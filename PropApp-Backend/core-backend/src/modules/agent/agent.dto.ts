/**
 * Agent Module - DTO Validation Schemas
 * Per Backend Requirements.md Agent Platform section
 */

import { z } from 'zod';

// ============================================
// JOBS
// ============================================

export const jobQuerySchema = z.object({
    status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'all']).default('pending'),
    category: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const acceptJobSchema = z.object({
    notes: z.string().max(1000).optional(),
});

export const declineJobSchema = z.object({
    reason: z.string().max(500).optional(),
});

export const completeJobSchema = z.object({
    notes: z.string().max(2000).optional(),
    photos: z.array(z.string().url()).optional(),
    completedAt: z.string().optional(), // ISO datetime
});

// ============================================
// SCHEDULE
// ============================================

export const addScheduleEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    date: z.string(), // ISO date
    startTime: z.string().optional(), // HH:mm
    endTime: z.string().optional(),
    type: z.enum(['personal', 'job', 'unavailable']).default('personal'),
});

export const scheduleQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

// ============================================
// EARNINGS
// ============================================

export const withdrawSchema = z.object({
    amount: z.number().positive(),
    bankAccountId: z.string().uuid().optional(),
});

// ============================================
// TYPES
// ============================================

export type JobQueryDto = z.infer<typeof jobQuerySchema>;
export type AcceptJobDto = z.infer<typeof acceptJobSchema>;
export type DeclineJobDto = z.infer<typeof declineJobSchema>;
export type CompleteJobDto = z.infer<typeof completeJobSchema>;
export type AddScheduleEventDto = z.infer<typeof addScheduleEventSchema>;
export type ScheduleQueryDto = z.infer<typeof scheduleQuerySchema>;
export type WithdrawDto = z.infer<typeof withdrawSchema>;
