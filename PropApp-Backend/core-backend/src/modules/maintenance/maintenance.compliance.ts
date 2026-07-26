import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /': { resource: 'homeai:maintenance.request', action: 'list', dataClassification: 'internal' },
    'GET /:id': { resource: 'homeai:maintenance.request', action: 'read', dataClassification: 'internal' },
    'POST /': { resource: 'homeai:maintenance.request', action: 'write', dataClassification: 'internal', reason: 'maintenance request created' },
    'PUT /:id': { resource: 'homeai:maintenance.request', action: 'write', dataClassification: 'internal', reason: 'maintenance request updated' },
    'POST /:id/assign': { resource: 'homeai:maintenance.request', action: 'write', dataClassification: 'internal', reason: 'agent assigned' },
};

export default registry;
