import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /jobs': { resource: 'homeai:agent.jobs', action: 'list', dataClassification: 'internal' },
    'GET /jobs/accepted': { resource: 'homeai:agent.jobs', action: 'list', dataClassification: 'internal' },
    'POST /jobs/:id/accept': { resource: 'homeai:agent.jobs', action: 'write', dataClassification: 'internal', reason: 'job accepted' },
    'POST /jobs/:id/decline': { resource: 'homeai:agent.jobs', action: 'write', dataClassification: 'internal', reason: 'job declined' },
    'PUT /jobs/:id/complete': { resource: 'homeai:agent.jobs', action: 'write', dataClassification: 'internal', reason: 'job completed' },

    'GET /schedule': { resource: 'homeai:agent.schedule', action: 'list', dataClassification: 'internal' },

    'GET /earnings': { resource: 'homeai:agent.earnings', action: 'read', dataClassification: 'PCI' },
    'GET /earnings/history': { resource: 'homeai:agent.earnings.history', action: 'list', dataClassification: 'PCI' },
    'POST /earnings/withdraw': { resource: 'homeai:agent.earnings.withdraw', action: 'write', dataClassification: 'PCI', reason: 'payout requested' },
};

export default registry;
