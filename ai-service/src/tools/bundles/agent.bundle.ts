/**
 * agent bundle — agent-role reads (jobs, earnings) + writes (accept,
 * decline, complete, withdraw).
 */

import { z } from 'zod';
import type { JobCardProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

type JobRow = {
    id: string;
    type: string;
    propertyId: string;
    scheduledDate: Date | null;
    payoutAmount: { toString(): string } | number | null;
    status: string;
    property?: { name: string } | null;
};

function toCard(r: JobRow): JobCardProps {
    return {
        jobId: r.id,
        jobType: r.type,
        propertyTitle: r.property?.name,
        scheduledAt: r.scheduledDate ? r.scheduledDate.toISOString() : undefined,
        payout:
            r.payoutAmount !== null
                ? { amount: Number(r.payoutAmount), currency: 'NGN' }
                : undefined,
        status: r.status,
        actions: [{ id: 'view', label: 'View job', kind: 'primary' as const }],
    };
}

const listAvailableParams = z.object({
    limit: z.number().int().min(1).max(50).default(20),
});

const listAvailable = defineLocalTool({
    name: 'agent.listAvailableJobs',
    label: 'Available jobs',
    description: 'List jobs available for the authenticated agent to accept.',
    parameters: listAvailableParams,
    async execute(params, ctx, sink) {
        const items = await prismaReadonly.agentJob.findMany({
            where: { status: 'OPEN' } as never,
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: { property: { select: { name: true } } } as never,
        });
        for (const j of items as unknown as JobRow[]) sink.ui({ type: 'JobCard', props: toCard(j) });
        return {
            text: `Found ${items.length} available job(s).`,
            details: { count: items.length, viewerRole: ctx.user.role },
        };
    },
});

const listMyJobs = defineLocalTool({
    name: 'agent.listMyJobs',
    label: 'My accepted jobs',
    description:
        'List jobs the authenticated agent has accepted. Scoped by ctx.user.userId.',
    parameters: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
    async execute(params, ctx, sink) {
        const items = await prismaReadonly.agentJob.findMany({
            where: { agentId: ctx.user.userId } as never,
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: { property: { select: { name: true } } } as never,
        });
        for (const j of items as unknown as JobRow[]) sink.ui({ type: 'JobCard', props: toCard(j) });
        return {
            text: `You have ${items.length} accepted job(s).`,
            details: { count: items.length, agentId: ctx.user.userId },
        };
    },
});

const accept = defineLocalTool({
    name: 'agent.acceptJob',
    label: 'Accept job',
    description: 'Accept an available job. Once accepted you commit to delivering it.',
    parameters: z.object({
        jobId: z.string().uuid(),
        note: z.string().max(500).optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Accept job ${p.jobId.slice(0, 8)}…${p.note ? ` with note "${p.note.slice(0, 60)}"` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.agent.acceptJob(ctx.jwt, params.jobId, params.note);
        return {
            text: r.message,
            details: { jobId: params.jobId, acceptedBy: ctx.user.userId },
        };
    },
});

const decline = defineLocalTool({
    name: 'agent.declineJob',
    label: 'Decline job',
    description: 'Decline an available job. A reason is required.',
    parameters: z.object({
        jobId: z.string().uuid(),
        reason: z.string().min(3).max(500),
    }),
    async execute(params, ctx) {
        const r = await grpc.agent.declineJob(ctx.jwt, params.jobId, params.reason);
        return { text: r.message, details: { jobId: params.jobId, declinedBy: ctx.user.userId } };
    },
});

const complete = defineLocalTool({
    name: 'agent.completeJob',
    label: 'Complete job',
    description: 'Mark an accepted job as complete. Payout settlement starts after this.',
    parameters: z.object({
        jobId: z.string().uuid(),
        completionNotes: z.string().max(2000).optional(),
    }),
    confirm: {
        humanSummary: (p) => `Mark job ${p.jobId.slice(0, 8)}… complete.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.agent.completeJob(ctx.jwt, params.jobId, params.completionNotes);
        return { text: r.message, details: { jobId: params.jobId, completedBy: ctx.user.userId } };
    },
});

const withdrawEarnings = defineLocalTool({
    name: 'agent.withdrawEarnings',
    label: 'Withdraw earnings',
    description: 'Withdraw earnings to a saved bank account.',
    parameters: z.object({
        amount: z.number().positive().max(10_000_000),
        bankAccountId: z.string().uuid(),
    }),
    confirm: {
        humanSummary: (p) => `Withdraw ₦${p.amount.toLocaleString()} to bank account ${p.bankAccountId.slice(0, 8)}…`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.agent.withdrawEarnings(ctx.jwt, {
            amount: params.amount,
            bank_account_id: params.bankAccountId,
        });
        return {
            text: `Withdrawal ${r.payout_id} ${r.status}.`,
            details: { payoutId: r.payout_id, requestedBy: ctx.user.userId },
        };
    },
});

export const agentBundle: ToolBundle = {
    name: 'agent',
    description: 'Manage agent jobs and earnings.',
    eligibleRoles: ['AGENT', 'ADMIN'],
    readTools: [listAvailable, listMyJobs],
    writeTools: [accept, decline, complete, withdrawEarnings],
};
