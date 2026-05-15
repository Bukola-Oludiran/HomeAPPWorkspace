/**
 * Transaction Routes
 * Per Backend Requirements.md Transaction & Payment History section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { transactionService } from './transactions.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import { paymentProviderFactory } from '../../integrations/payment';
import { logger } from '../../common/utils/logger';
import {
    transactionQuerySchema,
    initiatePaymentSchema,
    verifyPaymentSchema,
    createEscrowSchema,
    releaseEscrowSchema,
    refundSchema,
} from './transactions.dto';

const router = Router();
// ============================================
// PUBLIC WEBHOOK
// ============================================

/**
 * @route POST /transactions/webhook/paystack
 * @desc Paystack webhook for payment verification
 * @access Public (verified by signature)
 */
router.post('/webhook/paystack', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Verify Paystack signature
        const signature = req.headers['x-paystack-signature'] as string;
        const paystackProvider = paymentProviderFactory.getProviderById('paystack');

        if (paystackProvider && signature) {
            const isValid = paystackProvider.validateWebhook(req.body, signature);
            if (!isValid) {
                logger.warn('Invalid Paystack webhook signature');
                return res.status(400).send('Invalid signature');
            }
        }

        const { reference } = req.body.data || {};

        if (reference) {
            await transactionService.verifyPayment({ reference, provider: 'paystack' });
            logger.info(`Paystack webhook processed: ${reference}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        next(error);
    }
});

// ============================================
// AUTHENTICATED ROUTES
// ============================================

router.use(authenticate);

/**
 * @route GET /transactions
 * @desc Get transaction history
 * @access Private
 */
router.get(
    '/',
    validateQuery(transactionQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.getTransactions(
                req.user!.id,
                req.query as any
            );
            sendSuccess(res, result.transactions, {
                page: result.page,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /transactions/:id
 * @desc Get transaction details
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transaction = await transactionService.getTransactionById(
            req.params.id,
            req.user!.id
        );
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /transactions/pay
 * @desc Initiate payment
 * @access Private
 */
router.post(
    '/pay',
    validate(initiatePaymentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.initiatePayment(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /transactions/verify
 * @desc Verify payment
 * @access Private
 */
router.post(
    '/verify',
    validate(verifyPaymentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.verifyPayment(req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// ESCROW
// ============================================

/**
 * @route POST /transactions/escrow
 * @desc Create escrow
 * @access Private (Landlord)
 */
router.post(
    '/escrow',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(createEscrowSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.createEscrow(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /transactions/escrow/:id/release
 * @desc Release escrow (confirm)
 * @access Private (Tenant, Landlord)
 */
router.post(
    '/escrow/:id/release',
    validate(releaseEscrowSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = req.user!.role as 'TENANT' | 'LANDLORD';
            const result = await transactionService.releaseEscrow(
                req.params.id,
                req.user!.id,
                role,
                req.body
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// REFUND
// ============================================

/**
 * @route POST /transactions/:id/refund
 * @desc Request refund
 * @access Private
 */
router.post(
    '/:id/refund',
    validate(refundSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await transactionService.requestRefund(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
