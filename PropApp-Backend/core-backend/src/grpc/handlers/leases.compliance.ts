import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.leases', action: 'read', dataClassification: 'PII', reason: 'leases gRPC default' },
    'UpdateLease': { resource: 'homeai:grpc.leases.agreement', action: 'write', dataClassification: 'PII', reason: 'lease updated' },
    'RespondToRenewal': { resource: 'homeai:grpc.leases.renewal', action: 'write', dataClassification: 'PII', reason: 'renewal response' },
};

export default registry;
