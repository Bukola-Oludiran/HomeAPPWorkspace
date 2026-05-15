/**
 * OAuth Service
 * Handles OAuth authentication with Google, Apple, Facebook
 */

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { UserRole, VerificationLevel } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';
import { ValidationError, InvalidCredentialsError } from '../../common/utils/errors';
import type { WireAuthUser } from '@homeai/contracts/auth.contract';

type PrismaOAuthUser = {
    id: string;
    email: string;
    role: UserRole;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    verificationLevel: VerificationLevel;
    isEmailVerified: boolean;
    twoFactorEnabled: boolean;
    regionCode: string;
    walletAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
};

const serializeAuthUser = (user: PrismaOAuthUser): WireAuthUser => ({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    verificationLevel: user.verificationLevel,
    isEmailVerified: user.isEmailVerified,
    is2FAEnabled: user.twoFactorEnabled,
    regionCode: user.regionCode,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});

// ============================================
// TYPES
// ============================================

export type OAuthProvider = 'google' | 'apple' | 'facebook';

export interface OAuthUserInfo {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    provider: OAuthProvider;
}

interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface OAuthResult {
    user: WireAuthUser & { isNewUser: boolean };
    tokens: OAuthTokens;
}

// Mock OAuth verification (replace with real provider SDKs)
const mockOAuthProviders = {
    google: true,
    apple: true,
    facebook: true,
};

// ============================================
// OAUTH SERVICE
// ============================================

class OAuthService {
    private readonly supportedProviders: OAuthProvider[] = ['google', 'apple', 'facebook'];

    /**
     * Validate that provider is supported
     */
    validateProvider(provider: string): OAuthProvider {
        if (!this.supportedProviders.includes(provider as OAuthProvider)) {
            throw new ValidationError(`Unsupported OAuth provider: ${provider}`, [
                { field: 'provider', message: `Must be one of: ${this.supportedProviders.join(', ')}` },
            ]);
        }
        return provider as OAuthProvider;
    }

    /**
     * Verify OAuth token and get user info from provider
     */
    async verifyOAuthToken(provider: OAuthProvider, token: string): Promise<OAuthUserInfo> {
        // In production, verify token with actual provider SDK
        // For now, we'll use a mock implementation

        logger.info(`[OAuth] Verifying ${provider} token`);

        switch (provider) {
            case 'google':
                return this.verifyGoogleToken(token);
            case 'apple':
                return this.verifyAppleToken(token);
            case 'facebook':
                return this.verifyFacebookToken(token);
            default:
                throw new ValidationError(`Provider ${provider} not implemented`, []);
        }
    }

    /**
     * Login or register user via OAuth
     */
    async loginWithOAuth(
        provider: OAuthProvider,
        token: string,
        role: UserRole = UserRole.TENANT,
        regionCode: string = 'NG'
    ): Promise<OAuthResult> {
        // Verify token and get user info
        const oauthUser = await this.verifyOAuthToken(provider, token);

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: oauthUser.email.toLowerCase() },
        });

        let isNewUser = false;

        if (!user) {
            // Create new user from OAuth
            isNewUser = true;
            user = await prisma.user.create({
                data: {
                    email: oauthUser.email.toLowerCase(),
                    passwordHash: '', // OAuth users don't have password
                    role,
                    firstName: oauthUser.firstName || oauthUser.name?.split(' ')[0],
                    lastName: oauthUser.lastName || oauthUser.name?.split(' ').slice(1).join(' '),
                    avatarUrl: oauthUser.avatar,
                    isEmailVerified: true, // OAuth emails are pre-verified
                    regionCode,
                    profile: {
                        create: {
                            profileData: {
                                oauthProvider: provider,
                                oauthId: oauthUser.id,
                            },
                        },
                    },
                },
            });

            logger.info(`[OAuth] New user created via ${provider}: ${user.email}`);
        } else {
            // Update OAuth info if needed
            logger.info(`[OAuth] Existing user logged in via ${provider}: ${user.email}`);
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: {
                ...serializeAuthUser(user),
                isNewUser,
            },
            tokens,
        };
    }

    /**
     * Generate JWT tokens for OAuth user
     */
    private async generateTokens(user: {
        id: string;
        email: string;
        role: UserRole;
        verificationLevel: string;
        regionCode: string;
    }): Promise<OAuthTokens> {
        const jti = uuidv4();

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: this.getPermissionsForRole(user.role),
            verificationLevel: user.verificationLevel,
            regionCode: user.regionCode,
            jti,
        };

        const accessToken = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: 900, // 15 minutes
        });

        const refreshToken = uuidv4();
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: refreshExpiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }

    /**
     * Get permissions array for role (per PRD Section 6.3)
     */
    private getPermissionsForRole(role: UserRole): string[] {
        const permissions: Record<UserRole, string[]> = {
            TENANT: [
                'property:read',
                'application:read',
                'application:write',
                'payment:read',
                'payment:write',
                'verification:read',
            ],
            LANDLORD: [
                'property:read',
                'property:write',
                'application:read',
                'payment:read',
                'verification:read',
                'verification:write',
                'job:write',
            ],
            AGENT: [
                'property:read',
                'payment:read',
                'job:read',
                'job:write',
            ],
            ADMIN: [
                'property:read',
                'property:write',
                'application:read',
                'application:write',
                'payment:read',
                'payment:write',
                'verification:read',
                'verification:write',
                'job:read',
                'job:write',
                'admin:*',
            ],
        };

        return permissions[role] || [];
    }

    // ============================================
    // PROVIDER-SPECIFIC VERIFICATION (MOCKS)
    // ============================================

    /**
     * Verify Google OAuth token
     * In production: Use google-auth-library
     */
    private async verifyGoogleToken(token: string): Promise<OAuthUserInfo> {
        // TODO: Implement real Google verification
        // const { OAuth2Client } = require('google-auth-library');
        // const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
        // const ticket = await client.verifyIdToken({ idToken: token });
        // const payload = ticket.getPayload();

        // Mock implementation for development
        logger.warn('[OAuth] Using mock Google verification');

        // In development, decode the mock token
        const mockPayload = this.parseMockToken(token);

        return {
            id: mockPayload.sub || `google_${uuidv4().split('-')[0]}`,
            email: mockPayload.email || 'google_user@example.com',
            name: mockPayload.name,
            firstName: mockPayload.given_name,
            lastName: mockPayload.family_name,
            avatar: mockPayload.picture,
            provider: 'google',
        };
    }

    /**
     * Verify Apple OAuth token
     * In production: Use apple-signin-auth
     */
    private async verifyAppleToken(token: string): Promise<OAuthUserInfo> {
        logger.warn('[OAuth] Using mock Apple verification');

        const mockPayload = this.parseMockToken(token);

        return {
            id: mockPayload.sub || `apple_${uuidv4().split('-')[0]}`,
            email: mockPayload.email || 'apple_user@example.com',
            name: mockPayload.name,
            provider: 'apple',
        };
    }

    /**
     * Verify Facebook OAuth token
     * In production: Use facebook-api
     */
    private async verifyFacebookToken(token: string): Promise<OAuthUserInfo> {
        logger.warn('[OAuth] Using mock Facebook verification');

        const mockPayload = this.parseMockToken(token);

        return {
            id: mockPayload.sub || `fb_${uuidv4().split('-')[0]}`,
            email: mockPayload.email || 'fb_user@example.com',
            name: mockPayload.name,
            avatar: mockPayload.picture,
            provider: 'facebook',
        };
    }

    /**
     * Parse mock token for development
     */
    private parseMockToken(token: string): Record<string, string> {
        try {
            // Try to parse as JSON
            return JSON.parse(Buffer.from(token, 'base64').toString());
        } catch {
            // Return minimal mock data
            return {
                sub: `mock_${uuidv4().split('-')[0]}`,
                email: `mock_${Date.now()}@example.com`,
                name: 'Mock User',
            };
        }
    }
}

export const oauthService = new OAuthService();
export { OAuthService };
