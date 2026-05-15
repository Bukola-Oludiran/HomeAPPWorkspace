/**
 * Property Analytics DTO
 * Per APIRevised.md Section 3
 */

import { z } from 'zod';

export const viewAnalyticsQuerySchema = z.object({
    period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

export const marketComparisonQuerySchema = z.object({
    period: z.enum(['6m', '1y', '2y', '5y']).default('1y'),
});

export const marketTrendsQuerySchema = z.object({
    city: z.string().min(2),
    neighborhood: z.string().optional(),
    propertyType: z.string().optional(),
    period: z.enum(['6m', '1y', '2y', '5y']).default('1y'),
});

export const priceOptimizationSchema = z.object({
    targetMetric: z.enum(['occupancy', 'revenue', 'balanced']).default('balanced'),
    constraints: z.object({
        minPrice: z.number().positive().optional(),
        maxPrice: z.number().positive().optional(),
        targetTimeframe: z.string().optional(),
    }).optional(),
});

export type ViewAnalyticsQuery = z.infer<typeof viewAnalyticsQuerySchema>;
export type MarketComparisonQuery = z.infer<typeof marketComparisonQuerySchema>;
export type MarketTrendsQuery = z.infer<typeof marketTrendsQuerySchema>;
export type PriceOptimizationDto = z.infer<typeof priceOptimizationSchema>;
