/**
 * Lease Documents & Financial Reports Routes
 * Per APIRevised.md Section 4.2, 4.3
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { leaseReportsService } from './lease-reports.service';
import {
    generateLeaseSchema,
    leaseDocumentQuerySchema,
    generateReportSchema,
    financialReportQuerySchema,
} from './lease-reports.dto';
import { ZodError } from 'zod';

const router = Router();

// ============================================
// LEASE DOCUMENTS
// ============================================

/**
 * @swagger
 * /leases:
 *   get:
 *     summary: List lease documents
 *     tags: [Lease Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = leaseDocumentQuerySchema.parse(req.query);
            const result = await leaseReportsService.listLeaseDocuments(req.user!.id, query);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /leases/{id}/document:
 *   get:
 *     summary: Get lease document
 *     tags: [Lease Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/:id/document',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await leaseReportsService.getLeaseDocument(req.user!.id, req.params.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /leases/{id}/document/generate:
 *   post:
 *     summary: Generate lease document
 *     tags: [Lease Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/:id/document/generate',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = generateLeaseSchema.parse(req.body);
            const result = await leaseReportsService.generateLeaseDocument(req.user!.id, req.params.id, dto);
            sendSuccess(res, result, 201);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// FINANCIAL REPORTS
// ============================================

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List financial reports
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/reports',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = financialReportQuerySchema.parse(req.query);
            const result = await leaseReportsService.listFinancialReports(req.user!.id, query);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get financial report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/reports/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await leaseReportsService.getFinancialReport(req.user!.id, req.params.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate financial report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/reports/generate',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = generateReportSchema.parse(req.body);
            const result = await leaseReportsService.generateFinancialReport(req.user!.id, dto);
            sendSuccess(res, result, 201);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

export default router;
