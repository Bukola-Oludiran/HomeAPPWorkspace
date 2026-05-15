/**
 * Lease Routes
 * Implements Backend Requirements.md Lease & Agreements section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { leaseService } from './leases.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    createLeaseSchema,
    updateLeaseSchema,
    sendRenewalOfferSchema,
    respondToRenewalSchema,
    signLeaseSchema,
} from './leases.dto';

const router = Router();

// All lease routes require authentication
router.use(authenticate);

// ============================================
// GET LEASES
// ============================================

/**
 * @route GET /leases
 * @desc Get user's leases
 * @access Private
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const leases = await leaseService.getUserLeases(req.user!.id, req.user!.role);
        sendSuccess(res, leases);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /leases/:id
 * @desc Get lease by ID
 * @access Private (Tenant, Landlord, Admin)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lease = await leaseService.getLeaseById(req.params.id, req.user!.id);
        sendSuccess(res, lease);
    } catch (error) {
        next(error);
    }
});

// ============================================
// CREATE/UPDATE LEASE (Landlord only)
// ============================================

/**
 * @route POST /leases
 * @desc Create lease
 * @access Private (Landlord)
 */
router.post(
    '/',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(createLeaseSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lease = await leaseService.createLease(req.user!.id, req.body);
            sendCreated(res, lease);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /leases/:id
 * @desc Update lease terms
 * @access Private (Landlord)
 */
router.put(
    '/:id',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(updateLeaseSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lease = await leaseService.updateLease(req.params.id, req.user!.id, req.body);
            sendSuccess(res, lease);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// RENEWAL
// ============================================

/**
 * @route POST /leases/:id/renew
 * @desc Send renewal offer
 * @access Private (Landlord)
 */
router.post(
    '/:id/renew',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(sendRenewalOfferSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await leaseService.sendRenewalOffer(req.params.id, req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /leases/:id/respond
 * @desc Respond to renewal offer
 * @access Private (Tenant)
 */
router.post(
    '/:id/respond',
    requireRoles('TENANT', 'ADMIN'),
    validate(respondToRenewalSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await leaseService.respondToRenewal(req.params.id, req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// SIGNING
// ============================================

/**
 * @route POST /leases/:id/sign
 * @desc Sign lease
 * @access Private (Tenant, Landlord)
 */
router.post(
    '/:id/sign',
    validate(signLeaseSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = req.user!.role as 'TENANT' | 'LANDLORD';
            if (role !== 'TENANT' && role !== 'LANDLORD') {
                throw new Error('Only tenants and landlords can sign leases');
            }
            const result = await leaseService.signLease(req.params.id, req.user!.id, role, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
