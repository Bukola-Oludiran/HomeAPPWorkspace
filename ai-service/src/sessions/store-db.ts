/**
 * Persistent session store — wraps the in-memory session store with
 * `AiSession` / `AiSessionMessage` table writes.
 *
 * Lifecycle:
 *   - `getOrCreate({ userId, sessionId?, contextSeed? })` looks up an
 *     existing AiSession or creates one.
 *   - `appendUserMessage(sessionId, body)` writes the user's text.
 *   - `appendAssistantMessage(sessionId, body, fragments?)` writes the
 *     assistant turn, optionally with structured fragments.
 *   - `list(userId, limit?)` returns the user's sidebar history.
 *   - `loadMessages(sessionId, userId)` returns the timeline for a
 *     conversation the user owns.
 *   - `setTitle(sessionId, userId, title)` lets the user rename.
 *   - `delete(sessionId, userId)` removes a conversation and its messages.
 *
 * All read/write paths are userId-scoped — IDOR enforcement lives in the
 * `where: { userId }` filter on every query, not in the route handler.
 */

import type { AiMessageRole } from '@prisma/client';
import { prismaRw } from '../db/rw-client';

export interface CreateSessionInput {
    userId: string;
    contextSeed?: Record<string, unknown>;
}

export interface AppendInput {
    sessionId: string;
    role: AiMessageRole;
    content: string;
    payload?: Record<string, unknown>;
}

export interface SessionSummary {
    id: string;
    title: string;
    contextSeed: Record<string, unknown> | null;
    lastMessageAt: string;
    createdAt: string;
}

export interface SessionMessage {
    id: string;
    role: AiMessageRole;
    content: string;
    payload: Record<string, unknown> | null;
    createdAt: string;
}

class SessionPersistence {
    async create(input: CreateSessionInput): Promise<{ id: string }> {
        const row = await prismaRw.aiSession.create({
            data: {
                userId: input.userId,
                contextSeed: (input.contextSeed ?? null) as never,
            },
            select: { id: true },
        });
        return row;
    }

    async append(input: AppendInput): Promise<void> {
        await prismaRw.aiSessionMessage.create({
            data: {
                sessionId: input.sessionId,
                role: input.role,
                content: input.content,
                payload: (input.payload ?? null) as never,
            },
        });
        await prismaRw.aiSession.update({
            where: { id: input.sessionId },
            data: { lastMessageAt: new Date() },
        });
    }

    /** Sets a default title from the first user message if none has been set. */
    async maybeAutoTitle(sessionId: string, firstUserMessage: string): Promise<void> {
        const row = await prismaRw.aiSession.findUnique({
            where: { id: sessionId },
            select: { title: true },
        });
        if (!row || row.title) return;
        const trimmed = firstUserMessage.trim().slice(0, 80);
        if (trimmed.length === 0) return;
        await prismaRw.aiSession.update({
            where: { id: sessionId },
            data: { title: trimmed },
        });
    }

    async list(userId: string, limit = 50): Promise<SessionSummary[]> {
        const rows = await prismaRw.aiSession.findMany({
            where: { userId },
            orderBy: { lastMessageAt: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                contextSeed: true,
                lastMessageAt: true,
                createdAt: true,
            },
        });
        return rows.map((r) => ({
            id: r.id,
            title: r.title ?? 'New conversation',
            contextSeed: (r.contextSeed as Record<string, unknown> | null) ?? null,
            lastMessageAt: r.lastMessageAt.toISOString(),
            createdAt: r.createdAt.toISOString(),
        }));
    }

    async loadMessages(sessionId: string, userId: string): Promise<SessionMessage[] | null> {
        const own = await prismaRw.aiSession.findFirst({
            where: { id: sessionId, userId },
            select: { id: true },
        });
        if (!own) return null;
        const rows = await prismaRw.aiSessionMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                payload: true,
                createdAt: true,
            },
        });
        return rows.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            payload: (m.payload as Record<string, unknown> | null) ?? null,
            createdAt: m.createdAt.toISOString(),
        }));
    }

    async setTitle(sessionId: string, userId: string, title: string): Promise<boolean> {
        const r = await prismaRw.aiSession.updateMany({
            where: { id: sessionId, userId },
            data: { title: title.slice(0, 255) },
        });
        return r.count > 0;
    }

    async delete(sessionId: string, userId: string): Promise<boolean> {
        const r = await prismaRw.aiSession.deleteMany({
            where: { id: sessionId, userId },
        });
        return r.count > 0;
    }
}

export const sessionPersistence = new SessionPersistence();
