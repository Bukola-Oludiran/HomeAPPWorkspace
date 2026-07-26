/**
 * AI service HTTP surface.
 *
 *   POST   /v1/chat                     — main chat turn (SSE response)
 *   GET    /v1/sessions                 — sidebar history (list user's sessions)
 *   GET    /v1/sessions/:id/messages    — replay a past conversation
 *   PATCH  /v1/sessions/:id/title       — rename a conversation
 *   DELETE /v1/sessions/:id             — delete a conversation
 *   POST   /v1/_dev/tool/:name          — dev-only direct tool invocation
 *   GET    /v1/healthz                  — liveness
 *
 * Trust model: every authenticated route validates the bearer JWT with
 * the same secret as the backend's HTTP middleware; every session-scoped
 * query is filtered by `ctx.user.userId` server-side regardless of
 * route-param input.
 */

import cors from 'cors';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from './logger';
import { env } from './config/env';
import { AuthError, SessionUser, extractBearer, verifyJwt } from './auth/verify-jwt';
import { sessionStore } from './auth/session-store';
import { SseWriter } from './streaming/sse';
import { TeeRecorder } from './streaming/recorder';
import { sessionPersistence } from './sessions/store-db';
import { SessionRunner } from './session/runner';
import { LlmRunner, LlmNotConfigured } from './llm/runner';
import { auditLogger } from './audit/logger';
import { chatRateLimiter } from './middleware/rate-limit';

export function createApp(): express.Application {
    const app = express();

    // CORS: the frontend (Vite dev server) lives on a different port.
    app.use(
        cors({
            origin: (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(','),
            credentials: true,
        })
    );
    app.use(express.json({ limit: '1mb' }));

    app.get('/v1/healthz', (_req, res) => {
        res.json({ ok: true, ts: new Date().toISOString() });
    });

    // ----------------------------------------------------------------
    // Auth helper — extracts user or sends 401.
    // ----------------------------------------------------------------
    function withAuth(req: Request, res: Response): { user: SessionUser; jwt: string } | null {
        try {
            const jwt = extractBearer(req.headers.authorization);
            const user = verifyJwt(jwt);
            return { user, jwt };
        } catch (e) {
            if (e instanceof AuthError) {
                auditLogger.write({ type: 'auth_failure', summary: e.message });
                res.status(401).json({ ok: false, code: e.code, message: e.message });
            } else {
                res.status(500).json({ ok: false, code: 'INTERNAL', message: 'auth failure' });
            }
            return null;
        }
    }

    // ----------------------------------------------------------------
    // /v1/chat
    // ----------------------------------------------------------------
    const chatBody = z.object({
        sessionId: z.string().uuid().optional(),
        message: z.string().min(1).max(8_000),
        contextSeed: z
            .object({
                propertyId: z.string().uuid().optional(),
                leaseId: z.string().uuid().optional(),
                applicationId: z.string().uuid().optional(),
                conversationId: z.string().uuid().optional(),
                maintenanceRequestId: z.string().uuid().optional(),
            })
            .optional(),
    });

    app.post('/v1/chat', async (req: Request, res: Response) => {
        const auth = withAuth(req, res);
        if (!auth) return;
        const { user, jwt } = auth;

        const rate = chatRateLimiter.check(user.userId);
        if (!rate.ok) {
            auditLogger.write({
                type: 'rate_limited',
                userId: user.userId,
                meta: { retryAfterMs: rate.retryAfterMs },
            });
            res.status(429)
                .header('Retry-After', String(Math.ceil((rate.retryAfterMs ?? 1000) / 1000)))
                .json({
                    ok: false,
                    code: 'RATE_LIMIT',
                    message: 'Too many chat turns; retry shortly.',
                    retryAfterMs: rate.retryAfterMs,
                });
            return;
        }

        const parsed = chatBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Invalid chat request',
                details: parsed.error.errors,
            });
            return;
        }
        const { sessionId: incomingId, message, contextSeed } = parsed.data;

        // Session resolve-or-create. A FK-violation here (e.g. JWT sub
        // doesn't correspond to a real user) is surfaced as 500 — the
        // alternative is leaking the request into an unowned session.
        let session;
        try {
            session = incomingId ? sessionStore.get(incomingId) : undefined;
            if (incomingId && !session) {
                session = (await sessionStore.rehydrate(incomingId, jwt, user)) ?? undefined;
            }
            if (!session) {
                session = await sessionStore.create(jwt, user, contextSeed);
            } else {
                sessionStore.touch(session.sessionId);
            }

            await sessionPersistence.append({
                sessionId: session.sessionId,
                role: 'USER',
                content: message,
            });
            await sessionPersistence.maybeAutoTitle(session.sessionId, message);
        } catch (e) {
            const msg = (e as Error)?.message ?? 'session persistence failed';
            logger.error(`/v1/chat persistence failed: ${msg}`);
            res.status(500).json({
                ok: false,
                code: 'SESSION_PERSISTENCE',
                message:
                    'Could not initialize chat session. If you signed up before AI sessions launched, the user record may not exist in this database.',
            });
            return;
        }

        // Open SSE; wrap with a tee so we can capture the assistant turn.
        const sse = new SseWriter(res);
        const tee = new TeeRecorder(sse);
        res.on('close', () => sse.end());
        tee.write({ type: 'session', sessionId: session.sessionId });

        const turnStart = Date.now();
        try {
            if (env.ANTHROPIC_API_KEY) {
                const llm = new LlmRunner(session, tee);
                await llm.runTurn(message);
            } else {
                tee.write({
                    type: 'text_delta',
                    delta: '(LLM not configured. Set ANTHROPIC_API_KEY for tool-driven chat. Echo follows.)\n\n',
                });
                for (const w of message.split(/(\s+)/)) {
                    if (tee.isClosed) break;
                    tee.write({ type: 'text_delta', delta: w });
                    await new Promise((r) => setTimeout(r, 30));
                }
            }
        } catch (e) {
            const errorMsg =
                e instanceof LlmNotConfigured
                    ? e.message
                    : `Chat failure: ${(e as Error).message ?? 'unknown'}`;
            tee.write({ type: 'error', code: 'LLM', message: errorMsg });
            logger.error(errorMsg);
        } finally {
            tee.write({ type: 'done' });
            tee.end();
        }

        // Persist the assistant turn — text + structured fragments.
        const captured = tee.capture();
        if (captured.text || captured.fragments.length > 0) {
            await sessionPersistence
                .append({
                    sessionId: session.sessionId,
                    role: 'ASSISTANT',
                    content: captured.text,
                    payload:
                        captured.fragments.length > 0 || captured.toolCalls.length > 0
                            ? {
                                  fragments: captured.fragments,
                                  toolCalls: captured.toolCalls,
                              }
                            : undefined,
                })
                .catch((e) => logger.error(`persist assistant message failed: ${e.message}`));
        }

        auditLogger.write({
            type: 'chat_turn',
            sessionId: session.sessionId,
            userId: user.userId,
            durationMs: Date.now() - turnStart,
            summary: message.slice(0, 100),
        });
    });

    // ----------------------------------------------------------------
    // /v1/sessions — sidebar history
    // ----------------------------------------------------------------
    app.get('/v1/sessions', async (req: Request, res: Response) => {
        const auth = withAuth(req, res);
        if (!auth) return;
        const sessions = await sessionPersistence.list(auth.user.userId);
        res.json({ ok: true, sessions });
    });

    app.get('/v1/sessions/:id/messages', async (req: Request, res: Response) => {
        const auth = withAuth(req, res);
        if (!auth) return;
        const messages = await sessionPersistence.loadMessages(req.params.id, auth.user.userId);
        if (!messages) {
            res.status(404).json({ ok: false, code: 'NOT_FOUND', message: 'No such session' });
            return;
        }
        res.json({ ok: true, sessionId: req.params.id, messages });
    });

    const titleBody = z.object({ title: z.string().min(1).max(255) });
    app.patch('/v1/sessions/:id/title', async (req: Request, res: Response) => {
        const auth = withAuth(req, res);
        if (!auth) return;
        const parsed = titleBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ ok: false, code: 'VALIDATION_ERROR' });
            return;
        }
        const ok = await sessionPersistence.setTitle(
            req.params.id,
            auth.user.userId,
            parsed.data.title
        );
        if (!ok) {
            res.status(404).json({ ok: false, code: 'NOT_FOUND' });
            return;
        }
        res.json({ ok: true });
    });

    app.delete('/v1/sessions/:id', async (req: Request, res: Response) => {
        const auth = withAuth(req, res);
        if (!auth) return;
        const ok = await sessionPersistence.delete(req.params.id, auth.user.userId);
        if (!ok) {
            res.status(404).json({ ok: false, code: 'NOT_FOUND' });
            return;
        }
        res.json({ ok: true });
    });

    // ----------------------------------------------------------------
    // Dev-only direct-tool endpoint.
    // ----------------------------------------------------------------
    if (env.NODE_ENV !== 'production') {
        const devToolBody = z.object({
            args: z.unknown().optional(),
            skipConfirm: z.boolean().optional(),
        });

        app.post('/v1/_dev/tool/:name', async (req: Request, res: Response) => {
            const auth = withAuth(req, res);
            if (!auth) return;

            const parsed = devToolBody.safeParse(req.body ?? {});
            if (!parsed.success) {
                res.status(400).json({
                    ok: false,
                    code: 'VALIDATION_ERROR',
                    details: parsed.error.errors,
                });
                return;
            }

            // Dev endpoint uses ephemeral sessions (no DB row) so smoke
            // tests with synthetic JWTs don't FK-violate.
            const session = sessionStore.createEphemeral(auth.jwt, auth.user);
            const sse = new SseWriter(res);
            res.on('close', () => sse.end());

            sse.write({ type: 'session', sessionId: session.sessionId });
            const runner = new SessionRunner(session, sse);
            await runner.invokeDirect({
                toolName: req.params.name,
                args: parsed.data.args ?? {},
                skipConfirm: parsed.data.skipConfirm,
            });
            sse.end();

            logger.debug(
                `dev tool invocation: user=${auth.user.userId} tool=${req.params.name}`
            );
        });
    }

    return app;
}
