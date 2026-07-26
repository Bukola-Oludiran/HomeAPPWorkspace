import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /': { resource: 'homeai:notifications.inbox', action: 'list', dataClassification: 'internal' },
    'GET /unread-count': { resource: 'homeai:notifications.inbox', action: 'read', dataClassification: 'internal' },
    'POST /mark-read': { resource: 'homeai:notifications.inbox', action: 'write', dataClassification: 'internal' },
    'POST /mark-all-read': { resource: 'homeai:notifications.inbox', action: 'write', dataClassification: 'internal' },

    'GET /devices': { resource: 'homeai:notifications.device', action: 'list', dataClassification: 'internal' },
    'POST /devices': { resource: 'homeai:notifications.device', action: 'write', dataClassification: 'internal' },
    'DELETE /devices/:token': { resource: 'homeai:notifications.device', action: 'delete', dataClassification: 'internal' },

    'GET /preferences': { resource: 'homeai:notifications.preferences', action: 'read', dataClassification: 'internal' },
    'PUT /preferences': { resource: 'homeai:notifications.preferences', action: 'write', dataClassification: 'internal' },

    'DELETE /': { resource: 'homeai:notifications.inbox', action: 'delete', dataClassification: 'internal' },
    'DELETE /all': { resource: 'homeai:notifications.inbox', action: 'delete', dataClassification: 'internal', reason: 'clear all' },

    'POST /send': { resource: 'homeai:notifications.broadcast', action: 'write', dataClassification: 'internal', reason: 'admin broadcast' },
};

export default registry;
