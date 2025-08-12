console.log('Testing Electron import...');
try {
  const electron = require('electron');
  console.log('Electron object:', Object.keys(electron));
  console.log('App available:', !!electron.app);
  console.log('BrowserWindow available:', !!electron.BrowserWindow);
  console.log('ipcMain available:', !!electron.ipcMain);
} catch (error) {
  console.error('Error importing electron:', error);
}