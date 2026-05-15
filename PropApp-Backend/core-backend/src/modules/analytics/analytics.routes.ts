/**
 * Analytics Routes
 * Per APIRevised.md Section 3
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { analyticsService } from './analytics.service';
import {
    viewAnalyticsQuerySchema,
    marketTrendsQuerySchema,
    priceOptimizationSchema,
} from './analytics.dto';
import { ZodError } from 'zod';

const router = Router();

// ============================================
// PROPERTY ANALYTICS
// ============================================

/**
 * @swagger
 * /properties/{id}/analytics/views:
 *   get:
 *     summary: Get property view analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/properties/:id/analytics/views',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = viewAnalyticsQuerySchema.parse(req.query);
            const result = await analyticsService.getPropertyViews(
                req.params.id,
                req.user!.id,
                query
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /properties/{id}/analytics/market-comparison:
 *   get:
 *     summary: Get market comparison for property
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/properties/:id/analytics/market-comparison',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await analyticsService.getMarketComparison(
                req.params.id,
                req.user!.id
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /properties/{id}/analytics/price-optimization:
 *   post:
 *     summary: Get AI price optimization recommendations
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/properties/:id/analytics/price-optimization',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = priceOptimizationSchema.parse(req.body);
            const result = await analyticsService.getPriceOptimization(
                req.params.id,
                req.user!.id,
                dto
            );
            sendSuccess(res, result);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// MARKET TRENDS
// ============================================

/**
 * @swagger
 * /analytics/market-trends:
 *   get:
 *     summary: Get market trends for an area
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/market-trends',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = marketTrendsQuerySchema.parse(req.query);
            const result = await analyticsService.getMarketTrends(query);
            sendSuccess(res, result);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// LANDLORD DASHBOARD
// ============================================

/**
 * @swagger
 * /landlord/dashboard/analytics:
 *   get:
 *     summary: Get landlord dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/landlord/dashboard/analytics',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const period = (req.query.period as string) || '30d';
            const result = await analyticsService.getLandlordDashboardAnalytics(
                req.user!.id,
                period
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
