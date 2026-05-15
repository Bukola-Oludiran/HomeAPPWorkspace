/**
 * Session Routes
 * Session management endpoints
 * Per APIRevised.md Section 5
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { sessionService } from './session.service';
import { z } from 'zod';
import { ZodError } from 'zod';

const router = Router();

// ============================================
// GET ACTIVE SESSIONS
// ============================================

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: List active login sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/sessions',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TODO: Get current token hash from request
            const result = await sessionService.getSessions(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// REVOKE SESSION
// ============================================

/**
 * @swagger
 * /auth/sessions/{id}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/sessions/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await sessionService.revokeSession(req.user!.id, req.params.id);
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

/**
 * @swagger
 * /auth/sessions/all:
 *   delete:
 *     summary: Revoke all other sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/sessions/all',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { password } = revokeAllSchema.parse(req.body);
            // TODO: Get current session ID from token
            const currentSessionId = ''; // Placeholder
            const result = await sessionService.revokeAllOtherSessions(
                req.user!.id,
                currentSessionId,
                password
            );
            sendSuccess(res, {
                message: 'All other sessions have been revoked',
                revokedCount: result.revokedCount,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

export default router;
