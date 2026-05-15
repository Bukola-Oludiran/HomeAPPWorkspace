/**
 * Auth Service
 * Handles authentication logic: registration, login, JWT, 2FA
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { UserRole, VerificationLevel } from '@prisma/client';
import { JwtPayload } from '../../common/middleware/auth.middleware';
import { communicationProviderFactory } from '../../integrations/communication';
import {
    InvalidCredentialsError,
    EmailExistsError,
    UserNotFoundError,
    TwoFactorRequiredError,
    ValidationError,
} from '../../common/utils/errors';
import { logger } from '../../common/utils/logger';
import type { WireAuthUser } from '@homeai/contracts/auth.contract';

// Prisma row shape required by `serializeAuthUser`. Any auth endpoint
// that emits a user must `select` (or `findUnique` without select to
// get the full row) these fields.
type PrismaAuthUser = {
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

const serializeAuthUser = (user: PrismaAuthUser): WireAuthUser => ({
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

// Selection passed to every Prisma findUnique / create for auth flows
// so the row shape matches `serializeAuthUser`.
const authUserSelect = {
    id: true,
    email: true,
    role: true,
    firstName: true,
    lastName: true,
    phone: true,
    avatarUrl: true,
    verificationLevel: true,
    isEmailVerified: true,
    twoFactorEnabled: true,
    regionCode: true,
    walletAddress: true,
    createdAt: true,
    updatedAt: true,
} as const;

// ============================================
// TYPES
// ============================================

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface RegistrationInitResult {
    message: string;
    verificationToken: string;
    expiresAt: Date;
}

interface User2FASetup {
    secret: string;
    qrCodeUrl: string;
    recoveryCodes: string[];
}

// Temporary storage for verification codes (should use Redis in production)
const verificationCodes = new Map<string, { code: string; role: UserRole; regionCode: string; expiresAt: Date }>();
const passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

// ============================================
// AUTH SERVICE CLASS
// ============================================

class AuthService {
    private readonly SALT_ROUNDS = 12;
    private readonly VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000; // 15 minutes
    private readonly PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour

    // ----------------------------------------
    // REGISTRATION
    // ----------------------------------------

    /**
     * Initiate registration - send verification email
     */
    async initiateRegistration(
        email: string,
        role: UserRole = UserRole.TENANT,
        regionCode: string = 'NG'
    ): Promise<RegistrationInitResult> {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new EmailExistsError();
        }

        // Generate 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationToken = uuidv4();
        const expiresAt = new Date(Date.now() + this.VERIFICATION_CODE_EXPIRY);

        // Store verification data
        verificationCodes.set(email.toLowerCase(), {
            code,
            role,
            regionCode,
            expiresAt,
        });

        // Send verification email
        const emailProvider = communicationProviderFactory.getEmailProvider(regionCode);
        emailProvider.sendEmail({
            to: email,
            subject: 'Your HomeAI Verification Code',
            html: `
                <h2>Welcome to HomeAI!</h2>
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        }).catch(err => logger.error(`Failed to send verification email: ${err.message}`));

        logger.info(`Verification code sent to ${email}`);

        return {
            message: 'Verification code sent to your email',
            verificationToken,
            expiresAt,
        };
    }

    /**
     * Verify email with code
     */
    async verifyEmail(email: string, code: string): Promise<{ verified: boolean; message: string }> {
        const stored = verificationCodes.get(email.toLowerCase());

        if (!stored) {
            throw new ValidationError('No verification pending for this email', [
                { field: 'email', message: 'No verification pending' },
            ]);
        }

        if (stored.expiresAt < new Date()) {
            verificationCodes.delete(email.toLowerCase());
            throw new ValidationError('Verification code has expired', [
                { field: 'code', message: 'Code expired' },
            ]);
        }

        if (stored.code !== code) {
            throw new ValidationError('Invalid verification code', [
                { field: 'code', message: 'Invalid code' },
            ]);
        }

        return {
            verified: true,
            message: 'Email verified successfully',
        };
    }

    /**
     * Complete registration with password
     */
    async completeRegistration(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        phone?: string
    ): Promise<{ user: WireAuthUser; tokens: TokenPair }> {
        const stored = verificationCodes.get(email.toLowerCase());

        if (!stored) {
            throw new ValidationError('Email not verified', [
                { field: 'email', message: 'Please verify your email first' },
            ]);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                role: stored.role,
                firstName,
                lastName,
                phone,
                regionCode: stored.regionCode,
                isEmailVerified: true,
            },
            select: authUserSelect,
        });

        // Clean up verification code
        verificationCodes.delete(email.toLowerCase());

        // Generate tokens
        const tokens = await this.generateTokenPair(user);

        logger.info(`User registered: ${user.email}`);

        return {
            user: serializeAuthUser(user),
            tokens,
        };
    }

    // ----------------------------------------
    // LOGIN
    // ----------------------------------------

    /**
     * Login with email and password
     */
    async login(
        email: string,
        password: string,
        twoFactorCode?: string
    ): Promise<{ user: WireAuthUser; tokens: TokenPair; requires2FA?: boolean }> {
        // Find user (raw row needed for passwordHash + twoFactorSecret).
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new InvalidCredentialsError();
        }

        if (!user.isActive) {
            throw new InvalidCredentialsError('Account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // Check 2FA
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new TwoFactorRequiredError();
            }

            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token: twoFactorCode,
            });

            if (!isValid) {
                throw new InvalidCredentialsError('Invalid 2FA code');
            }
        }

        // Generate tokens
        const tokens = await this.generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role,
            verificationLevel: user.verificationLevel,
            regionCode: user.regionCode,
        });

        logger.info(`User logged in: ${user.email}`);

        return {
            user: serializeAuthUser(user),
            tokens,
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<TokenPair> {
        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new InvalidCredentialsError('Invalid refresh token');
        }

        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new InvalidCredentialsError('Refresh token expired');
        }

        if (!storedToken.user.isActive) {
            throw new InvalidCredentialsError('Account is disabled');
        }

        // Delete old refresh token
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        // Generate new token pair
        return this.generateTokenPair({
            id: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role,
            verificationLevel: storedToken.user.verificationLevel,
            regionCode: storedToken.user.regionCode,
        });
    }

    /**
     * Logout - invalidate refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }

    // ----------------------------------------
    // PASSWORD RESET
    // ----------------------------------------

    /**
     * Initiate password reset
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return { message: 'If the email exists, a reset link has been sent' };
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY);

        passwordResetTokens.set(token, { userId: user.id, expiresAt });

        // Send password reset email
        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        const emailProvider = communicationProviderFactory.getEmailProvider(user.regionCode || 'NG');
        emailProvider.sendEmail({
            to: email,
            subject: 'Reset Your HomeAI Password',
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        }).catch(err => logger.error(`Failed to send password reset email: ${err.message}`));

        logger.info(`Password reset email sent to ${email}`);

        return { message: 'If the email exists, a reset link has been sent' };
    }

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const stored = passwordResetTokens.get(token);

        if (!stored) {
            throw new ValidationError('Invalid or expired reset token', [
                { field: 'token', message: 'Invalid token' },
            ]);
        }

        if (stored.expiresAt < new Date()) {
            passwordResetTokens.delete(token);
            throw new ValidationError('Reset token has expired', [
                { field: 'token', message: 'Token expired' },
            ]);
        }

        const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

        await prisma.user.update({
            where: { id: stored.userId },
            data: { passwordHash },
        });

        // Invalidate all refresh tokens for this user
        await prisma.refreshToken.deleteMany({
            where: { userId: stored.userId },
        });

        passwordResetTokens.delete(token);

        logger.info(`Password reset for user: ${stored.userId}`);

        return { message: 'Password has been reset successfully' };
    }

    // ----------------------------------------
    // TWO-FACTOR AUTHENTICATION
    // ----------------------------------------

    /**
     * Set up 2FA for user
     */
    async setup2FA(userId: string): Promise<User2FASetup> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        if (user.twoFactorEnabled) {
            throw new ValidationError('2FA is already enabled', [
                { field: '2fa', message: 'Already enabled' },
            ]);
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `HomeAI (${user.email})`,
            issuer: 'HomeAI',
        });

        // Generate recovery codes
        const recoveryCodes = Array.from({ length: 10 }, () =>
            uuidv4().split('-').slice(0, 2).join('').toUpperCase()
        );

        // Store secret (but don't enable yet)
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 },
        });

        return {
            secret: secret.base32,
            qrCodeUrl: secret.otpauth_url!,
            recoveryCodes,
        };
    }

    /**
     * Verify and enable 2FA
     */
    async verify2FA(userId: string, code: string): Promise<{ enabled: boolean }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.twoFactorSecret) {
            throw new ValidationError('2FA setup not initiated', [
                { field: '2fa', message: 'Not set up' },
            ]);
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });

        if (!isValid) {
            throw new ValidationError('Invalid verification code', [
                { field: 'code', message: 'Invalid code' },
            ]);
        }

        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });

        logger.info(`2FA enabled for user: ${userId}`);

        return { enabled: true };
    }

    /**
     * Disable 2FA
     */
    async disable2FA(userId: string, code: string, password: string): Promise<{ disabled: boolean }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError('Invalid password');
        }

        // Verify 2FA code
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: code,
        });

        if (!isValid) {
            throw new ValidationError('Invalid verification code', [
                { field: 'code', message: 'Invalid code' },
            ]);
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        logger.info(`2FA disabled for user: ${userId}`);

        return { disabled: true };
    }

    /**
     * Get 2FA recovery codes (regenerates if 2FA enabled)
     * Per PRD Section 6.1: GET /api/v1/auth/2fa/recovery-codes
     */
    async getRecoveryCodes(userId: string): Promise<{ recoveryCodes: string[] }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        if (!user.twoFactorEnabled) {
            throw new ValidationError('2FA is not enabled', [
                { field: '2fa', message: 'Enable 2FA first' },
            ]);
        }

        // Generate new recovery codes
        const recoveryCodes = Array.from({ length: 10 }, () =>
            uuidv4().split('-').slice(0, 2).join('').toUpperCase()
        );

        // In production, store these hashed in the database
        // For now, we return them (user should save them securely)
        logger.info(`Recovery codes generated for user: ${userId}`);

        return { recoveryCodes };
    }

    // ----------------------------------------
    // PERMISSIONS (PRD Section 6.3)
    // ----------------------------------------

    /**
     * Get permissions array for a user role
     * Per PRD Section 6.3 RBAC table
     */
    static getPermissionsForRole(role: UserRole): string[] {
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

    // ----------------------------------------
    // TOKEN GENERATION
    // ----------------------------------------

    private async generateTokenPair(user: {
        id: string;
        email: string;
        role: UserRole;
        verificationLevel: VerificationLevel;
        regionCode: string;
    }): Promise<TokenPair> {
        const jti = uuidv4();

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            verificationLevel: user.verificationLevel,
            regionCode: user.regionCode,
            jti,
        };

        // Generate access token (15 minutes = 900 seconds)
        const accessToken = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: 900,
        });

        // Generate refresh token
        const refreshToken = uuidv4();
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days

        // Store refresh token in database
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
            expiresIn: 900, // 15 minutes in seconds
        };
    }
}

export const authService = new AuthService();
export { AuthService };
