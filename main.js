const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

// ---- Store JSON key-value, tối ưu hiệu năng ----
// Bug/perf fix: trước đây MỖI lần get/set/merge đều đọc/ghi đĩa đồng bộ
// (fs.readFileSync/writeFileSync), chặn main process — trong lúc chơi
// game (Enrichment dịch nhiều từ liên tiếp) có thể gây giật nhẹ giao diện.
// Giờ giữ toàn bộ store trong bộ nhớ (đọc 1 lần lúc khởi động), mọi lần ghi
// chỉ cập nhật bộ nhớ ngay lập tức rồi GHI ĐĨA GỘP LẠI (debounce 400ms) thay
// vì ghi ngay từng lần — giảm hẳn số lần ghi đĩa khi có nhiều thao tác dồn dập.
let storeCache = null;
let writeTimer = null;
let writeInFlight = null;

function getStorePath() {
  return path.join(app.getPath('userData'), 'apprends-fou-store.json');
}

async function loadStoreOnce() {
  if (storeCache) return storeCache;
  try {
    const raw = await fsp.readFile(getStorePath(), 'utf-8');
    storeCache = JSON.parse(raw);
  } catch (e) {
    storeCache = {};
  }
  return storeCache;
}

function scheduleWrite() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(flushStore, 400);
}

async function flushStore() {
  writeTimer = null;
  if (!storeCache) return;
  const snapshot = JSON.stringify(storeCache, null, 2);
  writeInFlight = fsp.writeFile(getStorePath(), snapshot, 'utf-8').catch((e) => {
    console.error('Store write failed:', e);
  });
  await writeInFlight;
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

app.whenReady().then(async () => {
  await loadStoreOnce();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Đảm bảo không mất dữ liệu: ghi đĩa ngay (không đợi debounce) trước khi thoát
app.on('before-quit', async (e) => {
  if (writeTimer) {
    e.preventDefault();
    clearTimeout(writeTimer);
    writeTimer = null;
    await flushStore();
    app.quit();
  }
});

// ---- IPC handlers cho lớp lưu trữ ----
ipcMain.handle('store:get', async (event, key) => {
  const store = await loadStoreOnce();
  return key ? store[key] : store;
});

ipcMain.handle('store:set', async (event, key, value) => {
  const store = await loadStoreOnce();
  store[key] = value;
  scheduleWrite();
  return true;
});

ipcMain.handle('store:merge', async (event, key, partialObj) => {
  const store = await loadStoreOnce();
  store[key] = { ...(store[key] || {}), ...partialObj };
  scheduleWrite();
  return true;
});

// ---- Xuất/nhập file sao lưu (dùng cho trang Cài đặt) ----
ipcMain.handle('dialog:saveFile', async (event, defaultName, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || !filePath) return { canceled: true };
  try {
    await fsp.writeFile(filePath, content, 'utf-8');
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
    const content = await fsp.readFile(filePaths[0], 'utf-8');
    return { canceled: false, content };
  } catch (e) {
    return { canceled: true, error: String(e) };
  }
});
