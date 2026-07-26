/**
 * leases bundle — read tools only in P4. Write tools (create/update/sign)
 * will be added in P6 once their gRPC proto + handler are in place.
 *
 * IDOR posture: TENANT sees leases.tenantId = ctx.userId;
 * LANDLORD sees leases.landlordId = ctx.userId; ADMIN sees all.
 */

import { z } from 'zod';
import { LeaseStatusValues } from '@homeai/contracts/enums';
import type { LeaseDetailPanelProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle, ToolCtx } from '../types';
import { defineLocalTool } from '../types';

type LeaseRow = {
    id: string;
    monthlyRent: { toString(): string } | number;
    status: string;
    startDate: Date;
    endDate: Date;
    property: { name: string };
};

function toPanel(l: LeaseRow): LeaseDetailPanelProps {
    return {
        leaseId: l.id,
        propertyTitle: l.property.name,
        status: l.status as LeaseDetailPanelProps['status'],
        monthlyRent: { amount: Number(l.monthlyRent), currency: 'NGN' },
        startDate: l.startDate.toISOString(),
        endDate: l.endDate.toISOString(),
        actions: [{ id: 'view', label: 'View lease', kind: 'primary' as const }],
    };
}

function whereForRole(ctx: ToolCtx): Record<string, unknown> {
    if (ctx.user.role === 'TENANT') return { tenantId: ctx.user.userId };
    if (ctx.user.role === 'LANDLORD') return { landlordId: ctx.user.userId };
    return {};
}

const listParams = z.object({
    status: z.enum(LeaseStatusValues).optional(),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'leases.listMine',
    label: 'List my leases',
    description:
        'List leases visible to the authenticated user (tenant sees their leases; landlord sees leases for their properties).',
    parameters: listParams,
    async execute(params, ctx, sink) {
        const where: Record<string, unknown> = { ...whereForRole(ctx) };
        if (params.status) where.status = params.status;
        const items = await prismaReadonly.lease.findMany({
            where: where as never,
            take: params.limit,
            orderBy: { startDate: 'desc' },
            include: { property: { select: { name: true } } },
        });
        for (const lease of items) sink.ui({ type: 'LeaseDetailPanel', props: toPanel(lease) });
        return {
            text: `You have ${items.length} lease(s)${params.status ? ` in ${params.status}` : ''}.`,
            details: { count: items.length, role: ctx.user.role, userId: ctx.user.userId },
        };
    },
});

const getByIdParams = z.object({ leaseId: z.string().uuid() });

const getById = defineLocalTool({
    name: 'leases.getById',
    label: 'Get lease details',
    description:
        'Fetch a single lease by id. Lease must be visible to the authenticated user (same scoping as listMine).',
    parameters: getByIdParams,
    async execute({ leaseId }, ctx, sink) {
        const where = { id: leaseId, ...whereForRole(ctx) };
        const lease = await prismaReadonly.lease.findFirst({
            where: where as never,
            include: { property: { select: { name: true } } },
        });
        if (!lease) {
            return {
                text: `Lease ${leaseId} not found or not accessible.`,
                ui: {
                    type: 'ErrorCard',
                    props: {
                        title: 'Lease not found',
                        message: 'No such lease, or you do not have access.',
                        code: 'NOT_FOUND',
                    },
                },
            };
        }
        sink.ui({ type: 'LeaseDetailPanel', props: toPanel(lease) });
        return {
            text: `Lease for ${lease.property.name}, ${lease.status}, ₦${Number(lease.monthlyRent).toLocaleString()}/month.`,
            details: { leaseId: lease.id, accessedBy: ctx.user.userId },
        };
    },
});

// ============================================
// Writes — gRPC, all confirm-gated at high or medium risk.
// ============================================

const createLease = defineLocalTool({
    name: 'leases.create',
    label: 'Create lease',
    description: 'Draft a new lease between this landlord and a tenant.',
    parameters: z.object({
        propertyId: z.string().uuid(),
        tenantId: z.string().uuid(),
        startDate: z.string(),
        endDate: z.string(),
        monthlyRent: z.number().positive().max(50_000_000),
        securityDeposit: z.number().nonnegative().max(50_000_000).optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Create lease for property ${p.propertyId.slice(0, 8)}…, ₦${p.monthlyRent.toLocaleString()}/month from ${p.startDate} to ${p.endDate}.`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.leases.createLease(ctx.jwt, {
            property_id: params.propertyId,
            tenant_id: params.tenantId,
            start_date: params.startDate,
            end_date: params.endDate,
            monthly_rent: params.monthlyRent,
            security_deposit: params.securityDeposit,
        });
        return {
            text: `Lease ${r.id} created (${r.status}).`,
            details: { leaseId: r.id, createdBy: ctx.user.userId },
        };
    },
});

const updateLease = defineLocalTool({
    name: 'leases.update',
    label: 'Update lease',
    description: 'Modify the monthly rent or end-date on an existing lease.',
    parameters: z.object({
        leaseId: z.string().uuid(),
        monthlyRent: z.number().positive().max(50_000_000).optional(),
        endDate: z.string().optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Update lease ${p.leaseId.slice(0, 8)}…${p.monthlyRent ? ` rent → ₦${p.monthlyRent.toLocaleString()}/month` : ''}${p.endDate ? `, end-date → ${p.endDate}` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.leases.updateLease(ctx.jwt, {
            id: params.leaseId,
            monthly_rent: params.monthlyRent,
            end_date: params.endDate,
        });
        return {
            text: `Lease ${r.id} updated (${r.status}).`,
            details: { leaseId: r.id, updatedBy: ctx.user.userId },
        };
    },
});

const sendRenewalOffer = defineLocalTool({
    name: 'leases.sendRenewalOffer',
    label: 'Send renewal offer',
    description: 'Send a renewal offer for an existing lease (landlord-side).',
    parameters: z.object({
        leaseId: z.string().uuid(),
        newEndDate: z.string(),
        newMonthlyRent: z.number().positive().optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Renewal offer: end-date → ${p.newEndDate}${p.newMonthlyRent ? `, rent → ₦${p.newMonthlyRent.toLocaleString()}` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.leases.sendRenewalOffer(ctx.jwt, {
            id: params.leaseId,
            new_end_date: params.newEndDate,
            new_monthly_rent: params.newMonthlyRent,
        });
        return { text: r.message, details: { leaseId: params.leaseId } };
    },
});

const respondToRenewal = defineLocalTool({
    name: 'leases.respondToRenewal',
    label: 'Respond to renewal',
    description: 'Accept or decline a renewal offer (tenant-side).',
    parameters: z.object({
        leaseId: z.string().uuid(),
        response: z.enum(['ACCEPT', 'DECLINE']),
    }),
    confirm: {
        humanSummary: (p) => `${p.response} renewal for lease ${p.leaseId.slice(0, 8)}…`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.leases.respondToRenewal(ctx.jwt, {
            id: params.leaseId,
            response: params.response,
        });
        return { text: r.message, details: { leaseId: params.leaseId, response: params.response } };
    },
});

const signLease = defineLocalTool({
    name: 'leases.sign',
    label: 'Sign lease',
    description: 'Sign a lease (tenant or landlord side). Confirm-gated.',
    parameters: z.object({
        leaseId: z.string().uuid(),
        signature: z.string().min(2).max(200),
    }),
    confirm: {
        humanSummary: (p) =>
            `Sign lease ${p.leaseId.slice(0, 8)}… with signature "${p.signature.slice(0, 40)}".`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.leases.signLease(ctx.jwt, {
            id: params.leaseId,
            signature: params.signature,
        });
        return { text: r.message, details: { leaseId: params.leaseId, signedBy: ctx.user.userId } };
    },
});

export const leasesBundle: ToolBundle = {
    name: 'leases',
    description: 'View, create, update, renew, and sign leases.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'ADMIN'],
    readTools: [listMine, getById],
    writeTools: [createLease, updateLease, sendRenewalOffer, respondToRenewal, signLease],
};
