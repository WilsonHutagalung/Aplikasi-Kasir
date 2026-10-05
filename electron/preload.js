const { contextBridge, ipcRenderer } = require('electron');

// Expose API yang aman ke renderer (browser window)
contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    isElectron: true,
});

