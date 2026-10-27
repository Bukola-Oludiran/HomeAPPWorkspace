/**
 * Auth Middleware Unit Tests
 * Access tokens are only honoured while their session is live.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('../../src/config/database', () => ({
    prisma: {
        session: {
            findFirst: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
        },
        user: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('../../src/common/observability/comply', () => ({
    safeEmit: { accessControl: jest.fn() },
}));

import { authenticate } from '../../src/common/middleware/auth.middleware';
import { prisma } from '../../src/config/database';

const sign = (payload: Record<string, unknown>) =>
    jwt.sign({ email: 'test@example.com', role: 'TENANT', verificationLevel: 'UNVERIFIED', regionCode: 'NG', ...payload }, process.env.JWT_SECRET!, {
        expiresIn: 900,
    });

const run = async (token: string) => {
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        getHeader: jest.fn().mockReturnValue('req-1'),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;
    await authenticate(req, res, next);
    return { req, res, next };
};

describe('authenticate', () => {
    it('rejects a token that is not bound to a session', async () => {
        const { res, next } = await run(sign({ sub: 'user-123' }));

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a token whose session was revoked or expired', async () => {
        (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

        const { res, next } = await run(sign({ sub: 'user-123', sid: 'session-id' }));

        expect(prisma.session.findFirst).toHaveBeenCalledWith({
            where: expect.objectContaining({ id: 'session-id', userId: 'user-123', revokedAt: null }),
        });
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('accepts a live session and exposes its id on req.user', async () => {
        (prisma.session.findFirst as jest.Mock).mockResolvedValue({ id: 'session-id' });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
            isActive: true,
        });

        const { req, next } = await run(sign({ sub: 'user-123', sid: 'session-id' }));

        expect(next).toHaveBeenCalledWith();
        expect(req.user).toEqual(expect.objectContaining({ id: 'user-123', sessionId: 'session-id' }));
    });
});
