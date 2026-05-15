/**
 * Maintenance Service
 * Handles maintenance requests
 * Per Backend Requirements.md Maintenance System section
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    PropertyNotFoundError,
    ValidationError,
} from '../../common/utils/errors';
import {
    CreateMaintenanceRequestDto,
    UpdateMaintenanceRequestDto,
    AssignAgentDto,
    MaintenanceQueryDto,
} from './maintenance.dto';

// ============================================
// TYPES
// ============================================

interface MaintenanceRequestDetail {
    id: string;
    propertyId: string;
    tenantId: string;
    category: string | null;
    description: string | null;
    urgency: string;
    status: string;
    preferredDate: Date | null;
    preferredTimeSlot: string | null;
    photos: string[];
    notes: string | null;
    resolution: string | null;
    cost: number | null;
    property: {
        id: string;
        name: string;
        address: string;
    };
    tenant: {
        id: string;
        firstName: string | null;
        lastName: string | null;
    };
    assignedAgent: {
        id: string;
        firstName: string | null;
        lastName: string | null;
    } | null;
    scheduledDate: Date | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// MAINTENANCE SERVICE CLASS
// ============================================

class MaintenanceService {
    /**
     * Get maintenance requests
     * GET /api/v1/maintenance
     */
    async getRequests(
        userId: string,
        role: string,
        query: MaintenanceQueryDto
    ): Promise<{
        requests: MaintenanceRequestDetail[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {};

        // Filter by role
        if (role === 'TENANT') {
            where.tenantId = userId;
        } else if (role === 'LANDLORD') {
            where.property = { ownerId: userId };
        } else if (role === 'AGENT') {
            where.assignedAgentId = userId;
        }

        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        if (query.propertyId) {
            where.propertyId = query.propertyId;
        }

        if (query.urgency && query.urgency !== 'all') {
            where.urgency = query.urgency.toUpperCase();
        }

        const [requests, total] = await Promise.all([
            prisma.maintenanceRequest.findMany({
                where: where as any,
                orderBy: [{ createdAt: 'desc' }],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            addressStreet: true,
                            addressCity: true,
                        },
                    },
                    tenant: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                    assignedAgent: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            prisma.maintenanceRequest.count({ where: where as any }),
        ]);

        return {
            requests: requests.map((r: any) => ({
                id: r.id,
                propertyId: r.propertyId,
                tenantId: r.tenantId,
                category: r.category,
                description: r.description,
                urgency: r.urgency,
                status: r.status,
                preferredDate: r.preferredDate,
                preferredTimeSlot: r.preferredTimeSlot,
                photos: (r.photos as string[]) || [],
                notes: r.notes,
                resolution: r.resolution,
                cost: r.cost ? Number(r.cost) : null,
                property: {
                    id: r.property.id,
                    name: r.property.name,
                    address: `${r.property.addressStreet || ''}, ${r.property.addressCity || ''}`.trim(),
                },
                tenant: r.tenant,
                assignedAgent: r.assignedAgent,
                scheduledDate: r.scheduledDate,
                resolvedAt: r.resolvedAt,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            })),
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get maintenance request by ID
     * GET /api/v1/maintenance/:id
     */
    async getRequestById(requestId: string, userId: string): Promise<MaintenanceRequestDetail> {
        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        addressStreet: true,
                        addressCity: true,
                        ownerId: true,
                    },
                },
                tenant: {
                    select: { id: true, firstName: true, lastName: true },
                },
                assignedAgent: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        if (!request) {
            throw new ValidationError('Maintenance request not found', [
                { field: 'id', message: 'Request not found' },
            ]);
        }

        // Verify access
        const hasAccess =
            request.tenantId === userId ||
            request.property.ownerId === userId ||
            request.assignedAgentId === userId;

        if (!hasAccess) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                throw new ValidationError('Access denied', [
                    { field: 'id', message: 'You do not have access to this request' },
                ]);
            }
        }

        return {
            id: request.id,
            propertyId: request.propertyId,
            tenantId: request.tenantId,
            category: request.category,
            description: request.description,
            urgency: request.urgency,
            status: request.status,
            preferredDate: request.preferredDate,
            preferredTimeSlot: request.preferredTimeSlot,
            photos: (request.photos as string[]) || [],
            notes: request.notes,
            resolution: request.resolution,
            cost: request.cost ? Number(request.cost) : null,
            property: {
                id: request.property.id,
                name: request.property.name,
                address: `${request.property.addressStreet || ''}, ${request.property.addressCity || ''}`.trim(),
            },
            tenant: request.tenant,
            assignedAgent: request.assignedAgent,
            scheduledDate: request.scheduledDate,
            resolvedAt: request.resolvedAt,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        };
    }

    /**
     * Create maintenance request
     * POST /api/v1/maintenance
     */
    async createRequest(
        tenantId: string,
        data: CreateMaintenanceRequestDto
    ): Promise<MaintenanceRequestDetail> {
        // Verify tenant has active lease for property
        const lease = await prisma.lease.findFirst({
            where: {
                tenantId,
                propertyId: data.propertyId,
                status: 'ACTIVE',
            },
        });

        if (!lease) {
            throw new ValidationError('No active lease', [
                { field: 'propertyId', message: 'You do not have an active lease for this property' },
            ]);
        }

        const urgencyValue = this.mapUrgency(data.urgency);

        const request = await prisma.maintenanceRequest.create({
            data: {
                propertyId: data.propertyId,
                tenantId,
                category: data.category,
                description: data.description,
                urgency: urgencyValue,
                preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
                preferredTimeSlot: data.preferredTimeSlot,
                status: 'PENDING',
                photos: [],
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        addressStreet: true,
                        addressCity: true,
                    },
                },
                tenant: {
                    select: { id: true, firstName: true, lastName: true },
                },
                assignedAgent: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        logger.info(`Maintenance request created: ${request.id} by tenant ${tenantId}`);

        return {
            id: request.id,
            propertyId: request.propertyId,
            tenantId: request.tenantId,
            category: request.category,
            description: request.description,
            urgency: request.urgency,
            status: request.status,
            preferredDate: request.preferredDate,
            preferredTimeSlot: request.preferredTimeSlot,
            photos: [],
            notes: request.notes,
            resolution: request.resolution,
            cost: request.cost ? Number(request.cost) : null,
            property: {
                id: request.property.id,
                name: request.property.name,
                address: `${request.property.addressStreet || ''}, ${request.property.addressCity || ''}`.trim(),
            },
            tenant: request.tenant,
            assignedAgent: request.assignedAgent,
            scheduledDate: request.scheduledDate,
            resolvedAt: request.resolvedAt,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        };
    }

    /**
     * Update maintenance request
     * PUT /api/v1/maintenance/:id
     */
    async updateRequest(
        requestId: string,
        userId: string,
        data: UpdateMaintenanceRequestDto
    ): Promise<MaintenanceRequestDetail> {
        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId },
            include: {
                property: { select: { ownerId: true } },
            },
        });

        if (!request) {
            throw new ValidationError('Request not found', [
                { field: 'id', message: 'Maintenance request not found' },
            ]);
        }

        // Only landlord, assigned agent, or admin can update
        const isLandlord = request.property.ownerId === userId;
        const isAgent = request.assignedAgentId === userId;

        if (!isLandlord && !isAgent) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                throw new ValidationError('Access denied', [
                    { field: 'id', message: 'Only landlord or assigned agent can update' },
                ]);
            }
        }

        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (data.status) updateData.status = this.mapStatus(data.status);
        if (data.description) updateData.description = data.description;
        if (data.urgency) updateData.urgency = this.mapUrgency(data.urgency);
        if (data.notes) updateData.notes = data.notes;
        if (data.resolution) {
            updateData.resolution = data.resolution;
            updateData.resolvedAt = new Date();
        }
        if (data.cost !== undefined) updateData.cost = data.cost;

        const updated = await prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: updateData as any,
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        addressStreet: true,
                        addressCity: true,
                    },
                },
                tenant: {
                    select: { id: true, firstName: true, lastName: true },
                },
                assignedAgent: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        logger.info(`Maintenance request updated: ${requestId}`);

        return {
            id: updated.id,
            propertyId: updated.propertyId,
            tenantId: updated.tenantId,
            category: updated.category,
            description: updated.description,
            urgency: updated.urgency,
            status: updated.status,
            preferredDate: updated.preferredDate,
            preferredTimeSlot: updated.preferredTimeSlot,
            photos: (updated.photos as string[]) || [],
            notes: updated.notes,
            resolution: updated.resolution,
            cost: updated.cost ? Number(updated.cost) : null,
            property: {
                id: updated.property.id,
                name: updated.property.name,
                address: `${updated.property.addressStreet || ''}, ${updated.property.addressCity || ''}`.trim(),
            },
            tenant: updated.tenant,
            assignedAgent: updated.assignedAgent,
            scheduledDate: updated.scheduledDate,
            resolvedAt: updated.resolvedAt,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }

    /**
     * Assign agent to maintenance request
     * POST /api/v1/maintenance/:id/assign
     */
    async assignAgent(
        requestId: string,
        landlordId: string,
        data: AssignAgentDto
    ): Promise<{ message: string }> {
        const request = await prisma.maintenanceRequest.findUnique({
            where: { id: requestId },
            include: {
                property: { select: { ownerId: true } },
            },
        });

        if (!request || request.property.ownerId !== landlordId) {
            throw new ValidationError('Request not found', [
                { field: 'id', message: 'Request not found or you are not the landlord' },
            ]);
        }

        // Verify agent exists
        const agent = await prisma.user.findFirst({
            where: { id: data.agentId, role: 'AGENT' },
        });

        if (!agent) {
            throw new ValidationError('Agent not found', [
                { field: 'agentId', message: 'Invalid agent ID' },
            ]);
        }

        await prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: {
                assignedAgentId: data.agentId,
                scheduledDate: new Date(data.scheduledDate),
                notes: data.notes,
                status: 'ASSIGNED',
                updatedAt: new Date(),
            },
        });

        logger.info(`Agent ${data.agentId} assigned to maintenance request ${requestId}`);

        return { message: 'Agent assigned successfully' };
    }

    // Helper methods to map strings to valid enum values
    private mapUrgency(urgency: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY' {
        const map: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'> = {
            'LOW': 'LOW',
            'MEDIUM': 'MEDIUM',
            'HIGH': 'HIGH',
            'EMERGENCY': 'EMERGENCY',
            'URGENT': 'EMERGENCY',
        };
        return map[urgency.toUpperCase()] || 'MEDIUM';
    }

    private mapStatus(status: string): 'PENDING' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' {
        const map: Record<string, 'PENDING' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'> = {
            'PENDING': 'PENDING',
            'SUBMITTED': 'SUBMITTED',
            'ACKNOWLEDGED': 'ACKNOWLEDGED',
            'ASSIGNED': 'ASSIGNED',
            'IN_PROGRESS': 'IN_PROGRESS',
            'COMPLETED': 'COMPLETED',
            'CANCELLED': 'CANCELLED',
        };
        return map[status.toUpperCase()] || 'PENDING';
    }
}

export const maintenanceService = new MaintenanceService();
export { MaintenanceService };
