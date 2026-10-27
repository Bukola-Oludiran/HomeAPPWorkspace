/**
 * Agent Service
 * Handles jobs, schedule, and earnings
 * Per Backend Requirements.md Agent Platform section + PRD Section 11
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { ValidationError } from '../../common/utils/errors';
import {
    JobQueryDto,
    AcceptJobDto,
    DeclineJobDto,
    CompleteJobDto,
    AddScheduleEventDto,
    ScheduleQueryDto,
    WithdrawDto,
} from './agent.dto';

// ============================================
// TYPES
// ============================================

interface JobSummary {
    id: string;
    title: string | null;
    category: string | null;
    payout: number;
    scheduledDate: Date | null;
    scheduledTime: string | null;
    urgency: string | null;
    status: string;
    property: {
        id: string;
        name: string;
        city: string | null;
    } | null;
    createdAt: Date;
}

interface EarningsSummary {
    todayTotal: number;
    weekTotal: number;
    monthTotal: number;
    pendingPayout: number;
    availableBalance: number;
    completedJobs: number;
}

// ============================================
// AGENT SERVICE CLASS
// ============================================

class AgentService {
    // ----------------------------------------
    // JOBS
    // ----------------------------------------

    /**
     * Get available jobs
     * GET /api/v1/agent/jobs
     */
    async getAvailableJobs(agentId: string, query: JobQueryDto): Promise<{
        jobs: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            status: 'PENDING',
            assignedAgentId: null,
        };

        if (query.category) {
            where.category = query.category.toUpperCase();
        }

        const [jobs, total] = await Promise.all([
            prisma.agentJob.findMany({
                where: where as any,
                orderBy: [{ createdAt: 'desc' }],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: {
                        select: { id: true, name: true, addressCity: true },
                    },
                },
            }),
            prisma.agentJob.count({ where: where as any }),
        ]);

        return {
            jobs: jobs.map((j: any) => ({
                id: j.id,
                type: j.title || j.type,
                property: j.property?.name || 'Unassigned property',
                address: [j.property?.addressStreet, j.property?.addressCity].filter(Boolean).join(', '),
                date: j.scheduledDate,
                time: j.scheduledTime || '',
                clientName: [j.requester?.firstName, j.requester?.lastName].filter(Boolean).join(' '),
                clientPhone: j.requester?.phone || undefined,
                payout: Number(j.payout || 0),
                status: j.status,
            })),
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get accepted jobs (my jobs)
     * GET /api/v1/agent/jobs/accepted
     */
    async getAcceptedJobs(agentId: string, query: JobQueryDto): Promise<{
        jobs: JobSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            assignedAgentId: agentId,
        };

        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        const [jobs, total] = await Promise.all([
            prisma.agentJob.findMany({
                where: where as any,
                orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: {
                        select: { id: true, name: true, addressCity: true },
                    },
                },
            }),
            prisma.agentJob.count({ where: where as any }),
        ]);

        return {
            jobs: jobs.map((j: any) => ({
                id: j.id,
                title: j.title,
                category: j.category,
                payout: Number(j.payout || 0),
                scheduledDate: j.scheduledDate,
                scheduledTime: j.scheduledTime,
                urgency: j.urgency,
                status: j.status,
                property: j.property ? {
                    id: j.property.id,
                    name: j.property.name,
                    city: j.property.addressCity,
                } : null,
                createdAt: j.createdAt,
            })),
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Accept job
     * POST /api/v1/agent/jobs/:id/accept
     */
    async acceptJob(agentId: string, jobId: string, data: AcceptJobDto): Promise<{ message: string }> {
        const job = await prisma.agentJob.findFirst({
            where: { id: jobId, status: 'PENDING', assignedAgentId: null },
        });

        if (!job) {
            throw new ValidationError('Job not found or already assigned', [
                { field: 'jobId', message: 'Job is not available' },
            ]);
        }

        await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                assignedAgentId: agentId,
                status: 'ASSIGNED',
                updatedAt: new Date(),
            },
        });

        logger.info(`Job ${jobId} accepted by agent ${agentId}`);

        return { message: 'Job accepted successfully' };
    }

    /**
     * Decline job
     * POST /api/v1/agent/jobs/:id/decline
     */
    async declineJob(agentId: string, jobId: string, data: DeclineJobDto): Promise<{ message: string }> {
        const job = await prisma.agentJob.findFirst({
            where: { id: jobId, assignedAgentId: agentId, status: 'ASSIGNED' },
        });

        if (!job) {
            throw new ValidationError('Job not found', [
                { field: 'jobId', message: 'Job not found or not assigned to you' },
            ]);
        }

        await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                assignedAgentId: null,
                status: 'PENDING',
                updatedAt: new Date(),
            },
        });

        logger.info(`Job ${jobId} declined by agent ${agentId}`);

        return { message: 'Job declined' };
    }

    /**
     * Complete job
     * PUT /api/v1/agent/jobs/:id/complete
     */
    async completeJob(agentId: string, jobId: string, data: CompleteJobDto): Promise<{ message: string }> {
        const job = await prisma.agentJob.findFirst({
            where: {
                id: jobId,
                assignedAgentId: agentId,
                status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
            },
        });

        if (!job) {
            throw new ValidationError('Job not found', [
                { field: 'jobId', message: 'Job not found or not in progress' },
            ]);
        }

        await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
                completionNotes: data.notes,
                completionEvidence: data.photos ? JSON.parse(JSON.stringify(data.photos)) : null,
                updatedAt: new Date(),
            },
        });

        // Create earning record
        if (job.payout) {
            await prisma.transaction.create({
                data: {
                    type: 'AGENT_EARNING',
                    payeeId: agentId,
                    payerId: agentId, // Required field - same as payee for earnings
                    propertyId: job.propertyId,
                    amount: job.payout,
                    currency: 'NGN',
                    status: 'PENDING', // Will be processed for payout
                    metadata: JSON.parse(JSON.stringify({ jobId: job.id, jobTitle: job.title })),
                },
            });
        }

        logger.info(`Job ${jobId} completed by agent ${agentId}`);

        return { message: 'Job marked as complete. Earnings added to your balance.' };
    }

    // ----------------------------------------
    // SCHEDULE
    // ----------------------------------------

    /**
     * Get schedule
     * GET /api/v1/agent/schedule
     */
    async getSchedule(agentId: string, query: ScheduleQueryDto): Promise<{
        jobs: JobSummary[];
        availability: Record<string, unknown>[];
    }> {
        const startDate = query.startDate ? new Date(query.startDate) : new Date();
        const endDate = query.endDate
            ? new Date(query.endDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Get scheduled jobs
        const jobs = await prisma.agentJob.findMany({
            where: {
                assignedAgentId: agentId,
                status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
                scheduledDate: { gte: startDate, lte: endDate },
            },
            orderBy: { scheduledDate: 'asc' },
            include: {
                property: {
                    select: { id: true, name: true, addressStreet: true, addressCity: true },
                },
                requester: { select: { firstName: true, lastName: true, phone: true } },
            },
        });

        const availability = await prisma.agentAvailability.findMany({
            where: { agentId, date: { gte: startDate, lte: endDate } },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        return {
            jobs: jobs.map((j: any) => ({
                id: j.id,
                title: j.title,
                category: j.category,
                payout: Number(j.payout || 0),
                scheduledDate: j.scheduledDate,
                scheduledTime: j.scheduledTime,
                urgency: j.urgency,
                status: j.status,
                property: j.property ? {
                    id: j.property.id,
                    name: j.property.name,
                    city: j.property.addressCity,
                } : null,
                createdAt: j.createdAt,
            })),
            availability,
        };
    }

    // ----------------------------------------
    // EARNINGS
    // ----------------------------------------

    /**
     * Get earnings summary
     * GET /api/v1/agent/earnings
     */
    async getEarnings(agentId: string): Promise<EarningsSummary> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get earnings
        const [todayEarnings, weekEarnings, monthEarnings, pendingPayout, completedJobs] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    payeeId: agentId,
                    type: 'AGENT_EARNING',
                    createdAt: { gte: today },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    payeeId: agentId,
                    type: 'AGENT_EARNING',
                    createdAt: { gte: startOfWeek },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    payeeId: agentId,
                    type: 'AGENT_EARNING',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    payeeId: agentId,
                    type: 'AGENT_EARNING',
                    status: 'PENDING',
                },
                _sum: { amount: true },
            }),
            prisma.agentJob.count({
                where: {
                    assignedAgentId: agentId,
                    status: 'COMPLETED',
                },
            }),
        ]);

        // Calculate available balance (completed but not yet withdrawn)
        const totalEarned = await prisma.transaction.aggregate({
            where: {
                payeeId: agentId,
                type: 'AGENT_EARNING',
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });

        const totalWithdrawn = await prisma.transaction.aggregate({
            where: {
                payerId: agentId,
                type: 'AGENT_WITHDRAWAL',
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });

        const availableBalance =
            Number(totalEarned._sum?.amount || 0) - Number(totalWithdrawn._sum?.amount || 0);

        return {
            todayTotal: Number(todayEarnings._sum?.amount || 0),
            weekTotal: Number(weekEarnings._sum?.amount || 0),
            monthTotal: Number(monthEarnings._sum?.amount || 0),
            pendingPayout: Number(pendingPayout._sum?.amount || 0),
            availableBalance,
            completedJobs,
        };
    }

    /**
     * Get earnings history
     * GET /api/v1/agent/earnings/history
     */
    async getEarningsHistory(agentId: string): Promise<{
        id: string;
        type: string;
        amount: number;
        status: string;
        jobTitle: string | null;
        createdAt: Date;
    }[]> {
        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { payeeId: agentId, type: 'AGENT_EARNING' },
                    { payerId: agentId, type: 'AGENT_WITHDRAWAL' },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            status: t.status,
            jobTitle: (t.metadata as Record<string, unknown>)?.jobTitle as string || null,
            createdAt: t.createdAt,
        }));
    }

    /**
     * Withdraw earnings
     * POST /api/v1/agent/earnings/withdraw
     */
    async withdrawEarnings(agentId: string, data: WithdrawDto): Promise<{
        message: string;
        transactionId: string;
    }> {
        const earnings = await this.getEarnings(agentId);

        if (data.amount > earnings.availableBalance) {
            throw new ValidationError('Insufficient balance', [
                { field: 'amount', message: `Available balance is ₦${earnings.availableBalance}` },
            ]);
        }

        const transaction = await prisma.transaction.create({
            data: {
                type: 'AGENT_WITHDRAWAL',
                payerId: agentId,
                payeeId: agentId, // Required field - same as payer for withdrawals
                amount: data.amount,
                currency: 'NGN',
                status: 'PENDING',
                metadata: JSON.parse(JSON.stringify({ bankAccountId: data.bankAccountId })),
            },
        });

        logger.info(`Agent withdrawal requested: ${transaction.id} by ${agentId}`);

        return {
            message: 'Withdrawal request submitted. Processing within 1-3 business days.',
            transactionId: transaction.id,
        };
    }
}

export const agentService = new AgentService();
export { AgentService };
