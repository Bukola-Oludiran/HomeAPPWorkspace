/**
 * Notification Routes
 * Per PRD Section 12
 */

import { Router, Request, Response, NextFunction } from 'express';
import { notificationService } from './notifications.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    notificationQuerySchema,
    markReadSchema,
    sendNotificationSchema,
    registerDeviceSchema,
    updatePreferencesSchema,
} from './notifications.dto';
import { z } from 'zod';

const router = Router();

// All notification routes require authentication
router.use(authenticate);
// ============================================
// GET NOTIFICATIONS
// ============================================

/**
 * @route GET /notifications
 * @desc Get user's notifications
 * @access Private
 */
router.get(
    '/',
    validateQuery(notificationQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await notificationService.getNotifications(
                req.user!.id,
                req.query as any
            );
            sendSuccess(res, result.notifications, {
                page: result.page,
                limit: result.limit ?? 20,
                total: result.total,
                totalPages: result.totalPages,
                unreadCount: result.unreadCount,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await notificationService.getUnreadCount(req.user!.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// MARK READ
// ============================================

/**
 * @route POST /notifications/mark-read
 * @desc Mark notifications as read
 * @access Private
 */
router.post(
    '/mark-read',
    validate(markReadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await notificationService.markAsRead(
                req.user!.id,
                req.body.notificationIds
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.post('/mark-all-read', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await notificationService.markAllAsRead(req.user!.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// DEVICE REGISTRATION (Push)
// ============================================

/**
 * @route GET /notifications/devices
 * @desc Get registered devices
 * @access Private
 */
router.get('/devices', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const devices = await notificationService.getUserDevices(req.user!.id);
        sendSuccess(res, devices);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /notifications/devices
 * @desc Register device for push notifications
 * @access Private
 */
router.post(
    '/devices',
    validate(registerDeviceSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await notificationService.registerDevice(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /notifications/devices/:token
 * @desc Unregister device
 * @access Private
 */
router.delete('/devices/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await notificationService.unregisterDevice(
            req.user!.id,
            req.params.token
        );
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// PREFERENCES
// ============================================

/**
 * @route GET /notifications/preferences
 * @desc Get notification preferences
 * @access Private
 */
router.get('/preferences', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const preferences = await notificationService.getPreferences(req.user!.id);
        sendSuccess(res, preferences);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /notifications/preferences
 * @desc Update notification preferences
 * @access Private
 */
router.put(
    '/preferences',
    validate(updatePreferencesSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const preferences = await notificationService.updatePreferences(
                req.user!.id,
                req.body
            );
            sendSuccess(res, preferences);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// DELETE NOTIFICATIONS
// ============================================

/**
 * @route DELETE /notifications
 * @desc Delete notifications
 * @access Private
 */
router.delete(
    '/',
    validate(z.object({ notificationIds: z.array(z.string().uuid()) })),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await notificationService.deleteNotifications(
                req.user!.id,
                req.body.notificationIds
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /notifications/all
 * @desc Clear all notifications
 * @access Private
 */
router.delete('/all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await notificationService.clearAllNotifications(req.user!.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// ADMIN: SEND NOTIFICATION
// ============================================

/**
 * @route POST /notifications/send
 * @desc Send notification to user (Admin)
 * @access Private (Admin)
 */
router.post(
    '/send',
    requireRoles('ADMIN'),
    validate(sendNotificationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await notificationService.sendNotification(req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
