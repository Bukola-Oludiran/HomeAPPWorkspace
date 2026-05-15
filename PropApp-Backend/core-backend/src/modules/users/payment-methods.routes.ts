/**
 * Payment Methods Routes
 * GET/POST/PUT/DELETE /users/me/payment-methods
 * Per APIRevised.md Section 1.1
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { paymentMethodsService } from './payment-methods.service';
import { addPaymentMethodSchema } from './payment-methods.dto';

const router = Router();

// ============================================
// LIST PAYMENT METHODS
// ============================================

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

router.post(
    '/me/payment-methods',
    authenticate,
    validate(addPaymentMethodSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentMethod = await paymentMethodsService.addPaymentMethod(
                req.user!.id,
                req.body
            );
            sendSuccess(res, paymentMethod, 201);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// SET DEFAULT PAYMENT METHOD
// ============================================

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
