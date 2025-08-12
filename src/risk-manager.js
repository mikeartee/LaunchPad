// Risk Management Module for LaunchPad
class RiskManager {
    constructor() {
        this.risks = [];
        this.riskCategories = ['Technical', 'Financial', 'Schedule', 'Resource', 'External'];
        this.probabilityLevels = ['Low', 'Medium', 'High'];
        this.impactLevels = ['Low', 'Medium', 'High'];
    }

    addRisk(risk) {
        const newRisk = {
            id: Date.now().toString(),
            title: risk.title,
            description: risk.description,
            category: risk.category,
            probability: risk.probability,
            impact: risk.impact,
            riskScore: this.calculateRiskScore(risk.probability, risk.impact),
            mitigation: risk.mitigation || '',
            owner: risk.owner || '',
            status: 'Open',
            createdDate: new Date().toISOString(),
            ...risk
        };
        this.risks.push(newRisk);
        return newRisk;
    }

    calculateRiskScore(probability, impact) {
        const probValue = { 'Low': 1, 'Medium': 2, 'High': 3 }[probability] || 1;
        const impactValue = { 'Low': 1, 'Medium': 2, 'High': 3 }[impact] || 1;
        return probValue * impactValue;
    }

    getRiskMatrix() {
        const matrix = {};
        this.risks.forEach(risk => {
            const key = `${risk.probability}-${risk.impact}`;
            if (!matrix[key]) matrix[key] = [];
            matrix[key].push(risk);
        });
        return matrix;
    }

    getTopRisks(limit = 5) {
        return this.risks
            .filter(risk => risk.status === 'Open')
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, limit);
    }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskManager;
} else {
    window.RiskManager = RiskManager;
}