/**
 * Banking Routes
 * Bank accounts and payout management
 * Per APIRevised.md Section 2
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { bankingService } from './banking.service';
import {
    addBankAccountSchema,
    resolveBankAccountSchema,
    bankQuerySchema,
    requestPayoutSchema,
    payoutQuerySchema,
    updatePayoutSettingsSchema,
} from './banking.dto';

const router = Router();

// ============================================
// SUPPORTED BANKS
// ============================================

router.get(
    '/banks',
    authenticate,
    validateQuery(bankQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { country, search } = req.query as { country?: string; search?: string };
            const banks = await bankingService.getSupportedBanks(country, search);
            sendSuccess(res, banks);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// RESOLVE ACCOUNT
// ============================================

router.post(
    '/resolve',
    authenticate,
    validate(resolveBankAccountSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { bankCode, accountNumber } = req.body;
            const result = await bankingService.resolveBankAccount(bankCode, accountNumber);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// BANK ACCOUNTS
// ============================================

router.get(
    '/users/me/bank-accounts',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await bankingService.getBankAccounts(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/users/me/bank-accounts',
    authenticate,
    validate(addBankAccountSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const account = await bankingService.addBankAccount(req.user!.id, req.body);
            sendSuccess(res, account, 201);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/users/me/bank-accounts/:id/default',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await bankingService.setDefaultBankAccount(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Bank account set as default payout destination' });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/users/me/bank-accounts/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await bankingService.deleteBankAccount(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Bank account removed successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PAYOUTS
// ============================================

router.post(
    '/users/me/payouts',
    authenticate,
    validate(requestPayoutSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await bankingService.requestPayout(req.user!.id, req.body);
            sendSuccess(res, result, 201);
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/users/me/payouts',
    authenticate,
    validateQuery(payoutQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await bankingService.getPayoutHistory(req.user!.id, req.query as never);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PAYOUT SETTINGS
// ============================================

router.get(
    '/users/me/payout-settings',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await bankingService.getPayoutSettings(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/users/me/payout-settings',
    authenticate,
    validate(updatePayoutSettingsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await bankingService.updatePayoutSettings(req.user!.id, req.body);
            sendSuccess(res, { message: 'Payout settings updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
