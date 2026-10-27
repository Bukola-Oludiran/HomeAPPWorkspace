/**
 * Auth Service Unit Tests
 */

import bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        session: {
            create: jest.fn().mockResolvedValue({ id: 'session-id' }),
        },
    },
}));

// Mock logger to avoid console output during tests
jest.mock('../../src/common/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

import { AuthService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/config/database';
import { EmailExistsError, InvalidCredentialsError } from '../../src/common/utils/errors';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('initiateRegistration', () => {
        it('should throw EmailExistsError if user already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });

            await expect(
                authService.initiateRegistration('test@example.com')
            ).rejects.toThrow(EmailExistsError);
        });

        it('should return verification info for new email', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await authService.initiateRegistration('new@example.com');

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('verificationToken');
            expect(result).toHaveProperty('expiresAt');
            expect(result.message).toContain('Verification code sent');
        });
    });

    describe('login', () => {
        it('should throw InvalidCredentialsError for non-existent user', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.login('nonexistent@example.com', 'password123')
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it('should throw InvalidCredentialsError for wrong password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                twoFactorEnabled: false,
                role: 'TENANT',
                verificationLevel: 'UNVERIFIED',
                regionCode: 'NG',
                firstName: null,
                lastName: null,
                phone: null,
                avatarUrl: null,
                emailVerified: false,
                preferredCurrency: 'NGN',
                preferredLanguage: 'en',
                walletAddress: null,
                createdAt: new Date('2026-01-01T00:00:00Z'),
                updatedAt: new Date('2026-01-01T00:00:00Z'),
            });

            await expect(
                authService.login('test@example.com', 'wrongpassword')
            ).rejects.toThrow(InvalidCredentialsError);
        });

        it('should return tokens for valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                isActive: true,
                twoFactorEnabled: false,
                role: 'TENANT',
                verificationLevel: 'UNVERIFIED',
                regionCode: 'NG',
                firstName: null,
                lastName: null,
                phone: null,
                avatarUrl: null,
                emailVerified: false,
                preferredCurrency: 'NGN',
                preferredLanguage: 'en',
                walletAddress: null,
                createdAt: new Date('2026-01-01T00:00:00Z'),
                updatedAt: new Date('2026-01-01T00:00:00Z'),
            });

            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 'token-id',
                token: 'refresh-token',
            });

            const result = await authService.login('test@example.com', 'correctpassword');

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.requires2FA).toBe(false);
            if (result.requires2FA) throw new Error('Expected authenticated login response');
            expect(result.user.email).toBe('test@example.com');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });

        it('returns a short-lived challenge for a 2FA-protected account', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-2fa', email: '2fa@example.com', passwordHash: hashedPassword,
                isActive: true, twoFactorEnabled: true, role: 'TENANT',
                verificationLevel: 'UNVERIFIED', regionCode: 'NG',
            });

            const result = await authService.login('2fa@example.com', 'correctpassword');

            expect(result.requires2FA).toBe(true);
            if (!result.requires2FA) throw new Error('Expected 2FA challenge');
            expect(result.challengeToken).toEqual(expect.any(String));
            expect(result.expiresIn).toBe(300);
            expect(prisma.session.create).not.toHaveBeenCalled();
        });

        it('should throw InvalidCredentialsError for inactive user', async () => {
            const hashedPassword = await bcrypt.hash('password', 10);

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                isActive: false,
                twoFactorEnabled: false,
            });

            await expect(
                authService.login('test@example.com', 'password')
            ).rejects.toThrow(InvalidCredentialsError);
        });
    });

    describe('password hashing', () => {
        it('should properly hash and verify passwords', async () => {
            const password = 'SecurePassword123!';
            const hash = await bcrypt.hash(password, 12);

            expect(await bcrypt.compare(password, hash)).toBe(true);
            expect(await bcrypt.compare('wrongpassword', hash)).toBe(false);
        });
    });
});
