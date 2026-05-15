/**
 * Banking contract — Zod request schemas + inferred request types for
 * the banking module. Backend re-exports from `banking.dto.ts`; the
 * frontend re-exports from `types/lease.ts` (which is currently the
 * frontend's catch-all for lease + transactions + maintenance + banking
 * types until they get dedicated frontend files).
 */

import { z } from 'zod';

// ============================================
// BANK ACCOUNTS
// ============================================

export const addBankAccountSchema = z.object({
    bankCode: z.string().min(3).max(10),
    accountNumber: z.string().length(10, 'Account number must be 10 digits'),
    accountName: z.string().min(3).max(100),
    accountType: z.enum(['savings', 'current', 'corporate']).default('savings'),
    setAsDefault: z.boolean().default(false),
});

export const resolveBankAccountSchema = z.object({
    bankCode: z.string().min(3).max(10),
    accountNumber: z.string().length(10, 'Account number must be 10 digits'),
});

export const bankQuerySchema = z.object({
    country: z.string().length(2).default('NG'),
    search: z.string().optional(),
});

// ============================================
// PAYOUT SETTINGS
// ============================================

export const updatePayoutSettingsSchema = z.object({
    payoutSchedule: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'manual']).optional(),
    minimumPayoutAmount: z.number().min(5000).optional(),
    defaultBankAccountId: z.string().uuid().optional(),
    autoPayoutEnabled: z.boolean().optional(),
});

export const requestPayoutSchema = z.object({
    amount: z.number().positive(),
    bankAccountId: z.string().uuid(),
    description: z.string().max(255).optional(),
});

export const payoutQuerySchema = z.object({
    status: z.enum(['processing', 'completed', 'failed', 'all']).default('all'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// REQUEST TYPES
// ============================================

export type AddBankAccountRequest = z.input<typeof addBankAccountSchema>;
export type ResolveBankAccountRequest = z.input<typeof resolveBankAccountSchema>;
export type BankQueryRequest = z.input<typeof bankQuerySchema>;
export type UpdatePayoutSettingsRequest = z.input<typeof updatePayoutSettingsSchema>;
export type RequestPayoutRequest = z.input<typeof requestPayoutSchema>;
export type PayoutQueryRequest = z.input<typeof payoutQuerySchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES — z.infer (= output)
// ============================================

export type AddBankAccountDto = z.infer<typeof addBankAccountSchema>;
export type ResolveBankAccountDto = z.infer<typeof resolveBankAccountSchema>;
export type BankQueryDto = z.infer<typeof bankQuerySchema>;
export type UpdatePayoutSettingsDto = z.infer<typeof updatePayoutSettingsSchema>;
export type RequestPayoutDto = z.infer<typeof requestPayoutSchema>;
export type PayoutQueryDto = z.infer<typeof payoutQuerySchema>;
