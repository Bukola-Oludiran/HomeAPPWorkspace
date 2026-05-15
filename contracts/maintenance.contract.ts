/**
 * Maintenance contract — Zod request schemas + inferred request types
 * for the maintenance module.
 *
 * NOTE on drift: The wire-shape here mirrors the prior backend zod
 * faithfully. Several name/case drifts noted in the plan (section A9)
 * remain unresolved and are tagged below; resolving them is a separate
 * follow-up because they require coordinated backend + Prisma + frontend
 * changes:
 *   - Request uses lowercase `urgency` while Prisma column + frontend
 *     enums use UPPERCASE `priority` (LOW / MEDIUM / HIGH / EMERGENCY).
 *     The service `mapUrgency()` already accepts UPPERCASE input so a
 *     future tightening can rename without runtime breakage.
 *   - Request takes `propertyId`; the frontend has historically used
 *     `leaseId` on its `CreateMaintenanceRequest` type, which the
 *     contract now corrects (no UI form was building the request, so no
 *     callsite breaks).
 *   - Query schema uses lowercase status strings while update/body uses
 *     UPPERCASE; service `toUpperCase()`s the query value. Preserved for
 *     now.
 */

import { z } from 'zod';
import { MaintenanceCategoryValues } from './enums';

// ============================================
// CREATE
// ============================================

export const createMaintenanceRequestSchema = z.object({
    propertyId: z.string().uuid(),
    category: z.enum(MaintenanceCategoryValues),
    description: z.string().min(10).max(2000),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
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
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
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
    urgency: z.enum(['low', 'medium', 'high', 'emergency', 'all']).optional(),
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
