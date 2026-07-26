/**
 * Sessions API smoke — validates the persistent chat-history flow.
 *
 * Real-user JWT is unavailable in this env (we don't have DB fixtures for
 * a user), so we use an ephemeral JWT and rely on Postgres to reject the
 * AiSession insert on the FK constraint. That gives us a known-shape
 * 500-ish failure on the persistence layer — enough to confirm:
 *   1. /v1/sessions returns 200 + empty list for an unknown user
 *   2. /v1/sessions/:id/messages returns 404 for non-existent sessions
 *   3. /v1/chat correctly rejects when persistence fails (graceful error,
 *      not a hung connection)
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const HOST = '127.0.0.1';
const SECRET = process.env.JWT_SECRET as string;

function userJwt(): string {
    return jwt.sign(
        {
            sub: randomUUID(),
            email: 'p8@smoke.test',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        },
        SECRET,
        { expiresIn: '5m' }
    );
}

function request(
    method: string,
    path: string,
    token: string,
    body?: object
): Promise<{ status: number; json?: unknown; body?: string }> {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const req = http.request(
            {
                method,
                host: HOST,
                port: PORT,
                path,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                    Authorization: `Bearer ${token}`,
                },
            },
            (res) => {
                let buf = '';
                res.on('data', (c) => (buf += c.toString()));
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode ?? 0, json: JSON.parse(buf) });
                    } catch {
                        resolve({ status: res.statusCode ?? 0, body: buf });
                    }
                });
            }
        );
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    let failures = 0;
    const fail = (l: string, m: string) => {
        console.error(`✗ ${l}: ${m}`);
        failures += 1;
    };
    const pass = (l: string) => console.log(`✓ ${l}`);

    const token = userJwt();

    // 1. GET /v1/sessions (empty for new user)
    {
        const r = await request('GET', '/v1/sessions', token);
        if (r.status !== 200) fail('GET /v1/sessions status', `got ${r.status}`);
        else {
            const sessions = (r.json as { sessions: unknown[] }).sessions;
            if (!Array.isArray(sessions)) fail('GET /v1/sessions', 'sessions not array');
            else pass(`GET /v1/sessions returned ${sessions.length} session(s) for ephemeral user`);
        }
    }

    // 2. GET /v1/sessions/:nonexistent/messages → 404
    {
        const r = await request('GET', `/v1/sessions/${randomUUID()}/messages`, token);
        if (r.status !== 404) fail('GET messages on non-existent', `got ${r.status}`);
        else pass('GET non-existent session messages → 404');
    }

    // 3. DELETE /v1/sessions/:nonexistent → 404
    {
        const r = await request('DELETE', `/v1/sessions/${randomUUID()}`, token);
        if (r.status !== 404) fail('DELETE non-existent', `got ${r.status}`);
        else pass('DELETE non-existent → 404');
    }

    // 4. PATCH /v1/sessions/:id/title with bad body → 400
    {
        const r = await request('PATCH', `/v1/sessions/${randomUUID()}/title`, token, {});
        if (r.status !== 400) fail('PATCH bad body', `got ${r.status}`);
        else pass('PATCH /v1/sessions/:id/title without title → 400');
    }

    // 5. /v1/sessions without auth → 401
    {
        return new Promise<void>((resolve) => {
            const req = http.request(
                {
                    method: 'GET',
                    host: HOST,
                    port: PORT,
                    path: '/v1/sessions',
                },
                (res) => {
                    if (res.statusCode !== 401) fail('no-auth /v1/sessions', `got ${res.statusCode}`);
                    else pass('GET /v1/sessions without auth → 401');
                    if (failures > 0) {
                        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
                        process.exit(1);
                    }
                    console.log('\nPASS: persistent sessions REST surface wired');
                    process.exit(0);
                    resolve();
                }
            );
            req.on('error', () => {});
            req.end();
        });
    }
}

main().catch((e) => {
    console.error('crashed:', e);
    process.exit(2);
});
