/**
 * P2 echo-SSE smoke test.
 *
 * Boots a JWT signed with the AI service's JWT_SECRET (read from .env),
 * POSTs /v1/chat, consumes the SSE stream, and asserts:
 *   - missing Authorization → 401
 *   - invalid JWT → 401
 *   - valid JWT → SSE stream begins with `session`, ends with `done`, and
 *     contains text_delta tokens that reassemble the input message
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const HOST = '127.0.0.1';
const SECRET = process.env.JWT_SECRET;

if (!SECRET || SECRET.length < 32) {
    console.error('Smoke test needs JWT_SECRET (>= 32 chars) in env or .env');
    process.exit(2);
}

interface SseEvent {
    type: string;
    payload: Record<string, unknown>;
}

function postChat(
    body: object,
    authorization?: string
): Promise<{ status: number; events: SseEvent[]; rawBody: string }> {
    return new Promise((resolve, reject) => {
        const json = JSON.stringify(body);
        const req = http.request(
            {
                method: 'POST',
                host: HOST,
                port: PORT,
                path: '/v1/chat',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(json),
                    ...(authorization ? { Authorization: authorization } : {}),
                },
            },
            (res) => {
                const status = res.statusCode ?? 0;
                let buf = '';
                res.on('data', (c) => {
                    buf += c.toString();
                });
                res.on('end', () => {
                    if (
                        !res.headers['content-type']?.includes('text/event-stream')
                    ) {
                        resolve({ status, events: [], rawBody: buf });
                        return;
                    }
                    const events = parseSse(buf);
                    resolve({ status, events, rawBody: buf });
                });
            }
        );
        req.on('error', reject);
        req.write(json);
        req.end();
    });
}

function parseSse(buf: string): SseEvent[] {
    const events: SseEvent[] = [];
    const blocks = buf.split('\n\n');
    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        let type = '';
        let data = '';
        for (const line of trimmed.split('\n')) {
            if (line.startsWith('event: ')) type = line.slice(7);
            else if (line.startsWith('data: ')) data = line.slice(6);
        }
        if (!type) continue;
        try {
            events.push({ type, payload: JSON.parse(data) });
        } catch {
            events.push({ type, payload: { raw: data } });
        }
    }
    return events;
}

function signJwt(payload: object): string {
    return jwt.sign(payload, SECRET as string, { expiresIn: '5m' });
}

async function main() {
    let failures = 0;

    // 1. No auth → 401
    {
        const { status } = await postChat({ message: 'hi' });
        if (status !== 401) {
            console.error(`✗ No-auth call returned ${status}, expected 401`);
            failures += 1;
        } else {
            console.log('✓ No-auth call → 401');
        }
    }

    // 2. Bad JWT → 401
    {
        const { status } = await postChat(
            { message: 'hi' },
            'Bearer not.a.real.token'
        );
        if (status !== 401) {
            console.error(`✗ Bad-token call returned ${status}, expected 401`);
            failures += 1;
        } else {
            console.log('✓ Bad-token call → 401');
        }
    }

    // 3. Valid JWT → SSE stream
    {
        const token = signJwt({
            sub: randomUUID(),
            email: 'smoke@example.com',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        });
        const message = 'hello world from the echo smoke test';
        const { status, events } = await postChat(
            { message },
            `Bearer ${token}`
        );

        if (status !== 200) {
            console.error(`✗ Valid-JWT call returned status ${status}`);
            failures += 1;
        }

        const first = events[0];
        const last = events[events.length - 1];
        const deltas = events
            .filter((e) => e.type === 'text_delta')
            .map((e) => e.payload.delta)
            .join('');

        if (first?.type !== 'session' || typeof first.payload.sessionId !== 'string') {
            console.error(`✗ First event was ${first?.type}, expected session(sessionId)`);
            failures += 1;
        } else {
            console.log(`✓ First event session=${first.payload.sessionId}`);
        }

        if (last?.type !== 'done') {
            console.error(`✗ Last event was ${last?.type}, expected done`);
            failures += 1;
        } else {
            console.log('✓ Last event done');
        }

        if (deltas !== message) {
            console.error(
                `✗ Reassembled text_deltas did not match. got="${deltas}" expected="${message}"`
            );
            console.error(`-- raw SSE body follows --\n${JSON.stringify(events, null, 2)}`);
            failures += 1;
        } else {
            console.log('✓ text_deltas reassemble exactly to input message');
        }
    }

    // 4. Validation: empty message → 400
    {
        const token = signJwt({
            sub: randomUUID(),
            email: 'smoke@example.com',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        });
        const { status } = await postChat({ message: '' }, `Bearer ${token}`);
        if (status !== 400) {
            console.error(`✗ Empty-message call returned ${status}, expected 400`);
            failures += 1;
        } else {
            console.log('✓ Empty-message call → 400');
        }
    }

    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: AI service P2 echo surface is wired correctly');
    process.exit(0);
}

main().catch((e) => {
    console.error('Smoke test crashed:', e);
    process.exit(2);
});
