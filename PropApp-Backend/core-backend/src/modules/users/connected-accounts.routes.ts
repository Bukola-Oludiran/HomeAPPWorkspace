/**
 * Connected Accounts Routes
 * Per APIRevised.md Section 6
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { connectedAccountsService } from './connected-accounts.service';
import { linkAccountSchema } from './connected-accounts.dto';

const router = Router();

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

router.post(
    '/me/connected-accounts/:provider',
    authenticate,
    validate(linkAccountSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await connectedAccountsService.linkAccount(
                req.user!.id,
                req.params.provider,
                req.body.idToken
            );
            sendSuccess(res, result, 201);
        } catch (error) {
            next(error);
        }
    }
);

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
