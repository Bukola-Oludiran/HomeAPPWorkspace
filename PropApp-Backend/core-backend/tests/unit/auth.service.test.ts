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
            findFirst: jest.fn(),
            update: jest.fn().mockResolvedValue({ id: 'session-id' }),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { AuthService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/config/database';
import { EmailExistsError, InvalidCredentialsError } from '../../src/common/utils/errors';

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const activeUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    isActive: true,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    role: 'TENANT',
    verificationLevel: 'UNVERIFIED',
    regionCode: 'NG',
    firstName: null,
    lastName: null,
    phone: null,
    avatarUrl: null,
    isEmailVerified: false,
    walletAddress: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
});

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

    describe('sessions', () => {
        it('issues an access token bound to a new session whose hash matches the refresh token', async () => {
            const passwordHash = await bcrypt.hash('correctpassword', 4);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(activeUser({ passwordHash }));

            const result = await authService.login('test@example.com', 'correctpassword');
            if (result.requires2FA) throw new Error('Expected authenticated login response');

            const payload = jwt.decode(result.tokens.accessToken) as { sid?: string; sub: string };
            expect(payload.sid).toBe('session-id');
            expect(payload.sub).toBe('user-123');
            expect(prisma.session.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ userId: 'user-123', tokenHash: sha256(result.tokens.refreshToken) }),
                })
            );
        });

        it('refuses to refresh when the session was revoked', async () => {
            (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
                id: 'rt-1',
                token: 'old-refresh',
                expiresAt: new Date(Date.now() + 60_000),
                user: activeUser(),
            });
            (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(authService.refreshToken('old-refresh')).rejects.toThrow(InvalidCredentialsError);
            expect(prisma.refreshToken.create).not.toHaveBeenCalled();
        });

        it('rotates the refresh token and keeps the same session on refresh', async () => {
            (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
                id: 'rt-1',
                token: 'old-refresh',
                expiresAt: new Date(Date.now() + 60_000),
                user: activeUser(),
            });
            (prisma.session.findFirst as jest.Mock).mockResolvedValue({ id: 'session-id', userId: 'user-123' });

            const tokens = await authService.refreshToken('old-refresh');

            expect(prisma.session.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.objectContaining({ tokenHash: sha256('old-refresh'), revokedAt: null }) })
            );
            expect(prisma.session.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'session-id' },
                    data: expect.objectContaining({ tokenHash: sha256(tokens.refreshToken) }),
                })
            );
            expect(prisma.session.create).not.toHaveBeenCalled();
            expect((jwt.decode(tokens.accessToken) as { sid?: string }).sid).toBe('session-id');
        });

        it('revokes the session on logout', async () => {
            await authService.logout('some-refresh');

            expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'some-refresh' } });
            expect(prisma.session.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.objectContaining({ tokenHash: sha256('some-refresh'), revokedAt: null }) })
            );
        });
    });

    describe('2FA login challenge', () => {
        const secret = speakeasy.generateSecret().base32;
        const twoFactorUser = async () =>
            activeUser({
                id: 'user-2fa',
                email: '2fa@example.com',
                passwordHash: await bcrypt.hash('correctpassword', 4),
                twoFactorEnabled: true,
                twoFactorSecret: secret,
            });

        it('completes login with a valid TOTP code and only then creates the session', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(await twoFactorUser());
            const challenge = await authService.login('2fa@example.com', 'correctpassword');
            if (!challenge.requires2FA) throw new Error('Expected 2FA challenge');
            expect(prisma.session.create).not.toHaveBeenCalled();

            const code = speakeasy.totp({ secret, encoding: 'base32' });
            const result = await authService.verifyLoginChallenge(challenge.challengeToken, code);

            expect(result.requires2FA).toBe(false);
            expect(result.user.email).toBe('2fa@example.com');
            expect((jwt.decode(result.tokens.accessToken) as { sid?: string }).sid).toBe('session-id');
            expect(prisma.session.create).toHaveBeenCalledTimes(1);
        });

        it('rejects a wrong TOTP code', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(await twoFactorUser());
            const challenge = await authService.login('2fa@example.com', 'correctpassword');
            if (!challenge.requires2FA) throw new Error('Expected 2FA challenge');

            await expect(authService.verifyLoginChallenge(challenge.challengeToken, '000000')).rejects.toThrow(
                InvalidCredentialsError
            );
            expect(prisma.session.create).not.toHaveBeenCalled();
        });

        it('does not accept an ordinary access token as a challenge token', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(await twoFactorUser());
            const accessToken = jwt.sign({ sub: 'user-2fa', sid: 'session-id' }, process.env.JWT_SECRET!, { expiresIn: 900 });
            const code = speakeasy.totp({ secret, encoding: 'base32' });

            await expect(authService.verifyLoginChallenge(accessToken, code)).rejects.toThrow(InvalidCredentialsError);
        });

        it('still accepts the code inline with the login request', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(await twoFactorUser());
            const code = speakeasy.totp({ secret, encoding: 'base32' });

            const result = await authService.login('2fa@example.com', 'correctpassword', code);

            expect(result.requires2FA).toBe(false);
            expect(prisma.session.create).toHaveBeenCalledTimes(1);
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
