/**
 * Role-Specific Profiles Routes
 * Per APIRevised.md Section 1.3
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { profilesService } from './profiles.service';
import {
    tenantProfileSchema,
    landlordProfileSchema,
    agentProfileSchema,
    addCertificationSchema,
} from './profiles.dto';

const router = Router();

// ============================================
// TENANT PROFILE
// ============================================

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

router.put(
    '/me/profile/tenant',
    authenticate,
    validate(tenantProfileSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await profilesService.updateTenantProfile(req.user!.id, req.body);
            sendSuccess(res, { message: 'Tenant profile updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// LANDLORD PROFILE
// ============================================

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

router.put(
    '/me/profile/landlord',
    authenticate,
    validate(landlordProfileSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await profilesService.updateLandlordProfile(req.user!.id, req.body);
            sendSuccess(res, { message: 'Landlord profile updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// AGENT PROFILE
// ============================================

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

router.put(
    '/me/profile/agent',
    authenticate,
    validate(agentProfileSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await profilesService.updateAgentProfile(req.user!.id, req.body);
            sendSuccess(res, { message: 'Agent profile updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// AGENT CERTIFICATIONS
// ============================================

router.post(
    '/me/profile/agent/certifications',
    authenticate,
    validate(addCertificationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await profilesService.addAgentCertification(req.user!.id, req.body);
            sendSuccess(res, { message: 'Certification added', ...result }, 201);
        } catch (error) {
            next(error);
        }
    }
);

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
