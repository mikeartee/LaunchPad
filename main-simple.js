const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/index.html');
}

// Simple project selection
ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Folder'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Stub handlers for other functions
ipcMain.handle('get-project-info', async () => null);
ipcMain.handle('load-csv-data', async () => ({ tasks: [], gantt: [], projectPath: null }));
ipcMain.handle('load-task-progress', async () => ({}));
ipcMain.handle('save-task-completion', async () => false);
ipcMain.handle('export-tasks', async () => false);
ipcMain.handle('sync-to-original', async () => false);
ipcMain.handle('save-task-notes', async () => false);
ipcMain.handle('update-time-spent', async () => false);
ipcMain.handle('save-task-assignment', async () => false);
ipcMain.handle('get-team-members', async () => []);
ipcMain.handle('save-team-members', async () => false);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});