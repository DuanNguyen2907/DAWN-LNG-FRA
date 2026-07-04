const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeMerge: (key, partialObj) => ipcRenderer.invoke('store:merge', key, partialObj),
  saveFile: (defaultName, content) => ipcRenderer.invoke('dialog:saveFile', defaultName, content),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
});
