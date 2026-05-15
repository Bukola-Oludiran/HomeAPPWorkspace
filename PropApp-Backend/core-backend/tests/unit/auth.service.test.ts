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
            });

            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 'token-id',
                token: 'refresh-token',
            });

            const result = await authService.login('test@example.com', 'correctpassword');

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.user.email).toBe('test@example.com');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
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
