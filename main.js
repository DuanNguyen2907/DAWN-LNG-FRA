const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ---- Simple JSON key-value store persisted in userData ----
function getStorePath() {
  return path.join(app.getPath('userData'), 'apprends-fou-store.json');
}

function readStore() {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Store write failed:', e);
    return false;
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#14213D',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- IPC handlers for the renderer's persistence layer ----
ipcMain.handle('store:get', (event, key) => {
  const store = readStore();
  return key ? store[key] : store;
});

ipcMain.handle('store:set', (event, key, value) => {
  const store = readStore();
  store[key] = value;
  return writeStore(store);
});

ipcMain.handle('store:merge', (event, key, partialObj) => {
  const store = readStore();
  store[key] = { ...(store[key] || {}), ...partialObj };
  return writeStore(store);
});

// ---- Xuất/nhập file sao lưu (dùng cho trang Cài đặt) ----
ipcMain.handle('dialog:saveFile', async (event, defaultName, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || !filePath) return { canceled: true };
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { canceled: false, filePath };
  } catch (e) {
    return { canceled: true, error: String(e) };
  }
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || filePaths.length === 0) return { canceled: true };
  try {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { canceled: false, content };
  } catch (e) {
    return { canceled: true, error: String(e) };
  }
});
