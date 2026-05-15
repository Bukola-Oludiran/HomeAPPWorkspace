/**
 * Session Service
 * Manages user login sessions
 * Per APIRevised.md Section 5
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ============================================
// TYPES
// ============================================

interface SessionResponse {
    id: string;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    location: string | null;
    isCurrent: boolean;
    lastActiveAt: Date;
    createdAt: Date;
}

// ============================================
// SERVICE
// ============================================

class SessionService {
    /**
     * Create a new session
     */
    async createSession(
        userId: string,
        tokenHash: string,
        deviceInfo: {
            deviceName?: string;
            deviceType?: string;
            browser?: string;
            os?: string;
            ipAddress?: string;
        },
        expiresAt: Date
    ): Promise<string> {
        const session = await prisma.session.create({
            data: {
                userId,
                tokenHash,
                deviceName: deviceInfo.deviceName,
                deviceType: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                ipAddress: deviceInfo.ipAddress,
                expiresAt,
            },
        });

        return session.id;
    }

    /**
     * Get active sessions for a user
     */
    async getSessions(userId: string, currentTokenHash?: string): Promise<{
        currentSessionId: string | null;
        sessions: SessionResponse[];
        total: number;
    }> {
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { lastActiveAt: 'desc' },
        });

        let currentSessionId: string | null = null;

        const formattedSessions = sessions.map(session => {
            const isCurrent = currentTokenHash
                ? session.tokenHash === currentTokenHash
                : false;

            if (isCurrent) {
                currentSessionId = session.id;
            }

            return {
                id: session.id,
                deviceName: session.deviceName,
                deviceType: session.deviceType,
                browser: session.browser,
                os: session.os,
                ipAddress: session.ipAddress ? this.maskIpAddress(session.ipAddress) : null,
                location: session.location ? this.formatLocation(session.location) : null,
                isCurrent,
                lastActiveAt: session.lastActiveAt,
                createdAt: session.createdAt,
            };
        });

        return {
            currentSessionId,
            sessions: formattedSessions,
            total: formattedSessions.length,
        };
    }

    /**
     * Revoke a specific session
     */
    async revokeSession(userId: string, sessionId: string, currentSessionId?: string): Promise<void> {
        if (sessionId === currentSessionId) {
            throw new AppError('Cannot revoke current session. Use logout instead.', 'SESSION_001', 400);
        }

        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId, revokedAt: null },
        });

        if (!session) {
            throw new NotFoundError('Session not found');
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }

    /**
     * Revoke all sessions except current
     */
    async revokeAllOtherSessions(
        userId: string,
        currentSessionId: string,
        password: string
    ): Promise<{ revokedCount: number }> {
        // Verify password
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid password', 'AUTH_001', 401);
        }

        const result = await prisma.session.updateMany({
            where: {
                userId,
                id: { not: currentSessionId },
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        return { revokedCount: result.count };
    }

    /**
     * Update session activity
     */
    async updateSessionActivity(sessionId: string): Promise<void> {
        await prisma.session.update({
            where: { id: sessionId },
            data: { lastActiveAt: new Date() },
        }).catch(() => {
            // Ignore errors for session updates
        });
    }

    /**
     * Validate session by token hash
     */
    async validateSession(tokenHash: string): Promise<string | null> {
        const session = await prisma.session.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        return session?.userId ?? null;
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private maskIpAddress(ip: string): string {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        // IPv6
        return ip.replace(/:.{1,4}:.{1,4}$/, ':xxxx:xxxx');
    }

    private formatLocation(location: unknown): string | null {
        if (!location || typeof location !== 'object') return null;
        const loc = location as { city?: string; country?: string };
        if (loc.city && loc.country) {
            return `${loc.city}, ${loc.country}`;
        }
        return loc.country ?? null;
    }
}

export const sessionService = new SessionService();
