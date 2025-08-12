const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  getProjectInfo: () => ipcRenderer.invoke('get-project-info'),
  loadCsvData: () => ipcRenderer.invoke('load-csv-data'),
  saveTaskCompletion: (taskId, completed, notes) => ipcRenderer.invoke('save-task-completion', taskId, completed, notes),
  loadTaskProgress: () => ipcRenderer.invoke('load-task-progress'),
  exportTasks: (tasks, exportType) => ipcRenderer.invoke('export-tasks', tasks, exportType),
  syncToOriginal: (tasks) => ipcRenderer.invoke('sync-to-original', tasks),
  saveTaskNotes: (taskId, notes) => ipcRenderer.invoke('save-task-notes', taskId, notes),
  updateTimeSpent: (taskId, timeSpent) => ipcRenderer.invoke('update-time-spent', taskId, timeSpent),
  saveTaskAssignment: (taskId, assignedTo) => ipcRenderer.invoke('save-task-assignment', taskId, assignedTo),
  getTeamMembers: () => ipcRenderer.invoke('get-team-members'),
  saveTeamMembers: (teamMembers) => ipcRenderer.invoke('save-team-members', teamMembers)
});