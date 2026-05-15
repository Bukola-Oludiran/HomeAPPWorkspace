/**
 * Landlord dashboard contract — Zod request schemas + inferred request
 * types for the landlord aggregator endpoints (dashboard, applicants,
 * financials, verification, jobs).
 */

import { z } from 'zod';
import {
    OpenAPIRegistry,
    paginatedResponse,
    requireBearerAuth,
    STANDARD_ERROR_RESPONSES,
    successResponse,
} from './openapi';

// ============================================
// DASHBOARD
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
// JOBS
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
    scheduledDate: z.string(),
    scheduledTime: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high']).default('medium'),
    instructions: z.string().max(2000).optional(),
});

// ============================================
// REQUEST TYPES
// ============================================

export type LandlordDashboardQueryRequest = z.input<typeof dashboardQuerySchema>;
export type ApplicantStatusRequest = z.input<typeof applicantStatusSchema>;
export type ApplicantQueryRequest = z.input<typeof applicantQuerySchema>;
export type LandlordFinancialQueryRequest = z.input<typeof financialQuerySchema>;
export type LandlordTransactionQueryRequest = z.input<typeof transactionQuerySchema>;
export type LandlordPayoutRequest = z.input<typeof payoutRequestSchema>;
export type StartVerificationRequest = z.input<typeof startVerificationSchema>;
export type CreateJobRequest = z.input<typeof createJobSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Landlord Dashboard';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerLandlordPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });

    registry.registerPath({
        method: 'get',
        path: '/landlord/dashboard',
        tags: [TAG],
        summary: 'Aggregate dashboard for landlord (revenue, vacancies, alerts).',
        security: requireBearerAuth,
        request: { query: dashboardQuerySchema },
        responses: {
            200: successResponse('Dashboard snapshot', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/properties',
        tags: [TAG],
        summary: "List landlord's properties with dashboard metrics.",
        security: requireBearerAuth,
        responses: {
            200: successResponse('Property summary list', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/applicants',
        tags: [TAG],
        summary: 'Applicants across landlord\'s properties (filter by status).',
        security: requireBearerAuth,
        request: { query: applicantQuerySchema },
        responses: {
            200: paginatedResponse('Applicants', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/applicants/{id}',
        tags: [TAG],
        summary: 'Applicant detail.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Applicant record', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/landlord/applicants/{id}/approve',
        tags: [TAG],
        summary: 'Approve an applicant — moves toward lease creation.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Applicant approved', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/landlord/applicants/{id}/reject',
        tags: [TAG],
        summary: 'Reject an applicant (provide reason via applicantStatusSchema).',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(applicantStatusSchema) },
        responses: {
            200: successResponse('Applicant rejected', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/financials/overview',
        tags: [TAG],
        summary: 'Aggregate financial overview (period-scoped).',
        security: requireBearerAuth,
        request: { query: financialQuerySchema },
        responses: {
            200: successResponse('Financial summary', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/financials/transactions',
        tags: [TAG],
        summary: 'Paginated landlord-side transaction history.',
        security: requireBearerAuth,
        request: { query: transactionQuerySchema },
        responses: {
            200: paginatedResponse('Transactions', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/financials/payouts',
        tags: [TAG],
        summary: 'Landlord payout history.',
        security: requireBearerAuth,
        responses: {
            200: paginatedResponse('Payouts', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/landlord/financials/payouts',
        tags: [TAG],
        summary: 'Request a landlord payout.',
        security: requireBearerAuth,
        request: JSON_BODY(payoutRequestSchema),
        responses: {
            201: successResponse('Payout queued', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/alerts',
        tags: [TAG],
        summary: 'Pending alerts (verification expirations, maintenance, etc.).',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Alert list', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/landlord/verification/start',
        tags: [TAG],
        summary: 'Kick off a property-verification audit on the landlord side.',
        security: requireBearerAuth,
        request: JSON_BODY(startVerificationSchema),
        responses: {
            201: successResponse('Audit queued', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/landlord/jobs',
        tags: [TAG],
        summary: 'Post a job for an agent (inspection, key handover, etc.).',
        security: requireBearerAuth,
        request: JSON_BODY(createJobSchema),
        responses: {
            201: successResponse('Job created', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/landlord/jobs',
        tags: [TAG],
        summary: "Landlord's posted agent jobs.",
        security: requireBearerAuth,
        responses: {
            200: successResponse('Jobs', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type ApplicantStatusDto = z.infer<typeof applicantStatusSchema>;
export type ApplicantQueryDto = z.infer<typeof applicantQuerySchema>;
export type FinancialQueryDto = z.infer<typeof financialQuerySchema>;
export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type PayoutRequestDto = z.infer<typeof payoutRequestSchema>;
export type StartVerificationDto = z.infer<typeof startVerificationSchema>;
export type CreateJobDto = z.infer<typeof createJobSchema>;
