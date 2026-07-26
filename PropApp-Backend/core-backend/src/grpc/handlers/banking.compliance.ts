import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.banking', action: 'read', dataClassification: 'PCI', reason: 'banking gRPC default' },
    'AddBankAccount': { resource: 'homeai:grpc.banking.account', action: 'write', dataClassification: 'PCI', reason: 'bank account added' },
    'DeleteBankAccount': { resource: 'homeai:grpc.banking.account', action: 'delete', dataClassification: 'PCI', reason: 'bank account removed' },
    'ResolveBankAccount': { resource: 'homeai:grpc.banking.account', action: 'read', dataClassification: 'PCI', reason: 'bank account resolved' },
};

export default registry;
