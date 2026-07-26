import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.messaging', action: 'read', dataClassification: 'PII', reason: 'messaging gRPC default' },
    'SendMessage': { resource: 'homeai:grpc.messaging.message', action: 'write', dataClassification: 'PII', reason: 'message sent' },
};

export default registry;
