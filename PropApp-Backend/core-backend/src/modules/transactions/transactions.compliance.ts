import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'POST /webhook/paystack': {
        resource: 'homeai:transactions.webhook',
        action: 'write',
        dataClassification: 'PCI',
        actorOverride: { service: 'paystack' },
        reason: 'paystack webhook reconciliation',
    },

    'GET /': { resource: 'homeai:transactions.history', action: 'list', dataClassification: 'PCI' },
    'GET /:id': { resource: 'homeai:transactions.history', action: 'read', dataClassification: 'PCI' },

    'POST /pay': { resource: 'homeai:transactions.payment', action: 'write', dataClassification: 'PCI', reason: 'payment initiated' },
    'POST /verify': { resource: 'homeai:transactions.payment', action: 'write', dataClassification: 'PCI', reason: 'payment verified' },

    'POST /escrow': { resource: 'homeai:transactions.escrow', action: 'write', dataClassification: 'PCI', reason: 'escrow created' },
    'POST /escrow/:id/release': { resource: 'homeai:transactions.escrow', action: 'write', dataClassification: 'PCI', reason: 'escrow released' },

    'POST /:id/refund': { resource: 'homeai:transactions.refund', action: 'write', dataClassification: 'PCI', reason: 'refund requested' },
};

export default registry;
