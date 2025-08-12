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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('src/index.html');
}

// Helper functions for progress file operations
function getProgressFilePath() {
  if (!currentProjectPath) return null;
  return path.join(currentProjectPath, '.launchpad-progress.json');
}

async function loadProgress() {
  const progressFile = getProgressFilePath();
  if (!progressFile || !fs.existsSync(progressFile)) return {};
  
  try {
    const data = fs.readFileSync(progressFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading progress:', error);
    return {};
  }
}

async function saveProgress(progress) {
  const progressFile = getProgressFilePath();
  if (!progressFile) return false;
  
  try {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

// Authorization check
function isAuthorized() {
  return mainWindow && !mainWindow.isDestroyed();
}

// Select project folder
ipcMain.handle('select-project-folder', async () => {
  if (!isAuthorized()) return null;
  
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
  if (!isAuthorized() || !currentProjectPath) return null;
  
  const projectName = path.basename(currentProjectPath);
  const summaryPath = path.join(currentProjectPath, '01-Planning Documents', 'Business Summary.md');
  
  let summary = 'No summary available';
  try {
    if (fs.existsSync(summaryPath)) {
      summary = fs.readFileSync(summaryPath, 'utf8').split('\n')[0].replace('# ', '');
    }
  } catch (error) {
    console.error('Error reading summary:', error);
  }
  
  return { name: projectName, summary, path: currentProjectPath };
});

// Load CSV data with error handling
ipcMain.handle('load-csv-data', async () => {
  if (!isAuthorized()) return { tasks: [], gantt: [], projectPath: null };
  
  if (!currentProjectPath) {
    return { tasks: [], gantt: [], projectPath: null };
  }
  
  const dataPath = path.join(currentProjectPath, '03-Project Management');
  
  try {
    const tasks = [];
    const taskPath = path.join(dataPath, 'Task List.csv');
    
    if (fs.existsSync(taskPath)) {
      await new Promise((resolve, reject) => {
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
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const gantt = [];
    const ganttPath = path.join(dataPath, 'Gantt Chart.csv');
    
    if (fs.existsSync(ganttPath)) {
      await new Promise((resolve, reject) => {
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
          .on('end', resolve)
          .on('error', reject);
      });
    }

    return { tasks, gantt, projectPath: currentProjectPath };
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return { tasks: [], gantt: [], projectPath: currentProjectPath };
  }
});

// Save task completion
ipcMain.handle('save-task-completion', async (event, taskId, completed, notes = '') => {
  if (!isAuthorized() || !currentProjectPath || !taskId) return false;
  
  const progress = await loadProgress();
  progress[taskId] = {
    ...progress[taskId],
    completed,
    notes,
    completedDate: completed ? new Date().toISOString() : null,
    timeSpent: progress[taskId]?.timeSpent || 0
  };
  
  return await saveProgress(progress);
});

// Load task progress
ipcMain.handle('load-task-progress', async () => {
  if (!isAuthorized()) return {};
  return await loadProgress();
});

// Export tasks to CSV
ipcMain.handle('export-tasks', async (event, tasks, exportType = 'all') => {
  if (!isAuthorized() || !Array.isArray(tasks)) return false;
  
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
      const timeSpent = (task.timeSpent || 0) / 3600;
      
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
  if (!isAuthorized() || !currentProjectPath || !Array.isArray(tasks)) return false;
  
  const taskPath = path.join(currentProjectPath, '03-Project Management', 'Task List.csv');
  if (!fs.existsSync(taskPath)) return false;
  
  try {
    const originalData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(taskPath)
        .pipe(csv())
        .on('data', (row) => originalData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
    
    if (originalData.length === 0) return false;
    
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
  if (!isAuthorized() || !taskId) return false;
  
  const progress = await loadProgress();
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].notes = notes;
  return await saveProgress(progress);
});

// Update time spent on task
ipcMain.handle('update-time-spent', async (event, taskId, timeSpent) => {
  if (!isAuthorized() || !taskId || typeof timeSpent !== 'number') return false;
  
  const progress = await loadProgress();
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].timeSpent = timeSpent;
  return await saveProgress(progress);
});

// Save task assignment
ipcMain.handle('save-task-assignment', async (event, taskId, assignedTo) => {
  if (!isAuthorized() || !taskId) return false;
  
  const progress = await loadProgress();
  if (!progress[taskId]) {
    progress[taskId] = { completed: false, notes: '', timeSpent: 0, assignedTo: '' };
  }
  
  progress[taskId].assignedTo = assignedTo;
  return await saveProgress(progress);
});

// Get team members
ipcMain.handle('get-team-members', async () => {
  if (!isAuthorized()) return [];
  
  const progressFile = getProgressFilePath();
  if (!progressFile) return [];
  
  const teamFile = path.join(path.dirname(progressFile), '.launchpad-team.json');
  
  try {
    if (fs.existsSync(teamFile)) {
      const data = fs.readFileSync(teamFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading team members:', error);
  }
  
  return ['Team Member']; // Default team member
});

// Save team members
ipcMain.handle('save-team-members', async (event, teamMembers) => {
  if (!isAuthorized() || !Array.isArray(teamMembers)) return false;
  
  const progressFile = getProgressFilePath();
  if (!progressFile) return false;
  
  const teamFile = path.join(path.dirname(progressFile), '.launchpad-team.json');
  
  try {
    fs.writeFileSync(teamFile, JSON.stringify(teamMembers, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving team members:', error);
    return false;
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