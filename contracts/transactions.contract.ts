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
    paymentMethod: z
        .enum(['card', 'bank_transfer', 'ussd', 'wallet', 'crypto'])
        .default('card'),
    currency: z.enum(['NGN', 'USD']).default('NGN'),
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

export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
export type CreateEscrowDto = z.infer<typeof createEscrowSchema>;
export type ReleaseEscrowDto = z.infer<typeof releaseEscrowSchema>;
export type RefundDto = z.infer<typeof refundSchema>;
