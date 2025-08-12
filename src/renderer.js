const { ipcRenderer } = require('electron');

let allTasks = [];
let allGantt = [];
let taskProgress = {};
let activeTimers = {};
let teamMembers = [];
let charts = {};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjectInfo();
    await loadData();
    setupEventListeners();
    updateStats();
    setupRevenueCalculator();
    initializeTooltips();
});

// Load CSV data
async function loadData() {
    try {
        const data = await ipcRenderer.invoke('load-csv-data');
        allTasks = data.tasks;
        allGantt = data.gantt;
        
        // Load task progress
        taskProgress = await ipcRenderer.invoke('load-task-progress');
        
        // Load team members
        teamMembers = await ipcRenderer.invoke('get-team-members');
        
        // Apply progress to tasks
        allTasks.forEach(task => {
            const progress = taskProgress[task.id];
            if (progress) {
                task.completed = progress.completed;
                task.notes = progress.notes || '';
                task.completedDate = progress.completedDate;
                task.timeSpent = progress.timeSpent || 0;
                task.assignedTo = progress.assignedTo || '';
            }
        });
        
        renderTasks();
        populateFilters();
        renderGanttChart();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load project data. Make sure CSV files are in the correct location.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Filters
    document.getElementById('phase-filter').addEventListener('change', filterTasks);
    document.getElementById('type-filter').addEventListener('change', filterTasks);
    document.getElementById('refresh-btn').addEventListener('click', loadData);
    
    // Project selection
    document.getElementById('open-project-btn').addEventListener('click', selectProject);
    document.getElementById('change-project-btn').addEventListener('click', selectProject);

    // Export and sync buttons
    document.getElementById('export-all-btn').addEventListener('click', () => exportTasks('all'));
    document.getElementById('export-completed-btn').addEventListener('click', () => exportTasks('completed'));
    document.getElementById('sync-btn').addEventListener('click', syncToOriginal);

    // Analytics buttons
    document.getElementById('export-charts-btn').addEventListener('click', exportCharts);
    document.getElementById('refresh-charts-btn').addEventListener('click', renderCharts);

    // Revenue calculator
    document.getElementById('hourly-rate').addEventListener('input', calculateRevenue);
    document.getElementById('hours-week').addEventListener('input', calculateRevenue);
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Render charts when analytics tab is opened
    if (tabName === 'analytics') {
        setTimeout(renderCharts, 100); // Small delay to ensure tab is visible
    }
}

// Render tasks with enhanced features
function renderTasks(tasksToRender = allTasks) {
    const container = document.getElementById('tasks-container');
    
    if (tasksToRender.length === 0) {
        container.innerHTML = '<div class="no-tasks">No tasks found. Check your CSV files.</div>';
        return;
    }

    container.innerHTML = tasksToRender.map(task => {
        const timeSpentHours = (task.timeSpent || 0) / 3600;
        const isTimerActive = activeTimers[task.id];
        
        return `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask('${task.id}', this.checked)">
                <span class="task-phase">${task.phase}</span>
                <div class="task-actions">
                    <button class="timer-btn ${isTimerActive ? 'active' : ''}" 
                            onclick="toggleTimer('${task.id}')" 
                            data-tooltip="timer" data-task-id="${task.id}">
                        ${isTimerActive ? '⏹️' : '▶️'}
                    </button>
                    <button class="notes-btn" onclick="openNotesModal('${task.id}')" 
                            data-tooltip="notes" data-task-id="${task.id}">📝</button>
                    <button class="assign-btn" onclick="openAssignModal('${task.id}')" 
                            data-tooltip="assign" data-task-id="${task.id}">👤</button>
                    <button class="details-btn" onclick="openTaskDetails('${task.id}')" 
                            data-tooltip="details" data-task-id="${task.id}">🔍</button>
                </div>
            </div>
            <div class="task-title">${task.summary}</div>
            <div class="task-meta">
                <span class="task-type">${task.type}</span>
                ${task.assignedTo ? `<span class="assigned-to">👤 ${task.assignedTo}</span>` : ''}
                ${timeSpentHours > 0 ? `<span class="time-spent">⏱️ ${timeSpentHours.toFixed(1)}h</span>` : ''}
                ${task.completedDate ? `<span class="completed-date">✅ ${new Date(task.completedDate).toLocaleDateString()}</span>` : ''}
            </div>
            ${task.notes ? `<div class="task-notes">💭 ${task.notes}</div>` : ''}
        </div>
    `;
    }).join('');
}

// Populate filter dropdowns
function populateFilters() {
    const phases = [...new Set(allTasks.map(task => task.phase))];
    const types = [...new Set(allTasks.map(task => task.type))];

    const phaseFilter = document.getElementById('phase-filter');
    const typeFilter = document.getElementById('type-filter');

    phaseFilter.innerHTML = '<option value="">All Phases</option>' + 
        phases.map(phase => `<option value="${phase}">${phase}</option>`).join('');

    typeFilter.innerHTML = '<option value="">All Types</option>' + 
        types.map(type => `<option value="${type}">${type}</option>`).join('');
}

// Filter tasks
function filterTasks() {
    const phaseFilter = document.getElementById('phase-filter').value;
    const typeFilter = document.getElementById('type-filter').value;

    let filteredTasks = allTasks;

    if (phaseFilter) {
        filteredTasks = filteredTasks.filter(task => task.phase === phaseFilter);
    }

    if (typeFilter) {
        filteredTasks = filteredTasks.filter(task => task.type === typeFilter);
    }

    renderTasks(filteredTasks);
}

// Toggle task completion
async function toggleTask(taskId, completed) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = completed;
        if (completed) {
            task.completedDate = new Date().toISOString();
            // Stop timer if running
            if (activeTimers[taskId]) {
                toggleTimer(taskId);
            }
        } else {
            // Unchecking - remove completion date
            task.completedDate = null;
        }
        
        await ipcRenderer.invoke('save-task-completion', taskId, completed, task.notes || '');
        updateStats();
        renderTasks();
        
        // Update timeline chart if it exists
        if (document.querySelector('.tab-content.active')?.id === 'analytics-tab') {
            setTimeout(renderCharts, 100);
        }
    }
}

// Timer functionality
function toggleTimer(taskId) {
    if (activeTimers[taskId]) {
        // Stop timer
        clearInterval(activeTimers[taskId].interval);
        const timeSpent = Date.now() - activeTimers[taskId].startTime;
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            task.timeSpent = (task.timeSpent || 0) + timeSpent;
            ipcRenderer.invoke('update-time-spent', taskId, task.timeSpent);
        }
        delete activeTimers[taskId];
    } else {
        // Start timer
        activeTimers[taskId] = {
            startTime: Date.now(),
            interval: setInterval(() => {
                // Update UI every second if needed
                const button = document.querySelector(`button[onclick="toggleTimer('${taskId}')"]`);
                if (button) {
                    const elapsed = Math.floor((Date.now() - activeTimers[taskId].startTime) / 1000);
                    button.title = `Stop timer (${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')})`;
                }
            }, 1000)
        };
    }
    renderTasks();
}

// Notes modal functionality
function openNotesModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📝 Task Notes</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>${task.summary}</strong></p>
                <textarea id="task-notes" placeholder="Add your notes here..." rows="6">${task.notes || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveNotes('${taskId}')" class="primary">Save Notes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('task-notes').focus();
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Assignment modal functionality
function openAssignModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👤 Assign Task</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>${task.summary}</strong></p>
                <div class="assign-section">
                    <label>Assign to:</label>
                    <select id="task-assignee">
                        <option value="">Unassigned</option>
                        ${teamMembers.map(member => 
                            `<option value="${member}" ${task.assignedTo === member ? 'selected' : ''}>${member}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="team-management">
                    <button onclick="openTeamManager()" class="secondary">📝 Manage Team</button>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveAssignment('${taskId}')" class="primary">Assign Task</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function saveAssignment(taskId) {
    const assignee = document.getElementById('task-assignee').value;
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.assignedTo = assignee;
        await ipcRenderer.invoke('save-task-assignment', taskId, assignee);
        renderTasks();
    }
    closeModal();
}

// Team management modal
function openTeamManager() {
    closeModal(); // Close assign modal first
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content team-modal">
            <div class="modal-header">
                <h3>👥 Manage Team</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="team-list">
                    ${teamMembers.map((member, index) => `
                        <div class="team-member">
                            <input type="text" value="${member}" data-index="${index}" class="member-input">
                            <button onclick="removeMember(${index})" class="remove-btn">❌</button>
                        </div>
                    `).join('')}
                </div>
                <div class="add-member">
                    <input type="text" id="new-member" placeholder="Add new team member...">
                    <button onclick="addMember()" class="add-btn">➕ Add</button>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveTeam()" class="primary">Save Team</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addMember() {
    const newMember = document.getElementById('new-member').value.trim();
    if (newMember && !teamMembers.includes(newMember)) {
        teamMembers.push(newMember);
        openTeamManager(); // Refresh the modal
    }
}

function removeMember(index) {
    teamMembers.splice(index, 1);
    openTeamManager(); // Refresh the modal
}

async function saveTeam() {
    // Update team members from inputs
    const inputs = document.querySelectorAll('.member-input');
    teamMembers = Array.from(inputs).map(input => input.value.trim()).filter(name => name);
    
    await ipcRenderer.invoke('save-team-members', teamMembers);
    showNotification('✅ Team updated successfully!');
    closeModal();
}

// Task details modal
function openTaskDetails(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const timeSpentHours = (task.timeSpent || 0) / 3600;
    const assignedTo = task.assignedTo || 'Unassigned';
    const completedDate = task.completedDate ? new Date(task.completedDate).toLocaleString() : 'Not completed';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content task-details-modal">
            <div class="modal-header">
                <h3>🔍 Task Details</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="task-detail-grid">
                    <div class="detail-section">
                        <h4>📋 Task Information</h4>
                        <div class="detail-item">
                            <strong>Summary:</strong>
                            <p>${task.summary}</p>
                        </div>
                        <div class="detail-item">
                            <strong>Phase:</strong>
                            <span class="phase-badge">${task.phase}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Type:</strong>
                            <span class="type-badge">${task.type}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Status:</strong>
                            <span class="status-badge ${task.completed ? 'completed' : 'pending'}">
                                ${task.completed ? '✅ Completed' : '⏳ Pending'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>👥 Assignment & Progress</h4>
                        <div class="detail-item">
                            <strong>Assigned to:</strong>
                            <span class="assigned-badge">${assignedTo}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Time Spent:</strong>
                            <span class="time-badge">${timeSpentHours.toFixed(1)} hours</span>
                        </div>
                        <div class="detail-item">
                            <strong>Completed Date:</strong>
                            <span class="date-info">${completedDate}</span>
                        </div>
                    </div>
                    
                    ${task.notes ? `
                    <div class="detail-section full-width">
                        <h4>📝 Notes</h4>
                        <div class="notes-display">
                            ${task.notes}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Close</button>
                <button onclick="openNotesModal('${taskId}'); closeModal();" class="secondary">📝 Edit Notes</button>
                <button onclick="openAssignModal('${taskId}'); closeModal();" class="primary">👤 Assign Task</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Dynamic Tooltip System
let tooltipTimeout;
let currentTooltip = null;

function initializeTooltips() {
    const tooltip = document.getElementById('dynamic-tooltip');
    
    // Add event listeners to all elements with data-tooltip
    document.addEventListener('mouseenter', (e) => {
        if (e.target.hasAttribute('data-tooltip')) {
            tooltipTimeout = setTimeout(() => {
                showTooltip(e.target);
            }, 500); // 500ms delay
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.hasAttribute('data-tooltip')) {
            clearTimeout(tooltipTimeout);
            hideTooltip();
        }
    }, true);
}

function showTooltip(element) {
    const tooltip = document.getElementById('dynamic-tooltip');
    const content = tooltip.querySelector('.tooltip-content');
    const tooltipType = element.getAttribute('data-tooltip');
    
    // Generate dynamic content based on tooltip type
    const tooltipContent = generateTooltipContent(tooltipType, element);
    content.innerHTML = tooltipContent;
    
    // Position tooltip
    positionTooltip(tooltip, element);
    
    // Show tooltip
    tooltip.classList.add('show');
    currentTooltip = tooltip;
}

function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.classList.remove('show');
        currentTooltip = null;
    }
}

function generateTooltipContent(type, element) {
    const taskId = element.getAttribute('data-task-id');
    const task = taskId ? allTasks.find(t => t.id === taskId) : null;
    
    switch (type) {
        case 'timer':
            if (task) {
                const isActive = activeTimers[taskId];
                const timeSpent = (task.timeSpent || 0) / 3600;
                return `
                    <strong>${isActive ? '⏹️ Stop Timer' : '▶️ Start Timer'}</strong><br>
                    Current status: ${isActive ? 'Running' : 'Stopped'}<br>
                    Time logged: ${timeSpent.toFixed(1)} hours
                `;
            }
            break;
            
        case 'notes':
            if (task) {
                const hasNotes = task.notes && task.notes.trim();
                return `
                    <strong>📝 ${hasNotes ? 'Edit Notes' : 'Add Notes'}</strong><br>
                    Current notes: ${hasNotes ? task.notes.substring(0, 50) + '...' : 'None'}<br>
                    Click to ${hasNotes ? 'edit' : 'add'} task notes
                `;
            }
            break;
            
        case 'assign':
            if (task) {
                const assignee = task.assignedTo || 'Unassigned';
                return `
                    <strong>👤 Assign Task</strong><br>
                    Currently assigned to: ${assignee}<br>
                    Team members: ${teamMembers.length} available
                `;
            }
            break;
            
        case 'details':
            if (task) {
                return `
                    <strong>🔍 View Task Details</strong><br>
                    Phase: ${task.phase}<br>
                    Type: ${task.type}<br>
                    Status: ${task.completed ? 'Completed' : 'Pending'}
                `;
            }
            break;
            
        case 'export-all':
            return `
                <strong>📤 Export All Tasks</strong><br>
                Tasks to export: ${allTasks.length}<br>
                Format: CSV with completion status<br>
                Includes: Notes, assignments, time spent
            `;
            
        case 'export-completed':
            const completedCount = allTasks.filter(t => t.completed).length;
            return `
                <strong>✅ Export Completed Tasks</strong><br>
                Completed tasks: ${completedCount}<br>
                Format: CSV with completion data<br>
                Perfect for progress reports
            `;
            
        case 'sync-files':
            return `
                <strong>🔄 Sync to Original Files</strong><br>
                Updates your source CSV files<br>
                Adds: Completion status, assignments, notes<br>
                ⚠️ This modifies your original files
            `;
            
        case 'export-charts':
            const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
            return `
                <strong>📊 Export Charts</strong><br>
                Charts ready: 5 analytics charts<br>
                Saves to: ${projectName}/Presentations/<br>
                Format: PNG images with project name
            `;
            
        case 'refresh-charts':
            return `
                <strong>🔄 Refresh Charts</strong><br>
                Updates all analytics with latest data<br>
                Reflects: Task completion, time tracking<br>
                Use after completing tasks
            `;
            
        default:
            return 'No tooltip content available';
    }
    
    return 'Loading...';
}

function positionTooltip(tooltip, element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const arrow = tooltip.querySelector('.tooltip-arrow');
    
    // Default position: above the element
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Smart positioning: avoid screen edges
    if (top < 10) {
        // Position below if no room above
        top = rect.bottom + 10;
        arrow.className = 'tooltip-arrow arrow-up';
    } else {
        arrow.className = 'tooltip-arrow arrow-down';
    }
    
    if (left < 10) {
        left = 10;
    } else if (left + tooltipRect.width > window.innerWidth - 10) {
        left = tooltipRect.width - 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

// Analytics and Charts
function renderCharts() {
    if (!window.Chart) {
        console.error('Chart.js not loaded');
        return;
    }
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    renderProgressChart();
    renderPhaseChart();
    renderTeamChart();
    renderTimeChart();
    renderTimelineChart();
}

function renderProgressChart() {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;
    
    const completed = allTasks.filter(task => task.completed).length;
    const pending = allTasks.length - completed;
    const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
    
    charts.progress = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ['#4caf50', '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${projectName} - Overall Progress`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderPhaseChart() {
    const ctx = document.getElementById('phase-chart');
    if (!ctx) return;
    
    const phaseData = {};
    allTasks.forEach(task => {
        if (!phaseData[task.phase]) {
            phaseData[task.phase] = { total: 0, completed: 0 };
        }
        phaseData[task.phase].total++;
        if (task.completed) phaseData[task.phase].completed++;
    });
    
    const phases = Object.keys(phaseData);
    const completedData = phases.map(phase => phaseData[phase].completed);
    const pendingData = phases.map(phase => phaseData[phase].total - phaseData[phase].completed);
    const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
    
    charts.phase = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: phases,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: '#4caf50'
                },
                {
                    label: 'Pending',
                    data: pendingData,
                    backgroundColor: '#ff9800'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Project Phases'
                    },
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tasks'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${projectName} - Progress by Phase`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} tasks`;
                        }
                    }
                }
            }
        }
    });
}

function renderTeamChart() {
    const ctx = document.getElementById('team-chart');
    if (!ctx) return;
    
    const teamData = {};
    allTasks.forEach(task => {
        const assignee = task.assignedTo || 'Unassigned';
        if (!teamData[assignee]) {
            teamData[assignee] = { total: 0, completed: 0 };
        }
        teamData[assignee].total++;
        if (task.completed) teamData[assignee].completed++;
    });
    
    const members = Object.keys(teamData);
    const totalTasks = members.map(member => teamData[member].total);
    const completedTasks = members.map(member => teamData[member].completed);
    const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
    
    charts.team = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: members,
            datasets: [
                {
                    label: 'Total Tasks',
                    data: totalTasks,
                    backgroundColor: '#2196f3'
                },
                {
                    label: 'Completed',
                    data: completedTasks,
                    backgroundColor: '#4caf50'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${projectName} - Team Workload`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderTimeChart() {
    const ctx = document.getElementById('time-chart');
    if (!ctx) return;
    
    const phaseTime = {};
    let totalTime = 0;
    
    allTasks.forEach(task => {
        if (!phaseTime[task.phase]) phaseTime[task.phase] = 0;
        const taskTime = (task.timeSpent || 0) / 3600; // Convert to hours
        phaseTime[task.phase] += taskTime;
        totalTime += taskTime;
    });
    
    // Show empty state if no time tracked
    if (totalTime === 0) {
        const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
        
        charts.time = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No time tracked yet'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${projectName} - Time Distribution`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        return;
    }
    
    const phases = Object.keys(phaseTime).filter(phase => phaseTime[phase] > 0);
    const timeData = phases.map(phase => phaseTime[phase].toFixed(1));
    const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
    
    charts.time = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: phases,
            datasets: [{
                data: timeData,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${projectName} - Time Distribution`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / totalTime) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}h (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderTimelineChart() {
    const ctx = document.getElementById('timeline-chart');
    if (!ctx) return;
    
    const completedTasks = allTasks.filter(task => task.completed && task.completedDate);
    
    if (completedTasks.length === 0) {
        // Show empty state
        const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'Project';
        
        charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Start tracking by completing tasks!'],
                datasets: [{
                    label: 'No progress yet',
                    data: [0],
                    borderColor: '#e0e0e0',
                    backgroundColor: 'rgba(224, 224, 224, 0.1)',
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${projectName} - Completion Timeline`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        return;
    }
    
    // Group by date
    const dateGroups = {};
    completedTasks.forEach(task => {
        const date = new Date(task.completedDate).toDateString();
        dateGroups[date] = (dateGroups[date] || 0) + 1;
    });
    
    const dates = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
    const counts = dates.map(date => dateGroups[date]);
    
    // Calculate cumulative
    const cumulative = [];
    let total = 0;
    counts.forEach(count => {
        total += count;
        cumulative.push(total);
    });
    
    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Total Tasks Completed',
                    data: cumulative,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tasks Completed'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${projectName} - Completion Timeline`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} tasks completed by ${context.label}`;
                        }
                    }
                }
            }
        }
    });
}

// Export charts functionality
async function exportCharts() {
    const projectName = document.getElementById('project-title').textContent.replace('🚀 LaunchPad - ', '') || 'LaunchPad';
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const chartDescriptions = [
        'Overall-Progress',
        'Progress-by-Phase', 
        'Team-Workload',
        'Time-Distribution',
        'Completion-Timeline'
    ];
    
    const chartElements = document.querySelectorAll('.chart-card canvas');
    const chartDataArray = [];
    
    // Collect all chart data
    chartElements.forEach((canvas, index) => {
        const chart = Object.values(charts)[index];
        if (chart && chartDescriptions[index]) {
            const dataURL = canvas.toDataURL('image/png');
            const filename = `${projectName}_${chartDescriptions[index]}_${dateStr}.png`;
            chartDataArray.push({ dataURL, filename });
        }
    });
    
    if (chartDataArray.length === 0) {
        showNotification('❌ No charts to export', 'error');
        return;
    }
    
    // Export to project folder
    try {
        const result = await ipcRenderer.invoke('export-charts-to-folder', chartDataArray);
        
        if (result.success) {
            showNotification(`📊 ${result.fileCount} charts exported to:\n${result.exportPath}`);
        } else {
            showNotification(`❌ Export failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('❌ Export failed - check console for details', 'error');
    }
}

async function saveNotes(taskId) {
    const notes = document.getElementById('task-notes').value;
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.notes = notes;
        await ipcRenderer.invoke('save-task-notes', taskId, notes);
        renderTasks();
    }
    closeModal();
}

// Export functionality
async function exportTasks(type) {
    let tasksToExport = allTasks;
    
    if (type === 'completed') {
        tasksToExport = allTasks.filter(task => task.completed);
    } else if (type === 'pending') {
        tasksToExport = allTasks.filter(task => !task.completed);
    }
    
    const success = await ipcRenderer.invoke('export-tasks', tasksToExport, type);
    if (success) {
        showNotification(`✅ Exported ${tasksToExport.length} tasks successfully!`);
    } else {
        showNotification('❌ Export cancelled or failed', 'error');
    }
}

// Sync to original files
async function syncToOriginal() {
    const success = await ipcRenderer.invoke('sync-to-original', allTasks);
    if (success) {
        showNotification('✅ Successfully synced to original CSV files!');
    } else {
        showNotification('❌ Failed to sync to original files', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update statistics
function updateStats() {
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.completed).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('progress-percent').textContent = `${progressPercent}%`;
}

// Render Gantt chart (simplified)
function renderGanttChart() {
    const container = document.getElementById('gantt-chart');
    
    if (allGantt.length === 0) {
        container.innerHTML = '<div class="gantt-empty">📊 Timeline data will be displayed here.<br>Import your Gantt Chart.csv file to see the project timeline.</div>';
        return;
    }

    // Group by phase and sort
    const phases = {};
    allGantt.forEach(item => {
        if (!phases[item.phase]) {
            phases[item.phase] = [];
        }
        phases[item.phase].push(item);
    });

    // Define phase order
    const phaseOrder = ['Foundation', 'Brand', 'Digital', 'Content', 'Thought Leadership', 'Client Acquisition', 'Revenue Target', 'Operations', 'Team Expansion', 'Growth Systems'];
    
    const sortedPhases = phaseOrder.filter(phase => phases[phase]);
    
    container.innerHTML = sortedPhases.map(phase => {
        const phaseTasks = phases[phase].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        return `
            <div class="gantt-phase">
                <h4>📋 ${phase} Phase</h4>
                <div class="gantt-tasks">
                    ${phaseTasks.map(task => {
                        const startDate = new Date(task.startDate).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
                        const endDate = new Date(task.endDate).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
                        
                        return `
                            <div class="gantt-task">
                                <span class="gantt-task-name">${task.task}</span>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <span style="font-size: 0.8em; color: #666;">${startDate} - ${endDate}</span>
                                    <span class="gantt-task-duration">${task.duration}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Revenue calculator
function setupRevenueCalculator() {
    calculateRevenue();
}

function calculateRevenue() {
    const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 190;
    const hoursPerWeek = parseFloat(document.getElementById('hours-week').value) || 10;

    const weeklyRevenue = hourlyRate * hoursPerWeek;
    const monthlyRevenue = weeklyRevenue * 4.33; // Average weeks per month

    document.getElementById('weekly-revenue').textContent = `NZ$${weeklyRevenue.toLocaleString()}`;
    document.getElementById('monthly-revenue').textContent = `NZ$${monthlyRevenue.toLocaleString()}`;

    // Update status indicators
    const survivalTarget = 4500;
    const expansionTarget = 7500;

    const survivalStatus = document.getElementById('survival-status');
    const expansionStatus = document.getElementById('expansion-status');

    if (monthlyRevenue >= survivalTarget) {
        survivalStatus.textContent = '✅ Achieved';
        survivalStatus.style.color = '#4caf50';
    } else {
        const needed = survivalTarget - monthlyRevenue;
        survivalStatus.textContent = `❌ Need NZ$${needed.toLocaleString()} more`;
        survivalStatus.style.color = '#f44336';
    }

    if (monthlyRevenue >= expansionTarget) {
        expansionStatus.textContent = '✅ Ready to hire team';
        expansionStatus.style.color = '#4caf50';
    } else {
        const needed = expansionTarget - monthlyRevenue;
        expansionStatus.textContent = `⏳ Need NZ$${needed.toLocaleString()} more`;
        expansionStatus.style.color = '#ff9800';
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('tasks-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #f44336;">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
            <button onclick="loadData()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

// Load project info
async function loadProjectInfo() {
    try {
        const projectInfo = await ipcRenderer.invoke('get-project-info');
        if (projectInfo) {
            document.getElementById('project-title').textContent = `🚀 LaunchPad - ${projectInfo.name}`;
            document.getElementById('project-summary').textContent = projectInfo.summary;
        } else {
            document.getElementById('project-title').textContent = '🚀 LaunchPad';
        }
    } catch (error) {
        console.error('Error loading project info:', error);
    }
}

// Select project folder
async function selectProject() {
    try {
        const projectPath = await ipcRenderer.invoke('select-project-folder');
        if (projectPath) {
            await loadProjectInfo();
            await loadData();
            updateStats();
        }
    } catch (error) {
        console.error('Error selecting project:', error);
        showError('Failed to load project. Make sure the folder has the correct structure.');
    }
}

// Listen for menu events
ipcRenderer.on('open-project', selectProject);
ipcRenderer.on('refresh-data', () => {
    loadData();
});
ipcRenderer.on('export-tasks', () => {
    exportTasks('all');
});
ipcRenderer.on('sync-to-original', syncToOriginal);

// Make functions globally available
window.toggleTask = toggleTask;
window.toggleTimer = toggleTimer;
window.openNotesModal = openNotesModal;
window.openAssignModal = openAssignModal;
window.openTaskDetails = openTaskDetails;
window.openTeamManager = openTeamManager;
window.closeModal = closeModal;
window.saveNotes = saveNotes;
window.saveAssignment = saveAssignment;
window.addMember = addMember;
window.removeMember = removeMember;
window.saveTeam = saveTeam;
window.renderCharts = renderCharts;
window.exportCharts = exportCharts;