import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /me': { resource: 'homeai:users.profile', action: 'read', dataClassification: 'PII' },
    'PUT /me': { resource: 'homeai:users.profile', action: 'write', dataClassification: 'PII' },
    'PUT /me/password': { resource: 'homeai:users.password', action: 'write', dataClassification: 'PII', reason: 'self-service password change' },
    'PUT /me/preferences': { resource: 'homeai:users.preferences', action: 'write', dataClassification: 'internal' },
    'PUT /me/notification-settings': { resource: 'homeai:users.notification-settings', action: 'write', dataClassification: 'internal' },
    'DELETE /me': { resource: 'homeai:users.account', action: 'delete', dataClassification: 'PII', reason: 'account deletion' },

    'POST /me/avatar': { resource: 'homeai:users.avatar', action: 'write', dataClassification: 'PII' },

    'GET /me/wallet': { resource: 'homeai:users.wallet', action: 'read', dataClassification: 'PCI' },
    'POST /me/wallet/connect': { resource: 'homeai:users.wallet', action: 'write', dataClassification: 'PCI', reason: 'blockchain wallet linked' },

    'GET /me/favorites': { resource: 'homeai:users.favorites', action: 'list', dataClassification: 'internal' },
    'POST /me/favorites/:propertyId': { resource: 'homeai:users.favorites', action: 'write', dataClassification: 'internal' },
    'DELETE /me/favorites/:propertyId': { resource: 'homeai:users.favorites', action: 'delete', dataClassification: 'internal' },

    'GET /public/landlord/:id': { resource: 'homeai:users.landlord-public', action: 'read', dataClassification: 'public' },
    'GET /public/tenant/:id': { resource: 'homeai:users.tenant-public', action: 'read', dataClassification: 'public' },
    'GET /public/agent/:id': { resource: 'homeai:users.agent-public', action: 'read', dataClassification: 'public' },

    'GET /internal/:id/context': {
        resource: 'homeai:users.ai-context',
        action: 'read',
        dataClassification: 'internal',
        actorOverride: { service: 'ai-service' },
        reason: 'AI service user context lookup',
    },

    'GET /me/profile/tenant': { resource: 'homeai:users.tenant-profile', action: 'read', dataClassification: 'PII' },
    'PUT /me/profile/tenant': { resource: 'homeai:users.tenant-profile', action: 'write', dataClassification: 'PII' },
    'GET /me/profile/landlord': { resource: 'homeai:users.landlord-profile', action: 'read', dataClassification: 'PII' },
    'PUT /me/profile/landlord': { resource: 'homeai:users.landlord-profile', action: 'write', dataClassification: 'PII' },
    'GET /me/profile/agent': { resource: 'homeai:users.agent-profile', action: 'read', dataClassification: 'PII' },
    'PUT /me/profile/agent': { resource: 'homeai:users.agent-profile', action: 'write', dataClassification: 'PII' },

    'POST /me/profile/agent/certifications': { resource: 'homeai:users.agent-certifications', action: 'write', dataClassification: 'internal' },
    'DELETE /me/profile/agent/certifications/:id': { resource: 'homeai:users.agent-certifications', action: 'delete', dataClassification: 'internal' },

    'GET /me/payment-methods': { resource: 'homeai:users.payment-methods', action: 'list', dataClassification: 'PCI' },
    'POST /me/payment-methods': { resource: 'homeai:users.payment-methods', action: 'write', dataClassification: 'PCI' },
    'PUT /me/payment-methods/:id/default': { resource: 'homeai:users.payment-methods', action: 'write', dataClassification: 'PCI' },
    'DELETE /me/payment-methods/:id': { resource: 'homeai:users.payment-methods', action: 'delete', dataClassification: 'PCI' },
};

export default registry;
