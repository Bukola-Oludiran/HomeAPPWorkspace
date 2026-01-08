/**
 * Notification Module - DTO Validation Schemas
 * Per PRD Section 12 (Messaging & Notification Service)
 */

import { z } from 'zod';

// ============================================
// NOTIFICATION TYPES
// ============================================

export const notificationTypeSchema = z.enum([
    'APPLICATION_RECEIVED',
    'APPLICATION_APPROVED',
    'APPLICATION_REJECTED',
    'PAYMENT_RECEIVED',
    'PAYMENT_DUE',
    'PAYMENT_OVERDUE',
    'LEASE_EXPIRING',
    'LEASE_RENEWED',
    'MAINTENANCE_CREATED',
    'MAINTENANCE_ASSIGNED',
    'MAINTENANCE_COMPLETED',
    'MESSAGE_RECEIVED',
    'VERIFICATION_APPROVED',
    'VERIFICATION_REJECTED',
    'JOB_AVAILABLE',
    'JOB_ASSIGNED',
    'ESCROW_FUNDED',
    'ESCROW_RELEASED',
    'GENERAL',
]);

export const notificationChannelSchema = z.enum(['PUSH', 'EMAIL', 'SMS', 'IN_APP']);

// ============================================
// QUERY
// ============================================

export const notificationQuerySchema = z.object({
    type: z.string().optional(),
    read: z.enum(['true', 'false', 'all']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// MARK READ
// ============================================

export const markReadSchema = z.object({
    notificationIds: z.array(z.string().uuid()).min(1).max(100),
});

// ============================================
// SEND NOTIFICATION (Internal/Admin)
// ============================================

export const sendNotificationSchema = z.object({
    userId: z.string().uuid(),
    type: notificationTypeSchema,
    title: z.string().min(1).max(255),
    body: z.string().min(1).max(1000),
    data: z.record(z.unknown()).optional(),
    channels: z.array(notificationChannelSchema).default(['IN_APP']),
});

// ============================================
// REGISTER DEVICE (Push notifications)
// ============================================

export const registerDeviceSchema = z.object({
    token: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']),
    deviceId: z.string().optional(),
});

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export const updatePreferencesSchema = z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),

    // Granular preferences
    preferences: z.object({
        applications: z.boolean().optional(),
        payments: z.boolean().optional(),
        maintenance: z.boolean().optional(),
        messages: z.boolean().optional(),
        marketing: z.boolean().optional(),
    }).optional(),
});

// ============================================
// TYPES
// ============================================

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationQueryDto = z.infer<typeof notificationQuerySchema>;
export type MarkReadDto = z.infer<typeof markReadSchema>;
export type SendNotificationDto = z.infer<typeof sendNotificationSchema>;
export type RegisterDeviceDto = z.infer<typeof registerDeviceSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
