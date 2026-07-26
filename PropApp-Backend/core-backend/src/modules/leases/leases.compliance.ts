import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /': { resource: 'homeai:leases.agreement', action: 'list', dataClassification: 'PII' },
    'GET /:id': { resource: 'homeai:leases.agreement', action: 'read', dataClassification: 'PII' },
    'POST /': { resource: 'homeai:leases.agreement', action: 'write', dataClassification: 'PII', reason: 'lease created' },
    'PUT /:id': { resource: 'homeai:leases.agreement', action: 'write', dataClassification: 'PII', reason: 'lease terms updated' },

    'POST /:id/renew': { resource: 'homeai:leases.renewal', action: 'write', dataClassification: 'PII', reason: 'renewal offered' },
    'POST /:id/respond': { resource: 'homeai:leases.renewal', action: 'write', dataClassification: 'PII', reason: 'renewal response' },
    'POST /:id/sign': { resource: 'homeai:leases.signing', action: 'write', dataClassification: 'PII', reason: 'e-signature' },
};

export default registry;
