import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'GET /conversations': { resource: 'homeai:messaging.conversation', action: 'list', dataClassification: 'PII' },
    'POST /conversations': { resource: 'homeai:messaging.conversation', action: 'write', dataClassification: 'PII', reason: 'conversation started' },
    'GET /conversations/:id': { resource: 'homeai:messaging.message', action: 'list', dataClassification: 'PII' },
    'POST /conversations/:id': { resource: 'homeai:messaging.message', action: 'write', dataClassification: 'PII', reason: 'message sent' },
};

export default registry;
