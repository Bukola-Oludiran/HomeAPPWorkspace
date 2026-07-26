import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.applications', action: 'read', dataClassification: 'PII', reason: 'applications gRPC default' },
    'WithdrawApplication': { resource: 'homeai:grpc.applications', action: 'delete', dataClassification: 'PII', reason: 'application withdrawn' },
};

export default registry;
