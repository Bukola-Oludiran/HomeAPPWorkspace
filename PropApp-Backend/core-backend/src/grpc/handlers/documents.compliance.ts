import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.documents', action: 'read', dataClassification: 'PII', reason: 'documents gRPC default' },
};

export default registry;
