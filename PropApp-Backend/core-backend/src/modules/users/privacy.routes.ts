/**
 * Privacy Settings Routes
 * Per APIRevised.md Section 1.2
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { privacyService } from './privacy.service';
import { privacySettingsSchema } from './privacy.dto';
import { ZodError } from 'zod';

const router = Router();

/**
 * @swagger
 * /users/me/privacy:
 *   get:
 *     summary: Get privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/privacy',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const settings = await privacyService.getPrivacySettings(req.user!.id);
            sendSuccess(res, settings);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/me/privacy',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = privacySettingsSchema.parse(req.body);
            const settings = await privacyService.updatePrivacySettings(req.user!.id, dto);
            sendSuccess(res, {
                message: 'Privacy settings updated successfully',
                settings,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

export default router;
