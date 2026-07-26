import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /': { resource: 'homeai:properties.listing', action: 'list', dataClassification: 'public' },
    'GET /search': { resource: 'homeai:properties.listing', action: 'list', dataClassification: 'public', reason: 'text search' },
    'GET /featured': { resource: 'homeai:properties.listing', action: 'list', dataClassification: 'public' },
    'GET /nearby': { resource: 'homeai:properties.listing', action: 'list', dataClassification: 'public' },
    'GET /:id': { resource: 'homeai:properties.listing', action: 'read', dataClassification: 'public' },

    'GET /my/list': { resource: 'homeai:properties.listing', action: 'list', dataClassification: 'internal', reason: 'owner property listing' },
    'POST /': { resource: 'homeai:properties.listing', action: 'write', dataClassification: 'internal' },
    'PUT /:id': { resource: 'homeai:properties.listing', action: 'write', dataClassification: 'internal' },
    'DELETE /:id': { resource: 'homeai:properties.listing', action: 'delete', dataClassification: 'internal' },
    'PATCH /:id/status': { resource: 'homeai:properties.listing', action: 'write', dataClassification: 'internal' },

    'POST /:id/images': { resource: 'homeai:properties.media', action: 'write', dataClassification: 'internal' },
    'DELETE /:id/images/:imageId': { resource: 'homeai:properties.media', action: 'delete', dataClassification: 'internal' },

    'POST /draft': { resource: 'homeai:properties.draft', action: 'write', dataClassification: 'internal' },
    'PUT /draft/:id': { resource: 'homeai:properties.draft', action: 'write', dataClassification: 'internal' },
    'POST /draft/:id/publish': { resource: 'homeai:properties.listing', action: 'write', dataClassification: 'internal', reason: 'draft published' },
};

export default registry;
