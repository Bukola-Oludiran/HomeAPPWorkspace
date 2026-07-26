import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.lease-reports', action: 'read', dataClassification: 'PCI', reason: 'lease report gRPC default' },
    'GenerateFinancialReport': { resource: 'homeai:grpc.lease-reports.financial', action: 'write', dataClassification: 'PCI', reason: 'financial report generated' },
};

export default registry;
