/**
 * Lease Service
 * Handles lease CRUD, renewals, and signing
 * Per Backend Requirements.md Lease & Agreements section
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    UserNotFoundError,
    PropertyNotFoundError,
    ValidationError,
} from '../../common/utils/errors';
import {
    CreateLeaseDto,
    UpdateLeaseDto,
    SendRenewalOfferDto,
    RespondToRenewalDto,
    SignLeaseDto,
} from './leases.dto';

// ============================================
// TYPES
// ============================================

interface LeaseDetail {
    id: string;
    propertyId: string;
    tenantId: string;
    landlordId: string;
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
    securityDeposit: number | null;
    status: string;
    terms: Record<string, unknown>;
    signedByTenant: boolean;
    signedByLandlord: boolean;
    documentUrl: string | null;
    blockchainTokenId: number | null;
    property: {
        id: string;
        name: string;
        address: string;
    };
    tenant: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
    landlord: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

interface RenewalOffer {
    id: string;
    leaseId: string;
    newEndDate: Date;
    newMonthlyRent: number;
    terms: Record<string, unknown>;
    status: string;
    expiresAt: Date | null;
    createdAt: Date;
}

// ============================================
// LEASE SERVICE CLASS
// ============================================

class LeaseService {
    // ----------------------------------------
    // GET LEASE
    // ----------------------------------------

    /**
     * Get lease by ID
     * GET /api/v1/leases/:id
     */
    async getLeaseById(leaseId: string, userId: string): Promise<LeaseDetail> {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
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
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'id', message: 'Lease not found' },
            ]);
        }

        // Verify access (must be tenant, landlord, or admin)
        if (lease.tenantId !== userId && lease.landlordId !== userId) {
            // Check if admin
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                throw new ValidationError('Access denied', [
                    { field: 'id', message: 'You do not have access to this lease' },
                ]);
            }
        }

        return {
            id: lease.id,
            propertyId: lease.propertyId,
            tenantId: lease.tenantId,
            landlordId: lease.landlordId,
            startDate: lease.startDate,
            endDate: lease.endDate,
            monthlyRent: Number(lease.monthlyRent),
            securityDeposit: lease.securityDeposit ? Number(lease.securityDeposit) : null,
            status: lease.status,
            terms: (lease.terms as Record<string, unknown>) || {},
            signedByTenant: lease.signedByTenant,
            signedByLandlord: lease.signedByLandlord,
            documentUrl: lease.documentUrl,
            blockchainTokenId: lease.blockchainTokenId,
            property: {
                id: lease.property.id,
                name: lease.property.name,
                address: `${lease.property.addressStreet || ''}, ${lease.property.addressCity || ''}`.trim(),
            },
            tenant: lease.tenant,
            landlord: lease.landlord,
            createdAt: lease.createdAt,
            updatedAt: lease.updatedAt,
        };
    }

    /**
     * Get user's leases
     */
    async getUserLeases(userId: string, role: string): Promise<LeaseDetail[]> {
        const where: Prisma.LeaseWhereInput = role === 'LANDLORD'
            ? { landlordId: userId }
            : { tenantId: userId };

        const leases = await prisma.lease.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return leases.map(lease => ({
            id: lease.id,
            propertyId: lease.propertyId,
            tenantId: lease.tenantId,
            landlordId: lease.landlordId,
            startDate: lease.startDate,
            endDate: lease.endDate,
            monthlyRent: Number(lease.monthlyRent),
            securityDeposit: lease.securityDeposit ? Number(lease.securityDeposit) : null,
            status: lease.status,
            terms: (lease.terms as Record<string, unknown>) || {},
            signedByTenant: lease.signedByTenant,
            signedByLandlord: lease.signedByLandlord,
            documentUrl: lease.documentUrl,
            blockchainTokenId: lease.blockchainTokenId,
            property: {
                id: lease.property.id,
                name: lease.property.name,
                address: `${lease.property.addressStreet || ''}, ${lease.property.addressCity || ''}`.trim(),
            },
            tenant: lease.tenant,
            landlord: lease.landlord,
            createdAt: lease.createdAt,
            updatedAt: lease.updatedAt,
        }));
    }

    // ----------------------------------------
    // CREATE LEASE
    // ----------------------------------------

    /**
     * Create lease
     * POST /api/v1/leases
     */
    async createLease(landlordId: string, data: CreateLeaseDto): Promise<LeaseDetail> {
        // Verify property ownership
        const property = await prisma.property.findFirst({
            where: { id: data.propertyId, ownerId: landlordId },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        // Verify tenant exists
        const tenant = await prisma.user.findFirst({
            where: { id: data.tenantId, role: 'TENANT' },
        });

        if (!tenant) {
            throw new ValidationError('Tenant not found', [
                { field: 'tenantId', message: 'Invalid tenant ID' },
            ]);
        }

        // Check for overlapping leases
        const existingLease = await prisma.lease.findFirst({
            where: {
                propertyId: data.propertyId,
                status: { in: ['ACTIVE', 'PENDING_SIGNATURES'] },
                OR: [
                    {
                        startDate: { lte: new Date(data.endDate) },
                        endDate: { gte: new Date(data.startDate) },
                    },
                ],
            },
        });

        if (existingLease) {
            throw new ValidationError('Overlapping lease exists', [
                { field: 'propertyId', message: 'Property has an active or pending lease during this period' },
            ]);
        }

        const lease = await prisma.lease.create({
            data: {
                propertyId: data.propertyId,
                tenantId: data.tenantId,
                landlordId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                monthlyRent: data.monthlyRent,
                securityDeposit: data.securityDeposit,
                terms: data.terms || {},
                status: 'DRAFT',
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
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        logger.info(`Lease created: ${lease.id} by landlord ${landlordId}`);

        return {
            id: lease.id,
            propertyId: lease.propertyId,
            tenantId: lease.tenantId,
            landlordId: lease.landlordId,
            startDate: lease.startDate,
            endDate: lease.endDate,
            monthlyRent: Number(lease.monthlyRent),
            securityDeposit: lease.securityDeposit ? Number(lease.securityDeposit) : null,
            status: lease.status,
            terms: (lease.terms as Record<string, unknown>) || {},
            signedByTenant: lease.signedByTenant,
            signedByLandlord: lease.signedByLandlord,
            documentUrl: lease.documentUrl,
            blockchainTokenId: lease.blockchainTokenId,
            property: {
                id: lease.property.id,
                name: lease.property.name,
                address: `${lease.property.addressStreet || ''}, ${lease.property.addressCity || ''}`.trim(),
            },
            tenant: lease.tenant,
            landlord: lease.landlord,
            createdAt: lease.createdAt,
            updatedAt: lease.updatedAt,
        };
    }

    // ----------------------------------------
    // UPDATE LEASE
    // ----------------------------------------

    /**
     * Update lease
     * PUT /api/v1/leases/:id
     */
    async updateLease(leaseId: string, landlordId: string, data: UpdateLeaseDto): Promise<LeaseDetail> {
        const lease = await prisma.lease.findFirst({
            where: { id: leaseId, landlordId },
        });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'id', message: 'Lease not found or you are not the landlord' },
            ]);
        }

        if (lease.status !== 'DRAFT') {
            throw new ValidationError('Cannot update lease', [
                { field: 'status', message: 'Only draft leases can be updated' },
            ]);
        }

        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: {
                monthlyRent: data.monthlyRent,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                terms: data.terms ? { ...((lease.terms as object) || {}), ...data.terms } : undefined,
                updatedAt: new Date(),
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
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                landlord: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        logger.info(`Lease updated: ${leaseId}`);

        return {
            id: updatedLease.id,
            propertyId: updatedLease.propertyId,
            tenantId: updatedLease.tenantId,
            landlordId: updatedLease.landlordId,
            startDate: updatedLease.startDate,
            endDate: updatedLease.endDate,
            monthlyRent: Number(updatedLease.monthlyRent),
            securityDeposit: updatedLease.securityDeposit ? Number(updatedLease.securityDeposit) : null,
            status: updatedLease.status,
            terms: (updatedLease.terms as Record<string, unknown>) || {},
            signedByTenant: updatedLease.signedByTenant,
            signedByLandlord: updatedLease.signedByLandlord,
            documentUrl: updatedLease.documentUrl,
            blockchainTokenId: updatedLease.blockchainTokenId,
            property: {
                id: updatedLease.property.id,
                name: updatedLease.property.name,
                address: `${updatedLease.property.addressStreet || ''}, ${updatedLease.property.addressCity || ''}`.trim(),
            },
            tenant: updatedLease.tenant,
            landlord: updatedLease.landlord,
            createdAt: updatedLease.createdAt,
            updatedAt: updatedLease.updatedAt,
        };
    }

    // ----------------------------------------
    // RENEWAL
    // ----------------------------------------

    /**
     * Send renewal offer
     * POST /api/v1/leases/:id/renew
     */
    async sendRenewalOffer(
        leaseId: string,
        landlordId: string,
        data: SendRenewalOfferDto
    ): Promise<{ message: string; renewalId: string }> {
        const lease = await prisma.lease.findFirst({
            where: { id: leaseId, landlordId, status: 'ACTIVE' },
        });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'id', message: 'Active lease not found or you are not the landlord' },
            ]);
        }

        // Create renewal offer in metadata or separate table
        // For now, store in lease metadata
        const renewalOffer = {
            id: `renewal_${Date.now()}`,
            newEndDate: data.newEndDate,
            newMonthlyRent: data.newMonthlyRent,
            terms: data.terms,
            status: 'PENDING',
            expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            message: data.message,
            createdAt: new Date().toISOString(),
        };

        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                terms: {
                    ...((lease.terms as object) || {}),
                    pendingRenewal: renewalOffer,
                },
                updatedAt: new Date(),
            },
        });

        // TODO: Send notification to tenant

        logger.info(`Renewal offer sent for lease: ${leaseId}`);

        return {
            message: 'Renewal offer sent to tenant',
            renewalId: renewalOffer.id,
        };
    }

    /**
     * Respond to renewal offer
     * POST /api/v1/leases/:id/respond
     */
    async respondToRenewal(
        leaseId: string,
        tenantId: string,
        data: RespondToRenewalDto
    ): Promise<{ message: string; newLeaseId?: string }> {
        const lease = await prisma.lease.findFirst({
            where: { id: leaseId, tenantId, status: 'ACTIVE' },
        });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'id', message: 'Active lease not found or you are not the tenant' },
            ]);
        }

        const terms = lease.terms as Record<string, unknown>;
        const pendingRenewal = terms?.pendingRenewal as Record<string, unknown>;

        if (!pendingRenewal || pendingRenewal.status !== 'PENDING') {
            throw new ValidationError('No pending renewal offer', [
                { field: 'id', message: 'No pending renewal offer for this lease' },
            ]);
        }

        if (data.accept) {
            // Create new lease with renewed terms
            const newLease = await prisma.lease.create({
                data: {
                    propertyId: lease.propertyId,
                    tenantId: lease.tenantId,
                    landlordId: lease.landlordId,
                    startDate: lease.endDate, // Start from current lease end
                    endDate: new Date(pendingRenewal.newEndDate as string),
                    monthlyRent: pendingRenewal.newMonthlyRent as number,
                    securityDeposit: lease.securityDeposit,
                    terms: {
                        ...terms,
                        pendingRenewal: undefined,
                        previousLeaseId: lease.id,
                    },
                    status: 'PENDING_SIGNATURES',
                },
            });

            // Mark current lease as renewed
            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    status: 'RENEWED',
                    terms: {
                        ...terms,
                        pendingRenewal: { ...pendingRenewal, status: 'ACCEPTED' },
                        renewedToLeaseId: newLease.id,
                    },
                },
            });

            logger.info(`Lease renewed: ${leaseId} -> ${newLease.id}`);

            return {
                message: 'Renewal accepted. New lease created.',
                newLeaseId: newLease.id,
            };
        } else {
            // Decline or counter-offer
            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    terms: {
                        ...terms,
                        pendingRenewal: {
                            ...pendingRenewal,
                            status: data.counterOffer ? 'COUNTER_OFFERED' : 'DECLINED',
                            counterOffer: data.counterOffer,
                            tenantMessage: data.message,
                            respondedAt: new Date().toISOString(),
                        },
                    },
                },
            });

            // TODO: Send notification to landlord

            logger.info(`Lease renewal ${data.counterOffer ? 'counter-offered' : 'declined'}: ${leaseId}`);

            return {
                message: data.counterOffer ? 'Counter-offer sent to landlord' : 'Renewal declined',
            };
        }
    }

    // ----------------------------------------
    // SIGNING
    // ----------------------------------------

    /**
     * Sign lease
     */
    async signLease(
        leaseId: string,
        userId: string,
        role: 'TENANT' | 'LANDLORD',
        data: SignLeaseDto
    ): Promise<{ message: string; fullyExecuted: boolean }> {
        const where = role === 'LANDLORD'
            ? { id: leaseId, landlordId: userId }
            : { id: leaseId, tenantId: userId };

        const lease = await prisma.lease.findFirst({ where });

        if (!lease) {
            throw new ValidationError('Lease not found', [
                { field: 'id', message: 'Lease not found or access denied' },
            ]);
        }

        if (lease.status !== 'PENDING_SIGNATURES' && lease.status !== 'DRAFT') {
            throw new ValidationError('Cannot sign lease', [
                { field: 'status', message: 'Lease is not in a signable state' },
            ]);
        }

        const updateData: Prisma.LeaseUpdateInput = {
            updatedAt: new Date(),
        };

        if (role === 'LANDLORD') {
            if (lease.signedByLandlord) {
                throw new ValidationError('Already signed', [
                    { field: 'signature', message: 'You have already signed this lease' },
                ]);
            }
            updateData.signedByLandlord = true;
        } else {
            if (lease.signedByTenant) {
                throw new ValidationError('Already signed', [
                    { field: 'signature', message: 'You have already signed this lease' },
                ]);
            }
            updateData.signedByTenant = true;
        }

        // Check if both parties will have signed after this
        const willBeFullyExecuted =
            (role === 'LANDLORD' && lease.signedByTenant) ||
            (role === 'TENANT' && lease.signedByLandlord);

        if (willBeFullyExecuted) {
            updateData.status = 'ACTIVE';
            // TODO: Mint NFT on blockchain
        } else if (lease.status === 'DRAFT') {
            updateData.status = 'PENDING_SIGNATURES';
        }

        await prisma.lease.update({
            where: { id: leaseId },
            data: updateData,
        });

        logger.info(`Lease signed by ${role}: ${leaseId}`);

        return {
            message: willBeFullyExecuted
                ? 'Lease fully executed and now active'
                : `Lease signed. Waiting for ${role === 'LANDLORD' ? 'tenant' : 'landlord'} signature.`,
            fullyExecuted: willBeFullyExecuted,
        };
    }
}

export const leaseService = new LeaseService();
export { LeaseService };
