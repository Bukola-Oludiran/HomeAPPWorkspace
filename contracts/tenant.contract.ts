/**
 * Tenant dashboard contract — Zod request schemas + inferred request
 * types for the tenant aggregator endpoints (dashboard, applications,
 * payments).
 */

import { z } from 'zod';

// ============================================
// DASHBOARD
// ============================================

export const dashboardQuerySchema = z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
});

// ============================================
// APPLICATIONS
// ============================================

export const submitApplicationSchema = z.object({
    propertyId: z.string().uuid(),
    moveInDate: z.string(),
    leaseTerm: z.number().int().min(1).max(36).optional(),
    message: z.string().max(2000).optional(),

    personalInfo: z
        .object({
            occupation: z.string().max(100).optional(),
            employer: z.string().max(200).optional(),
            monthlyIncome: z.number().positive().optional(),
            pets: z.boolean().optional(),
            smoker: z.boolean().optional(),
            additionalOccupants: z.number().int().min(0).optional(),
        })
        .optional(),

    employmentInfo: z
        .object({
            status: z
                .enum(['employed', 'self-employed', 'student', 'retired', 'unemployed'])
                .optional(),
            companyName: z.string().max(200).optional(),
            jobTitle: z.string().max(100).optional(),
            yearsEmployed: z.number().min(0).optional(),
            employerContact: z.string().max(100).optional(),
        })
        .optional(),
});

export const applicationQuerySchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'withdrawn', 'all']).default('all'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// PAYMENTS
// ============================================

export const makePaymentSchema = z.object({
    leaseId: z.string().uuid(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['card', 'bank_transfer', 'wallet']),
    paymentType: z.enum(['rent', 'deposit', 'maintenance', 'other']).default('rent'),
    notes: z.string().max(500).optional(),
});

export const paymentQuerySchema = z.object({
    status: z.enum(['pending', 'completed', 'failed', 'all']).default('all'),
    type: z.enum(['rent', 'deposit', 'maintenance', 'other', 'all']).default('all'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

// ============================================
// REQUEST TYPES
// ============================================

export type TenantDashboardQueryRequest = z.input<typeof dashboardQuerySchema>;
export type SubmitApplicationRequest = z.input<typeof submitApplicationSchema>;
export type TenantApplicationQueryRequest = z.input<typeof applicationQuerySchema>;
export type MakePaymentRequest = z.input<typeof makePaymentSchema>;
export type TenantPaymentQueryRequest = z.input<typeof paymentQuerySchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type SubmitApplicationDto = z.infer<typeof submitApplicationSchema>;
export type ApplicationQueryDto = z.infer<typeof applicationQuerySchema>;
export type MakePaymentDto = z.infer<typeof makePaymentSchema>;
export type PaymentQueryDto = z.infer<typeof paymentQuerySchema>;
