/**
 * Tenant dashboard contract — Zod request schemas + inferred request
 * types for the tenant aggregator endpoints (dashboard, applications,
 * payments).
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

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Tenant Dashboard';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerTenantPaths = (registry: OpenAPIRegistry): void => {
    const propertyIdParam = z.object({ propertyId: z.string().uuid() });
    const idParam = z.object({ id: z.string().uuid() });

    registry.registerPath({
        method: 'get',
        path: '/tenant/dashboard',
        tags: [TAG],
        summary: 'Aggregate dashboard for the authenticated tenant.',
        security: requireBearerAuth,
        request: { query: dashboardQuerySchema },
        responses: {
            200: successResponse('Dashboard snapshot', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/tenant/rental',
        tags: [TAG],
        summary: "Tenant's active rental + lease summary.",
        security: requireBearerAuth,
        responses: {
            200: successResponse('Current rental', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/tenant/applications',
        tags: [TAG],
        summary: 'List the tenant\'s rental applications.',
        security: requireBearerAuth,
        request: { query: applicationQuerySchema },
        responses: {
            200: paginatedResponse('Applications', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/tenant/applications',
        tags: [TAG],
        summary: 'Submit a new rental application.',
        security: requireBearerAuth,
        request: JSON_BODY(submitApplicationSchema),
        responses: {
            201: successResponse('Application submitted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/tenant/applications/{id}',
        tags: [TAG],
        summary: 'Withdraw a pending application.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Withdrawn', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/tenant/saved',
        tags: [TAG],
        summary: 'List saved (favorited) properties.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Saved properties', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/tenant/saved/{propertyId}',
        tags: [TAG],
        summary: 'Save a property to favorites.',
        security: requireBearerAuth,
        request: { params: propertyIdParam },
        responses: {
            200: successResponse('Saved', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/tenant/saved/{propertyId}',
        tags: [TAG],
        summary: 'Remove a property from favorites.',
        security: requireBearerAuth,
        request: { params: propertyIdParam },
        responses: {
            200: successResponse('Removed', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/tenant/payments',
        tags: [TAG],
        summary: "Tenant's rent / deposit payment history.",
        security: requireBearerAuth,
        request: { query: paymentQuerySchema },
        responses: {
            200: paginatedResponse('Payments', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/tenant/payments',
        tags: [TAG],
        summary: 'Make a tenant-side payment (rent / deposit / other).',
        security: requireBearerAuth,
        request: JSON_BODY(makePaymentSchema),
        responses: {
            201: successResponse('Payment submitted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type SubmitApplicationDto = z.infer<typeof submitApplicationSchema>;
export type ApplicationQueryDto = z.infer<typeof applicationQuerySchema>;
export type MakePaymentDto = z.infer<typeof makePaymentSchema>;
export type PaymentQueryDto = z.infer<typeof paymentQuerySchema>;
