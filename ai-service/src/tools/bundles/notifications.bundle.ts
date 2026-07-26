/**
 * notifications bundle — read (listMine) + writes (markRead variants,
 * delete variants) via gRPC. All writes are low-risk (notifications are
 * an inherently per-user surface) so no confirm gate.
 */

import { z } from 'zod';
import type {
    NotificationListItem,
    NotificationListProps,
} from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

// ============================================
// listMine
// ============================================

const listParams = z.object({
    unreadOnly: z.boolean().default(false),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'notifications.listMine',
    label: 'My notifications',
    description:
        'List notifications for the authenticated user. Scoped by ctx.user.userId.',
    parameters: listParams,
    async execute(params, ctx, sink) {
        const userId = ctx.user.userId;
        const where: Record<string, unknown> = { userId };
        if (params.unreadOnly) where.isRead = false;
        const [items, unreadCount] = await Promise.all([
            prismaReadonly.notification.findMany({
                where: where as never,
                take: params.limit,
                orderBy: { createdAt: 'desc' },
            }),
            prismaReadonly.notification.count({
                where: { userId, isRead: false },
            }),
        ]);
        const list: NotificationListProps = {
            items: items.map(
                (n) =>
                    ({
                        notificationId: n.id,
                        title: n.title ?? 'Notification',
                        body: n.body ?? n.message ?? '',
                        createdAt: n.createdAt.toISOString(),
                        isRead: n.isRead,
                    }) satisfies NotificationListItem
            ),
            unreadCount,
        };
        sink.ui({ type: 'NotificationList', props: list });
        return {
            text: `You have ${items.length} notification(s), ${unreadCount} unread.`,
            details: { count: items.length, unread: unreadCount, userId },
        };
    },
});

// ============================================
// writes — gRPC, no confirm gate
// ============================================

const markReadParams = z.object({
    notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

const markRead = defineLocalTool({
    name: 'notifications.markRead',
    label: 'Mark notifications read',
    description: 'Mark a batch of notifications as read.',
    parameters: markReadParams,
    async execute(params, ctx) {
        const r = await grpc.notifications.markNotificationsRead(
            ctx.jwt,
            params.notificationIds
        );
        return {
            text: `Marked ${r.affected} notification(s) as read.`,
            details: { affected: r.affected, userId: ctx.user.userId },
        };
    },
});

const markAllRead = defineLocalTool({
    name: 'notifications.markAllRead',
    label: 'Mark all read',
    description: 'Mark every notification as read for the authenticated user.',
    parameters: z.object({}),
    async execute(_params, ctx) {
        const r = await grpc.notifications.markAllNotificationsRead(ctx.jwt);
        return {
            text: `Marked ${r.affected} notification(s) as read.`,
            details: { affected: r.affected, userId: ctx.user.userId },
        };
    },
});

const deleteIds = defineLocalTool({
    name: 'notifications.delete',
    label: 'Delete notifications',
    description: 'Delete a batch of notifications by id.',
    parameters: markReadParams,
    confirm: {
        humanSummary: (p) => `Delete ${p.notificationIds.length} notification(s).`,
        riskLevel: 'low',
    },
    async execute(params, ctx) {
        const r = await grpc.notifications.deleteNotifications(
            ctx.jwt,
            params.notificationIds
        );
        return {
            text: `Deleted ${r.affected} notification(s).`,
            details: { affected: r.affected, userId: ctx.user.userId },
        };
    },
});

const clearAll = defineLocalTool({
    name: 'notifications.clearAll',
    label: 'Clear all notifications',
    description: 'Delete every notification for the authenticated user. Confirm-gated.',
    parameters: z.object({}),
    confirm: {
        humanSummary: () => 'Delete every notification (this cannot be undone).',
        riskLevel: 'medium',
    },
    async execute(_params, ctx) {
        const r = await grpc.notifications.clearAllNotifications(ctx.jwt);
        return {
            text: `Cleared ${r.affected} notification(s).`,
            details: { affected: r.affected, userId: ctx.user.userId },
        };
    },
});

export const notificationsBundle: ToolBundle = {
    name: 'notifications',
    description: 'View and manage your notifications.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [listMine],
    writeTools: [markRead, markAllRead, deleteIds, clearAll],
};
