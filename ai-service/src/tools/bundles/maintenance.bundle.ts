/**
 * maintenance bundle — read (listMine, getById) + write (submit).
 *
 * IDOR posture: list/get filters by ctx.user.userId for tenants;
 * landlords see requests for their own properties; agents see requests
 * assigned to them. The role-aware filter mirrors the HTTP route's
 * service.getRequests() behavior.
 */

import { z } from 'zod';
import {
    MaintenanceCategoryValues,
    MaintenancePriorityValues,
    MaintenanceStatusValues,
} from '@homeai/contracts/enums';
import type { MaintenanceRequestCardProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle, ToolCtx } from '../types';
import { defineLocalTool } from '../types';

// ============================================
// shared projection
// ============================================

type MaintenanceRow = {
    id: string;
    property: { id: string; name: string };
    category: string | null;
    description: string | null;
    priority: string;
    status: string;
    createdAt: Date;
    assignedAgent?: { firstName: string | null; lastName: string | null } | null;
};

function toCard(r: MaintenanceRow): MaintenanceRequestCardProps {
    return {
        requestId: r.id,
        propertyTitle: r.property.name,
        category: r.category ?? undefined,
        priority: r.priority as MaintenanceRequestCardProps['priority'],
        status: r.status as MaintenanceRequestCardProps['status'],
        description: r.description ?? undefined,
        createdAt: r.createdAt.toISOString(),
        assignedAgentName: r.assignedAgent
            ? [r.assignedAgent.firstName, r.assignedAgent.lastName]
                  .filter(Boolean)
                  .join(' ') || undefined
            : undefined,
        actions: [{ id: 'view', label: 'View request', kind: 'primary' as const }],
    };
}

function whereForRole(ctx: ToolCtx): Record<string, unknown> {
    if (ctx.user.role === 'TENANT') return { tenantId: ctx.user.userId };
    if (ctx.user.role === 'LANDLORD')
        return { property: { ownerId: ctx.user.userId } };
    if (ctx.user.role === 'AGENT') return { assignedAgentId: ctx.user.userId };
    // ADMIN: no filter; agent may also see assigned via the AGENT branch above.
    return {};
}

// ============================================
// maintenance.listMine
// ============================================

const listParams = z.object({
    status: z.enum(MaintenanceStatusValues).optional(),
    propertyId: z.string().uuid().optional(),
    priority: z.enum(MaintenancePriorityValues).optional(),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'maintenance.listMine',
    label: 'List maintenance requests',
    description:
        'List maintenance requests visible to the authenticated user (tenants see their own; landlords see those for their properties; agents see those assigned to them).',
    parameters: listParams,
    async execute(params, ctx, sink) {
        const where: Record<string, unknown> = { ...whereForRole(ctx) };
        if (params.status) where.status = params.status;
        if (params.priority) where.priority = params.priority;
        if (params.propertyId) where.propertyId = params.propertyId;

        const items = await prismaReadonly.maintenanceRequest.findMany({
            where: where as never,
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: {
                property: { select: { id: true, name: true } },
                assignedAgent: { select: { firstName: true, lastName: true } },
            },
        });

        const cards = items.map(toCard);
        for (const card of cards) sink.ui({ type: 'MaintenanceRequestCard', props: card });

        return {
            text: `Found ${cards.length} maintenance request(s).`,
            details: { count: cards.length, role: ctx.user.role, userId: ctx.user.userId },
        };
    },
});

// ============================================
// maintenance.getById
// ============================================

const getByIdParams = z.object({ requestId: z.string().uuid() });

const getById = defineLocalTool({
    name: 'maintenance.getById',
    label: 'Get maintenance request',
    description:
        'Fetch a single maintenance request by id. The request must be visible to the authenticated user (same scoping as listMine).',
    parameters: getByIdParams,
    async execute({ requestId }, ctx, sink) {
        const where = { id: requestId, ...whereForRole(ctx) };
        const row = await prismaReadonly.maintenanceRequest.findFirst({
            where: where as never,
            include: {
                property: { select: { id: true, name: true } },
                assignedAgent: { select: { firstName: true, lastName: true } },
            },
        });
        if (!row) {
            return {
                text: `Maintenance request ${requestId} not found or not accessible.`,
                ui: {
                    type: 'ErrorCard',
                    props: {
                        title: 'Not found',
                        message: 'No such request, or you do not have access.',
                        code: 'NOT_FOUND',
                    },
                },
            };
        }
        sink.ui({ type: 'MaintenanceRequestCard', props: toCard(row) });
        return {
            text: `Maintenance request "${row.description?.slice(0, 80) ?? row.id}" status=${row.status}.`,
            details: { requestId: row.id, accessedBy: ctx.user.userId },
        };
    },
});

// ============================================
// maintenance.submit (write — gRPC + confirm gate)
// ============================================

const submitParams = z.object({
    propertyId: z.string().uuid(),
    category: z.enum(MaintenanceCategoryValues),
    description: z.string().min(10).max(2000),
    priority: z.enum(MaintenancePriorityValues).default('MEDIUM'),
    preferredDate: z.string().optional(),
    preferredTimeSlot: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
});

function timeSlotToWire(
    s?: 'morning' | 'afternoon' | 'evening' | 'any'
): 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY' | undefined {
    if (!s) return undefined;
    return s.toUpperCase() as 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';
}

const submit = defineLocalTool({
    name: 'maintenance.submit',
    label: 'Submit maintenance request',
    description:
        'Submit a maintenance request for a property you currently lease. Requires propertyId from properties.search / leases.listMine. Confirm-gated.',
    parameters: submitParams,
    confirm: {
        humanSummary: (p) =>
            `Submit a ${p.priority} priority ${p.category.toLowerCase()} request: "${p.description.slice(0, 80)}${p.description.length > 80 ? '…' : ''}"`,
        riskLevel: 'medium',
    },
    async execute(params, ctx, sink) {
        const result = await grpc.maintenance.submitMaintenanceRequest(ctx.jwt, {
            property_id: params.propertyId,
            category: params.category,
            description: params.description,
            priority: params.priority,
            preferred_date: params.preferredDate,
            preferred_time_slot: timeSlotToWire(params.preferredTimeSlot),
        });
        sink.ui({
            type: 'MaintenanceRequestCard',
            props: {
                requestId: result.id,
                propertyTitle: result.property.name,
                category: result.category ?? undefined,
                priority: result.priority as MaintenanceRequestCardProps['priority'],
                status: result.status as MaintenanceRequestCardProps['status'],
                description: result.description ?? undefined,
                createdAt: result.created_at,
                assignedAgentName: result.assigned_agent
                    ? [result.assigned_agent.first_name, result.assigned_agent.last_name]
                          .filter(Boolean)
                          .join(' ') || undefined
                    : undefined,
                actions: [{ id: 'view', label: 'View request', kind: 'primary' as const }],
            },
        });
        return {
            text: `Maintenance request submitted (id=${result.id}, status=${result.status}).`,
            details: { requestId: result.id, submittedBy: ctx.user.userId },
        };
    },
});

export const maintenanceBundle: ToolBundle = {
    name: 'maintenance',
    description: 'View and submit maintenance requests.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [listMine, getById],
    writeTools: [submit],
};
