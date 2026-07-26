/**
 * Transactions contract — Zod request schemas + inferred request types
 * for the transactions module (payments, escrow, refunds).
 *
 * NOTE on drift: `initiatePaymentSchema.type` is UPPERCASE
 * (`'RENT' | 'DEPOSIT' | 'MAINTENANCE' | 'ESCROW'`) while the matching
 * frontend `TransactionType` is wider and named differently
 * (`'RENT_PAYMENT' | 'SECURITY_DEPOSIT' | ...`). Preserved as-is here;
 * resolving the naming requires coordinated backend renames + Prisma
 * column updates and is deferred.
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
// QUERY
// ============================================

export const transactionQuerySchema = z.object({
    type: z
        .enum(['rent', 'deposit', 'maintenance', 'payout', 'agent_earning', 'escrow', 'all'])
        .optional(),
    status: z
        .enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'all'])
        .optional(),
    propertyId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// INITIATE PAYMENT
// ============================================

export const initiatePaymentSchema = z.object({
    type: z.enum(['RENT', 'DEPOSIT', 'MAINTENANCE', 'ESCROW']),
    amount: z.number().positive(),
    propertyId: z.string().uuid().optional(),
    leaseId: z.string().uuid().optional(),
    // Loosened from a static enum so the handler can accept any payment method
    // the user's region permits (e.g. NG keeps `ussd`/`wallet`; CA accepts only
    // `card`/`bank_transfer`). Region-aware validation happens at handler entry
    // via regionConfigService.
    paymentMethod: z.string().min(2).max(30).default('card'),
    // Loosened from z.enum(['NGN','USD']) for the same reason. ISO-4217 3-char
    // code; validated against regionConfigService.isCurrencyAllowed at the
    // handler. Default is filled from the user's region if omitted.
    currency: z.string().length(3).optional(),
    metadata: z.record(z.unknown()).optional(),
});

// ============================================
// VERIFY PAYMENT
// ============================================

export const verifyPaymentSchema = z.object({
    reference: z.string(),
    provider: z.enum(['paystack', 'flutterwave']).default('paystack'),
});

// ============================================
// ESCROW
// ============================================

export const createEscrowSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    amount: z.number().positive(),
    type: z.enum(['RENT', 'DEPOSIT', 'PURCHASE']),
    releaseConditions: z
        .object({
            requireTenantConfirmation: z.boolean().default(true),
            requireLandlordConfirmation: z.boolean().default(true),
            autoReleaseAfterDays: z.number().int().min(1).max(90).optional(),
        })
        .optional(),
    notes: z.string().max(1000).optional(),
});

export const releaseEscrowSchema = z.object({
    confirm: z.boolean(),
    notes: z.string().max(500).optional(),
});

// ============================================
// REFUND
// ============================================

export const refundSchema = z.object({
    amount: z.number().positive().optional(),
    reason: z.string().max(500),
});

// ============================================
// REQUEST TYPES
// ============================================

export type TransactionQueryRequest = z.input<typeof transactionQuerySchema>;
export type InitiatePaymentRequest = z.input<typeof initiatePaymentSchema>;
export type VerifyPaymentRequest = z.input<typeof verifyPaymentSchema>;
export type CreateEscrowRequest = z.input<typeof createEscrowSchema>;
export type ReleaseEscrowRequest = z.input<typeof releaseEscrowSchema>;
export type RefundRequest = z.input<typeof refundSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Transactions';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerTransactionsPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });

    registry.registerPath({
        method: 'post',
        path: '/transactions/webhook/paystack',
        tags: [TAG],
        summary: 'Paystack signed webhook (signature-verified, no Bearer).',
        request: { body: { content: { 'application/json': { schema: z.unknown() } } } },
        responses: {
            200: { description: 'Webhook accepted' },
            400: STANDARD_ERROR_RESPONSES[400],
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/transactions',
        tags: [TAG],
        summary: 'Paginated transaction history for the authenticated user.',
        security: requireBearerAuth,
        request: { query: transactionQuerySchema },
        responses: {
            200: paginatedResponse('Transactions', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/transactions/{id}',
        tags: [TAG],
        summary: 'Transaction detail.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Transaction record', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/transactions/pay',
        tags: [TAG],
        summary: 'Initiate a payment (returns paymentUrl + provider reference).',
        security: requireBearerAuth,
        request: JSON_BODY(initiatePaymentSchema),
        responses: {
            201: successResponse(
                'Payment initiated',
                z.object({
                    transactionId: z.string().uuid(),
                    paymentUrl: z.string().url(),
                    reference: z.string(),
                    provider: z.string(),
                })
            ),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/transactions/verify',
        tags: [TAG],
        summary: 'Verify a previously-initiated payment by reference.',
        security: requireBearerAuth,
        request: JSON_BODY(verifyPaymentSchema),
        responses: {
            200: successResponse('Verification result', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/transactions/escrow',
        tags: [TAG],
        summary: 'Landlord opens an escrow against a property + tenant.',
        security: requireBearerAuth,
        request: JSON_BODY(createEscrowSchema),
        responses: {
            201: successResponse('Escrow created', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/transactions/escrow/{id}/release',
        tags: [TAG],
        summary: 'Tenant or landlord confirms release of escrow funds.',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(releaseEscrowSchema) },
        responses: {
            200: successResponse('Release recorded', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/transactions/{id}/refund',
        tags: [TAG],
        summary: 'Request a refund against a transaction.',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(refundSchema) },
        responses: {
            200: successResponse('Refund queued', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
export type CreateEscrowDto = z.infer<typeof createEscrowSchema>;
export type ReleaseEscrowDto = z.infer<typeof releaseEscrowSchema>;
export type RefundDto = z.infer<typeof refundSchema>;
