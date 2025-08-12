// Extensions to renderer.js for new project management features
// This file contains the new functionality for Budget, Risk, and Stakeholder management

// Initialize new managers
let budgetManager = new BudgetManager();
let riskManager = new RiskManager();
let stakeholderManager = new StakeholderManager();

// Add event listeners for new features
function setupNewFeatureListeners() {
    // Budget management
    document.getElementById('add-budget-item-btn')?.addEventListener('click', openBudgetItemModal);
    document.getElementById('add-expense-btn')?.addEventListener('click', openExpenseModal);
    
    // Risk management
    document.getElementById('add-risk-btn')?.addEventListener('click', openRiskModal);
    
    // Stakeholder management
    document.getElementById('add-stakeholder-btn')?.addEventListener('click', openStakeholderModal);
}

// Budget Management Functions
function openBudgetItemModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>💰 Add Budget Item</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Category:</label>
                    <select id="budget-category">
                        ${budgetManager.categories.map(cat => 
                            `<option value="${cat}">${cat}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Planned Amount ($):</label>
                    <input type="number" id="budget-amount" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="budget-description" rows="3" placeholder="Optional description..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveBudgetItem()" class="primary">Add Budget Item</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveBudgetItem() {
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const description = document.getElementById('budget-description').value;
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    budgetManager.setBudget(category, amount, description);
    renderBudgetSummary();
    renderBudgetDetails();
    closeModal();
    showNotification('Budget item added successfully!');
}

function openExpenseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>💸 Add Expense</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="expense-category">
                            ${budgetManager.categories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount ($):</label>
                        <input type="number" id="expense-amount" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <input type="text" id="expense-description" placeholder="What was this expense for?" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Vendor:</label>
                        <input type="text" id="expense-vendor" placeholder="Optional vendor name">
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="expense-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveExpense()" class="primary">Add Expense</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveExpense() {
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const vendor = document.getElementById('expense-vendor').value;
    const date = document.getElementById('expense-date').value;
    
    if (!amount || amount <= 0 || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    budgetManager.addExpense({
        category,
        amount,
        description,
        vendor,
        date: date + 'T00:00:00.000Z'
    });
    
    renderBudgetSummary();
    renderBudgetDetails();
    closeModal();
    showNotification('Expense added successfully!');
}

function renderBudgetSummary() {
    const summary = budgetManager.getBudgetSummary();
    const container = document.getElementById('budget-summary');
    
    container.innerHTML = `
        <div class="budget-summary-card">
            <h4>Total Budget</h4>
            <div class="budget-amount">$${summary.totalPlanned.toLocaleString()}</div>
        </div>
        <div class="budget-summary-card">
            <h4>Total Spent</h4>
            <div class="budget-amount" style="color: #ff9800;">$${summary.totalSpent.toLocaleString()}</div>
        </div>
        <div class="budget-summary-card">
            <h4>Remaining</h4>
            <div class="budget-amount" style="color: ${summary.totalVariance >= 0 ? '#4caf50' : '#f44336'};">
                $${summary.totalVariance.toLocaleString()}
            </div>
        </div>
        <div class="budget-summary-card">
            <h4>Utilization</h4>
            <div class="budget-amount" style="color: ${summary.utilizationPercent > 90 ? '#f44336' : '#667eea'};">
                ${summary.utilizationPercent}%
            </div>
        </div>
    `;
}

function renderBudgetDetails() {
    const summary = budgetManager.getBudgetSummary();
    const alerts = budgetManager.getBudgetAlerts();
    const container = document.getElementById('budget-details');
    
    let alertsHtml = '';
    if (alerts.length > 0) {
        alertsHtml = `
            <div style="margin-bottom: 20px;">
                <h4>⚠️ Budget Alerts</h4>
                ${alerts.map(alert => `
                    <div class="notification ${alert.type}" style="position: static; transform: none; margin-bottom: 10px;">
                        ${alert.message} (${alert.utilization}%)
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = `
        ${alertsHtml}
        <h4>Budget Categories</h4>
        ${summary.categories.map(category => `
            <div class="budget-category">
                <div class="budget-category-info">
                    <h5>${category.category}</h5>
                    <p>${category.description || 'No description'}</p>
                </div>
                <div class="budget-amounts">
                    <span class="budget-planned">Planned: $${category.plannedAmount.toLocaleString()}</span>
                    <span class="budget-spent">Spent: $${(category.actualSpent || 0).toLocaleString()}</span>
                    <span class="budget-variance ${category.variance >= 0 ? 'positive' : 'negative'}">
                        Variance: $${(category.variance || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        `).join('')}
    `;
}

// Risk Management Functions
function openRiskModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚠️ Add Risk</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Risk Title:</label>
                    <input type="text" id="risk-title" placeholder="Brief risk description" required>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="risk-description" rows="3" placeholder="Detailed risk description..." required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="risk-category">
                            ${riskManager.riskCategories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Owner:</label>
                        <select id="risk-owner">
                            <option value="">Unassigned</option>
                            ${teamMembers.map(member => 
                                `<option value="${member}">${member}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Probability:</label>
                        <select id="risk-probability">
                            ${riskManager.probabilityLevels.map(level => 
                                `<option value="${level}">${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Impact:</label>
                        <select id="risk-impact">
                            ${riskManager.impactLevels.map(level => 
                                `<option value="${level}">${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Mitigation Strategy:</label>
                    <textarea id="risk-mitigation" rows="3" placeholder="How will this risk be mitigated?"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveRisk()" class="primary">Add Risk</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveRisk() {
    const title = document.getElementById('risk-title').value;
    const description = document.getElementById('risk-description').value;
    const category = document.getElementById('risk-category').value;
    const owner = document.getElementById('risk-owner').value;
    const probability = document.getElementById('risk-probability').value;
    const impact = document.getElementById('risk-impact').value;
    const mitigation = document.getElementById('risk-mitigation').value;
    
    if (!title || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    riskManager.addRisk({
        title,
        description,
        category,
        owner,
        probability,
        impact,
        mitigation
    });
    
    renderRiskMatrix();
    renderRisksList();
    closeModal();
    showNotification('Risk added successfully!');
}

function renderRiskMatrix() {
    const matrix = riskManager.getRiskMatrix();
    const container = document.getElementById('risk-matrix');
    
    const matrixCells = [
        { key: 'High-High', label: 'High Impact / High Probability', class: 'high-high' },
        { key: 'High-Medium', label: 'High Impact / Medium Probability', class: 'high-medium' },
        { key: 'High-Low', label: 'High Impact / Low Probability', class: 'high-low' },
        { key: 'Medium-High', label: 'Medium Impact / High Probability', class: 'medium-high' },
        { key: 'Medium-Medium', label: 'Medium Impact / Medium Probability', class: 'medium-medium' },
        { key: 'Medium-Low', label: 'Medium Impact / Low Probability', class: 'medium-low' },
        { key: 'Low-High', label: 'Low Impact / High Probability', class: 'low-high' },
        { key: 'Low-Medium', label: 'Low Impact / Medium Probability', class: 'low-medium' },
        { key: 'Low-Low', label: 'Low Impact / Low Probability', class: 'low-low' }
    ];
    
    container.innerHTML = matrixCells.map(cell => {
        const risks = matrix[cell.key] || [];
        return `
            <div class="risk-matrix-cell ${cell.class}">
                <h5>${cell.label}</h5>
                ${risks.map(risk => `
                    <div class="risk-item">${risk.title}</div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function renderRisksList() {
    const topRisks = riskManager.getTopRisks(10);
    const container = document.getElementById('risks-list');
    
    container.innerHTML = `
        <h4>Top Risks (by Score)</h4>
        ${topRisks.map(risk => `
            <div class="risk-card">
                <h5>${risk.title}</h5>
                <p>${risk.description}</p>
                <div class="risk-meta">
                    <span class="risk-badge ${risk.category.toLowerCase()}">${risk.category}</span>
                    <span class="risk-badge ${risk.probability.toLowerCase()}">P: ${risk.probability}</span>
                    <span class="risk-badge ${risk.impact.toLowerCase()}">I: ${risk.impact}</span>
                    <span class="risk-badge" style="background: #333;">Score: ${risk.riskScore}</span>
                    ${risk.owner ? `<span class="risk-badge" style="background: #2196f3;">${risk.owner}</span>` : ''}
                </div>
                ${risk.mitigation ? `<p style="margin-top: 10px; font-style: italic;">Mitigation: ${risk.mitigation}</p>` : ''}
            </div>
        `).join('')}
    `;
}

// Stakeholder Management Functions
function openStakeholderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👥 Add Stakeholder</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" id="stakeholder-name" placeholder="Stakeholder name" required>
                    </div>
                    <div class="form-group">
                        <label>Role:</label>
                        <input type="text" id="stakeholder-role" placeholder="Their role/position" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Organization:</label>
                        <input type="text" id="stakeholder-organization" placeholder="Company/organization">
                    </div>
                    <div class="form-group">
                        <label>Type:</label>
                        <select id="stakeholder-type">
                            ${stakeholderManager.stakeholderTypes.map(type => 
                                `<option value="${type}">${type}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Influence Level:</label>
                        <select id="stakeholder-influence">
                            ${stakeholderManager.influenceLevels.map(level => 
                                `<option value="${level}">${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Interest Level:</label>
                        <select id="stakeholder-interest">
                            ${stakeholderManager.interestLevels.map(level => 
                                `<option value="${level}">${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Contact Information:</label>
                    <input type="text" id="stakeholder-contact" placeholder="Email, phone, etc.">
                </div>
                <div class="form-group">
                    <label>Expectations:</label>
                    <textarea id="stakeholder-expectations" rows="2" placeholder="What do they expect from the project?"></textarea>
                </div>
                <div class="form-group">
                    <label>Concerns:</label>
                    <textarea id="stakeholder-concerns" rows="2" placeholder="What are their main concerns?"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()">Cancel</button>
                <button onclick="saveStakeholder()" class="primary">Add Stakeholder</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveStakeholder() {
    const name = document.getElementById('stakeholder-name').value;
    const role = document.getElementById('stakeholder-role').value;
    const organization = document.getElementById('stakeholder-organization').value;
    const type = document.getElementById('stakeholder-type').value;
    const influence = document.getElementById('stakeholder-influence').value;
    const interest = document.getElementById('stakeholder-interest').value;
    const contact = document.getElementById('stakeholder-contact').value;
    const expectations = document.getElementById('stakeholder-expectations').value;
    const concerns = document.getElementById('stakeholder-concerns').value;
    
    if (!name || !role) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    stakeholderManager.addStakeholder({
        name,
        role,
        organization,
        type,
        influence,
        interest,
        contact,
        expectations,
        concerns
    });
    
    renderStakeholderMatrix();
    renderStakeholdersList();
    closeModal();
    showNotification('Stakeholder added successfully!');
}

function renderStakeholderMatrix() {
    const matrix = stakeholderManager.getStakeholderMatrix();
    const container = document.getElementById('stakeholder-matrix');
    
    const matrixCells = [
        { key: 'High-High', label: 'Manage Closely', class: 'high-high' },
        { key: 'High-Medium', label: 'Keep Satisfied', class: 'high-medium' },
        { key: 'High-Low', label: 'Keep Satisfied', class: 'high-low' },
        { key: 'Medium-High', label: 'Keep Informed', class: 'medium-high' },
        { key: 'Medium-Medium', label: 'Monitor', class: 'medium-medium' },
        { key: 'Medium-Low', label: 'Monitor', class: 'medium-low' },
        { key: 'Low-High', label: 'Keep Informed', class: 'low-high' },
        { key: 'Low-Medium', label: 'Monitor', class: 'low-medium' },
        { key: 'Low-Low', label: 'Monitor', class: 'low-low' }
    ];
    
    container.innerHTML = matrixCells.map(cell => {
        const stakeholders = matrix[cell.key] || [];
        return `
            <div class="stakeholder-matrix-cell ${cell.class}">
                <h5>${cell.label}</h5>
                ${stakeholders.map(stakeholder => `
                    <div class="stakeholder-item">${stakeholder.name}</div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function renderStakeholdersList() {
    const container = document.getElementById('stakeholders-list');
    
    container.innerHTML = `
        <h4>All Stakeholders</h4>
        ${stakeholderManager.stakeholders.map(stakeholder => `
            <div class="stakeholder-card">
                <h5>${stakeholder.name}</h5>
                <div class="role">${stakeholder.role}${stakeholder.organization ? ` at ${stakeholder.organization}` : ''}</div>
                <div class="stakeholder-meta">
                    <span class="stakeholder-badge ${stakeholder.engagementStrategy.toLowerCase().replace(' ', '-')}">${stakeholder.engagementStrategy}</span>
                    <span class="risk-badge ${stakeholder.influence.toLowerCase()}">Influence: ${stakeholder.influence}</span>
                    <span class="risk-badge ${stakeholder.interest.toLowerCase()}">Interest: ${stakeholder.interest}</span>
                    <span class="risk-badge" style="background: #9c27b0;">${stakeholder.type}</span>
                </div>
                ${stakeholder.expectations ? `<p style="margin-top: 8px;"><strong>Expects:</strong> ${stakeholder.expectations}</p>` : ''}
                ${stakeholder.concerns ? `<p style="margin-top: 5px;"><strong>Concerns:</strong> ${stakeholder.concerns}</p>` : ''}
            </div>
        `).join('')}
    `;
}

// Enhanced tab switching to handle new tabs
function switchTabExtended(tabName) {
    // Call original switchTab function
    switchTab(tabName);
    
    // Handle new tab-specific rendering
    switch(tabName) {
        case 'budget':
            renderBudgetSummary();
            renderBudgetDetails();
            break;
        case 'risks':
            renderRiskMatrix();
            renderRisksList();
            break;
        case 'stakeholders':
            renderStakeholderMatrix();
            renderStakeholdersList();
            break;
    }
}

// Make functions globally available
window.openBudgetItemModal = openBudgetItemModal;
window.saveBudgetItem = saveBudgetItem;
window.openExpenseModal = openExpenseModal;
window.saveExpense = saveExpense;
window.openRiskModal = openRiskModal;
window.saveRisk = saveRisk;
window.openStakeholderModal = openStakeholderModal;
window.saveStakeholder = saveStakeholder;
window.switchTabExtended = switchTabExtended;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupNewFeatureListeners();
    
    // Override the original switchTab function
    const originalSwitchTab = window.switchTab;
    window.switchTab = function(tabName) {
        originalSwitchTab(tabName);
        switchTabExtended(tabName);
    };
});