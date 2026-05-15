/**
 * Privacy Settings Routes
 * Per APIRevised.md Section 1.2
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { privacyService } from './privacy.service';
import { privacySettingsSchema } from './privacy.dto';

const router = Router();

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

router.put(
    '/me/privacy',
    authenticate,
    validate(privacySettingsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const settings = await privacyService.updatePrivacySettings(req.user!.id, req.body);
            sendSuccess(res, {
                message: 'Privacy settings updated successfully',
                settings,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
