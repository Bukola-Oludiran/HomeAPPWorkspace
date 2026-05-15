/**
 * Maintenance contract — Zod request schemas + inferred request types
 * for the maintenance module.
 *
 * Plan section A9 drift resolved here: requests use UPPERCASE
 * `priority` (LOW / MEDIUM / HIGH / EMERGENCY) sourced from
 * `MaintenancePriorityValues` in `./enums`, matching both Prisma's
 * `MaintenancePriority` column type and the frontend
 * `MaintenancePriority` union. The prior `urgency` field on the wire
 * was an unrelated lowercase spelling that required a `mapUrgency()`
 * adapter in the service. That adapter is gone alongside the rename.
 *
 * Remaining drift (status casing): `maintenanceQuerySchema.status`
 * still uses lowercase tokens while update/body uses UPPERCASE; the
 * service `toUpperCase()`s the query value. Preserved as-is — a future
 * cleanup can unify both sides.
 */

import { z } from 'zod';
import { MaintenanceCategoryValues, MaintenancePriorityValues } from './enums';

// ============================================
// CREATE
// ============================================

export const createMaintenanceRequestSchema = z.object({
    propertyId: z.string().uuid(),
    category: z.enum(MaintenanceCategoryValues),
    description: z.string().min(10).max(2000),
    priority: z.enum(MaintenancePriorityValues).default('MEDIUM'),
    preferredDate: z.string().optional(),
    preferredTimeSlot: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
});

// ============================================
// UPDATE
// ============================================

export const updateMaintenanceRequestSchema = z.object({
    status: z
        .enum([
            'PENDING',
            'ASSIGNED',
            'IN_PROGRESS',
            'ON_HOLD',
            'COMPLETED',
            'CANCELLED',
        ])
        .optional(),
    description: z.string().min(10).max(2000).optional(),
    priority: z.enum(MaintenancePriorityValues).optional(),
    notes: z.string().max(2000).optional(),
    resolution: z.string().max(2000).optional(),
    cost: z.number().min(0).optional(),
});

// ============================================
// ASSIGN AGENT
// ============================================

export const assignAgentSchema = z.object({
    agentId: z.string().uuid(),
    scheduledDate: z.string(),
    scheduledTime: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

// ============================================
// QUERY
// ============================================

export const maintenanceQuerySchema = z.object({
    status: z
        .enum(['pending', 'assigned', 'in_progress', 'completed', 'all'])
        .default('all'),
    propertyId: z.string().uuid().optional(),
    priority: z.enum([...MaintenancePriorityValues, 'all'] as const).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// REQUEST TYPES
// ============================================

export type CreateMaintenanceRequest = z.input<typeof createMaintenanceRequestSchema>;
export type UpdateMaintenanceRequest = z.input<typeof updateMaintenanceRequestSchema>;
export type AssignMaintenanceAgentRequest = z.input<typeof assignAgentSchema>;
export type MaintenanceQueryRequest = z.input<typeof maintenanceQuerySchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

export type CreateMaintenanceRequestDto = z.infer<typeof createMaintenanceRequestSchema>;
export type UpdateMaintenanceRequestDto = z.infer<typeof updateMaintenanceRequestSchema>;
export type AssignAgentDto = z.infer<typeof assignAgentSchema>;
export type MaintenanceQueryDto = z.infer<typeof maintenanceQuerySchema>;
