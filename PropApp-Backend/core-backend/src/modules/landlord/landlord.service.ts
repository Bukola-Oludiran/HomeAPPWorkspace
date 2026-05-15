/**
 * Landlord Dashboard Service
 * Handles dashboard stats, applicants, financials, alerts, and jobs
 * Per PRD Section 9.1 + Backend Requirements.md
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    UserNotFoundError,
    PropertyNotFoundError,
    NotPropertyOwnerError,
    ValidationError,
} from '../../common/utils/errors';
import {
    DashboardQueryDto,
    ApplicantQueryDto,
    ApplicantStatusDto,
    FinancialQueryDto,
    TransactionQueryDto,
    PayoutRequestDto,
    StartVerificationDto,
    CreateJobDto,
} from './landlord.dto';

// ============================================
// TYPES
// ============================================

interface DashboardStats {
    totalRevenue: number;
    monthlyRevenue: number;
    occupancyRate: number;
    activeListings: number;
    totalProperties: number;
    pendingApplications: number;
    alertCount: number;
    properties: PropertySummary[];
}

interface PropertySummary {
    id: string;
    name: string;
    status: string;
    occupancyStatus: string;
    monthlyRent: number | null;
    verificationTier: string;
}

interface Applicant {
    id: string;
    tenantId: string;
    propertyId: string;
    propertyName: string;
    tenant: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        avatarUrl: string | null;
        verificationLevel: string;
    };
    status: string;
    moveInDate: Date | null;
    submittedAt: Date;
}

interface FinancialSummary {
    totalRevenue: number;
    pendingPayouts: number;
    availableBalance: number;
    recentTransactions: TransactionSummary[];
    revenueByProperty: { propertyId: string; propertyName: string; revenue: number }[];
}

interface TransactionSummary {
    id: string;
    type: string;
    amount: number;
    status: string;
    propertyId: string | null;
    propertyName: string | null;
    createdAt: Date;
}

interface Alert {
    id: string;
    type: string;
    title: string | null;
    message: string | null;
    priority: string;
    propertyId: string | null;
    createdAt: Date;
    read: boolean;
}

// ============================================
// LANDLORD SERVICE CLASS
// ============================================

class LandlordService {
    // ----------------------------------------
    // DASHBOARD
    // ----------------------------------------

    /**
     * Get landlord dashboard stats
     * GET /api/v1/landlord/dashboard
     */
    async getDashboard(landlordId: string, query: DashboardQueryDto): Promise<DashboardStats> {
        const user = await prisma.user.findUnique({
            where: { id: landlordId, role: 'LANDLORD' },
        });

        if (!user) {
            throw new UserNotFoundError('Landlord not found');
        }

        // Get all properties
        const properties = await prisma.property.findMany({
            where: { ownerId: landlordId, status: { not: 'DELISTED' } },
            select: {
                id: true,
                name: true,
                status: true,
                verificationTier: true,
                leases: {
                    where: { status: 'ACTIVE' },
                    select: { monthlyRent: true },
                },
            },
        });

        // Get pending applications count
        const pendingApplications = await prisma.application.count({
            where: {
                property: { ownerId: landlordId },
                status: 'PENDING',
            },
        });

        // Calculate stats
        const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
        const occupiedProperties = properties.filter(p => p.status === 'RENTED').length;
        const occupancyRate = properties.length > 0
            ? (occupiedProperties / properties.length) * 100
            : 0;

        // Get revenue from completed transactions
        const revenueResult = await prisma.transaction.aggregate({
            where: {
                payeeId: landlordId,
                status: 'COMPLETED',
                type: { in: ['RENT_PAYMENT', 'SECURITY_DEPOSIT'] },
            },
            _sum: { amount: true },
        });

        // Get monthly revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenueResult = await prisma.transaction.aggregate({
            where: {
                payeeId: landlordId,
                status: 'COMPLETED',
                type: { in: ['RENT_PAYMENT', 'SECURITY_DEPOSIT'] },
                createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
        });

        // Get alert count (unread notifications)
        const alertCount = await prisma.notification.count({
            where: {
                userId: landlordId,
                read: false,
            },
        });

        return {
            totalRevenue: Number(revenueResult._sum?.amount || 0),
            monthlyRevenue: Number(monthlyRevenueResult._sum?.amount || 0),
            occupancyRate: Math.round(occupancyRate),
            activeListings,
            totalProperties: properties.length,
            pendingApplications,
            alertCount,
            properties: properties.map(p => ({
                id: p.id,
                name: p.name,
                status: p.status,
                occupancyStatus: p.leases.length > 0 ? 'OCCUPIED' : 'VACANT',
                monthlyRent: p.leases[0]?.monthlyRent ? Number(p.leases[0].monthlyRent) : null,
                verificationTier: p.verificationTier,
            })),
        };
    }

    // ----------------------------------------
    // PROPERTIES
    // ----------------------------------------

    /**
     * Get landlord's properties
     * GET /api/v1/landlord/properties
     */
    async getMyProperties(landlordId: string): Promise<PropertySummary[]> {
        const properties = await prisma.property.findMany({
            where: { ownerId: landlordId, status: { not: 'DELISTED' } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                status: true,
                verificationTier: true,
                leases: {
                    where: { status: 'ACTIVE' },
                    select: { monthlyRent: true },
                },
            },
        });

        return properties.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            occupancyStatus: p.leases.length > 0 ? 'OCCUPIED' : 'VACANT',
            monthlyRent: p.leases[0]?.monthlyRent ? Number(p.leases[0].monthlyRent) : null,
            verificationTier: p.verificationTier,
        }));
    }

    // ----------------------------------------
    // APPLICANTS
    // ----------------------------------------

    /**
     * Get applicants for landlord's properties
     * GET /api/v1/landlord/applicants
     */
    async getApplicants(landlordId: string, query: ApplicantQueryDto): Promise<{
        applicants: Applicant[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            property: { ownerId: landlordId },
        };

        if (query.propertyId) {
            where.propertyId = query.propertyId;
        }

        if (query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                orderBy: { submittedAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: { select: { name: true } },
                    tenant: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatarUrl: true,
                            verificationLevel: true,
                        },
                    },
                },
            }),
            prisma.application.count({ where }),
        ]);

        return {
            applicants: applications.map(a => ({
                id: a.id,
                tenantId: a.tenantId,
                propertyId: a.propertyId,
                propertyName: a.property.name,
                tenant: a.tenant,
                status: a.status,
                moveInDate: a.moveInDate,
                submittedAt: a.submittedAt,
            })),
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get applicant details
     * GET /api/v1/landlord/applicants/:id
     */
    async getApplicantDetails(landlordId: string, applicationId: string): Promise<Record<string, unknown>> {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                property: { ownerId: landlordId },
            },
            include: {
                property: true,
                tenant: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        avatarUrl: true,
                        verificationLevel: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!application) {
            throw new ValidationError('Application not found', [
                { field: 'id', message: 'Application not found or you do not have access' },
            ]);
        }

        return {
            id: application.id,
            status: application.status,
            submittedAt: application.submittedAt,
            moveInDate: application.moveInDate,
            leaseTerm: application.leaseTerm,
            additionalNotes: application.additionalNotes,
            personalInfo: application.personalInfo,
            employmentInfo: application.employmentInfo,
            documents: application.documents,
            property: {
                id: application.property.id,
                name: application.property.name,
                price: Number(application.property.price),
            },
            tenant: application.tenant,
        };
    }

    /**
     * Approve applicant
     * PUT /api/v1/landlord/applicants/:id/approve
     */
    async approveApplicant(landlordId: string, applicationId: string): Promise<{ message: string }> {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                property: { ownerId: landlordId },
                status: 'PENDING',
            },
        });

        if (!application) {
            throw new ValidationError('Application not found or already processed', [
                { field: 'id', message: 'Cannot approve this application' },
            ]);
        }

        await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'APPROVED', updatedAt: new Date() },
        });

        // TODO: Send notification to tenant
        // TODO: Potentially create lease draft

        logger.info(`Application ${applicationId} approved by landlord ${landlordId}`);

        return { message: 'Application approved. Tenant has been notified.' };
    }

    /**
     * Reject applicant
     * PUT /api/v1/landlord/applicants/:id/reject
     */
    async rejectApplicant(
        landlordId: string,
        applicationId: string,
        data: ApplicantStatusDto
    ): Promise<{ message: string }> {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                property: { ownerId: landlordId },
                status: 'PENDING',
            },
        });

        if (!application) {
            throw new ValidationError('Application not found or already processed', [
                { field: 'id', message: 'Cannot reject this application' },
            ]);
        }

        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: 'REJECTED',
                additionalNotes: data.notes,
                updatedAt: new Date(),
            },
        });

        // TODO: Send notification to tenant

        logger.info(`Application ${applicationId} rejected by landlord ${landlordId}`);

        return { message: 'Application rejected. Tenant has been notified.' };
    }

    // ----------------------------------------
    // FINANCIALS
    // ----------------------------------------

    /**
     * Get financial summary
     * GET /api/v1/landlord/financials
     * GET /api/v1/landlord/financials/summary
     */
    async getFinancialSummary(landlordId: string, query: FinancialQueryDto): Promise<FinancialSummary> {
        // Get total revenue
        const totalRevenue = await prisma.transaction.aggregate({
            where: {
                payeeId: landlordId,
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });

        // Get pending payouts
        const pendingPayouts = await prisma.transaction.aggregate({
            where: {
                payeeId: landlordId,
                status: 'PENDING',
                type: 'PAYOUT',
            },
            _sum: { amount: true },
        });

        // Get available balance (completed minus paid out)
        const paidOut = await prisma.transaction.aggregate({
            where: {
                payerId: landlordId,
                type: 'PAYOUT',
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });

        const availableBalance =
            Number(totalRevenue._sum?.amount || 0) - Number(paidOut._sum?.amount || 0);

        // Get recent transactions
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { payeeId: landlordId },
                    { payerId: landlordId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                property: { select: { name: true } },
            },
        });

        // Get revenue by property
        const propertiesWithRevenue = await prisma.property.findMany({
            where: { ownerId: landlordId },
            select: {
                id: true,
                name: true,
                transactions: {
                    where: { status: 'COMPLETED', type: { in: ['RENT_PAYMENT', 'SECURITY_DEPOSIT'] } },
                    select: { amount: true },
                },
            },
        });

        return {
            totalRevenue: Number(totalRevenue._sum.amount || 0),
            pendingPayouts: Number(pendingPayouts._sum?.amount || 0),
            availableBalance,
            recentTransactions: recentTransactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                status: t.status,
                propertyId: t.propertyId,
                propertyName: t.property?.name || null,
                createdAt: t.createdAt,
            })),
            revenueByProperty: propertiesWithRevenue.map(p => ({
                propertyId: p.id,
                propertyName: p.name,
                revenue: p.transactions.reduce((sum, t) => sum + Number(t.amount), 0),
            })),
        };
    }

    /**
     * Get transaction history
     * GET /api/v1/landlord/financials/transactions
     */
    async getTransactions(landlordId: string, query: TransactionQueryDto): Promise<{
        transactions: TransactionSummary[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            OR: [
                { payeeId: landlordId },
                { payerId: landlordId },
            ],
        };

        if (query.type && query.type !== 'all') {
            where.type = query.type.toUpperCase();
        }

        if (query.propertyId) {
            where.propertyId = query.propertyId;
        }

        if (query.startDate || query.endDate) {
            (where as any).createdAt = {};
            if (query.startDate) (where as any).createdAt.gte = new Date(query.startDate);
            if (query.endDate) (where as any).createdAt.lte = new Date(query.endDate);
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: { select: { name: true } },
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            transactions: transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                status: t.status,
                propertyId: t.propertyId,
                propertyName: t.property?.name || null,
                createdAt: t.createdAt,
            })),
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Request payout
     * POST /api/v1/landlord/financials/payout
     */
    async requestPayout(landlordId: string, data: PayoutRequestDto): Promise<{
        message: string;
        transactionId: string;
    }> {
        // Verify available balance
        const summary = await this.getFinancialSummary(landlordId, { period: 'all' });

        if (data.amount > summary.availableBalance) {
            throw new ValidationError('Insufficient balance', [
                { field: 'amount', message: `Available balance is ${summary.availableBalance}` },
            ]);
        }

        // Create payout transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: 'PAYOUT',
                payerId: landlordId,
                payeeId: landlordId, // Required field
                amount: data.amount,
                currency: 'NGN',
                status: 'PENDING',
                metadata: JSON.parse(JSON.stringify({ notes: data.notes, bankAccountId: data.bankAccountId })),
            },
        });

        logger.info(`Payout requested: ${transaction.id} for ${data.amount} by ${landlordId}`);

        return {
            message: 'Payout request submitted. Processing within 1-3 business days.',
            transactionId: transaction.id,
        };
    }

    // ----------------------------------------
    // ALERTS
    // ----------------------------------------

    /**
     * Get actionable alerts
     * GET /api/v1/landlord/alerts
     */
    async getAlerts(landlordId: string): Promise<Alert[]> {
        const notifications = await prisma.notification.findMany({
            where: { userId: landlordId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            priority: (n.data as Record<string, unknown>)?.priority as string || 'normal',
            propertyId: (n.data as Record<string, unknown>)?.propertyId as string || null,
            createdAt: n.createdAt,
            read: n.read,
        }));
    }

    // ----------------------------------------
    // VERIFICATION
    // ----------------------------------------

    /**
     * Start property verification
     * POST /api/v1/landlord/properties/:id/verify
     */
    async startVerification(
        landlordId: string,
        propertyId: string,
        data: StartVerificationDto
    ): Promise<{ message: string; verificationId: string }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: landlordId },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        // Create verification record
        const verification = await prisma.verification.create({
            data: {
                propertyId,
                type: data.verificationType.toUpperCase() as any,
                level: 'BRONZE',
                status: 'PENDING',
                requestedBy: landlordId,
                data: JSON.parse(JSON.stringify({ notes: data.notes })),
            },
        });

        // TODO: Trigger verification workflow (agent assignment, etc.)

        logger.info(`Verification started: ${verification.id} for property ${propertyId}`);

        return {
            message: 'Verification process started. An agent will be assigned shortly.',
            verificationId: verification.id,
        };
    }

    // ----------------------------------------
    // JOBS (Creating jobs for agents)
    // ----------------------------------------

    /**
     * Create job for agents
     * POST /api/v1/landlord/jobs
     */
    async createJob(landlordId: string, data: CreateJobDto): Promise<{ jobId: string }> {
        const property = await prisma.property.findFirst({
            where: { id: data.propertyId, ownerId: landlordId },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        const job = await prisma.agentJob.create({
            data: {
                propertyId: data.propertyId,
                requesterId: landlordId,
                type: 'MAINTENANCE', // Required field
                title: data.title,
                description: data.description,
                category: data.category,
                payout: data.payout,
                scheduledDate: new Date(data.scheduledDate),
                scheduledTime: data.scheduledTime,
                urgency: data.urgency.toUpperCase(),
                instructions: data.instructions,
                status: 'PENDING',
            },
        });

        logger.info(`Job created: ${job.id} by landlord ${landlordId}`);

        return { jobId: job.id };
    }

    /**
     * Get landlord's jobs
     * GET /api/v1/landlord/jobs
     */
    async getJobs(landlordId: string): Promise<Record<string, unknown>[]> {
        const jobs = await prisma.agentJob.findMany({
            where: { createdById: landlordId },
            orderBy: { createdAt: 'desc' },
            include: {
                property: { select: { name: true, addressCity: true } },
                assignedAgent: {
                    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
            },
        });

        return jobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            category: j.category,
            status: j.status,
            payout: Number(j.payout || 0),
            scheduledDate: j.scheduledDate,
            urgency: j.urgency,
            property: j.property ? {
                id: j.propertyId,
                name: j.property.name,
                city: j.property.addressCity,
            } : null,
            assignedAgent: j.assignedAgent,
            createdAt: j.createdAt,
        }));
    }
}

export const landlordService = new LandlordService();
export { LandlordService };
