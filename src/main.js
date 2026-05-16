const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Paths ─────────────────────────────────────────────────────
const appDir = app.isPackaged
  ? path.dirname(path.dirname(process.execPath))  // .../World Storage/
  : path.join(__dirname, '..');

const configPath = path.join(appDir, 'config.json');

// ── Load / create config ──────────────────────────────────────
function loadConfig() {
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch(e) {
      console.warn('config.json rusak, membuat ulang...');
    }
  }
  // Default config
  const defaultConfig = {
    db_path: path.join(appDir, 'world-storage.db'),
    _info: "Edit db_path untuk mengubah lokasi database. Gunakan double backslash (\\\\) untuk path Windows."
  };
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

const config = loadConfig();
const dbPath = config.db_path;

// Pastikan folder untuk db_path ada
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('📁 Config:', configPath);
console.log('📁 DB Path:', dbPath);

let SQL, db, win;

// ═══════════════════════════════════════════
//  DATABASE INIT
// ═══════════════════════════════════════════
async function initDB() {
  const sqlJs = require('sql.js');
  const wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  SQL = await sqlJs({ locateFile: () => wasmPath });

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS worlds (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT NOT NULL UNIQUE,
      category   TEXT NOT NULL DEFAULT 'Empty',
      seed       TEXT NOT NULL DEFAULT '',
      note       TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL DEFAULT '#aaaaaa',
      is_default INTEGER NOT NULL DEFAULT 0
    );
  `);

  const result = db.exec("SELECT COUNT(*) as c FROM categories");
  const count = result[0]?.values[0][0] || 0;
  if (count === 0) {
    db.run(`INSERT INTO categories (name, color, is_default) VALUES
      ('Empty','#4a5568',1),('Break','#ff4466',1)`);
  }

  saveDB();
  console.log('✅ Database siap:', dbPath);
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// ═══════════════════════════════════════════
//  WINDOW
// ═══════════════════════════════════════════
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'World Storage', backgroundColor: '#0a0c10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(async () => {
  await initDB();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ═══════════════════════════════════════════
//  IPC — WORLDS
// ═══════════════════════════════════════════
ipcMain.handle('worlds:getAll', () => toObjects(db.exec('SELECT * FROM worlds ORDER BY id')));

ipcMain.handle('worlds:add', (_, data) => {
  const code = (data.code || '').trim().toUpperCase();
  if (!code) throw new Error('World code tidak boleh kosong');
  const exists = toObjects(db.exec(`SELECT id FROM worlds WHERE UPPER(code)='${code}'`));
  if (exists.length) throw new Error(`World "${code}" sudah ada`);
  db.run('INSERT INTO worlds (code,category,seed,note) VALUES (?,?,?,?)',
    [code, data.category||'Empty', data.seed||'', data.note||'']);
  saveDB();
  return toObjects(db.exec(`SELECT * FROM worlds WHERE UPPER(code)='${code}'`))[0];
});

ipcMain.handle('worlds:update', (_, id, data) => {
  const code = (data.code || '').trim().toUpperCase();
  if (!code) throw new Error('World code tidak boleh kosong');
  const exists = toObjects(db.exec(`SELECT id FROM worlds WHERE UPPER(code)='${code}' AND id!=${id}`));
  if (exists.length) throw new Error(`World "${code}" sudah ada`);
  db.run('UPDATE worlds SET code=?,category=?,seed=?,note=? WHERE id=?',
    [code, data.category||'Empty', data.seed||'', data.note||'', id]);
  saveDB();
  return toObjects(db.exec(`SELECT * FROM worlds WHERE id=${id}`))[0];
});

ipcMain.handle('worlds:delete', (_, id) => {
  db.run('DELETE FROM worlds WHERE id=?', [id]);
  saveDB();
  return { deleted: id };
});

ipcMain.handle('worlds:bulkAdd', (_, items) => {
  const existing = new Set(toObjects(db.exec('SELECT UPPER(code) as code FROM worlds')).map(r=>r.code));
  let added=0, skipped=0;
  const stmt = db.prepare('INSERT INTO worlds (code,category,seed,note) VALUES (?,?,?,?)');
  items.forEach(item => {
    const code = (item.code||'').trim().toUpperCase();
    if (!code || existing.has(code)) { skipped++; return; }
    stmt.run([code, item.category||'Empty', item.seed||'', item.note||'']);
    existing.add(code); added++;
  });
  stmt.free();
  saveDB();
  return { added, skipped };
});

// ═══════════════════════════════════════════
//  IPC — CATEGORIES
// ═══════════════════════════════════════════
ipcMain.handle('categories:getAll', () => toObjects(db.exec('SELECT * FROM categories ORDER BY name')));

ipcMain.handle('categories:add', (_, data) => {
  const name = (data.name||'').trim();
  if (!name) throw new Error('Nama kategori tidak boleh kosong');
  const exists = toObjects(db.exec(`SELECT id FROM categories WHERE LOWER(name)=LOWER('${name}')`));
  if (exists.length) throw new Error(`Kategori "${name}" sudah ada`);
  db.run('INSERT INTO categories (name,color,is_default) VALUES (?,?,0)', [name, data.color||'#aaaaaa']);
  saveDB();
  return toObjects(db.exec(`SELECT * FROM categories WHERE LOWER(name)=LOWER('${name}')`))[0];
});

ipcMain.handle('categories:update', (_, id, data) => {
  db.run('UPDATE categories SET color=? WHERE id=?', [data.color, id]);
  saveDB();
  return toObjects(db.exec(`SELECT * FROM categories WHERE id=${id}`))[0];
});

ipcMain.handle('categories:delete', (_, id) => {
  const cat = toObjects(db.exec(`SELECT * FROM categories WHERE id=${id}`))[0];
  if (!cat) throw new Error('Kategori tidak ditemukan');
  if (cat.is_default) throw new Error('Kategori default tidak bisa dihapus');
  db.run("UPDATE worlds SET category='Empty' WHERE category=?", [cat.name]);
  db.run('DELETE FROM categories WHERE id=?', [id]);
  saveDB();
  return { deleted: id };
});

// ═══════════════════════════════════════════
//  IPC — INFO
// ═══════════════════════════════════════════
ipcMain.handle('db:getPath', () => dbPath);
ipcMain.handle('db:getConfigPath', () => configPath);
