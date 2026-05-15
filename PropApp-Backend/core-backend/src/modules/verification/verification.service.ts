/**
 * Verification Service
 * Handles KYC, document, and property verification
 * Per PRD Section 10 + Backend Requirements.md
 */

import { Prisma, VerificationStatus as PrismaVerificationStatus } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { ValidationError, PropertyNotFoundError } from '../../common/utils/errors';
import { blockchainProviderFactory } from '../../integrations/blockchain';
import { documentProviderFactory } from '../../integrations/document';
import { regionConfigService } from '../../config/regions';
import { env } from '../../config/env';
import {
    SubmitIdentityVerificationDto,
    SubmitDocumentDto,
    RequestPropertyVerificationDto,
    SubmitPropertyVerificationResultDto,
    VerificationQueryDto,
    VerificationTier,
} from './verification.dto';

// ============================================
// TYPES
// ============================================

interface UserVerificationStatus {
    userId: string;
    tier: VerificationTier | null;
    score: number;
    identityVerified: boolean;
    addressVerified: boolean;
    documentsVerified: string[];
    lastUpdated: Date | null;
}

interface VerificationRecord {
    id: string;
    type: string;
    status: string;
    userId: string | null;
    propertyId: string | null;
    documentUrl: string | null;
    documentType: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// VERIFICATION SERVICE CLASS
// ============================================

class VerificationService {
    // ----------------------------------------
    // USER VERIFICATION STATUS
    // ----------------------------------------

    /**
     * Get verification status
     * GET /api/v1/verification/status
     */
    async getVerificationStatus(userId: string): Promise<UserVerificationStatus> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                verificationLevel: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new ValidationError('User not found', []);
        }

        // Get verification records for this user
        const verifications = await prisma.verification.findMany({
            where: { userId, status: 'APPROVED' },
        });

        const identityVerified = verifications.some(v => v.type === 'IDENTITY');
        const addressVerified = verifications.some(v => v.type === 'ADDRESS');

        const documentsVerified = verifications
            .filter(v => v.type !== 'IDENTITY' && v.type !== 'ADDRESS')
            .map(v => v.type);

        // Calculate score based on verifications
        let score = 0;
        if (identityVerified) score += 40;
        if (addressVerified) score += 30;
        if (documentsVerified.length > 0) score += 20;
        if (documentsVerified.length > 2) score += 10;

        return {
            userId: user.id,
            tier: this.getTierFromScore(score),
            score,
            identityVerified,
            addressVerified,
            documentsVerified,
            lastUpdated: user.updatedAt,
        };
    }

    // ----------------------------------------
    // IDENTITY VERIFICATION
    // ----------------------------------------

    /**
     * Submit identity verification
     * POST /api/v1/verification/identity
     */
    async submitIdentityVerification(
        userId: string,
        data: SubmitIdentityVerificationDto
    ): Promise<{ verificationId: string; message: string }> {
        // Check for existing pending verification
        const existing = await prisma.verification.findFirst({
            where: {
                userId,
                type: 'IDENTITY',
                status: { in: ['PENDING', 'IN_REVIEW'] },
            },
        });

        if (existing) {
            throw new ValidationError('Verification in progress', [
                { field: 'type', message: 'You already have a pending identity verification' },
            ]);
        }

        // Create verification record
        const verification = await prisma.verification.create({
            data: {
                userId,
                type: 'IDENTITY',
                level: 'BRONZE',
                status: 'PENDING',
                documentType: data.type,
                documentNumber: data.documentNumber.slice(-4), // Store only last 4 digits
                metadata: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    hasSelfie: !!data.selfieBase64,
                },
            },
        });

        // TODO: Integrate with Smile Identity or similar KYC provider
        logger.info(`Identity verification submitted: ${verification.id} for user ${userId}`);

        return {
            verificationId: verification.id,
            message: 'Identity verification submitted. Processing takes 1-3 business days.',
        };
    }

    /**
     * Submit address verification
     * POST /api/v1/verification/address
     */
    async submitAddressVerification(
        userId: string,
        data: SubmitDocumentDto
    ): Promise<{ verificationId: string; message: string }> {
        const verification = await prisma.verification.create({
            data: {
                userId,
                type: 'ADDRESS',
                level: 'BRONZE',
                status: 'PENDING',
                documentUrl: data.documentUrl,
                documentType: data.type,
                metadata: {
                    notes: data.notes,
                },
            },
        });

        logger.info(`Address verification submitted: ${verification.id}`);

        return {
            verificationId: verification.id,
            message: 'Address verification submitted. Processing takes 1-3 business days.',
        };
    }

    // ----------------------------------------
    // PROPERTY VERIFICATION
    // ----------------------------------------

    /**
     * Get property verifications
     * GET /api/v1/verification/properties
     */
    async getPropertyVerifications(landlordId: string, query: VerificationQueryDto): Promise<{
        verifications: VerificationRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // Get landlord's properties
        const properties = await prisma.property.findMany({
            where: { ownerId: landlordId },
            select: { id: true },
        });

        const propertyIds = properties.map(p => p.id);

        const where: Prisma.VerificationWhereInput = {
            propertyId: { in: propertyIds },
        };

        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase() as PrismaVerificationStatus;
        }

        const [verifications, total] = await Promise.all([
            prisma.verification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.verification.count({ where }),
        ]);

        return {
            verifications: verifications.map(v => this.formatVerification(v)),
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get property verification status
     * GET /api/v1/verification/properties/:propertyId
     */
    async getPropertyVerificationStatus(propertyId: string, userId: string): Promise<{
        propertyId: string;
        tier: VerificationTier | null;
        score: number;
        verifications: VerificationRecord[];
    }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId },
            select: { ownerId: true, verificationTier: true },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        // Check access
        if (property.ownerId !== userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN' && user?.role !== 'AGENT') {
                throw new ValidationError('Access denied', [
                    { field: 'propertyId', message: 'You do not have access to this property' },
                ]);
            }
        }

        const verifications = await prisma.verification.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' },
        });

        const approvedCount = verifications.filter(v => v.status === 'APPROVED').length;
        const score = Math.min(approvedCount * 25, 100);

        return {
            propertyId,
            tier: this.getTierFromScore(score),
            score,
            verifications: verifications.map(v => this.formatVerification(v)),
        };
    }

    /**
     * Request property verification
     * POST /api/v1/verification/properties/:propertyId/audit/request
     */
    async requestPropertyVerification(
        propertyId: string,
        landlordId: string,
        data: RequestPropertyVerificationDto
    ): Promise<{ verificationId: string; message: string }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: landlordId },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        const verification = await prisma.verification.create({
            data: {
                propertyId,
                type: 'PHYSICAL_AUDIT',
                level: data.tier === 'PLATINUM' ? 'PLATINUM' : data.tier === 'GOLD' ? 'GOLD' : data.tier === 'SILVER' ? 'SILVER' : 'BRONZE',
                status: 'PENDING',
                metadata: {
                    requestedTier: data.tier,
                    preferredDate: data.preferredDate,
                    notes: data.notes,
                },
            },
        });

        // Create agent job for property verification
        await prisma.agentJob.create({
            data: {
                type: 'PROPERTY_AUDIT',
                propertyId,
                requesterId: landlordId,
                status: 'OPEN',
                priority: 'MEDIUM',
                earnings: this.getVerificationPayout(data.tier),
                notes: `Conduct ${data.tier} tier verification for property: ${property.name}`,
            },
        });

        logger.info(`Property verification requested: ${verification.id} for property ${propertyId}`);

        return {
            verificationId: verification.id,
            message: `${data.tier} tier verification requested. An agent will be assigned within 24 hours.`,
        };
    }

    /**
     * Submit C of O verification
     * POST /api/v1/verification/properties/:propertyId/cofo
     */
    async submitCofoVerification(
        propertyId: string,
        landlordId: string,
        data: SubmitDocumentDto
    ): Promise<{ verificationId: string; message: string }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: landlordId },
            include: { owner: true },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        const verification = await prisma.verification.create({
            data: {
                propertyId,
                type: 'COFO',
                level: 'GOLD',
                status: 'PENDING',
                documentUrl: data.documentUrl,
                documentType: data.type,
                metadata: { notes: data.notes },
            },
        });

        // Attempt automatic document verification (async, non-blocking)
        const propertyAddress = [
            property.addressStreet,
            property.addressCity,
            property.addressState,
        ].filter(Boolean).join(', ');

        const regionCode = property.regionCode || 'NG';
        const documentProvider = documentProviderFactory.getProviderForDocumentType(
            regionCode,
            'certificate_of_occupancy'
        );

        documentProvider.verifyDocument({
            documentType: 'certificate_of_occupancy',
            documentUrl: data.documentUrl,
            propertyAddress,
            ownerName: `${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim(),
            country: regionCode,
        }).then(async (result) => {
            const newStatus = result.status === 'verified' ? 'APPROVED' :
                result.status === 'failed' ? 'REJECTED' : 'PENDING';

            await prisma.verification.update({
                where: { id: verification.id },
                data: {
                    status: newStatus as PrismaVerificationStatus,
                    metadata: JSON.parse(JSON.stringify({
                        notes: data.notes,
                        providerVerificationId: result.verificationId,
                        confidence: result.confidence,
                        issues: result.issues,
                    })),
                },
            });

            if (result.status === 'verified') {
                await prisma.property.update({
                    where: { id: propertyId },
                    data: { verificationTier: 'GOLD' },
                });
                logger.info(`Property ${propertyId} auto-verified to GOLD tier`);
            }
        }).catch((err: Error) => {
            logger.error(`Document verification failed for ${verification.id}: ${err.message}`);
        });

        logger.info(`C of O verification submitted: ${verification.id}`);

        return {
            verificationId: verification.id,
            message: 'Certificate of Occupancy submitted for verification.',
        };
    }

    // ----------------------------------------
    // ADMIN OPERATIONS
    // ----------------------------------------

    /**
     * Approve verification (Admin)
     */
    async approveVerification(
        verificationId: string,
        adminId: string,
        result: SubmitPropertyVerificationResultDto
    ): Promise<{ message: string }> {
        const verification = await prisma.verification.findUnique({
            where: { id: verificationId },
        });

        if (!verification) {
            throw new ValidationError('Verification not found', []);
        }

        // Verify admin role - IDOR protection
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (admin?.role !== 'ADMIN') {
            throw new ValidationError('Access denied', [
                { field: 'adminId', message: 'Only admins can approve verifications' },
            ]);
        }

        const resultLevel = result.tier === 'PLATINUM' ? 'PLATINUM' : result.tier === 'GOLD' ? 'GOLD' : result.tier === 'SILVER' ? 'SILVER' : 'BRONZE';

        await prisma.verification.update({
            where: { id: verificationId },
            data: {
                status: 'APPROVED',
                level: resultLevel,
                reviewedById: adminId,
                reviewedAt: new Date(),
                metadata: {
                    ...((verification.metadata as object) || {}),
                    passed: result.passed,
                    findings: result.findings,
                    photos: result.photos,
                    score: result.score,
                },
            },
        });

        // Update entity verification level
        if (verification.userId) {
            await prisma.user.update({
                where: { id: verification.userId },
                data: {
                    verificationLevel: resultLevel,
                },
            });
        } else if (verification.propertyId) {
            await prisma.property.update({
                where: { id: verification.propertyId },
                data: { verificationTier: resultLevel },
            });
        }

        // Record verification on blockchain (fire and forget)
        this.recordVerificationOnChain(verificationId, verification).catch(err => {
            logger.error(`Failed to record verification on blockchain: ${verificationId}`, err);
        });

        logger.info(`Verification approved: ${verificationId} by admin ${adminId}`);

        return { message: 'Verification approved' };
    }

    /**
     * Record verification on blockchain
     */
    private async recordVerificationOnChain(
        verificationId: string,
        verification: { id: string; type: string; propertyId: string | null; userId: string | null }
    ): Promise<void> {
        const regionCode = env.DEFAULT_REGION || 'NG';

        // Check if blockchain is enabled for region
        if (!regionConfigService.isFeatureEnabled(regionCode, 'blockchainEnabled')) {
            logger.debug(`Blockchain disabled for region ${regionCode}, skipping verification record`);
            return;
        }

        const blockchain = blockchainProviderFactory.getProvider(regionCode);

        // Create a hash of the verification data for on-chain storage
        const dataToHash = JSON.stringify({
            verificationId,
            type: verification.type,
            propertyId: verification.propertyId,
            userId: verification.userId,
            timestamp: new Date().toISOString(),
        });
        const documentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

        const result = await blockchain.recordVerification({
            propertyId: verification.propertyId || verification.userId || verificationId,
            verificationType: verification.type === 'IDENTITY' ? 'identity' : 'property',
            documentHash,
        });

        if (result.success && result.verificationId) {
            // Update verification with blockchain info
            await prisma.verification.update({
                where: { id: verificationId },
                data: {
                    blockchainVerificationId: result.verificationId,
                    blockchainTxHash: result.txHash,
                },
            });

            logger.info(`Verification recorded on chain: ${verificationId} -> ${result.verificationId}`);
        } else {
            logger.warn(`Blockchain verification recording failed: ${verificationId} - ${result.error}`);
        }
    }

    /**
     * Reject verification (Admin)
     */
    async rejectVerification(
        verificationId: string,
        adminId: string,
        reason: string
    ): Promise<{ message: string }> {
        const verification = await prisma.verification.findUnique({
            where: { id: verificationId },
        });

        if (!verification) {
            throw new ValidationError('Verification not found', []);
        }

        // Verify admin role - IDOR protection
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (admin?.role !== 'ADMIN') {
            throw new ValidationError('Access denied', [
                { field: 'adminId', message: 'Only admins can reject verifications' },
            ]);
        }

        await prisma.verification.update({
            where: { id: verificationId },
            data: {
                status: 'REJECTED',
                reviewedById: adminId,
                reviewedAt: new Date(),
                rejectionReason: reason,
            },
        });

        logger.info(`Verification rejected: ${verificationId} by admin ${adminId}`);

        return { message: 'Verification rejected' };
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private getTierFromScore(score: number): VerificationTier | null {
        if (score >= 100) return 'PLATINUM';
        if (score >= 90) return 'GOLD';
        if (score >= 70) return 'SILVER';
        if (score >= 40) return 'BRONZE';
        return null;
    }

    private getVerificationPayout(tier: VerificationTier): number {
        const payouts: Record<VerificationTier, number> = {
            BRONZE: 5000,
            SILVER: 10000,
            GOLD: 20000,
            PLATINUM: 35000,
        };
        return payouts[tier];
    }

    private formatVerification(v: any): VerificationRecord {
        return {
            id: v.id,
            type: v.type,
            status: v.status,
            userId: v.userId,
            propertyId: v.propertyId,
            documentUrl: v.documentUrl,
            documentType: v.documentType,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
        };
    }
}

export const verificationService = new VerificationService();
export { VerificationService };
