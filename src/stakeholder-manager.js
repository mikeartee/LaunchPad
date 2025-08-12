// Stakeholder Management Module
class StakeholderManager {
    constructor() {
        this.stakeholders = [];
        this.communicationLog = [];
        this.influenceLevels = ['Low', 'Medium', 'High'];
        this.interestLevels = ['Low', 'Medium', 'High'];
        this.stakeholderTypes = ['Internal', 'External', 'Customer', 'Vendor', 'Regulatory'];
    }

    addStakeholder(stakeholder) {
        const newStakeholder = {
            id: Date.now().toString(),
            name: stakeholder.name,
            role: stakeholder.role,
            organization: stakeholder.organization || '',
            type: stakeholder.type,
            influence: stakeholder.influence,
            interest: stakeholder.interest,
            contact: stakeholder.contact || '',
            communicationPreference: stakeholder.communicationPreference || 'Email',
            expectations: stakeholder.expectations || '',
            concerns: stakeholder.concerns || '',
            engagementStrategy: this.determineEngagementStrategy(stakeholder.influence, stakeholder.interest),
            lastContact: null,
            createdDate: new Date().toISOString(),
            ...stakeholder
        };
        this.stakeholders.push(newStakeholder);
        return newStakeholder;
    }

    determineEngagementStrategy(influence, interest) {
        if (influence === 'High' && interest === 'High') return 'Manage Closely';
        if (influence === 'High' && interest === 'Low') return 'Keep Satisfied';
        if (influence === 'Low' && interest === 'High') return 'Keep Informed';
        return 'Monitor';
    }

    logCommunication(stakeholderId, communication) {
        const log = {
            id: Date.now().toString(),
            stakeholderId,
            type: communication.type,
            subject: communication.subject,
            summary: communication.summary,
            date: new Date().toISOString(),
            followUpRequired: communication.followUpRequired || false,
            followUpDate: communication.followUpDate || null
        };
        this.communicationLog.push(log);
        
        // Update last contact for stakeholder
        const stakeholder = this.stakeholders.find(s => s.id === stakeholderId);
        if (stakeholder) {
            stakeholder.lastContact = log.date;
        }
        
        return log;
    }

    getStakeholderMatrix() {
        const matrix = {
            'High-High': [], 'High-Medium': [], 'High-Low': [],
            'Medium-High': [], 'Medium-Medium': [], 'Medium-Low': [],
            'Low-High': [], 'Low-Medium': [], 'Low-Low': []
        };
        
        this.stakeholders.forEach(stakeholder => {
            const key = `${stakeholder.influence}-${stakeholder.interest}`;
            if (matrix[key]) {
                matrix[key].push(stakeholder);
            }
        });
        
        return matrix;
    }

    getOverdueCommunications(daysSince = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSince);
        
        return this.stakeholders.filter(stakeholder => {
            if (!stakeholder.lastContact) return true;
            return new Date(stakeholder.lastContact) < cutoffDate;
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StakeholderManager;
} else {
    window.StakeholderManager = StakeholderManager;
}