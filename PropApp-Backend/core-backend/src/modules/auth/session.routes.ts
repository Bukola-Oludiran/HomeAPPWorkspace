/**
 * Session Routes
 * Session management endpoints
 * Per APIRevised.md Section 5
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { sessionService } from './session.service';
import { prisma } from '../../config/database';
import { z } from 'zod';

const router = Router();

// ============================================
// GET ACTIVE SESSIONS
// ============================================

router.get(
    '/sessions',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // The current session is identified by the sid in the access token
            const session = await prisma.session.findUnique({ where: { id: req.user!.sessionId } });
            const result = await sessionService.getSessions(req.user!.id, session?.tokenHash);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// REVOKE SESSION
// ============================================

// The UUID pattern keeps DELETE /sessions/all (below) from being captured as an id
router.delete(
    '/sessions/:id([0-9a-fA-F-]{36})',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await sessionService.revokeSession(req.user!.id, req.params.id, req.user!.sessionId);
            sendSuccess(res, { message: 'Session revoked successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// REVOKE ALL OTHER SESSIONS
// ============================================

const revokeAllSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

router.delete(
    '/sessions/all',
    authenticate,
    validate(revokeAllSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { password } = req.body;
            const result = await sessionService.revokeAllOtherSessions(
                req.user!.id,
                req.user!.sessionId!,
                password
            );
            sendSuccess(res, {
                message: 'All other sessions have been revoked',
                revokedCount: result.revokedCount,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
