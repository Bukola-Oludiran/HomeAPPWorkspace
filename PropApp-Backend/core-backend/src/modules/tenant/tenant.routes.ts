/**
 * Tenant Dashboard Routes
 * Implements Backend Requirements.md Tenant Dashboard section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { tenantService } from './tenant.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    dashboardQuerySchema,
    submitApplicationSchema,
    applicationQuerySchema,
    makePaymentSchema,
    paymentQuerySchema,
} from './tenant.dto';

const router = Router();

// All tenant routes require authentication and TENANT role
router.use(authenticate);
router.use(requireRoles('TENANT', 'ADMIN'));
// ============================================
// DASHBOARD
// ============================================

/**
 * @route GET /tenant/dashboard
 * @desc Get tenant dashboard stats
 * @access Private (Tenant)
 */
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await tenantService.getDashboard(req.user!.id);
        sendSuccess(res, stats);
    } catch (error) {
        next(error);
    }
});

// ============================================
// RENTAL INFO
// ============================================

/**
 * @route GET /tenant/rental
 * @desc Get current rental info
 * @access Private (Tenant)
 */
router.get('/rental', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rental = await tenantService.getRentalInfo(req.user!.id);
        sendSuccess(res, rental);
    } catch (error) {
        next(error);
    }
});

// ============================================
// APPLICATIONS
// ============================================

/**
 * @route GET /tenant/applications
 * @desc Get tenant's applications
 * @access Private (Tenant)
 */
router.get(
    '/applications',
    validateQuery(applicationQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await tenantService.getApplications(req.user!.id, req.query as any);
            sendSuccess(res, result.applications, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /tenant/applications
 * @desc Submit application
 * @access Private (Tenant)
 */
router.post(
    '/applications',
    validate(submitApplicationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await tenantService.submitApplication(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /tenant/applications/:id
 * @desc Withdraw application
 * @access Private (Tenant)
 */
router.delete('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tenantService.withdrawApplication(req.user!.id, req.params.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// SAVED PROPERTIES
// ============================================

/**
 * @route GET /tenant/saved
 * @desc Get saved/favorited properties
 * @access Private (Tenant)
 */
router.get('/saved', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const saved = await tenantService.getSavedProperties(req.user!.id);
        sendSuccess(res, saved);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /tenant/saved/:propertyId
 * @desc Save property to favorites
 * @access Private (Tenant)
 */
router.post('/saved/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Use favorites service
        const { favoritesService } = await import('../properties/favorites.service');
        const result = await favoritesService.addFavorite(req.user!.id, req.params.propertyId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route DELETE /tenant/saved/:propertyId
 * @desc Remove property from favorites
 * @access Private (Tenant)
 */
router.delete('/saved/:propertyId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { favoritesService } = await import('../properties/favorites.service');
        const result = await favoritesService.removeFavorite(req.user!.id, req.params.propertyId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// ============================================
// PAYMENTS
// ============================================

/**
 * @route GET /tenant/payments
 * @desc Get payment history
 * @access Private (Tenant)
 */
router.get(
    '/payments',
    validateQuery(paymentQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await tenantService.getPayments(req.user!.id, req.query as any);
            sendSuccess(res, result.payments, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /tenant/payments
 * @desc Make payment
 * @access Private (Tenant)
 */
router.post(
    '/payments',
    validate(makePaymentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await tenantService.makePayment(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
