import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.notifications', action: 'read', dataClassification: 'internal', reason: 'notifications gRPC default' },
    'MarkAllNotificationsRead': { resource: 'homeai:grpc.notifications.inbox', action: 'write', dataClassification: 'internal', reason: 'mark all read' },
    'ClearAllNotifications': { resource: 'homeai:grpc.notifications.inbox', action: 'delete', dataClassification: 'internal', reason: 'clear all' },
};

export default registry;
