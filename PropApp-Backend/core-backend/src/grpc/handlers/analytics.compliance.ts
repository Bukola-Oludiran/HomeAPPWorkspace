import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.analytics', action: 'read', dataClassification: 'internal', reason: 'analytics gRPC default' },
};

export default registry;
