/**
 * Agent Routes
 * Implements Backend Requirements.md Agent Platform section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { agentService } from './agent.service';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    jobQuerySchema,
    acceptJobSchema,
    declineJobSchema,
    completeJobSchema,
    scheduleQuerySchema,
    withdrawSchema,
} from './agent.dto';

const router = Router();

// All agent routes require authentication and AGENT role
router.use(authenticate);
router.use(requireRoles('AGENT', 'ADMIN'));

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
// JOBS
// ============================================

/**
 * @route GET /agent/jobs
 * @desc Get available jobs
 * @access Private (Agent)
 */
router.get(
    '/jobs',
    validateQuery(jobQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.getAvailableJobs(req.user!.id, req.query as any);
            sendSuccess(res, result.jobs, {
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
 * @route GET /agent/jobs/accepted
 * @desc Get my accepted jobs
 * @access Private (Agent)
 */
router.get(
    '/jobs/accepted',
    validateQuery(jobQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.getAcceptedJobs(req.user!.id, req.query as any);
            sendSuccess(res, result.jobs, {
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
 * @route POST /agent/jobs/:id/accept
 * @desc Accept a job
 * @access Private (Agent)
 */
router.post(
    '/jobs/:id/accept',
    validate(acceptJobSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.acceptJob(req.user!.id, req.params.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /agent/jobs/:id/decline
 * @desc Decline a job
 * @access Private (Agent)
 */
router.post(
    '/jobs/:id/decline',
    validate(declineJobSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.declineJob(req.user!.id, req.params.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /agent/jobs/:id/complete
 * @desc Mark job as complete
 * @access Private (Agent)
 */
router.put(
    '/jobs/:id/complete',
    validate(completeJobSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.completeJob(req.user!.id, req.params.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// SCHEDULE
// ============================================

/**
 * @route GET /agent/schedule
 * @desc Get agent schedule
 * @access Private (Agent)
 */
router.get(
    '/schedule',
    validateQuery(scheduleQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const schedule = await agentService.getSchedule(req.user!.id, req.query as any);
            sendSuccess(res, schedule);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// EARNINGS
// ============================================

/**
 * @route GET /agent/earnings
 * @desc Get earnings summary
 * @access Private (Agent)
 */
router.get('/earnings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const earnings = await agentService.getEarnings(req.user!.id);
        sendSuccess(res, earnings);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /agent/earnings/history
 * @desc Get earnings/payout history
 * @access Private (Agent)
 */
router.get('/earnings/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const history = await agentService.getEarningsHistory(req.user!.id);
        sendSuccess(res, history);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /agent/earnings/withdraw
 * @desc Request payout/withdrawal
 * @access Private (Agent)
 */
router.post(
    '/earnings/withdraw',
    validate(withdrawSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await agentService.withdrawEarnings(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
