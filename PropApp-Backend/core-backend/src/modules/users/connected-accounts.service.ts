/**
 * Connected Accounts Service
 * Per APIRevised.md Section 6
 */

import { prisma } from '../../config/database';
import { OAuthProvider } from '@prisma/client';
import { AppError, NotFoundError } from '../../common/utils/errors';

// ============================================
// TYPES
// ============================================

interface ConnectedAccount {
    provider: string;
    email: string;
    connectedAt: Date;
    lastUsedAt: Date | null;
}

interface ConnectedAccountsResponse {
    accounts: ConnectedAccount[];
    availableProviders: string[];
}

const SUPPORTED_PROVIDERS: Record<string, OAuthProvider> = {
    'google': 'GOOGLE',
    'apple': 'APPLE',
    'facebook': 'FACEBOOK',
};

// ============================================
// SERVICE
// ============================================

class ConnectedAccountsService {
    /**
     * Get user's connected accounts
     */
    async getConnectedAccounts(userId: string): Promise<ConnectedAccountsResponse> {
        const accounts = await prisma.connectedAccount.findMany({
            where: { userId },
            select: {
                provider: true,
                email: true,
                connectedAt: true,
                lastUsedAt: true,
            },
        });

        const connectedProviders = accounts.map(a => a.provider.toLowerCase());
        const availableProviders = Object.keys(SUPPORTED_PROVIDERS).filter(
            p => !connectedProviders.includes(p)
        );

        return {
            accounts: accounts.map(a => ({
                provider: a.provider.toLowerCase(),
                email: a.email,
                connectedAt: a.connectedAt,
                lastUsedAt: a.lastUsedAt,
            })),
            availableProviders,
        };
    }

    /**
     * Link a social account
     */
    async linkAccount(userId: string, provider: string, idToken: string): Promise<{
        provider: string;
        email: string;
        connectedAt: Date;
        message: string;
    }> {
        const normalizedProvider = provider.toLowerCase();
        const prismaProvider = SUPPORTED_PROVIDERS[normalizedProvider];

        if (!prismaProvider) {
            throw new AppError('Unsupported provider', 'AUTH_019', 400);
        }

        // Check if already linked
        const existing = await prisma.connectedAccount.findFirst({
            where: { userId, provider: prismaProvider },
        });

        if (existing) {
            throw new AppError('Account already linked', 'AUTH_018', 400);
        }

        // In production, verify the idToken with the provider's API
        // For now, we'll mock the verification
        const mockEmail = `user_${Date.now()}@${normalizedProvider}.mock`;
        const mockProviderUserId = `${normalizedProvider}_${Date.now()}`;

        // Check if this social account is already linked to another user
        const existingOtherUser = await prisma.connectedAccount.findFirst({
            where: {
                providerUserId: mockProviderUserId,
                userId: { not: userId },
            },
        });

        if (existingOtherUser) {
            throw new AppError('This social account is already linked to another user', 'AUTH_020', 400);
        }

        const account = await prisma.connectedAccount.create({
            data: {
                userId,
                provider: prismaProvider,
                providerUserId: mockProviderUserId,
                email: mockEmail,
                connectedAt: new Date(),
            },
        });

        return {
            provider: normalizedProvider,
            email: account.email,
            connectedAt: account.connectedAt,
            message: `${normalizedProvider.charAt(0).toUpperCase() + normalizedProvider.slice(1)} account linked successfully`,
        };
    }

    /**
     * Unlink a social account
     */
    async unlinkAccount(userId: string, provider: string): Promise<void> {
        const normalizedProvider = provider.toLowerCase();
        const prismaProvider = SUPPORTED_PROVIDERS[normalizedProvider];

        if (!prismaProvider) {
            throw new AppError('Unsupported provider', 'AUTH_019', 400);
        }

        // Get user to check if they have a password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        });

        // Get all connected accounts
        const connectedAccounts = await prisma.connectedAccount.findMany({
            where: { userId },
        });

        // Check if this is the only login method
        if (!user?.passwordHash && connectedAccounts.length <= 1) {
            throw new AppError(
                'Cannot unlink account. This is your only login method. Set a password first.',
                'AUTH_021',
                400
            );
        }

        // Find and delete the account
        const account = await prisma.connectedAccount.findFirst({
            where: { userId, provider: prismaProvider },
        });

        if (!account) {
            throw new NotFoundError('Connected account not found');
        }

        await prisma.connectedAccount.delete({
            where: { id: account.id },
        });
    }
}

export const connectedAccountsService = new ConnectedAccountsService();
