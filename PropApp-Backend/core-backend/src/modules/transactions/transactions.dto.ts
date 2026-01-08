/**
 * Transaction Module - DTO Validation Schemas
 * Per Backend Requirements.md Transaction & Payment History section
 */

import { z } from 'zod';

// ============================================
// QUERY
// ============================================

export const transactionQuerySchema = z.object({
    type: z.enum(['rent', 'deposit', 'maintenance', 'payout', 'agent_earning', 'escrow', 'all']).optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'all']).optional(),
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
    paymentMethod: z.enum(['card', 'bank_transfer', 'ussd', 'wallet', 'crypto']).default('card'),
    currency: z.enum(['NGN', 'USD']).default('NGN'),
    metadata: z.record(z.unknown()).optional(),
});

// ============================================
// VERIFY PAYMENT (Webhook callback)
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
    releaseConditions: z.object({
        requireTenantConfirmation: z.boolean().default(true),
        requireLandlordConfirmation: z.boolean().default(true),
        autoReleaseAfterDays: z.number().int().min(1).max(90).optional(),
    }).optional(),
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
    amount: z.number().positive().optional(), // Partial refund, or full if not specified
    reason: z.string().max(500),
});

// ============================================
// TYPES
// ============================================

export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
export type CreateEscrowDto = z.infer<typeof createEscrowSchema>;
export type ReleaseEscrowDto = z.infer<typeof releaseEscrowSchema>;
export type RefundDto = z.infer<typeof refundSchema>;
