import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.maintenance', action: 'read', dataClassification: 'internal', reason: 'maintenance gRPC default' },
    'SubmitMaintenanceRequest': { resource: 'homeai:grpc.maintenance.request', action: 'write', dataClassification: 'internal', reason: 'maintenance submitted' },
    'UpdateMaintenanceRequest': { resource: 'homeai:grpc.maintenance.request', action: 'write', dataClassification: 'internal', reason: 'maintenance updated' },
};

export default registry;
