/**
 * Role-Specific Profiles Routes
 * Per APIRevised.md Section 1.3
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { profilesService } from './profiles.service';
import {
    tenantProfileSchema,
    landlordProfileSchema,
    agentProfileSchema,
    addCertificationSchema,
} from './profiles.dto';
import { ZodError } from 'zod';

const router = Router();

// ============================================
// TENANT PROFILE
// ============================================

/**
 * @swagger
 * /users/me/profile/tenant:
 *   get:
 *     summary: Get tenant profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/profile/tenant',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = await profilesService.getTenantProfile(req.user!.id);
            sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/profile/tenant:
 *   put:
 *     summary: Update tenant profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/me/profile/tenant',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = tenantProfileSchema.parse(req.body);
            await profilesService.updateTenantProfile(req.user!.id, dto);
            sendSuccess(res, { message: 'Tenant profile updated successfully' });
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// LANDLORD PROFILE
// ============================================

/**
 * @swagger
 * /users/me/profile/landlord:
 *   get:
 *     summary: Get landlord profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/profile/landlord',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = await profilesService.getLandlordProfile(req.user!.id);
            sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/profile/landlord:
 *   put:
 *     summary: Update landlord profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/me/profile/landlord',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = landlordProfileSchema.parse(req.body);
            await profilesService.updateLandlordProfile(req.user!.id, dto);
            sendSuccess(res, { message: 'Landlord profile updated successfully' });
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// AGENT PROFILE
// ============================================

/**
 * @swagger
 * /users/me/profile/agent:
 *   get:
 *     summary: Get agent profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/me/profile/agent',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = await profilesService.getAgentProfile(req.user!.id);
            sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /users/me/profile/agent:
 *   put:
 *     summary: Update agent profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/me/profile/agent',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = agentProfileSchema.parse(req.body);
            await profilesService.updateAgentProfile(req.user!.id, dto);
            sendSuccess(res, { message: 'Agent profile updated successfully' });
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// AGENT CERTIFICATIONS
// ============================================

/**
 * @swagger
 * /users/me/profile/agent/certifications:
 *   post:
 *     summary: Add agent certification
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/me/profile/agent/certifications',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = addCertificationSchema.parse(req.body);
            const result = await profilesService.addAgentCertification(req.user!.id, dto);
            sendSuccess(res, { message: 'Certification added', ...result }, 201);
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
 * /users/me/profile/agent/certifications/{id}:
 *   delete:
 *     summary: Delete agent certification
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/me/profile/agent/certifications/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await profilesService.deleteAgentCertification(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Certification deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
