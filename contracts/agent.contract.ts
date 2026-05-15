/**
 * Agent dashboard contract — Zod request schemas + inferred request
 * types for the agent aggregator endpoints (jobs, schedule, earnings).
 */

import { z } from 'zod';
import {
    OpenAPIRegistry,
    paginatedResponse,
    requireBearerAuth,
    STANDARD_ERROR_RESPONSES,
    successResponse,
} from './openapi';

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

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Agents';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerAgentPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });

    registry.registerPath({
        method: 'get',
        path: '/agent/jobs',
        tags: [TAG],
        summary: 'Marketplace of jobs available for the agent to accept.',
        security: requireBearerAuth,
        request: { query: jobQuerySchema },
        responses: {
            200: paginatedResponse('Available jobs', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/agent/jobs/accepted',
        tags: [TAG],
        summary: "Jobs the agent has accepted (scheduled work queue).",
        security: requireBearerAuth,
        request: { query: jobQuerySchema },
        responses: {
            200: paginatedResponse('Accepted jobs', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/agent/jobs/{id}/accept',
        tags: [TAG],
        summary: 'Accept a marketplace job.',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(acceptJobSchema) },
        responses: {
            200: successResponse('Job accepted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/agent/jobs/{id}/decline',
        tags: [TAG],
        summary: 'Decline a marketplace job.',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(declineJobSchema) },
        responses: {
            200: successResponse('Job declined', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/agent/jobs/{id}/complete',
        tags: [TAG],
        summary: 'Mark a job complete (optionally attach photos + notes).',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(completeJobSchema) },
        responses: {
            200: successResponse('Job completed', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/agent/schedule',
        tags: [TAG],
        summary: "Agent's schedule (jobs + personal events).",
        security: requireBearerAuth,
        request: { query: scheduleQuerySchema },
        responses: {
            200: successResponse('Schedule entries', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/agent/earnings',
        tags: [TAG],
        summary: 'Earnings summary.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Earnings snapshot', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/agent/earnings/history',
        tags: [TAG],
        summary: 'Earnings history (per-period).',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Earnings history', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/agent/withdraw',
        tags: [TAG],
        summary: 'Request a withdrawal of available earnings.',
        security: requireBearerAuth,
        request: JSON_BODY(withdrawSchema),
        responses: {
            201: successResponse('Withdrawal queued', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type JobQueryDto = z.infer<typeof jobQuerySchema>;
export type AcceptJobDto = z.infer<typeof acceptJobSchema>;
export type DeclineJobDto = z.infer<typeof declineJobSchema>;
export type CompleteJobDto = z.infer<typeof completeJobSchema>;
export type AddScheduleEventDto = z.infer<typeof addScheduleEventSchema>;
export type ScheduleQueryDto = z.infer<typeof scheduleQuerySchema>;
export type WithdrawDto = z.infer<typeof withdrawSchema>;
