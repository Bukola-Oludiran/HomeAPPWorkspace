/**
 * Maintenance Module - DTO Validation Schemas
 * Per Backend Requirements.md Maintenance System section
 */

import { z } from 'zod';

// ============================================
// CREATE MAINTENANCE REQUEST
// ============================================

export const createMaintenanceRequestSchema = z.object({
    propertyId: z.string().uuid(),
    category: z.enum([
        'PLUMBING',
        'ELECTRICAL',
        'HVAC',
        'APPLIANCE',
        'STRUCTURAL',
        'PEST_CONTROL',
        'CLEANING',
        'SECURITY',
        'OTHER',
    ]),
    description: z.string().min(10).max(2000),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
    preferredDate: z.string().optional(), // ISO date
    preferredTimeSlot: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
});

// ============================================
// UPDATE MAINTENANCE REQUEST
// ============================================

export const updateMaintenanceRequestSchema = z.object({
    status: z.enum([
        'PENDING',
        'ASSIGNED',
        'IN_PROGRESS',
        'ON_HOLD',
        'COMPLETED',
        'CANCELLED',
    ]).optional(),
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
    scheduledDate: z.string(), // ISO date
    scheduledTime: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

// ============================================
// QUERY
// ============================================

export const maintenanceQuerySchema = z.object({
    status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'all']).default('all'),
    propertyId: z.string().uuid().optional(),
    urgency: z.enum(['low', 'medium', 'high', 'emergency', 'all']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// TYPES
// ============================================

export type CreateMaintenanceRequestDto = z.infer<typeof createMaintenanceRequestSchema>;
export type UpdateMaintenanceRequestDto = z.infer<typeof updateMaintenanceRequestSchema>;
export type AssignAgentDto = z.infer<typeof assignAgentSchema>;
export type MaintenanceQueryDto = z.infer<typeof maintenanceQuerySchema>;
