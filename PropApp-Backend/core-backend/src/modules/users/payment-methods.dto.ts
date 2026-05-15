/**
 * Payment Methods Module - DTO Validation Schemas
 * Per APIRevised.md Section 1.1
 */

import { z } from 'zod';

// ============================================
// ADD PAYMENT METHOD
// ============================================

export const addPaymentMethodSchema = z.object({
    paymentToken: z.string().min(1, 'Payment token is required'),
    setAsDefault: z.boolean().default(false),
});

// ============================================
// QUERY
// ============================================

export const paymentMethodQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// TYPES
// ============================================

export type AddPaymentMethodDto = z.infer<typeof addPaymentMethodSchema>;
export type PaymentMethodQueryDto = z.infer<typeof paymentMethodQuerySchema>;
