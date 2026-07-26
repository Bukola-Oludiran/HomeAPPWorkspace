/**
 * banking bundle — bank accounts + payouts.
 */

import { z } from 'zod';
import type { BankAccountCardProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

type BankAccountRow = {
    id: string;
    bankName: string;
    maskedAccountNumber: string;
    accountName: string;
    isDefault: boolean;
};

function toCard(b: BankAccountRow): BankAccountCardProps {
    return {
        accountId: b.id,
        bankName: b.bankName,
        maskedAccountNumber: b.maskedAccountNumber,
        accountName: b.accountName,
        isDefault: b.isDefault,
        actions: b.isDefault
            ? [{ id: 'remove', label: 'Remove', kind: 'danger' as const }]
            : [
                  { id: 'default', label: 'Set as default', kind: 'primary' as const },
                  { id: 'remove', label: 'Remove', kind: 'danger' as const },
              ],
    };
}

const getMyAccount = defineLocalTool({
    name: 'banking.getMyAccount',
    label: 'My bank accounts',
    description: 'List the authenticated user’s saved bank accounts.',
    parameters: z.object({}),
    async execute(_params, ctx, sink) {
        const accounts = await (prismaReadonly as any).bankAccount?.findMany?.({
            where: { userId: ctx.user.userId },
            orderBy: { isDefault: 'desc' },
        });
        const rows = (accounts ?? []) as BankAccountRow[];
        for (const a of rows) sink.ui({ type: 'BankAccountCard', props: toCard(a) });
        return {
            text: `You have ${rows.length} saved bank account(s).`,
            details: { count: rows.length, userId: ctx.user.userId },
        };
    },
});

const resolve = defineLocalTool({
    name: 'banking.resolveBankAccount',
    label: 'Resolve bank account',
    description:
        'Look up an account-name for a bank code + account number, via the payment provider. No DB write.',
    parameters: z.object({
        bankCode: z.string().min(2).max(10),
        accountNumber: z.string().regex(/^\d{6,20}$/),
    }),
    async execute(params, ctx) {
        const r = await grpc.banking.resolve(ctx.jwt, {
            bank_code: params.bankCode,
            account_number: params.accountNumber,
        });
        return {
            text: `${r.account_name} (${params.bankCode} ${params.accountNumber}).`,
            details: { ...r },
        };
    },
});

const addAccount = defineLocalTool({
    name: 'banking.addAccount',
    label: 'Add bank account',
    description: 'Add a bank account for receiving payouts. Confirm-gated.',
    parameters: z.object({
        bankCode: z.string().min(2).max(10),
        accountNumber: z.string().regex(/^\d{6,20}$/),
        makeDefault: z.boolean().optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Add bank account ${p.bankCode} ${p.accountNumber}${p.makeDefault ? ' (as default)' : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx, sink) {
        const r = await grpc.banking.addAccount(ctx.jwt, {
            bank_code: params.bankCode,
            account_number: params.accountNumber,
            make_default: params.makeDefault,
        });
        sink.ui({
            type: 'BankAccountCard',
            props: {
                accountId: r.id,
                bankName: r.bank_name,
                maskedAccountNumber: r.masked_account_number,
                accountName: r.account_name,
                isDefault: r.is_default,
                actions: [],
            },
        });
        return { text: `Bank account added (id=${r.id}).`, details: { accountId: r.id } };
    },
});

const setDefault = defineLocalTool({
    name: 'banking.setDefault',
    label: 'Set default bank account',
    description: 'Make a saved bank account the default for payouts.',
    parameters: z.object({ accountId: z.string().uuid() }),
    async execute(params, ctx) {
        const r = await grpc.banking.setDefault(ctx.jwt, params.accountId);
        return { text: r.message, details: { accountId: params.accountId } };
    },
});

const deleteAccount = defineLocalTool({
    name: 'banking.deleteAccount',
    label: 'Delete bank account',
    description: 'Remove a saved bank account.',
    parameters: z.object({ accountId: z.string().uuid() }),
    confirm: {
        humanSummary: (p) => `Remove bank account ${p.accountId.slice(0, 8)}…`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.banking.deleteAccount(ctx.jwt, params.accountId);
        return { text: r.message, details: { accountId: params.accountId } };
    },
});

const requestPayout = defineLocalTool({
    name: 'banking.requestPayout',
    label: 'Request payout',
    description: 'Request a payout to a saved bank account.',
    parameters: z.object({
        amount: z.number().positive().max(20_000_000),
        bankAccountId: z.string().uuid().optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Request payout of ₦${p.amount.toLocaleString()}${p.bankAccountId ? ` to account ${p.bankAccountId.slice(0, 8)}…` : ' (default account)'}.`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.banking.requestPayout(ctx.jwt, {
            amount: params.amount,
            bank_account_id: params.bankAccountId,
        });
        return { text: `Payout ${r.payout_id} ${r.status}.`, details: { ...r } };
    },
});

export const bankingBundle: ToolBundle = {
    name: 'banking',
    description: 'Manage bank accounts and request payouts.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [getMyAccount],
    writeTools: [resolve, addAccount, setDefault, deleteAccount, requestPayout],
};
