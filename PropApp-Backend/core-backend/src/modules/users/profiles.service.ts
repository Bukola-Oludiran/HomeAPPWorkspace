/**
 * Role-Specific Profiles Service
 * Per APIRevised.md Section 1.3
 */

import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../common/utils/errors';
import {
    TenantProfileDto,
    LandlordProfileDto,
    AgentProfileDto,
    AddCertificationDto
} from './profiles.dto';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getProfileData(userId: string): Promise<Record<string, unknown>> {
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
    });
    return (profile?.profileData || {}) as Record<string, unknown>;
}

async function updateProfileData(userId: string, section: string, data: Record<string, unknown>): Promise<void> {
    const existingData = await getProfileData(userId);
    const existingSection = (existingData[section] || {}) as Record<string, unknown>;

    const updatedSection = {
        ...existingSection,
        ...Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        ),
    };

    const newProfileData = {
        ...existingData,
        [section]: updatedSection,
    } as Prisma.InputJsonValue;

    const createData = {
        [section]: updatedSection,
    } as Prisma.InputJsonValue;

    await prisma.userProfile.upsert({
        where: { userId },
        create: { userId, profileData: createData },
        update: { profileData: newProfileData },
    });
}

// ============================================
// SERVICE
// ============================================

class ProfilesService {
    // ============================================
    // TENANT PROFILE
    // ============================================

    async getTenantProfile(userId: string): Promise<TenantProfileDto & { rentalHistory: unknown; documents: unknown }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, firstName: true, lastName: true },
        });

        if (user?.role !== 'TENANT') {
            throw new AppError('User is not a tenant', 'PROFILE_001', 400);
        }

        const profileData = await getProfileData(userId);
        const tenantData = (profileData.tenant || {}) as Record<string, unknown>;

        // Get verification status
        const verifications = await prisma.verification.findMany({
            where: { userId, status: 'APPROVED' },
            select: { type: true, reviewedAt: true },
        });

        const identityVerified = verifications.some(v => v.type === 'IDENTITY');
        const identityVerifiedAt = verifications.find(v => v.type === 'IDENTITY')?.reviewedAt;

        return {
            displayName: (tenantData.displayName as string) || `${user.firstName} ${user.lastName?.charAt(0)}.`,
            bio: (tenantData.bio as string) || '',
            preferences: (tenantData.preferences as TenantProfileDto['preferences']) || {},
            privacySettings: (tenantData.privacySettings as TenantProfileDto['privacySettings']) || {},
            rentalHistory: {
                verifiedRentals: 0,
                yearsHistory: 0,
                hasDisputes: false,
            },
            documents: {
                identityVerified,
                identityVerifiedAt,
                proofOfIncomeStatus: 'pending',
                proofOfIncomeUploadedAt: null,
            },
        };
    }

    async updateTenantProfile(userId: string, dto: TenantProfileDto): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'TENANT') {
            throw new AppError('User is not a tenant', 'PROFILE_001', 400);
        }

        await updateProfileData(userId, 'tenant', dto as unknown as Record<string, unknown>);
    }

    // ============================================
    // LANDLORD PROFILE
    // ============================================

    async getLandlordProfile(userId: string): Promise<LandlordProfileDto & { portfolio: unknown; verificationStatus: unknown }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, verificationLevel: true },
        });

        if (user?.role !== 'LANDLORD') {
            throw new AppError('User is not a landlord', 'PROFILE_002', 400);
        }

        const profileData = await getProfileData(userId);
        const landlordData = (profileData.landlord || {}) as Record<string, unknown>;

        // Get property stats
        const properties = await prisma.property.count({
            where: { ownerId: userId },
        });
        const activeListings = await prisma.property.count({
            where: { ownerId: userId, status: 'ACTIVE' },
        });
        const occupiedUnits = await prisma.property.count({
            where: { ownerId: userId, status: 'RENTED' },
        });

        // Get verifications
        const verifications = await prisma.verification.findMany({
            where: { userId, status: 'APPROVED' },
            select: { type: true },
        });

        return {
            businessName: (landlordData.businessName as string) || '',
            businessEmail: (landlordData.businessEmail as string) || '',
            businessPhone: (landlordData.businessPhone as string) || '',
            businessAddress: (landlordData.businessAddress as LandlordProfileDto['businessAddress']) || {},
            publicVisibility: (landlordData.publicVisibility as LandlordProfileDto['publicVisibility']) || {},
            portfolio: {
                totalProperties: properties,
                activeListings,
                occupiedUnits,
            },
            verificationStatus: {
                identity: verifications.some(v => v.type === 'IDENTITY') ? 'verified' : 'pending',
                address: verifications.some(v => v.type === 'ADDRESS') ? 'verified' : 'pending',
                overallTier: user.verificationLevel.toLowerCase(),
            },
        };
    }

    async updateLandlordProfile(userId: string, dto: LandlordProfileDto): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'LANDLORD') {
            throw new AppError('User is not a landlord', 'PROFILE_002', 400);
        }

        await updateProfileData(userId, 'landlord', dto as unknown as Record<string, unknown>);
    }

    // ============================================
    // AGENT PROFILE
    // ============================================

    async getAgentProfile(userId: string): Promise<AgentProfileDto & { certifications: unknown[]; ratings: unknown }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, firstName: true, lastName: true },
        });

        if (user?.role !== 'AGENT') {
            throw new AppError('User is not an agent', 'PROFILE_003', 400);
        }

        const profileData = await getProfileData(userId);
        const agentData = (profileData.agent || {}) as Record<string, unknown>;
        const certifications = (agentData.certifications || []) as unknown[];

        // Get ratings (TODO: aggregate from reviews)
        const ratings = { average: 0, totalReviews: 0 };

        return {
            professionalName: (agentData.professionalName as string) || `${user.firstName} ${user.lastName}`,
            businessEmail: (agentData.businessEmail as string) || '',
            businessPhone: (agentData.businessPhone as string) || '',
            serviceAreas: (agentData.serviceAreas as string[]) || [],
            specialties: (agentData.specialties as string[]) || [],
            publicVisibility: (agentData.publicVisibility as AgentProfileDto['publicVisibility']) || {},
            certifications,
            ratings,
        };
    }

    async updateAgentProfile(userId: string, dto: AgentProfileDto): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'AGENT') {
            throw new AppError('User is not an agent', 'PROFILE_003', 400);
        }

        await updateProfileData(userId, 'agent', dto as unknown as Record<string, unknown>);
    }

    // ============================================
    // AGENT CERTIFICATIONS
    // ============================================

    async addAgentCertification(userId: string, dto: AddCertificationDto): Promise<{ id: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'AGENT') {
            throw new AppError('User is not an agent', 'PROFILE_003', 400);
        }

        const profileData = await getProfileData(userId);
        const agentData = (profileData.agent || {}) as Record<string, unknown>;
        const certifications = (agentData.certifications || []) as Array<Record<string, unknown>>;

        const newCert = {
            id: `cert_${Date.now()}`,
            ...dto,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        certifications.push(newCert);

        await updateProfileData(userId, 'agent', { certifications });

        return { id: newCert.id };
    }

    async deleteAgentCertification(userId: string, certId: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'AGENT') {
            throw new AppError('User is not an agent', 'PROFILE_003', 400);
        }

        const profileData = await getProfileData(userId);
        const agentData = (profileData.agent || {}) as Record<string, unknown>;
        const certifications = (agentData.certifications || []) as Array<Record<string, unknown>>;

        const filtered = certifications.filter(c => c.id !== certId);

        if (filtered.length === certifications.length) {
            throw new AppError('Certification not found', 'PROFILE_004', 404);
        }

        await updateProfileData(userId, 'agent', { certifications: filtered });
    }
}

export const profilesService = new ProfilesService();
