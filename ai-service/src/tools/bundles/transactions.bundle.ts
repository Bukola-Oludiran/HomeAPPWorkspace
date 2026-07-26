/**
 * transactions bundle — read tools.
 *
 * IDOR posture: a transaction is visible if the authenticated user is
 * either the payer or the payee. Two-sided check mirrors the HTTP
 * `transactionService.getTransactions`.
 */

import { z } from 'zod';
import type {
    PaymentSummaryCardProps,
    TransactionListItem,
    TransactionListProps,
} from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const TX_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'] as const;

type TxRow = {
    id: string;
    type: string;
    amount: { toString(): string } | number;
    currency: string;
    status: string;
    createdAt: Date;
    payerId: string;
    payeeId: string;
    payer: { firstName: string | null; lastName: string | null } | null;
    payee: { firstName: string | null; lastName: string | null } | null;
};

function nameOf(u: { firstName: string | null; lastName: string | null } | null): string | undefined {
    if (!u) return undefined;
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return full || undefined;
}

function toItem(t: TxRow, viewerUserId: string): TransactionListItem {
    // Counterparty = the OTHER side of the transaction from the viewer's POV.
    const counterpartyName =
        t.payerId === viewerUserId ? nameOf(t.payee) : nameOf(t.payer);
    return {
        transactionId: t.id,
        kind: t.type,
        amount: { amount: Number(t.amount), currency: t.currency ?? 'NGN' },
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        counterpartyName,
    };
}

const listParams = z.object({
    status: z.enum(TX_STATUSES).optional(),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'transactions.listMine',
    label: 'List my transactions',
    description:
        'List transactions where the authenticated user is the payer or payee. Scoped by ctx.user.userId.',
    parameters: listParams,
    async execute(params, ctx, sink) {
        const userId = ctx.user.userId;
        const where: Record<string, unknown> = {
            OR: [{ payerId: userId }, { payeeId: userId }],
        };
        if (params.status) where.status = params.status;

        const [items, total] = await Promise.all([
            prismaReadonly.transaction.findMany({
                where: where as never,
                take: params.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    payer: { select: { firstName: true, lastName: true } },
                    payee: { select: { firstName: true, lastName: true } },
                },
            }),
            prismaReadonly.transaction.count({ where: where as never }),
        ]);

        const list: TransactionListProps = {
            items: items.map((t) => toItem(t, userId)),
            total,
        };
        sink.ui({ type: 'TransactionList', props: list });
        return {
            text: `Found ${items.length} of ${total} transaction(s).`,
            details: { count: items.length, total, userId },
        };
    },
});

const getByIdParams = z.object({ transactionId: z.string().uuid() });

const getById = defineLocalTool({
    name: 'transactions.getById',
    label: 'Get transaction details',
    description:
        'Fetch a transaction by id. Must involve the authenticated user as payer or payee.',
    parameters: getByIdParams,
    async execute({ transactionId }, ctx, sink) {
        const userId = ctx.user.userId;
        const t = await prismaReadonly.transaction.findFirst({
            where: {
                id: transactionId,
                OR: [{ payerId: userId }, { payeeId: userId }],
            },
            include: {
                payer: { select: { firstName: true, lastName: true } },
                payee: { select: { firstName: true, lastName: true } },
            },
        });
        if (!t) {
            return {
                text: `Transaction ${transactionId} not found or not yours.`,
                ui: {
                    type: 'ErrorCard',
                    props: {
                        title: 'Transaction not found',
                        message: 'No such transaction, or you are not party to it.',
                        code: 'NOT_FOUND',
                    },
                },
            };
        }
        const list: TransactionListProps = { items: [toItem(t, userId)], total: 1 };
        sink.ui({ type: 'TransactionList', props: list });
        return {
            text: `Transaction ${t.id} ${t.type} ${t.status} ₦${Number(t.amount).toLocaleString()}.`,
            details: { transactionId: t.id, accessedBy: userId },
        };
    },
});

// ============================================
// transactions.initiatePayment (write, gRPC, HIGH-RISK confirm-gated)
// ============================================

const TX_TYPES = ['RENT', 'DEPOSIT', 'AGENT_FEE', 'OTHER'] as const;
const PAYMENT_METHODS = ['CARD', 'BANK_TRANSFER', 'USSD'] as const;

const payParams = z.object({
    type: z.enum(TX_TYPES),
    amount: z.number().positive().max(50_000_000), // ₦50M ceiling per-tool
    currency: z.string().length(3).default('NGN'),
    leaseId: z.string().uuid().optional(),
    propertyId: z.string().uuid().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).optional(),
    description: z.string().max(500).optional(),
});

const initiatePayment = defineLocalTool({
    name: 'transactions.initiatePayment',
    label: 'Initiate payment',
    description:
        'Initiate a payment (rent, deposit, fee). Confirm-gated. Returns a payment URL the user follows to complete via Paystack / Stripe.',
    parameters: payParams,
    confirm: {
        humanSummary: (p) =>
            `Pay ₦${p.amount.toLocaleString()} ${p.currency} for ${p.type.toLowerCase()}${p.leaseId ? ` (lease ${p.leaseId.slice(0, 8)}…)` : ''}.`,
        riskLevel: 'high',
    },
    async execute(params, ctx, sink) {
        const r = await grpc.transactions.initiatePayment(ctx.jwt, {
            type: params.type,
            amount: params.amount,
            currency: params.currency,
            lease_id: params.leaseId,
            property_id: params.propertyId,
            payment_method: params.paymentMethod,
            description: params.description,
        });
        const card: PaymentSummaryCardProps = {
            purpose: params.type,
            amount: { amount: params.amount, currency: params.currency },
            recipientName: '(see lease landlord)',
            actions: r.payment_url
                ? [
                      {
                          id: 'pay',
                          label: 'Complete payment',
                          kind: 'primary' as const,
                          payload: { paymentUrl: r.payment_url },
                      },
                  ]
                : [],
        };
        sink.ui({ type: 'PaymentSummaryCard', props: card });
        return {
            text: `Payment initiated. Transaction ${r.transaction_id} status=${r.status}. ${r.payment_url ? 'Complete via the linked payment URL.' : ''}`,
            details: {
                transactionId: r.transaction_id,
                amount: params.amount,
                initiatedBy: ctx.user.userId,
            },
        };
    },
});

export const transactionsBundle: ToolBundle = {
    name: 'transactions',
    description: 'View transactions you are a party to and initiate new payments.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [listMine, getById],
    writeTools: [initiatePayment],
};
