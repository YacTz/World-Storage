# World Storage — Electron App

## Struktur File
```
world-storage-electron/
├── src/
│   ├── main.js       ← Electron main process
│   ├── preload.js    ← Bridge aman ke database
│   └── index.html    ← Tampilan aplikasi
├── package.json
├── SETUP.bat         ← Jalankan SEKALI untuk install
└── START.bat         ← Jalankan setiap mau buka app
```

---

## Cara Setup (Lakukan SEKALI)
1. Extract folder ini ke mana saja (contoh: D:\world-storage)
2. Double-click **SETUP.bat** — tunggu sampai selesai
3. Selesai!

## Cara Buka Aplikasi
Double-click **START.bat** setiap kali mau buka.

---

## Lokasi Database
Data tersimpan di:
```
C:\Users\[nama]\AppData\Roaming\world-storage\world-storage.db
```
File .db ini yang perlu dibackup. Atau gunakan tombol Export JSON di dalam app.

---

## Catatan
- Tidak perlu CMD, tidak perlu browser
- Aplikasi langsung terbuka seperti software biasa
- Data permanen, tidak hilang selama file .db tidak dihapus
