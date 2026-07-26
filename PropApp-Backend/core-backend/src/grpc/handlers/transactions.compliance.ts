import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.transactions', action: 'read', dataClassification: 'PCI', reason: 'transactions gRPC default' },
    'InitiatePayment': { resource: 'homeai:grpc.transactions.payment', action: 'write', dataClassification: 'PCI', reason: 'payment initiated' },
};

export default registry;
