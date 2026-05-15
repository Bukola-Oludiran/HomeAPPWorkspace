/**
 * Landlord Dashboard Routes
 * Implements PRD Section 9.1 + Backend Requirements.md Landlord Dashboard
 */

import { Router, Request, Response, NextFunction } from 'express';
import { landlordService } from './landlord.service';
import { authenticate, requireRoles, requirePermission } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    dashboardQuerySchema,
    applicantQuerySchema,
    applicantStatusSchema,
    financialQuerySchema,
    transactionQuerySchema,
    payoutRequestSchema,
    startVerificationSchema,
    createJobSchema,
} from './landlord.dto';

const router = Router();

// All landlord routes require authentication and LANDLORD role
router.use(authenticate);
router.use(requireRoles('LANDLORD', 'ADMIN'));
// ============================================
// DASHBOARD
// ============================================

/**
 * @route GET /landlord/dashboard
 * @desc Get landlord dashboard stats
 * @access Private (Landlord)
 */
router.get(
    '/dashboard',
    validateQuery(dashboardQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await landlordService.getDashboard(req.user!.id, req.query as any);
            sendSuccess(res, stats);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PROPERTIES
// ============================================

/**
 * @route GET /landlord/properties
 * @desc Get landlord's properties
 * @access Private (Landlord)
 */
router.get('/properties', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const properties = await landlordService.getMyProperties(req.user!.id);
        sendSuccess(res, properties);
    } catch (error) {
        next(error);
    }
});

// ============================================
// APPLICANTS
// ============================================

/**
 * @route GET /landlord/applicants
 * @desc Get applicants for landlord's properties
 * @access Private (Landlord)
 */
router.get(
    '/applicants',
    validateQuery(applicantQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.getApplicants(req.user!.id, req.query as any);
            sendSuccess(res, result.applicants, {
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
 * @route GET /landlord/applicants/:id
 * @desc Get applicant details
 * @access Private (Landlord)
 */
router.get('/applicants/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applicant = await landlordService.getApplicantDetails(req.user!.id, req.params.id);
        sendSuccess(res, applicant);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /landlord/applicants/:id/approve
 * @desc Approve applicant
 * @access Private (Landlord)
 */
router.put('/applicants/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await landlordService.approveApplicant(req.user!.id, req.params.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /landlord/applicants/:id/reject
 * @desc Reject applicant
 * @access Private (Landlord)
 */
router.put(
    '/applicants/:id/reject',
    validate(applicantStatusSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.rejectApplicant(req.user!.id, req.params.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// FINANCIALS
// ============================================

/**
 * @route GET /landlord/financials
 * @desc Get financial overview
 * @access Private (Landlord)
 */
router.get(
    '/financials',
    validateQuery(financialQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const summary = await landlordService.getFinancialSummary(req.user!.id, req.query as any);
            sendSuccess(res, summary);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /landlord/financials/summary
 * @desc Get financial summary (alias)
 * @access Private (Landlord)
 */
router.get(
    '/financials/summary',
    validateQuery(financialQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const summary = await landlordService.getFinancialSummary(req.user!.id, req.query as any);
            sendSuccess(res, summary);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /landlord/financials/transactions
 * @desc Get transaction history
 * @access Private (Landlord)
 */
router.get(
    '/financials/transactions',
    validateQuery(transactionQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.getTransactions(req.user!.id, req.query as any);
            sendSuccess(res, result.transactions, {
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
 * @route POST /landlord/financials/payout
 * @desc Request payout
 * @access Private (Landlord)
 */
router.post(
    '/financials/payout',
    validate(payoutRequestSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.requestPayout(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// ALERTS
// ============================================

/**
 * @route GET /landlord/alerts
 * @desc Get actionable alerts
 * @access Private (Landlord)
 */
router.get('/alerts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const alerts = await landlordService.getAlerts(req.user!.id);
        sendSuccess(res, alerts);
    } catch (error) {
        next(error);
    }
});

// ============================================
// VERIFICATION
// ============================================

/**
 * @route POST /landlord/properties/:id/verify
 * @desc Start verification process
 * @access Private (Landlord)
 */
router.post(
    '/properties/:id/verify',
    validate(startVerificationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.startVerification(
                req.user!.id,
                req.params.id,
                req.body
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// JOBS (Creating jobs for agents)
// ============================================

/**
 * @route POST /landlord/jobs
 * @desc Create job for agents
 * @access Private (Landlord)
 */
router.post(
    '/jobs',
    validate(createJobSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await landlordService.createJob(req.user!.id, req.body);
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /landlord/jobs
 * @desc Get landlord's jobs
 * @access Private (Landlord)
 */
router.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jobs = await landlordService.getJobs(req.user!.id);
        sendSuccess(res, jobs);
    } catch (error) {
        next(error);
    }
});

export default router;
