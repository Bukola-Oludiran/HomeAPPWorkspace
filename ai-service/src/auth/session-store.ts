/**
 * In-memory session store + DB-backed persistence coordination.
 *
 * Volatile state (JWT, last-activity, agent runtime) stays in memory;
 * the persistent record (AiSession + message history) lives in Postgres
 * via `sessionPersistence`. The in-memory `sessionId` is the SAME UUID
 * as the DB row, so frontend deep-links and the SSE protocol use a
 * single identifier.
 *
 * JWT is process-memory only — never written to the DB.
 */

import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { sessionPersistence } from '../sessions/store-db';
import type { SessionUser } from './verify-jwt';

export interface SessionState {
    sessionId: string;
    jwt: string;
    user: SessionUser;
    createdAt: number;
    lastActivity: number;
    /** Snapshot of the contextSeed passed when the AiSession row was created. */
    contextSeed?: Record<string, unknown>;
}

class SessionStore {
    private sessions = new Map<string, SessionState>();
    private readonly ttlMs: number;

    constructor() {
        this.ttlMs = env.SESSION_TTL_MINUTES * 60 * 1000;
        setInterval(() => this.evictStale(), 60_000).unref();
    }

    async create(
        jwt: string,
        user: SessionUser,
        contextSeed?: Record<string, unknown>
    ): Promise<SessionState> {
        const { id } = await sessionPersistence.create({
            userId: user.userId,
            contextSeed,
        });
        const now = Date.now();
        const state: SessionState = {
            sessionId: id,
            jwt,
            user,
            createdAt: now,
            lastActivity: now,
            contextSeed,
        };
        this.sessions.set(id, state);
        return state;
    }

    /**
     * Ephemeral, in-memory-only session — no DB row created.
     * Used by the dev-only direct-tool endpoint and by tests where the
     * authenticated JWT doesn't correspond to a real `users` row (which
     * would FK-violate on `ai_sessions.user_id`).
     */
    createEphemeral(jwt: string, user: SessionUser): SessionState {
        const id = randomUUID();
        const now = Date.now();
        const state: SessionState = {
            sessionId: id,
            jwt,
            user,
            createdAt: now,
            lastActivity: now,
        };
        this.sessions.set(id, state);
        return state;
    }

    /**
     * Rehydrate a previously-persisted session into memory when the user
     * resumes from the sidebar. Verifies ownership via the DB row's userId.
     */
    async rehydrate(
        sessionId: string,
        jwt: string,
        user: SessionUser
    ): Promise<SessionState | null> {
        const messages = await sessionPersistence.loadMessages(sessionId, user.userId);
        if (!messages) return null;
        const now = Date.now();
        const state: SessionState = {
            sessionId,
            jwt,
            user,
            createdAt: now,
            lastActivity: now,
        };
        this.sessions.set(sessionId, state);
        return state;
    }

    get(sessionId: string): SessionState | undefined {
        const state = this.sessions.get(sessionId);
        if (!state) return undefined;
        if (Date.now() - state.lastActivity > this.ttlMs) {
            this.sessions.delete(sessionId);
            return undefined;
        }
        return state;
    }

    touch(sessionId: string): void {
        const state = this.sessions.get(sessionId);
        if (state) state.lastActivity = Date.now();
    }

    /**
     * Re-attach an incoming JWT to an existing session. The user's JWT may
     * have rotated between turns (refresh-token flow); we accept any JWT
     * whose `sub` matches the session's original user.
     */
    rebind(sessionId: string, jwt: string, user: SessionUser): SessionState | undefined {
        const state = this.sessions.get(sessionId);
        if (!state) return undefined;
        if (state.user.userId !== user.userId) return undefined;
        state.jwt = jwt;
        state.user = user;
        state.lastActivity = Date.now();
        return state;
    }

    delete(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    private evictStale(): void {
        const now = Date.now();
        for (const [id, state] of this.sessions) {
            if (now - state.lastActivity > this.ttlMs) {
                this.sessions.delete(id);
            }
        }
    }
}

export const sessionStore = new SessionStore();
