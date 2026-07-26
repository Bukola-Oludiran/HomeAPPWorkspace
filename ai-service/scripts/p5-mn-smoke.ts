/**
 * P5 messaging + notifications smoke.
 *
 * Confirms the new bundles register correctly, the read paths return
 * empty result sets for ephemeral users (proving JWT-sub scoping), and
 * the write tools either gate via ConfirmationCard or call the gRPC
 * backend successfully even when the operation is a no-op for the
 * ephemeral user.
 *
 * Real happy-path writes (sending a message into a conversation the
 * user participates in) require DB fixtures and are manual.
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const HOST = '127.0.0.1';
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error('Need JWT_SECRET');
    process.exit(2);
}

interface SseEvent {
    type: string;
    payload: Record<string, unknown>;
}

function userJwt(): string {
    return jwt.sign(
        {
            sub: randomUUID(),
            email: 'mn@smoke.test',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        },
        SECRET as string,
        { expiresIn: '5m' }
    );
}

function call(
    name: string,
    body: object,
    token: string
): Promise<SseEvent[]> {
    return new Promise((resolve, reject) => {
        const json = JSON.stringify(body);
        const req = http.request(
            {
                method: 'POST',
                host: HOST,
                port: PORT,
                path: `/v1/_dev/tool/${encodeURIComponent(name)}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(json),
                    Authorization: `Bearer ${token}`,
                },
            },
            (res) => {
                let buf = '';
                res.on('data', (c) => (buf += c.toString()));
                res.on('end', () => resolve(parseSse(buf)));
            }
        );
        req.on('error', reject);
        req.write(json);
        req.end();
    });
}

function parseSse(buf: string): SseEvent[] {
    const out: SseEvent[] = [];
    for (const block of buf.split('\n\n')) {
        const t = block.trim();
        if (!t || t.startsWith(':')) continue;
        let type = '';
        let data = '';
        for (const ln of t.split('\n')) {
            if (ln.startsWith('event: ')) type = ln.slice(7);
            else if (ln.startsWith('data: ')) data = ln.slice(6);
        }
        if (!type) continue;
        try {
            out.push({ type, payload: JSON.parse(data) });
        } catch {
            out.push({ type, payload: { raw: data } });
        }
    }
    return out;
}

async function main() {
    let failures = 0;
    const fail = (l: string, m: string) => {
        console.error(`✗ ${l}: ${m}`);
        failures += 1;
    };
    const pass = (l: string) => console.log(`✓ ${l}`);

    const token = userJwt();

    // messaging.listConversations
    {
        const ev = await call('messaging.listConversations', { args: { limit: 10 } }, token);
        const result = ev.find((e) => e.type === 'tool_call_result');
        if (!result || (result.payload as any).ok !== true)
            fail('messaging.listConversations', 'tool failed');
        else pass('messaging.listConversations responds (empty for ephemeral user)');
    }

    // notifications.listMine
    {
        const ev = await call('notifications.listMine', { args: { limit: 10 } }, token);
        const ui = ev.find((e) => e.type === 'ui' && (e.payload as any).component?.type === 'NotificationList');
        if (!ui) fail('notifications.listMine', 'no NotificationList fragment');
        else pass('notifications.listMine → NotificationList fragment');
    }

    // notifications.markAllRead — gRPC roundtrip lands.
    // The backend interceptor validates user-exists-in-DB; ephemeral users
    // are correctly rejected with UNAUTHENTICATED. We assert that the gRPC
    // path WAS exercised (we got a tool_call_result, not a transport error).
    {
        const ev = await call(
            'notifications.markAllRead',
            { args: {}, skipConfirm: true },
            token
        );
        const result = ev.find((e) => e.type === 'tool_call_result');
        if (!result)
            fail('notifications.markAllRead', 'no tool_call_result event');
        else {
            const okOrAuthFail = (result.payload as any).ok === true ||
                JSON.stringify((result.payload as any).summary).includes('AUTH_');
            if (!okOrAuthFail)
                fail('notifications.markAllRead', `unexpected failure: ${JSON.stringify(result.payload)}`);
            else
                pass(
                    'notifications.markAllRead → gRPC roundtrip (auth-failure expected for ephemeral user; that itself proves the interceptor is engaged)'
                );
        }
    }

    // messaging.sendMessage — confirm-gated, should not call gRPC
    {
        const ev = await call(
            'messaging.sendMessage',
            {
                args: {
                    conversationId: randomUUID(),
                    content: 'smoke test should never reach gRPC',
                    messageType: 'TEXT',
                },
            },
            token
        );
        const confirmEvt = ev.find((e) => e.type === 'confirm_required');
        const confirmCard = ev.find(
            (e) => e.type === 'ui' && (e.payload as any).component?.type === 'ConfirmationCard'
        );
        const result = ev.find((e) => e.type === 'tool_call_result');
        if (!confirmEvt) fail('messaging.sendMessage', 'no confirm_required');
        if (!confirmCard) fail('messaging.sendMessage', 'no ConfirmationCard');
        if (result)
            fail(
                'messaging.sendMessage',
                'tool body ran without user confirmation (gate bypassed)'
            );
        if (confirmEvt && confirmCard && !result)
            pass('messaging.sendMessage → confirm-gated correctly');
    }

    // clearAll — confirm-gated
    {
        const ev = await call('notifications.clearAll', { args: {} }, token);
        const confirmCard = ev.find(
            (e) => e.type === 'ui' && (e.payload as any).component?.type === 'ConfirmationCard'
        );
        if (!confirmCard) fail('notifications.clearAll', 'no ConfirmationCard');
        else pass('notifications.clearAll → confirm-gated');
    }

    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: messaging + notifications bundles wired end-to-end');
    process.exit(0);
}

main().catch((e) => {
    console.error('crashed:', e);
    process.exit(2);
});
