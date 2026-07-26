/**
 * Notifications gRPC handlers — thin wrappers around notificationService.
 *
 * Every method validates the JWT via the shared `authenticateGrpc` helper
 * and scopes by ctx.userId. The service-layer methods enforce that
 * notification ids passed in belong to the caller (no IDOR escape route).
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { notificationService } from '../../modules/notifications/notifications.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface IdsReq {
    notification_ids: string[];
    request_id?: string;
}
interface EmptyReq {
    request_id?: string;
}
interface BatchResult {
    affected: number;
}

export const markNotificationsRead: handleUnaryCall<IdsReq, BatchResult> = async (
    call: ServerUnaryCall<IdsReq, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = await notificationService.markAsRead(ctx.userId, call.request.notification_ids);
        callback(null, { affected: r.updated });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const markAllNotificationsRead: handleUnaryCall<EmptyReq, BatchResult> = async (
    call: ServerUnaryCall<EmptyReq, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = await notificationService.markAllAsRead(ctx.userId);
        callback(null, { affected: r.updated });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const deleteNotifications: handleUnaryCall<IdsReq, BatchResult> = async (
    call: ServerUnaryCall<IdsReq, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = await notificationService.deleteNotifications(
            ctx.userId,
            call.request.notification_ids
        );
        callback(null, { affected: r.deleted });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const clearAllNotifications: handleUnaryCall<EmptyReq, BatchResult> = async (
    call: ServerUnaryCall<EmptyReq, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = await notificationService.clearAllNotifications(ctx.userId);
        callback(null, { affected: r.deleted });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const notificationsHandlers = {
    MarkNotificationsRead: markNotificationsRead,
    MarkAllNotificationsRead: markAllNotificationsRead,
    DeleteNotifications: deleteNotifications,
    ClearAllNotifications: clearAllNotifications,
};
