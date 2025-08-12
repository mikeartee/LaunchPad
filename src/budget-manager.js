// Budget Management Module
class BudgetManager {
    constructor() {
        this.budgetItems = [];
        this.expenses = [];
        this.categories = ['Personnel', 'Equipment', 'Software', 'Marketing', 'Operations', 'Contingency'];
        this.totalBudget = 0;
    }

    setBudget(category, plannedAmount, description = '') {
        const existingIndex = this.budgetItems.findIndex(item => item.category === category);
        const budgetItem = {
            id: existingIndex >= 0 ? this.budgetItems[existingIndex].id : Date.now().toString(),
            category,
            plannedAmount,
            description,
            actualSpent: existingIndex >= 0 ? this.budgetItems[existingIndex].actualSpent : 0,
            lastUpdated: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            this.budgetItems[existingIndex] = budgetItem;
        } else {
            this.budgetItems.push(budgetItem);
        }

        this.recalculateTotalBudget();
        return budgetItem;
    }

    addExpense(expense) {
        const newExpense = {
            id: Date.now().toString(),
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            date: expense.date || new Date().toISOString(),
            vendor: expense.vendor || '',
            approved: expense.approved || false,
            taskId: expense.taskId || null,
            ...expense
        };

        this.expenses.push(newExpense);
        this.updateActualSpending(expense.category, expense.amount);
        return newExpense;
    }

    updateActualSpending(category, amount) {
        const budgetItem = this.budgetItems.find(item => item.category === category);
        if (budgetItem) {
            budgetItem.actualSpent = (budgetItem.actualSpent || 0) + amount;
            budgetItem.variance = budgetItem.plannedAmount - budgetItem.actualSpent;
            budgetItem.variancePercent = ((budgetItem.variance / budgetItem.plannedAmount) * 100).toFixed(1);
        }
    }

    recalculateTotalBudget() {
        this.totalBudget = this.budgetItems.reduce((total, item) => total + item.plannedAmount, 0);
    }

    getBudgetSummary() {
        const totalPlanned = this.budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
        const totalSpent = this.budgetItems.reduce((sum, item) => sum + (item.actualSpent || 0), 0);
        const totalVariance = totalPlanned - totalSpent;
        const utilizationPercent = totalPlanned > 0 ? ((totalSpent / totalPlanned) * 100).toFixed(1) : 0;

        return {
            totalPlanned,
            totalSpent,
            totalVariance,
            utilizationPercent,
            remainingBudget: totalVariance,
            categories: this.budgetItems.map(item => ({
                ...item,
                utilizationPercent: item.plannedAmount > 0 ? 
                    (((item.actualSpent || 0) / item.plannedAmount) * 100).toFixed(1) : 0
            }))
        };
    }

    getBudgetAlerts() {
        const alerts = [];
        this.budgetItems.forEach(item => {
            const utilization = item.plannedAmount > 0 ? 
                ((item.actualSpent || 0) / item.plannedAmount) * 100 : 0;
            
            if (utilization > 90) {
                alerts.push({
                    type: 'danger',
                    category: item.category,
                    message: `Budget exceeded for ${item.category}`,
                    utilization: utilization.toFixed(1)
                });
            } else if (utilization > 75) {
                alerts.push({
                    type: 'warning',
                    category: item.category,
                    message: `Budget at ${utilization.toFixed(1)}% for ${item.category}`,
                    utilization: utilization.toFixed(1)
                });
            }
        });
        return alerts;
    }

    getExpensesByCategory() {
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        return categoryTotals;
    }

    getMonthlySpending() {
        const monthlyData = {};
        this.expenses.forEach(expense => {
            const month = new Date(expense.date).toISOString().substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
        });
        return monthlyData;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BudgetManager;
} else {
    window.BudgetManager = BudgetManager;
}