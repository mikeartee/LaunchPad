const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;
let currentProjectPath = null;

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

app.whenReady().then(() => {
  createWindow();
  
  ipcMain.handle('select-project-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Project Folder'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      currentProjectPath = result.filePaths[0];
      return currentProjectPath;
    }
    return null;
  });

  ipcMain.handle('get-project-info', async () => {
    if (!currentProjectPath) return null;
    return { 
      name: path.basename(currentProjectPath), 
      summary: 'Project loaded successfully', 
      path: currentProjectPath 
    };
  });

  ipcMain.handle('load-csv-data', async () => ({ tasks: [], gantt: [], projectPath: currentProjectPath }));
  ipcMain.handle('load-task-progress', async () => ({}));
  ipcMain.handle('save-task-completion', async () => true);
  ipcMain.handle('export-tasks', async () => true);
  ipcMain.handle('sync-to-original', async () => true);
  ipcMain.handle('save-task-notes', async () => true);
  ipcMain.handle('update-time-spent', async () => true);
  ipcMain.handle('save-task-assignment', async () => true);
  ipcMain.handle('get-team-members', async () => ['Project Manager']);
  ipcMain.handle('save-team-members', async () => true);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});