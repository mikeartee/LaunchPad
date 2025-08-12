const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

let currentProjectPath = null;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('src/index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

// Select project folder
ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Project Folder',
    buttonLabel: 'Select Project'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    currentProjectPath = result.filePaths[0];
    return currentProjectPath;
  }
  return null;
});

// Get current project info
ipcMain.handle('get-project-info', async () => {
  if (!currentProjectPath) return null;
  
  const projectName = path.basename(currentProjectPath);
  const summaryPath = path.join(currentProjectPath, '01-Planning Documents', 'Business Summary.md');
  
  let summary = 'No summary available';
  if (fs.existsSync(summaryPath)) {
    summary = fs.readFileSync(summaryPath, 'utf8').split('\n')[0].replace('# ', '');
  }
  
  return { name: projectName, summary, path: currentProjectPath };
});

// Load CSV data
ipcMain.handle('load-csv-data', async () => {
  if (!currentProjectPath) {
    // Default to Zoomed In project if no project selected
    currentProjectPath = path.join(__dirname, '..', 'Zoomed In Business Plan');
  }
  
  const dataPath = path.join(currentProjectPath, '03-Project Management');
  
  try {
    // Load tasks
    const tasks = [];
    const taskPath = path.join(dataPath, 'Task List.csv');
    
    if (fs.existsSync(taskPath)) {
      await new Promise((resolve) => {
        fs.createReadStream(taskPath)
          .pipe(csv())
          .on('data', (row) => {
            tasks.push({
              id: row.UUID,
              phase: row['Milestone Phase'],
              type: row['Task Type'],
              summary: row.Summary,
              completed: false
            });
          })
          .on('end', resolve);
      });
    }

    // Load Gantt data
    const gantt = [];
    const ganttPath = path.join(dataPath, 'Gantt Chart.csv');
    
    if (fs.existsSync(ganttPath)) {
      await new Promise((resolve) => {
        fs.createReadStream(ganttPath)
          .pipe(csv({ separator: '|' }))
          .on('data', (row) => {
            gantt.push({
              id: row.UUID,
              task: row.Task,
              startDate: row['Start Date'],
              endDate: row['End Date'],
              duration: row.Duration,
              phase: row['Plan Phase Type']
            });
          })
          .on('end', resolve);
      });
    }

    return { tasks, gantt, projectPath: currentProjectPath };
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return { tasks: [], gantt: [], projectPath: currentProjectPath };
  }
});

// Save task completion with persistence
ipcMain.handle('save-task-completion', async (event, taskId, completed, notes = '') => {
  if (!currentProjectPath) return false;
  
  const progressFile = path.join(currentProjectPath, '.launchpad-progress.json');
  let progress = {};
  
  // Load existing progress
  if (fs.existsSync(progressFile)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  
  // Update progress
  progress[taskId] = {
    ...progress[taskId],
    completed,
    notes,
    completedDate: completed ? new Date().toISOString() : null,
    timeSpent: progress[taskId]?.timeSpent || 0
  };
  
  // Save progress
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
});

// Load task progress
ipcMain.handle('load-task-progress', async () => {
  if (!currentProjectPath) return {};
  
  const progressFile = path.join(currentProjectPath, '.launchpad-progress.json');
  if (fs.existsSync(progressFile)) {
    try {
      return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  return {};
});

// Export tasks to CSV
ipcMain.handle('export-tasks', async (event, tasks, exportType = 'all') => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Tasks',
    defaultPath: `launchpad-export-${exportType}-${new Date().toISOString().split('T')[0]}.csv`,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  
  if (result.canceled) return false;
  
  try {
    const headers = 'UUID,Phase,Type,Summary,Assigned To,Status,Completed Date,Notes,Time Spent (hours)\n';
    const csvData = tasks.map(task => {
      const status = task.completed ? 'Completed' : 'Pending';
      const completedDate = task.completedDate || '';
      const notes = (task.notes || '').replace(/"/g, '""');
      const assignedTo = (task.assignedTo || '').replace(/"/g, '""');
      const timeSpent = (task.timeSpent || 0) / 3600; // Convert seconds to hours
      
      return `"${task.id}","${task.phase}","${task.type}","${task.summary}","${assignedTo}","${status}","${completedDate}","${notes}","${timeSpent.toFixed(2)}"`;
    }).join('\n');
    
    fs.writeFileSync(result.filePath, headers + csvData);
    return true;
  } catch (error) {
    console.error('Error exporting tasks:', error);
    return false;
  }
});

// Update original CSV with completion status
ipcMain.handle('sync-to-original', async (event, tasks) => {
  if (!currentProjectPath) return false;
  
  const taskPath = path.join(currentProjectPath, '03-Project Management', 'Task List.csv');
  if (!fs.existsSync(taskPath)) return false;
  
  try {
    // Read original CSV
    const originalData = [];
    await new Promise((resolve) => {
      fs.createReadStream(taskPath)
        .pipe(csv())
        .on('data', (row) => originalData.push(row))
        .on('end', resolve);
    });
    
    // Update with completion status
    const updatedData = originalData.map(row => {
      const task = tasks.find(t => t.id === row.UUID);
      return {
        ...row,
        'Assigned To': task?.assignedTo || '',
        Status: task?.completed ? 'Completed' : 'Pending',
        'Completed Date': task?.completedDate || '',
        Notes: task?.notes || ''
      };
    });
    
    // Write back to CSV
    const headers = Object.keys(updatedData[0]).join(',') + '\n';
    const csvContent = updatedData.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    fs.writeFileSync(taskPath, headers + csvContent);
    return true;
  } catch (error) {
    console.error('Error syncing to original:', error);
    return false;
  }
});

// Save task notes
ipcMain.handle('save-task-notes', async (event, taskId, notes) => {
  if (!currentProjectPath) return false;
  
  const progressFile = path.join(currentProjectPath, '.launchpad-progress.json');
  let progress = {};
  
  if (fs.existsSync(progressFile)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].notes = notes;
  
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    return false;
  }
});

// Update time spent on task
ipcMain.handle('update-time-spent', async (event, taskId, timeSpent) => {
  if (!currentProjectPath) return false;
  
  const progressFile = path.join(currentProjectPath, '.launchpad-progress.json');
  let progress = {};
  
  if (fs.existsSync(progressFile)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].timeSpent = timeSpent;
  
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating time:', error);
    return false;
  }
});

// Save task assignment
ipcMain.handle('save-task-assignment', async (event, taskId, assignedTo) => {
  if (!currentProjectPath) return false;
  
  const progressFile = path.join(currentProjectPath, '.launchpad-progress.json');
  let progress = {};
  
  if (fs.existsSync(progressFile)) {
    try {
      progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].assignedTo = assignedTo;
  
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving assignment:', error);
    return false;
  }
});

// Get team members/groups
ipcMain.handle('get-team-members', async () => {
  if (!currentProjectPath) return [];
  
  const teamFile = path.join(currentProjectPath, '.launchpad-team.json');
  if (fs.existsSync(teamFile)) {
    try {
      const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf8'));
      return teamData.members || [];
    } catch (error) {
      console.error('Error loading team:', error);
    }
  }
  
  // Default team members
  return [
    'Michael Rewiri-Thorsen',
    'Team Member 1',
    'Team Member 2',
    'External Contractor',
    'Design Team',
    'Development Team',
    'Marketing Team'
  ];
});

// Save team members
ipcMain.handle('save-team-members', async (event, members) => {
  if (!currentProjectPath) return false;
  
  const teamFile = path.join(currentProjectPath, '.launchpad-team.json');
  const teamData = { members, lastUpdated: new Date().toISOString() };
  
  try {
    fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving team:', error);
    return false;
  }
});

// Export charts to project folder
ipcMain.handle('export-charts-to-folder', async (event, chartDataArray) => {
  if (!currentProjectPath) return { success: false, error: 'No project selected' };
  
  try {
    // Create presentations folder structure
    const presentationsDir = path.join(currentProjectPath, 'Presentations');
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const exportDir = path.join(presentationsDir, `Charts_${dateStr}_${timeStr}`);
    
    // Create directories if they don't exist
    if (!fs.existsSync(presentationsDir)) {
      fs.mkdirSync(presentationsDir, { recursive: true });
    }
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Save each chart
    const savedFiles = [];
    for (const chartData of chartDataArray) {
      const filePath = path.join(exportDir, chartData.filename);
      const base64Data = chartData.dataURL.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(filePath, base64Data, 'base64');
      savedFiles.push(chartData.filename);
    }
    
    return { 
      success: true, 
      exportPath: exportDir,
      fileCount: savedFiles.length,
      files: savedFiles
    };
  } catch (error) {
    console.error('Error exporting charts:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Project Folder...',
        accelerator: 'Ctrl+O',
        click: () => {
          mainWindow.webContents.send('open-project');
        }
      },
      { type: 'separator' },
      {
        label: 'Refresh Data',
        accelerator: 'F5',
        click: () => {
          mainWindow.webContents.send('refresh-data');
        }
      },
      { type: 'separator' },
      {
        label: 'Export Tasks...',
        accelerator: 'Ctrl+E',
        click: () => {
          mainWindow.webContents.send('export-tasks');
        }
      },
      {
        label: 'Sync to Original Files',
        accelerator: 'Ctrl+S',
        click: () => {
          mainWindow.webContents.send('sync-to-original');
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);