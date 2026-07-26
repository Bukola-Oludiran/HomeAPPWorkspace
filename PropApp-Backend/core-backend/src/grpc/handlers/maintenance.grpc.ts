/**
 * Maintenance gRPC handlers
 *
 * These thinly wrap maintenanceService methods. The only adaptation is
 * between proto wire shapes (snake_case, string enum tokens) and the
 * service-layer DTOs (camelCase, Prisma string enums). Authorization
 * checks, DB writes, status transitions all live in maintenance.service.ts
 * and are shared with the HTTP route.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { maintenanceService } from '../../modules/maintenance/maintenance.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';
import { ValidationError } from '../../common/utils/errors';
import {
    AssignMaintenanceAgentRequest,
    AssignMaintenanceAgentResponse,
    MaintenanceRequestPb,
    SubmitMaintenanceRequestRequest,
    UpdateMaintenanceRequestRequest,
    priorityFromWire,
    priorityToWire,
    statusFromWire,
    statusToWire,
    timeSlotFromWire,
} from '../types/maintenance';

type MaintenanceDetail = Awaited<ReturnType<typeof maintenanceService.getRequestById>>;

function toPb(detail: MaintenanceDetail): MaintenanceRequestPb {
    return {
        id: detail.id,
        property_id: detail.propertyId,
        tenant_id: detail.tenantId,
        category: detail.category ?? undefined,
        description: detail.description ?? undefined,
        priority: priorityToWire(detail.priority),
        status: statusToWire(detail.status),
        preferred_date: detail.preferredDate ? detail.preferredDate.toISOString() : undefined,
        preferred_time_slot: detail.preferredTimeSlot ?? undefined,
        photos: detail.photos,
        notes: detail.notes ?? undefined,
        resolution: detail.resolution ?? undefined,
        cost: detail.cost ?? undefined,
        property: {
            id: detail.property.id,
            name: detail.property.name,
            address: detail.property.address,
        },
        tenant: {
            id: detail.tenant.id,
            first_name: detail.tenant.firstName ?? undefined,
            last_name: detail.tenant.lastName ?? undefined,
        },
        assigned_agent: detail.assignedAgent
            ? {
                  id: detail.assignedAgent.id,
                  first_name: detail.assignedAgent.firstName ?? undefined,
                  last_name: detail.assignedAgent.lastName ?? undefined,
              }
            : undefined,
        scheduled_date: detail.scheduledDate ? detail.scheduledDate.toISOString() : undefined,
        resolved_at: detail.resolvedAt ? detail.resolvedAt.toISOString() : undefined,
        created_at: detail.createdAt.toISOString(),
        updated_at: detail.updatedAt.toISOString(),
    };
}

export const submitMaintenanceRequest: handleUnaryCall<
    SubmitMaintenanceRequestRequest,
    MaintenanceRequestPb
> = async (
    call: ServerUnaryCall<SubmitMaintenanceRequestRequest, MaintenanceRequestPb>,
    callback: sendUnaryData<MaintenanceRequestPb>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'TENANT', 'ADMIN');

        const req = call.request;
        const priority = priorityFromWire(req.priority);
        if (!priority) {
            throw new ValidationError('Invalid priority', [
                { field: 'priority', message: 'must be one of LOW, MEDIUM, HIGH, EMERGENCY' },
            ]);
        }

        const detail = await maintenanceService.createRequest(ctx.userId, {
            propertyId: req.property_id,
            category: req.category as never,
            description: req.description,
            priority,
            preferredDate: req.preferred_date,
            preferredTimeSlot: timeSlotFromWire(req.preferred_time_slot),
        });

        callback(null, toPb(detail));
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

type UpdatableStatus =
    | 'PENDING'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'ON_HOLD'
    | 'COMPLETED'
    | 'CANCELLED';
const UPDATABLE_STATUSES = new Set<UpdatableStatus>([
    'PENDING',
    'ASSIGNED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
]);

export const updateMaintenanceRequest: handleUnaryCall<
    UpdateMaintenanceRequestRequest,
    MaintenanceRequestPb
> = async (
    call: ServerUnaryCall<UpdateMaintenanceRequestRequest, MaintenanceRequestPb>,
    callback: sendUnaryData<MaintenanceRequestPb>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const req = call.request;

        let nextStatus: UpdatableStatus | undefined;
        if (req.status) {
            const wire = statusFromWire(req.status);
            if (!wire || !UPDATABLE_STATUSES.has(wire as UpdatableStatus)) {
                throw new ValidationError('Invalid status for update', [
                    {
                        field: 'status',
                        message:
                            'must be one of PENDING, ASSIGNED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED',
                    },
                ]);
            }
            nextStatus = wire as UpdatableStatus;
        }

        const detail = await maintenanceService.updateRequest(req.id, ctx.userId, {
            status: nextStatus,
            description: req.description,
            priority: req.priority ? priorityFromWire(req.priority) : undefined,
            notes: req.notes,
            resolution: req.resolution,
            cost: req.cost,
        });

        callback(null, toPb(detail));
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const assignMaintenanceAgent: handleUnaryCall<
    AssignMaintenanceAgentRequest,
    AssignMaintenanceAgentResponse
> = async (
    call: ServerUnaryCall<AssignMaintenanceAgentRequest, AssignMaintenanceAgentResponse>,
    callback: sendUnaryData<AssignMaintenanceAgentResponse>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');

        const req = call.request;
        const result = await maintenanceService.assignAgent(req.id, ctx.userId, {
            agentId: req.agent_id,
            scheduledDate: req.scheduled_date,
            scheduledTime: req.scheduled_time,
            notes: req.notes,
        });

        callback(null, { message: result.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const maintenanceHandlers = {
    SubmitMaintenanceRequest: submitMaintenanceRequest,
    UpdateMaintenanceRequest: updateMaintenanceRequest,
    AssignMaintenanceAgent: assignMaintenanceAgent,
};
