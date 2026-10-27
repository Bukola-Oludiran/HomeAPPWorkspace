/**
 * User Service
 * Handles user profile, preferences, and wallet integration
 * Per PRD Section 7
 */

import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    UserNotFoundError,
    InvalidCredentialsError,
    ValidationError,
} from '../../common/utils/errors';
import {
    UpdateProfileDto,
    UpdatePasswordDto,
    UpdatePreferencesDto,
    UpdateNotificationSettingsDto,
    ConnectWalletDto,
} from './users.dto';

// ============================================
// TYPES
// ============================================

interface UserProfile {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    walletAddress: string | null;
    verificationLevel: string;
    isEmailVerified: boolean;
    regionCode: string;
    createdAt: Date;
    profile?: {
        profileData: Record<string, unknown>;
    } | null;
}

interface PublicProfile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    verificationLevel: string;
    role: string;
    createdAt: Date;
    // Role-specific public info
    properties?: number;
    rating?: number;
    responseTime?: string;
}

// ============================================
// USER SERVICE CLASS
// ============================================

class UserService {
    private readonly SALT_ROUNDS = 12;

    // ----------------------------------------
    // GET CURRENT USER
    // ----------------------------------------

    /**
     * Get current user's full profile
     * GET /api/v1/users/me
     */
    async getCurrentUser(userId: string): Promise<UserProfile> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                walletAddress: true,
                verificationLevel: true,
                isEmailVerified: true,
                regionCode: true,
                createdAt: true,
                profile: {
                    select: {
                        profileData: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        return {
            ...user,
            profile: user.profile ? {
                profileData: user.profile.profileData as Record<string, unknown>,
            } : null,
        };
    }

    // ----------------------------------------
    // UPDATE PROFILE
    // ----------------------------------------

    /**
     * Update current user's profile
     * PUT /api/v1/users/me
     */
    async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Update user basic info
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                walletAddress: true,
                verificationLevel: true,
                isEmailVerified: true,
                regionCode: true,
                createdAt: true,
                profile: {
                    select: {
                        profileData: true,
                    },
                },
            },
        });

        // Update role-specific profile data if provided
        if (data.profileData) {
            await prisma.userProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    profileData: JSON.parse(JSON.stringify(data.profileData)),
                },
                update: {
                    profileData: JSON.parse(JSON.stringify(data.profileData)),
                },
            });
        }

        logger.info(`Profile updated for user: ${userId}`);

        return {
            ...updatedUser,
            profile: updatedUser.profile ? {
                profileData: updatedUser.profile.profileData as Record<string, unknown>,
            } : null,
        };
    }

    // ----------------------------------------
    // PASSWORD CHANGE
    // ----------------------------------------

    /**
     * Change password
     * PUT /api/v1/users/me/password
     */
    async changePassword(userId: string, data: UpdatePasswordDto): Promise<{ message: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Verify current password
        const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new InvalidCredentialsError('Current password is incorrect');
        }

        // Hash new password
        const newHash = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });

        // Invalidate all refresh tokens (force re-login on other devices)
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        logger.info(`Password changed for user: ${userId}`);

        return { message: 'Password changed successfully' };
    }

    // ----------------------------------------
    // PREFERENCES
    // ----------------------------------------

    /**
     * Update user preferences
     * PUT /api/v1/users/me/preferences
     */
    async updatePreferences(userId: string, data: UpdatePreferencesDto): Promise<{ message: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Merge preferences into profile data
        const existingData = (user.profile?.profileData as Record<string, unknown>) || {};
        const updatedData = {
            ...existingData,
            preferences: {
                ...(existingData.preferences as Record<string, unknown> || {}),
                ...data,
            },
        };

        await prisma.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                profileData: updatedData,
            },
            update: {
                profileData: updatedData,
            },
        });

        logger.info(`Preferences updated for user: ${userId}`);

        return { message: 'Preferences updated successfully' };
    }

    /**
     * Update notification settings
     * PUT /api/v1/users/me/notification-settings
     */
    async updateNotificationSettings(
        userId: string,
        data: UpdateNotificationSettingsDto
    ): Promise<{ message: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        const existingData = (user.profile?.profileData as Record<string, unknown>) || {};
        const updatedData = {
            ...existingData,
            notificationSettings: data,
        };

        await prisma.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                profileData: updatedData,
            },
            update: {
                profileData: updatedData,
            },
        });

        logger.info(`Notification settings updated for user: ${userId}`);

        return { message: 'Notification settings updated successfully' };
    }

    // ----------------------------------------
    // DELETE ACCOUNT
    // ----------------------------------------

    /**
     * Delete user account (soft delete)
     * DELETE /api/v1/users/me
     */
    async deleteAccount(userId: string): Promise<{ message: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Soft delete - mark as inactive
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                email: `deleted_${Date.now()}_${user.email}`, // Free up email
            },
        });

        // Invalidate all tokens
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        logger.info(`Account deleted for user: ${userId}`);

        return { message: 'Account deleted successfully' };
    }

    // ----------------------------------------
    // AVATAR
    // ----------------------------------------

    /**
     * Update avatar URL
     * POST /api/v1/users/me/avatar
     */
    async updateAvatar(userId: string, avatarUrl: string | null): Promise<{ avatarUrl: string | null }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
        });

        logger.info(`Avatar updated for user: ${userId}`);

        return { avatarUrl };
    }

    // ----------------------------------------
    // WALLET INTEGRATION (PRD Section 7.2)
    // ----------------------------------------

    /**
     * Get wallet info
     * GET /api/v1/users/me/wallet
     */
    async getWallet(userId: string): Promise<{ walletAddress: string | null; connected: boolean }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddress: true },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        return {
            walletAddress: user.walletAddress,
            connected: !!user.walletAddress,
        };
    }

    /**
     * Connect wallet
     * POST /api/v1/users/me/wallet/connect
     * Per PRD Section 7.2
     */
    async connectWallet(userId: string, data: ConnectWalletDto): Promise<{ walletAddress: string }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Verify signature (in production, use ethers.js or web3.js)
        const isValidSignature = await this.verifyWalletSignature(
            data.walletAddress,
            data.message,
            data.signature
        );

        if (!isValidSignature) {
            throw new ValidationError('Invalid wallet signature', [
                { field: 'signature', message: 'Could not verify wallet ownership' },
            ]);
        }

        // Check if wallet is already connected to another user
        const existingUser = await prisma.user.findFirst({
            where: {
                walletAddress: data.walletAddress.toLowerCase(),
                id: { not: userId },
            },
        });

        if (existingUser) {
            throw new ValidationError('Wallet already connected to another account', [
                { field: 'walletAddress', message: 'Already in use' },
            ]);
        }

        await prisma.user.update({
            where: { id: userId },
            data: { walletAddress: data.walletAddress.toLowerCase() },
        });

        logger.info(`Wallet connected for user: ${userId}`);

        return { walletAddress: data.walletAddress.toLowerCase() };
    }

    /**
     * Verify wallet signature (mock implementation)
     * In production, use ethers.js: ethers.verifyMessage(message, signature)
     */
    private async verifyWalletSignature(
        walletAddress: string,
        message: string,
        signature: string
    ): Promise<boolean> {
        // TODO: Implement real signature verification with ethers.js
        // const recoveredAddress = ethers.verifyMessage(message, signature);
        // return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();

        // Mock: Accept any valid-looking signature in development
        logger.warn('[Wallet] Using mock signature verification');
        return signature.startsWith('0x') && signature.length > 10;
    }

    // ----------------------------------------
    // PUBLIC PROFILES
    // ----------------------------------------

    /**
     * Get public landlord profile
     * GET /api/v1/users/public/landlord/:id
     */
    async getPublicLandlordProfile(landlordId: string): Promise<PublicProfile> {
        const user = await prisma.user.findUnique({
            where: { id: landlordId, role: 'LANDLORD', isActive: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                verificationLevel: true,
                role: true,
                createdAt: true,
                ownedProperties: {
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                },
            },
        });

        if (!user) {
            throw new UserNotFoundError('Landlord not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            verificationLevel: user.verificationLevel,
            role: user.role,
            createdAt: user.createdAt,
            properties: user.ownedProperties.length,
        };
    }

    /**
     * Get public tenant profile
     * GET /api/v1/users/public/tenant/:id
     */
    async getPublicTenantProfile(tenantId: string): Promise<PublicProfile> {
        const user = await prisma.user.findUnique({
            where: { id: tenantId, role: 'TENANT', isActive: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                verificationLevel: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UserNotFoundError('Tenant not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            verificationLevel: user.verificationLevel,
            role: user.role,
            createdAt: user.createdAt,
        };
    }

    /**
     * Get public agent profile
     * GET /api/v1/users/public/agent/:id
     */
    async getPublicAgentProfile(agentId: string): Promise<PublicProfile> {
        const user = await prisma.user.findUnique({
            where: { id: agentId, role: 'AGENT', isActive: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                verificationLevel: true,
                role: true,
                createdAt: true,
                assignedJobs: {
                    where: { status: 'COMPLETED' },
                    select: { id: true },
                },
            },
        });

        if (!user) {
            throw new UserNotFoundError('Agent not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            verificationLevel: user.verificationLevel,
            role: user.role,
            createdAt: user.createdAt,
            // TODO: Calculate actual rating from reviews
            rating: 4.5,
            responseTime: '< 1 hour',
        };
    }

    // ----------------------------------------
    // INTERNAL (Service-to-Service)
    // ----------------------------------------

    /**
     * Get user context for AI service
     * GET /api/v1/internal/users/:id/context
     */
    async getUserContext(userId: string): Promise<Record<string, unknown>> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                verificationLevel: true,
                regionCode: true,
                profile: {
                    select: {
                        profileData: true,
                    },
                },
                ownedProperties: {
                    where: { status: 'ACTIVE' },
                    take: 10,
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
                tenantLeases: {
                    where: { status: 'ACTIVE' },
                    take: 5,
                    select: {
                        id: true,
                        propertyId: true,
                        status: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        return {
            user: {
                id: user.id,
                role: user.role,
                firstName: user.firstName,
                verificationLevel: user.verificationLevel,
                regionCode: user.regionCode,
            },
            preferences: (user.profile?.profileData as Record<string, unknown>)?.preferences || {},
            properties: user.ownedProperties,
            leases: user.tenantLeases,
        };
    }
}

export const userService = new UserService();
export { UserService };
