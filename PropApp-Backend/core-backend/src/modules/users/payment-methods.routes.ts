/**
 * Payment Methods Routes
 * GET/POST/PUT/DELETE /users/me/payment-methods
 * Per APIRevised.md Section 1.1
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { paymentMethodsService } from './payment-methods.service';
import { addPaymentMethodSchema } from './payment-methods.dto';
import { ZodError } from 'zod';

const router = Router();

// ============================================
// LIST PAYMENT METHODS
// ============================================

/**
 * @swagger
 * /users/me/payment-methods:
 *   get:
 *     summary: List user's payment methods
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/payment-methods',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await paymentMethodsService.getPaymentMethods(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// ADD PAYMENT METHOD
// ============================================

/**
 * @swagger
 * /users/me/payment-methods:
 *   post:
 *     summary: Add a new payment method
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/me/payment-methods',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = addPaymentMethodSchema.parse(req.body);
            const paymentMethod = await paymentMethodsService.addPaymentMethod(
                req.user!.id,
                validatedData
            );
            sendSuccess(res, paymentMethod, 201);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// SET DEFAULT PAYMENT METHOD
// ============================================

/**
 * @swagger
 * /users/me/payment-methods/{id}/default:
 *   put:
 *     summary: Set a payment method as default
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/me/payment-methods/:id/default',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodsService.setDefaultPaymentMethod(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Payment method set as default' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// DELETE PAYMENT METHOD
// ============================================

/**
 * @swagger
 * /users/me/payment-methods/{id}:
 *   delete:
 *     summary: Remove a payment method
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/me/payment-methods/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodsService.deletePaymentMethod(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Payment method removed successfully' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
