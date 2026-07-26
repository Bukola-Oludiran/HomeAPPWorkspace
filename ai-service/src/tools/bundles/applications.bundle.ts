/**
 * applications bundle — tenant reads own applications; landlord sees
 * applications submitted for their properties.
 *
 * Note: the HTTP world exposed these via /tenant/applications and
 * /landlord/applicants; in the bundle world they collapse into a single
 * role-aware tool, mirroring the AI-side simplification.
 */

import { z } from 'zod';
import { ApplicationStatusValues } from '@homeai/contracts/enums';
import type { ApplicationStatusCardProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle, ToolCtx } from '../types';
import { defineLocalTool } from '../types';

type ApplicationRow = {
    id: string;
    status: string;
    submittedAt: Date;
    property: { name: string };
    tenant: { firstName: string | null; lastName: string | null };
};

function toCard(a: ApplicationRow): ApplicationStatusCardProps {
    return {
        applicationId: a.id,
        propertyTitle: a.property.name,
        status: a.status as ApplicationStatusCardProps['status'],
        submittedAt: a.submittedAt.toISOString(),
        landlordName: undefined,
        actions: [{ id: 'view', label: 'View application', kind: 'primary' as const }],
    };
}

function whereForRole(ctx: ToolCtx): Record<string, unknown> {
    if (ctx.user.role === 'TENANT') return { tenantId: ctx.user.userId };
    if (ctx.user.role === 'LANDLORD')
        return { property: { ownerId: ctx.user.userId } };
    return {};
}

const listParams = z.object({
    status: z.enum(ApplicationStatusValues).optional(),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'applications.listMine',
    label: 'List applications',
    description:
        'Tenants see applications they submitted. Landlords see applications for their properties.',
    parameters: listParams,
    async execute(params, ctx, sink) {
        const where: Record<string, unknown> = { ...whereForRole(ctx) };
        if (params.status) where.status = params.status;
        const items = await prismaReadonly.application.findMany({
            where: where as never,
            take: params.limit,
            orderBy: { submittedAt: 'desc' },
            include: {
                property: { select: { name: true } },
                tenant: { select: { firstName: true, lastName: true } },
            },
        });
        for (const app of items) sink.ui({ type: 'ApplicationStatusCard', props: toCard(app) });
        return {
            text: `Found ${items.length} application(s)${params.status ? ` in ${params.status}` : ''}.`,
            details: { count: items.length, role: ctx.user.role, userId: ctx.user.userId },
        };
    },
});

// ============================================
// applications.submit (write, gRPC, confirm-gated)
// ============================================

const submitParams = z.object({
    propertyId: z.string().uuid(),
    moveInDate: z.string().optional(),
    leaseTermMonths: z.number().int().min(1).max(60).optional(),
    additionalNotes: z.string().max(2000).optional(),
});

const submit = defineLocalTool({
    name: 'applications.submit',
    label: 'Submit application',
    description:
        'Submit a rental application for an active property listing. Confirm-gated — high-value action that locks the tenant into a tenancy decision flow.',
    parameters: submitParams,
    confirm: {
        humanSummary: (p) =>
            `Submit application for property ${p.propertyId}${p.moveInDate ? `, move-in ${p.moveInDate}` : ''}${p.leaseTermMonths ? `, ${p.leaseTermMonths}-month lease` : ''}.`,
        riskLevel: 'high',
    },
    async execute(params, ctx, sink) {
        const result = await grpc.applications.submit(ctx.jwt, {
            property_id: params.propertyId,
            move_in_date: params.moveInDate,
            lease_term_months: params.leaseTermMonths,
            additional_notes: params.additionalNotes,
        });
        sink.ui({
            type: 'ApplicationStatusCard',
            props: {
                applicationId: result.application_id,
                propertyTitle: '(see property details)',
                status: 'PENDING',
                submittedAt: new Date().toISOString(),
                actions: [{ id: 'view', label: 'View application', kind: 'primary' as const }],
            },
        });
        return {
            text: `Application ${result.application_id} submitted. ${result.message}`,
            details: { applicationId: result.application_id, submittedBy: ctx.user.userId },
        };
    },
});

// ============================================
// applications.withdraw (write, gRPC, confirm-gated)
// ============================================

const withdrawParams = z.object({
    applicationId: z.string().uuid(),
});

const withdraw = defineLocalTool({
    name: 'applications.withdraw',
    label: 'Withdraw application',
    description: 'Withdraw a PENDING application you previously submitted. Cannot be undone.',
    parameters: withdrawParams,
    confirm: {
        humanSummary: (p) => `Withdraw application ${p.applicationId}. This cannot be undone.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.applications.withdraw(ctx.jwt, params.applicationId);
        return {
            text: r.message,
            details: { applicationId: params.applicationId, withdrawnBy: ctx.user.userId },
        };
    },
});

export const applicationsBundle: ToolBundle = {
    name: 'applications',
    description:
        'View, submit, and withdraw rental applications.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'ADMIN'],
    readTools: [listMine],
    writeTools: [submit, withdraw],
};
