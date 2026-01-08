/**
 * Maintenance Routes
 * Implements Backend Requirements.md Maintenance System section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { maintenanceService } from './maintenance.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    createMaintenanceRequestSchema,
    updateMaintenanceRequestSchema,
    assignAgentSchema,
    maintenanceQuerySchema,
} from './maintenance.dto';

const router = Router();

// All maintenance routes require authentication
router.use(authenticate);

// ============================================
// HELPER: Validate request body/query
// ============================================

const validate = <T>(schema: { parse: (data: unknown) => T }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

const validateQuery = <T>(schema: { parse: (data: unknown) => T }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query) as Record<string, string>;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// ============================================
// GET REQUESTS
// ============================================

/**
 * @route GET /maintenance
 * @desc Get maintenance requests
 * @access Private
 */
router.get(
    '/',
    validateQuery(maintenanceQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await maintenanceService.getRequests(
                req.user!.id,
                req.user!.role,
                req.query as any
            );
            sendSuccess(res, result.requests, {
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
 * @route GET /maintenance/:id
 * @desc Get maintenance request by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = await maintenanceService.getRequestById(req.params.id, req.user!.id);
        sendSuccess(res, request);
    } catch (error) {
        next(error);
    }
});

// ============================================
// CREATE REQUEST (Tenant)
// ============================================

/**
 * @route POST /maintenance
 * @desc Create maintenance request
 * @access Private (Tenant)
 */
router.post(
    '/',
    requireRoles('TENANT', 'ADMIN'),
    validate(createMaintenanceRequestSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = await maintenanceService.createRequest(req.user!.id, req.body);
            sendCreated(res, request);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// UPDATE REQUEST (Landlord, Agent)
// ============================================

/**
 * @route PUT /maintenance/:id
 * @desc Update maintenance request status
 * @access Private (Landlord, Agent)
 */
router.put(
    '/:id',
    validate(updateMaintenanceRequestSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = await maintenanceService.updateRequest(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendSuccess(res, request);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// ASSIGN AGENT (Landlord)
// ============================================

/**
 * @route POST /maintenance/:id/assign
 * @desc Assign agent to maintenance request
 * @access Private (Landlord)
 */
router.post(
    '/:id/assign',
    requireRoles('LANDLORD', 'ADMIN'),
    validate(assignAgentSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await maintenanceService.assignAgent(
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
