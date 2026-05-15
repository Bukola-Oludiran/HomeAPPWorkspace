/**
 * Verification Routes
 * Per PRD Section 10 + Backend Requirements.md
 */

import { Router, Request, Response, NextFunction } from 'express';
import { verificationService } from './verification.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    submitIdentityVerificationSchema,
    submitDocumentSchema,
    requestPropertyVerificationSchema,
    submitPropertyVerificationResultSchema,
    verificationQuerySchema,
} from './verification.dto';
import { z } from 'zod';

const router = Router();

// All verification routes require authentication
router.use(authenticate);
// ============================================
// USER VERIFICATION
// ============================================

/**
 * @route GET /verification/status
 * @desc Get verification status
 * @access Private
 */
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await verificationService.getVerificationStatus(req.user!.id);
        sendSuccess(res, status);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /verification/identity
 * @desc Submit identity verification
 * @access Private
 */
router.post(
    '/identity',
    validate(submitIdentityVerificationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.submitIdentityVerification(
                req.user!.id,
                req.body
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /verification/address
 * @desc Submit address verification
 * @access Private
 */
router.post(
    '/address',
    validate(submitDocumentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.submitAddressVerification(
                req.user!.id,
                req.body
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PROPERTY VERIFICATION
// ============================================

/**
 * @route GET /verification/properties
 * @desc Get property verifications
 * @access Private (Landlord)
 */
router.get(
    '/properties',
    requireRoles('LANDLORD', 'ADMIN'),
    validateQuery(verificationQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.getPropertyVerifications(
                req.user!.id,
                req.query as any
            );
            sendSuccess(res, result.verifications, {
                page: result.page,
                limit: result.limit ?? 20,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /verification/properties/:propertyId
 * @desc Get property verification status
 * @access Private
 */
router.get(
    '/properties/:propertyId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const status = await verificationService.getPropertyVerificationStatus(
                req.params.propertyId,
                req.user!.id
            );
            sendSuccess(res, status);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /verification/properties/:propertyId/cofo
 * @desc Submit C of O verification
 * @access Private (Landlord)
 */
router.post(
    '/properties/:propertyId/cofo',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(submitDocumentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.submitCofoVerification(
                req.params.propertyId,
                req.user!.id,
                req.body
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /verification/properties/:propertyId/audit/request
 * @desc Request property verification audit
 * @access Private (Landlord)
 */
router.post(
    '/properties/:propertyId/audit/request',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(requestPropertyVerificationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.requestPropertyVerification(
                req.params.propertyId,
                req.user!.id,
                req.body
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route GET /verification/admin/pending
 * @desc Get pending verifications (Admin)
 * @access Private (Admin)
 */
router.get(
    '/admin/pending',
    requireRoles('ADMIN'),
    validateQuery(verificationQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Admin gets all pending verifications
            const result = await verificationService.getPropertyVerifications(
                req.user!.id,
                { ...req.query as any, status: 'pending' }
            );
            sendSuccess(res, result.verifications, {
                page: result.page,
                limit: result.limit ?? 20,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /verification/admin/:id/approve
 * @desc Approve verification (Admin)
 * @access Private (Admin)
 */
router.post(
    '/admin/:id/approve',
    requireRoles('ADMIN'),
    validate(submitPropertyVerificationResultSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.approveVerification(
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

/**
 * @route POST /verification/admin/:id/reject
 * @desc Reject verification (Admin)
 * @access Private (Admin)
 */
router.post(
    '/admin/:id/reject',
    requireRoles('ADMIN'),
    validate(z.object({ reason: z.string().max(500) })),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await verificationService.rejectVerification(
                req.params.id,
                req.user!.id,
                req.body.reason
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
