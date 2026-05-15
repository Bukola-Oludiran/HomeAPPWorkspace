/**
 * Agent dashboard contract — Zod request schemas + inferred request
 * types for the agent aggregator endpoints (jobs, schedule, earnings).
 */

import { z } from 'zod';

// ============================================
// JOBS
// ============================================

export const jobQuerySchema = z.object({
    status: z
        .enum(['pending', 'accepted', 'in_progress', 'completed', 'all'])
        .default('pending'),
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
    completedAt: z.string().optional(),
});

// ============================================
// SCHEDULE
// ============================================

export const addScheduleEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    date: z.string(),
    startTime: z.string().optional(),
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
// REQUEST TYPES
// ============================================

export type AgentJobQueryRequest = z.input<typeof jobQuerySchema>;
export type AcceptJobRequest = z.input<typeof acceptJobSchema>;
export type DeclineJobRequest = z.input<typeof declineJobSchema>;
export type CompleteJobRequest = z.input<typeof completeJobSchema>;
export type AddScheduleEventRequest = z.input<typeof addScheduleEventSchema>;
export type AgentScheduleQueryRequest = z.input<typeof scheduleQuerySchema>;
export type AgentWithdrawRequest = z.input<typeof withdrawSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

export type JobQueryDto = z.infer<typeof jobQuerySchema>;
export type AcceptJobDto = z.infer<typeof acceptJobSchema>;
export type DeclineJobDto = z.infer<typeof declineJobSchema>;
export type CompleteJobDto = z.infer<typeof completeJobSchema>;
export type AddScheduleEventDto = z.infer<typeof addScheduleEventSchema>;
export type ScheduleQueryDto = z.infer<typeof scheduleQuerySchema>;
export type WithdrawDto = z.infer<typeof withdrawSchema>;
