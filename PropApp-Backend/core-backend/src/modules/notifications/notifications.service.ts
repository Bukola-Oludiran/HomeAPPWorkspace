/**
 * Notification Service
 * Handles push, email, SMS, and in-app notifications
 * Per PRD Section 12
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { ValidationError } from '../../common/utils/errors';
import { regionConfigService } from '../../config/regions';
import {
    NotificationType,
    NotificationChannel,
    NotificationQueryDto,
    SendNotificationDto,
    RegisterDeviceDto,
    UpdatePreferencesDto,
} from './notifications.dto';

// ============================================
// TYPES
// ============================================

interface NotificationDetail {
    id: string;
    type: string;
    title: string | null;
    body: string | null;
    data: Record<string, unknown>;
    read: boolean;
    channels: NotificationChannel[];
    createdAt: Date;
}

interface DeviceToken {
    id: string;
    token: string;
    platform: string;
    active: boolean;
    createdAt: Date;
}

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

class NotificationService {
    // ----------------------------------------
    // GET NOTIFICATIONS
    // ----------------------------------------

    /**
     * Get user's notifications
     * GET /api/v1/notifications
     */
    async getNotifications(userId: string, query: NotificationQueryDto): Promise<{
        notifications: NotificationDetail[];
        unreadCount: number;
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = { userId };

        if (query.type) {
            (where as any).type = query.type;
        }

        if (query.read === 'true') {
            where.read = true;
        } else if (query.read === 'false') {
            where.read = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, read: false } }),
        ]);

        return {
            notifications: notifications.map(n => ({
                id: n.id,
                type: n.type as NotificationType,
                title: n.title,
                body: n.body,
                data: (n.data as Record<string, unknown>) || {},
                read: n.read,
                channels: (n.channels as NotificationChannel[]) || ['IN_APP'],
                createdAt: n.createdAt,
            })),
            unreadCount,
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get unread count
     * GET /api/v1/notifications/unread-count
     */
    async getUnreadCount(userId: string): Promise<{ count: number }> {
        const count = await prisma.notification.count({
            where: { userId, read: false },
        });

        return { count };
    }

    // ----------------------------------------
    // MARK READ
    // ----------------------------------------

    /**
     * Mark notifications as read
     * POST /api/v1/notifications/mark-read
     */
    async markAsRead(userId: string, notificationIds: string[]): Promise<{ updated: number }> {
        const result = await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
            data: { read: true, updatedAt: new Date() },
        });

        return { updated: result.count };
    }

    /**
     * Mark all as read
     * POST /api/v1/notifications/mark-all-read
     */
    async markAllAsRead(userId: string): Promise<{ updated: number }> {
        const result = await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, updatedAt: new Date() },
        });

        return { updated: result.count };
    }

    // ----------------------------------------
    // SEND NOTIFICATION
    // ----------------------------------------

    /**
     * Send notification to user
     * Internal use or admin endpoint
     */
    async sendNotification(data: SendNotificationDto): Promise<{ notificationId: string }> {
        // Check user preferences
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: {
                id: true,
                email: true,
                phone: true,
                notificationPreferences: true,
            },
        });

        if (!user) {
            throw new ValidationError('User not found', []);
        }

        // Create in-app notification
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type as any,
                title: data.title,
                body: data.body,
                data: data.data ? JSON.parse(JSON.stringify(data.data)) : {},
                channels: data.channels,
                read: false,
            },
        });

        // Send to external channels
        const prefs = (user.notificationPreferences as Record<string, boolean>) || {};

        if (data.channels.includes('EMAIL') && prefs.emailNotifications !== false) {
            await this.sendEmailNotification(user.email, data.title, data.body);
        }

        if (data.channels.includes('SMS') && prefs.smsNotifications !== false && user.phone) {
            await this.sendSmsNotification(user.phone, data.body);
        }

        if (data.channels.includes('PUSH') && prefs.pushNotifications !== false) {
            await this.sendPushNotification(data.userId, data.title, data.body, data.data);
        }

        logger.info(`Notification sent: ${notification.id} to user ${data.userId}`);

        return { notificationId: notification.id };
    }

    /**
     * Send notification to multiple users
     */
    async sendBulkNotification(
        userIds: string[],
        type: NotificationType,
        title: string,
        body: string,
        data?: Record<string, unknown>
    ): Promise<{ sent: number }> {
        const notifications = await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId,
                type: type as any,
                title,
                body,
                data: data ? JSON.parse(JSON.stringify(data)) : {},
                channels: ['IN_APP'],
                read: false,
            } as any)),
        });

        logger.info(`Bulk notification sent to ${notifications.count} users`);

        return { sent: notifications.count };
    }

    // ----------------------------------------
    // DEVICE REGISTRATION (Push)
    // ----------------------------------------

    /**
     * Register device for push notifications
     * POST /api/v1/notifications/devices
     */
    async registerDevice(userId: string, data: RegisterDeviceDto): Promise<{ deviceId: string }> {
        // Upsert device token
        const existing = await prisma.deviceToken.findFirst({
            where: { userId, token: data.token },
        });

        if (existing) {
            await prisma.deviceToken.update({
                where: { id: existing.id },
                data: { active: true, updatedAt: new Date() },
            });
            return { deviceId: existing.id };
        }

        const device = await prisma.deviceToken.create({
            data: {
                userId,
                token: data.token,
                platform: data.platform,
                deviceId: data.deviceId,
                active: true,
            },
        });

        logger.info(`Device registered: ${device.id} for user ${userId}`);

        return { deviceId: device.id };
    }

    /**
     * Unregister device
     * DELETE /api/v1/notifications/devices/:token
     */
    async unregisterDevice(userId: string, token: string): Promise<{ message: string }> {
        await prisma.deviceToken.updateMany({
            where: { userId, token },
            data: { active: false, updatedAt: new Date() },
        });

        return { message: 'Device unregistered' };
    }

    /**
     * Get user's devices
     */
    async getUserDevices(userId: string): Promise<DeviceToken[]> {
        const devices = await prisma.deviceToken.findMany({
            where: { userId, active: true },
        });

        return devices.map(d => ({
            id: d.id,
            token: d.token.slice(-10), // Only show last 10 chars for security
            platform: d.platform,
            active: d.active,
            createdAt: d.createdAt,
        }));
    }

    // ----------------------------------------
    // PREFERENCES
    // ----------------------------------------

    /**
     * Get notification preferences
     * GET /api/v1/notifications/preferences
     */
    async getPreferences(userId: string): Promise<Record<string, unknown>> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPreferences: true },
        });

        return (user?.notificationPreferences as Record<string, unknown>) || {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            preferences: {
                applications: true,
                payments: true,
                maintenance: true,
                messages: true,
                marketing: false,
            },
        };
    }

    /**
     * Update notification preferences
     * PUT /api/v1/notifications/preferences
     */
    async updatePreferences(userId: string, data: UpdatePreferencesDto): Promise<Record<string, unknown>> {
        const current = await this.getPreferences(userId);
        const updated = { ...current, ...data };

        await prisma.user.update({
            where: { id: userId },
            data: { notificationPreferences: updated },
        });

        logger.info(`Notification preferences updated for user ${userId}`);

        return updated;
    }

    // ----------------------------------------
    // DELETE NOTIFICATIONS
    // ----------------------------------------

    /**
     * Delete notifications
     * DELETE /api/v1/notifications
     */
    async deleteNotifications(userId: string, notificationIds: string[]): Promise<{ deleted: number }> {
        const result = await prisma.notification.deleteMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
        });

        return { deleted: result.count };
    }

    /**
     * Clear all notifications
     */
    async clearAllNotifications(userId: string): Promise<{ deleted: number }> {
        const result = await prisma.notification.deleteMany({
            where: { userId },
        });

        return { deleted: result.count };
    }

    // ----------------------------------------
    // PROVIDER INTEGRATIONS (TODO: Implement)
    // ----------------------------------------

    private async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
        const regionConfig = regionConfigService.getDefaultConfig();
        // TODO: Integrate with SendGrid/Mailgun
        logger.info(`Email notification queued: ${email} - ${subject}`);
    }

    private async sendSmsNotification(phone: string, message: string): Promise<void> {
        const regionConfig = regionConfigService.getDefaultConfig();
        // TODO: Integrate with Africa's Talking / Termii
        logger.info(`SMS notification queued: ${phone}`);
    }

    private async sendPushNotification(
        userId: string,
        title: string,
        body: string,
        data?: Record<string, unknown>
    ): Promise<void> {
        // Get user's active devices
        const devices = await prisma.deviceToken.findMany({
            where: { userId, active: true },
        });

        // TODO: Integrate with FCM / APNs
        for (const device of devices) {
            logger.info(`Push notification queued: ${device.platform} - ${title}`);
        }
    }
}

export const notificationService = new NotificationService();
export { NotificationService };
