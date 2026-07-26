import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /status': { resource: 'homeai:verification.status', action: 'read', dataClassification: 'PII' },

    'POST /identity': { resource: 'homeai:verification.identity', action: 'write', dataClassification: 'PII', reason: 'identity verification submitted' },
    'POST /address': { resource: 'homeai:verification.address', action: 'write', dataClassification: 'PII', reason: 'address verification submitted' },

    'GET /properties': { resource: 'homeai:verification.property', action: 'list', dataClassification: 'PII' },
    'GET /properties/:propertyId': { resource: 'homeai:verification.property', action: 'read', dataClassification: 'PII' },
    'POST /properties/:propertyId/cofo': { resource: 'homeai:verification.cofo', action: 'write', dataClassification: 'PII', reason: 'C of O submitted' },
    'POST /properties/:propertyId/audit/request': { resource: 'homeai:verification.audit', action: 'write', dataClassification: 'PII', reason: 'verification audit requested' },

    'GET /admin/pending': { resource: 'homeai:verification.property', action: 'list', dataClassification: 'internal', reason: 'admin queue' },
    'POST /admin/:id/approve': { resource: 'homeai:verification.property', action: 'write', dataClassification: 'internal', reason: 'admin verification approved' },
    'POST /admin/:id/reject': { resource: 'homeai:verification.property', action: 'write', dataClassification: 'internal', reason: 'admin verification rejected' },
};

export default registry;
