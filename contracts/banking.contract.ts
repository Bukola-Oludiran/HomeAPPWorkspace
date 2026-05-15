/**
 * Banking contract — Zod request schemas + inferred request types for
 * the banking module. Backend re-exports from `banking.dto.ts`; the
 * frontend re-exports from `types/lease.ts` (which is currently the
 * frontend's catch-all for lease + transactions + maintenance + banking
 * types until they get dedicated frontend files).
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

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Banking';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerBankingPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });

    registry.registerPath({
        method: 'get',
        path: '/banking/banks',
        tags: [TAG],
        summary: 'List supported banks (filterable by country + search).',
        security: requireBearerAuth,
        request: { query: bankQuerySchema },
        responses: {
            200: successResponse('Bank list', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/banking/resolve',
        tags: [TAG],
        summary: 'Resolve account name from bankCode + accountNumber.',
        security: requireBearerAuth,
        request: JSON_BODY(resolveBankAccountSchema),
        responses: {
            200: successResponse('Resolved account', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/users/me/bank-accounts',
        tags: [TAG],
        summary: "Current user's saved bank accounts.",
        security: requireBearerAuth,
        responses: {
            200: successResponse('Bank account list', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/bank-accounts',
        tags: [TAG],
        summary: 'Add a bank account.',
        security: requireBearerAuth,
        request: JSON_BODY(addBankAccountSchema),
        responses: {
            201: successResponse('Account added', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/bank-accounts/{id}/default',
        tags: [TAG],
        summary: 'Mark a saved bank account as the default payout destination.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Default updated', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/users/me/bank-accounts/{id}',
        tags: [TAG],
        summary: 'Remove a saved bank account.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Account removed', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/payouts',
        tags: [TAG],
        summary: 'Request a payout to the chosen account.',
        security: requireBearerAuth,
        request: JSON_BODY(requestPayoutSchema),
        responses: {
            201: successResponse('Payout queued', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/users/me/payouts',
        tags: [TAG],
        summary: 'Payout history (filterable by status + date range).',
        security: requireBearerAuth,
        request: { query: payoutQuerySchema },
        responses: {
            200: paginatedResponse('Payouts', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/users/me/payout-settings',
        tags: [TAG],
        summary: 'Payout-schedule + threshold settings.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Settings', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/payout-settings',
        tags: [TAG],
        summary: 'Update payout-schedule + threshold settings.',
        security: requireBearerAuth,
        request: JSON_BODY(updatePayoutSettingsSchema),
        responses: {
            200: successResponse('Settings updated', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type AddBankAccountDto = z.infer<typeof addBankAccountSchema>;
export type ResolveBankAccountDto = z.infer<typeof resolveBankAccountSchema>;
export type BankQueryDto = z.infer<typeof bankQuerySchema>;
export type UpdatePayoutSettingsDto = z.infer<typeof updatePayoutSettingsSchema>;
export type RequestPayoutDto = z.infer<typeof requestPayoutSchema>;
export type PayoutQueryDto = z.infer<typeof payoutQuerySchema>;
