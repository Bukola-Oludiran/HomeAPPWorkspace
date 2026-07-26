import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /dashboard': { resource: 'homeai:landlord.dashboard', action: 'read', dataClassification: 'internal' },
    'GET /properties': { resource: 'homeai:landlord.properties', action: 'list', dataClassification: 'internal' },

    'GET /applicants': { resource: 'homeai:landlord.applicants', action: 'list', dataClassification: 'PII' },
    'GET /applicants/:id': { resource: 'homeai:landlord.applicants', action: 'read', dataClassification: 'PII' },
    'PUT /applicants/:id/approve': { resource: 'homeai:landlord.applicants', action: 'write', dataClassification: 'PII', reason: 'applicant approved' },
    'PUT /applicants/:id/reject': { resource: 'homeai:landlord.applicants', action: 'write', dataClassification: 'PII', reason: 'applicant rejected' },

    'GET /financials': { resource: 'homeai:landlord.financials', action: 'read', dataClassification: 'PCI' },
    'GET /financials/summary': { resource: 'homeai:landlord.financials', action: 'read', dataClassification: 'PCI' },
    'GET /financials/transactions': { resource: 'homeai:landlord.financials.transactions', action: 'list', dataClassification: 'PCI' },
    'POST /financials/payout': { resource: 'homeai:landlord.payout', action: 'write', dataClassification: 'PCI', reason: 'payout requested' },

    'GET /alerts': { resource: 'homeai:landlord.alerts', action: 'list', dataClassification: 'internal' },

    'POST /properties/:id/verify': { resource: 'homeai:landlord.verification', action: 'write', dataClassification: 'PII', reason: 'verification started' },

    'POST /jobs': { resource: 'homeai:landlord.jobs', action: 'write', dataClassification: 'internal' },
    'GET /jobs': { resource: 'homeai:landlord.jobs', action: 'list', dataClassification: 'internal' },
};

export default registry;
