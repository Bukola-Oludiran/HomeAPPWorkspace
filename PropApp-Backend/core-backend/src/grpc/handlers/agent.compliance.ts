import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.agent', action: 'read', dataClassification: 'internal', reason: 'agent gRPC default' },
    'WithdrawEarnings': { resource: 'homeai:grpc.agent.earnings.withdraw', action: 'write', dataClassification: 'PCI', reason: 'agent withdrawal' },
};

export default registry;
