/**
 * Connected Accounts Routes
 * Per APIRevised.md Section 6
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { connectedAccountsService } from './connected-accounts.service';
import { linkAccountSchema } from './connected-accounts.dto';
import { ZodError } from 'zod';

const router = Router();

/**
 * @swagger
 * /users/me/connected-accounts:
 *   get:
 *     summary: Get connected social accounts
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/connected-accounts',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await connectedAccountsService.getConnectedAccounts(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/connected-accounts/{provider}:
 *   post:
 *     summary: Link a social account
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/me/connected-accounts/:provider',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = linkAccountSchema.parse(req.body);
            const result = await connectedAccountsService.linkAccount(
                req.user!.id,
                req.params.provider,
                dto.idToken
            );
            sendSuccess(res, result, 201);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/connected-accounts/{provider}:
 *   delete:
 *     summary: Unlink a social account
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/me/connected-accounts/:provider',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await connectedAccountsService.unlinkAccount(req.user!.id, req.params.provider);
            sendSuccess(res, { message: `${req.params.provider} account unlinked successfully` });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
