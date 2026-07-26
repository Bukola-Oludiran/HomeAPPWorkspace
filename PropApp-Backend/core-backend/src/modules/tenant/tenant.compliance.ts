import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /dashboard': { resource: 'homeai:tenant.dashboard', action: 'read', dataClassification: 'internal' },
    'GET /rental': { resource: 'homeai:tenant.rental', action: 'read', dataClassification: 'PII' },

    'GET /applications': { resource: 'homeai:tenant.applications', action: 'list', dataClassification: 'internal' },
    'POST /applications': { resource: 'homeai:tenant.applications', action: 'write', dataClassification: 'PII', reason: 'rental application submitted' },
    'DELETE /applications/:id': { resource: 'homeai:tenant.applications', action: 'delete', dataClassification: 'internal', reason: 'application withdrawn' },

    'GET /saved': { resource: 'homeai:tenant.saved', action: 'list', dataClassification: 'internal' },
    'POST /saved/:propertyId': { resource: 'homeai:tenant.saved', action: 'write', dataClassification: 'internal' },
    'DELETE /saved/:propertyId': { resource: 'homeai:tenant.saved', action: 'delete', dataClassification: 'internal' },

    'GET /payments': { resource: 'homeai:tenant.payments', action: 'list', dataClassification: 'PCI' },
    'POST /payments': { resource: 'homeai:tenant.payments', action: 'write', dataClassification: 'PCI', reason: 'rent payment' },
};

export default registry;
