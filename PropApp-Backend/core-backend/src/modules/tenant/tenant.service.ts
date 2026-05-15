/**
 * Tenant Dashboard Service
 * Handles dashboard stats, applications, rental info, and payments
 * Per Backend Requirements.md Tenant Dashboard section
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    UserNotFoundError,
    PropertyNotFoundError,
    ValidationError,
} from '../../common/utils/errors';
import {
    DashboardQueryDto,
    SubmitApplicationDto,
    ApplicationQueryDto,
    MakePaymentDto,
    PaymentQueryDto,
} from './tenant.dto';

// ============================================
// TYPES
// ============================================

interface TenantDashboard {
    nextPayment: {
        dueDate: Date | null;
        amount: number;
        status: string;
    } | null;
    leaseStatus: string | null;
    currentProperty: {
        id: string;
        name: string;
        address: string;
    } | null;
    openMaintenanceRequests: number;
    pendingApplications: number;
    savedProperties: number;
}

interface RentalInfo {
    lease: {
        id: string;
        startDate: Date;
        endDate: Date;
        monthlyRent: number;
        securityDeposit: number | null;
        status: string;
    } | null;
    property: {
        id: string;
        name: string;
        address: string;
        landlord: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
        };
    } | null;
    paymentHistory: {
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
    }[];
}

interface ApplicationSummary {
    id: string;
    propertyId: string;
    propertyName: string;
    propertyImage: string | null;
    status: string;
    submittedAt: Date;
    moveInDate: Date | null;
}

interface PaymentSummary {
    id: string;
    type: string;
    amount: number;
    status: string;
    propertyName: string | null;
    createdAt: Date;
}

// ============================================
// TENANT SERVICE CLASS
// ============================================

class TenantService {
    // ----------------------------------------
    // DASHBOARD
    // ----------------------------------------

    /**
     * Get tenant dashboard stats
     * GET /api/v1/tenant/dashboard
     */
    async getDashboard(tenantId: string): Promise<TenantDashboard> {
        const user = await prisma.user.findUnique({
            where: { id: tenantId, role: 'TENANT' },
        });

        if (!user) {
            throw new UserNotFoundError('Tenant not found');
        }

        // Get active lease
        const activeLease = await prisma.lease.findFirst({
            where: { tenantId, status: 'ACTIVE' },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        addressStreet: true,
                        addressCity: true,
                    },
                },
            },
        });

        // Get next payment due
        let nextPayment = null;
        if (activeLease) {
            const today = new Date();
            const nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

            const pendingPayment = await prisma.transaction.findFirst({
                where: {
                    payerId: tenantId,
                    type: 'RENT_PAYMENT',
                    status: 'PENDING',
                },
                orderBy: { createdAt: 'asc' },
            });

            nextPayment = {
                dueDate: pendingPayment ? nextDueDate : null,
                amount: Number(activeLease.monthlyRent),
                status: pendingPayment ? 'PENDING' : 'PAID',
            };
        }

        // Get counts
        const [openMaintenanceRequests, pendingApplications, savedProperties] = await Promise.all([
            prisma.maintenanceRequest.count({
                where: { tenantId, status: { in: ['SUBMITTED', 'IN_PROGRESS'] } },
            }),
            prisma.application.count({
                where: { tenantId, status: 'PENDING' },
            }),
            prisma.favorite.count({
                where: { userId: tenantId },
            }),
        ]);

        return {
            nextPayment,
            leaseStatus: activeLease?.status || null,
            currentProperty: activeLease ? {
                id: activeLease.property.id,
                name: activeLease.property.name,
                address: `${activeLease.property.addressStreet || ''}, ${activeLease.property.addressCity || ''}`.trim(),
            } : null,
            openMaintenanceRequests,
            pendingApplications,
            savedProperties,
        };
    }

    // ----------------------------------------
    // RENTAL INFO
    // ----------------------------------------

    /**
     * Get current rental info
     * GET /api/v1/tenant/rental
     */
    async getRentalInfo(tenantId: string): Promise<RentalInfo> {
        const activeLease = await prisma.lease.findFirst({
            where: { tenantId, status: 'ACTIVE' },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        addressStreet: true,
                        addressCity: true,
                        owner: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });

        // Get recent payments
        const paymentHistory = await prisma.transaction.findMany({
            where: { payerId: tenantId, type: { in: ['RENT_PAYMENT', 'SECURITY_DEPOSIT'] } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
            },
        });

        return {
            lease: activeLease ? {
                id: activeLease.id,
                startDate: activeLease.startDate,
                endDate: activeLease.endDate,
                monthlyRent: Number(activeLease.monthlyRent),
                securityDeposit: activeLease.securityDeposit ? Number(activeLease.securityDeposit) : null,
                status: activeLease.status,
            } : null,
            property: activeLease ? {
                id: activeLease.property.id,
                name: activeLease.property.name,
                address: `${activeLease.property.addressStreet || ''}, ${activeLease.property.addressCity || ''}`.trim(),
                landlord: activeLease.property.owner,
            } : null,
            paymentHistory: paymentHistory.map((p: any) => ({
                id: p.id,
                amount: Number(p.amount),
                status: p.status,
                createdAt: p.createdAt,
            })),
        };
    }

    // ----------------------------------------
    // APPLICATIONS
    // ----------------------------------------

    /**
     * Get tenant's applications
     * GET /api/v1/tenant/applications
     */
    async getApplications(tenantId: string, query: ApplicationQueryDto): Promise<{
        applications: ApplicationSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = { tenantId };

        if (query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where: where as any,
                orderBy: { submittedAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: {
                        select: {
                            name: true,
                            media: {
                                where: { isPrimary: true },
                                take: 1,
                                select: { url: true },
                            },
                        },
                    },
                },
            }),
            prisma.application.count({ where: where as any }),
        ]);

        return {
            applications: applications.map((a: any) => ({
                id: a.id,
                propertyId: a.propertyId,
                propertyName: a.property.name,
                propertyImage: a.property.media[0]?.url || null,
                status: a.status,
                submittedAt: a.submittedAt,
                moveInDate: a.moveInDate,
            })),
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Submit application
     * POST /api/v1/tenant/applications
     */
    async submitApplication(tenantId: string, data: SubmitApplicationDto): Promise<{
        applicationId: string;
        message: string;
    }> {
        const property = await prisma.property.findFirst({
            where: { id: data.propertyId, status: 'ACTIVE' },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        const existingApplication = await prisma.application.findFirst({
            where: {
                tenantId,
                propertyId: data.propertyId,
                status: { in: ['PENDING', 'APPROVED'] },
            },
        });

        if (existingApplication) {
            throw new ValidationError('Already applied to this property', [
                { field: 'propertyId', message: 'You have an existing application for this property' },
            ]);
        }

        const application = await prisma.application.create({
            data: {
                tenantId,
                propertyId: data.propertyId,
                moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
                leaseTerm: data.leaseTerm,
                additionalNotes: data.message,
                personalInfo: data.personalInfo ? JSON.parse(JSON.stringify(data.personalInfo)) : undefined,
                employmentInfo: data.employmentInfo ? JSON.parse(JSON.stringify(data.employmentInfo)) : undefined,
                status: 'PENDING',
            },
        });

        logger.info(`Application submitted: ${application.id} by tenant ${tenantId}`);

        return {
            applicationId: application.id,
            message: 'Application submitted successfully. The landlord will review it shortly.',
        };
    }

    /**
     * Withdraw application
     * DELETE /api/v1/tenant/applications/:id
     */
    async withdrawApplication(tenantId: string, applicationId: string): Promise<{ message: string }> {
        const application = await prisma.application.findFirst({
            where: {
                id: applicationId,
                tenantId,
                status: 'PENDING',
            },
        });

        if (!application) {
            throw new ValidationError('Application not found or cannot be withdrawn', [
                { field: 'id', message: 'Only pending applications can be withdrawn' },
            ]);
        }

        await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'WITHDRAWN', updatedAt: new Date() },
        });

        logger.info(`Application withdrawn: ${applicationId} by tenant ${tenantId}`);

        return { message: 'Application withdrawn successfully' };
    }

    // ----------------------------------------
    // PAYMENTS
    // ----------------------------------------

    /**
     * Get payment history
     * GET /api/v1/tenant/payments
     */
    async getPayments(tenantId: string, query: PaymentQueryDto): Promise<{
        payments: PaymentSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = { payerId: tenantId };

        if (query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        if (query.type !== 'all') {
            where.type = query.type.toUpperCase();
        }

        if (query.startDate || query.endDate) {
            const createdAt: Record<string, Date> = {};
            if (query.startDate) createdAt.gte = new Date(query.startDate);
            if (query.endDate) createdAt.lte = new Date(query.endDate);
            where.createdAt = createdAt;
        }

        const [payments, total] = await Promise.all([
            prisma.transaction.findMany({
                where: where as any,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: { select: { name: true } },
                },
            }),
            prisma.transaction.count({ where: where as any }),
        ]);

        return {
            payments: payments.map((p: any) => ({
                id: p.id,
                type: p.type,
                amount: Number(p.amount),
                status: p.status,
                propertyName: p.property?.name || null,
                createdAt: p.createdAt,
            })),
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Make payment
     * POST /api/v1/tenant/payments
     */
    async makePayment(tenantId: string, data: MakePaymentDto): Promise<{
        transactionId: string;
        paymentUrl: string | null;
        message: string;
    }> {
        const lease = await prisma.lease.findFirst({
            where: { id: data.leaseId, tenantId, status: 'ACTIVE' },
            include: {
                property: { select: { id: true, ownerId: true } },
            },
        });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'leaseId', message: 'Invalid lease or not your active lease' },
            ]);
        }

        const transactionType = this.mapPaymentType(data.paymentType);

        const transaction = await prisma.transaction.create({
            data: {
                type: transactionType,
                payerId: tenantId,
                payeeId: lease.property.ownerId,
                propertyId: lease.property.id,
                amount: data.amount,
                currency: 'NGN',
                status: 'PENDING',
                paymentMethod: data.paymentMethod.toUpperCase(),
                metadata: JSON.parse(JSON.stringify({ notes: data.notes, leaseId: data.leaseId })),
            },
        });

        logger.info(`Payment initiated: ${transaction.id} by tenant ${tenantId}`);

        return {
            transactionId: transaction.id,
            paymentUrl: null,
            message: 'Payment initiated. Please complete the payment.',
        };
    }

    // ----------------------------------------
    // SAVED PROPERTIES (Favorites)
    // ----------------------------------------

    /**
     * Get saved/favorited properties
     * GET /api/v1/tenant/saved
     */
    async getSavedProperties(tenantId: string): Promise<{
        id: string;
        name: string;
        price: number;
        priceUnit: string;
        primaryImage: string | null;
        favoritedAt: Date;
    }[]> {
        const favorites = await prisma.favorite.findMany({
            where: { userId: tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        priceUnit: true,
                        status: true,
                        media: {
                            where: { isPrimary: true },
                            take: 1,
                            select: { url: true },
                        },
                    },
                },
            },
        });

        return favorites
            .filter((f: any) => f.property.status === 'ACTIVE')
            .map((f: any) => ({
                id: f.property.id,
                name: f.property.name,
                price: Number(f.property.price),
                priceUnit: f.property.priceUnit,
                primaryImage: f.property.media[0]?.url || null,
                favoritedAt: f.createdAt,
            }));
    }

    private mapPaymentType(type: string): 'RENT_PAYMENT' | 'SECURITY_DEPOSIT' | 'SERVICE_FEE' {
        const typeMap: Record<string, 'RENT_PAYMENT' | 'SECURITY_DEPOSIT' | 'SERVICE_FEE'> = {
            'RENT': 'RENT_PAYMENT',
            'RENT_PAYMENT': 'RENT_PAYMENT',
            'DEPOSIT': 'SECURITY_DEPOSIT',
            'SECURITY_DEPOSIT': 'SECURITY_DEPOSIT',
        };
        return typeMap[type.toUpperCase()] || 'SERVICE_FEE';
    }
}

export const tenantService = new TenantService();
export { TenantService };
