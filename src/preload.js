const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer (index.html)
contextBridge.exposeInMainWorld('db', {
  // Worlds
  getWorlds:    ()         => ipcRenderer.invoke('worlds:getAll'),
  addWorld:     (data)     => ipcRenderer.invoke('worlds:add', data),
  updateWorld:  (id, data) => ipcRenderer.invoke('worlds:update', id, data),
  deleteWorld:  (id)       => ipcRenderer.invoke('worlds:delete', id),
  bulkAdd:      (items)    => ipcRenderer.invoke('worlds:bulkAdd', items),

  // Categories
  getCategories:    ()         => ipcRenderer.invoke('categories:getAll'),
  addCategory:      (data)     => ipcRenderer.invoke('categories:add', data),
  updateCategory:   (id, data) => ipcRenderer.invoke('categories:update', id, data),
  deleteCategory:   (id)       => ipcRenderer.invoke('categories:delete', id),

  // Info
  getDbPath: () => ipcRenderer.invoke('db:getPath'),
  getConfigPath: () => ipcRenderer.invoke('db:getConfigPath'),
});
