/**
 * Landlord Dashboard Module - DTO Validation Schemas
 * Per PRD Section 9.1 + Backend Requirements.md
 */

import { z } from 'zod';

// ============================================
// DASHBOARD STATS
// ============================================

export const dashboardQuerySchema = z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
});

// ============================================
// APPLICANTS
// ============================================

export const applicantStatusSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']),
    notes: z.string().max(500).optional(),
});

export const applicantQuerySchema = z.object({
    propertyId: z.string().uuid().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// FINANCIALS
// ============================================

export const financialQuerySchema = z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
    propertyId: z.string().uuid().optional(),
});

export const transactionQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    type: z.enum(['rent', 'deposit', 'maintenance', 'payout', 'all']).optional(),
    propertyId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const payoutRequestSchema = z.object({
    amount: z.number().positive(),
    bankAccountId: z.string().uuid().optional(),
    notes: z.string().max(500).optional(),
});

// ============================================
// VERIFICATION
// ============================================

export const startVerificationSchema = z.object({
    verificationType: z.enum(['cofo', 'physical_audit', 'full']),
    notes: z.string().max(500).optional(),
});

// ============================================
// JOBS (Creating jobs for agents)
// ============================================

export const createJobSchema = z.object({
    propertyId: z.string().uuid(),
    title: z.string().min(5).max(255),
    description: z.string().max(2000).optional(),
    category: z.enum([
        'PROPERTY_INSPECTION',
        'KEY_HANDOVER',
        'MAINTENANCE',
        'DOCUMENT_PICKUP',
        'PHOTOGRAPHY',
        'TENANT_SUPPORT',
    ]),
    payout: z.number().positive(),
    scheduledDate: z.string(), // ISO date
    scheduledTime: z.string().optional(), // e.g., "09:00"
    urgency: z.enum(['low', 'medium', 'high']).default('medium'),
    instructions: z.string().max(2000).optional(),
});

// ============================================
// TYPES
// ============================================

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type ApplicantStatusDto = z.infer<typeof applicantStatusSchema>;
export type ApplicantQueryDto = z.infer<typeof applicantQuerySchema>;
export type FinancialQueryDto = z.infer<typeof financialQuerySchema>;
export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type PayoutRequestDto = z.infer<typeof payoutRequestSchema>;
export type StartVerificationDto = z.infer<typeof startVerificationSchema>;
export type CreateJobDto = z.infer<typeof createJobSchema>;
