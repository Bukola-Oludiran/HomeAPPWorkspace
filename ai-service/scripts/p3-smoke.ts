/**
 * P3 smoke test — direct tool invocation via /v1/_dev/tool/:name.
 *
 * Exercises the full DB + gRPC + UI fragment + SSE pipeline without an
 * LLM. The LLM-driven path (P3.11) requires ANTHROPIC_API_KEY and is a
 * follow-up.
 *
 * Scenarios:
 *   1. properties.search returns a PropertyGrid fragment + tool_call_result.
 *   2. maintenance.submit (without skipConfirm) emits ConfirmationCard +
 *      confirm_required, and the tool body does NOT run.
 *   3. ui.render directly emits the requested fragment.
 *   4. An unknown tool name returns an ErrorCard + error event.
 *
 * The maintenance happy-path (skipConfirm + real DB row) is not exercised
 * here because it requires a real propertyId from an active lease. The
 * confirm-gate test gives us most of the wiring assurance.
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
    console.error('Smoke test needs JWT_SECRET in env or .env');
    process.exit(2);
}

interface SseEvent {
    type: string;
    payload: Record<string, unknown>;
}

function postDev(
    toolName: string,
    body: object,
    authorization: string
): Promise<{ status: number; events: SseEvent[] }> {
    return new Promise((resolve, reject) => {
        const json = JSON.stringify(body);
        const req = http.request(
            {
                method: 'POST',
                host: HOST,
                port: PORT,
                path: `/v1/_dev/tool/${encodeURIComponent(toolName)}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(json),
                    Authorization: authorization,
                },
            },
            (res) => {
                const status = res.statusCode ?? 0;
                let buf = '';
                res.on('data', (c) => {
                    buf += c.toString();
                });
                res.on('end', () => {
                    if (!res.headers['content-type']?.includes('text/event-stream')) {
                        resolve({ status, events: [] });
                        return;
                    }
                    resolve({ status, events: parseSse(buf) });
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
    for (const block of buf.split('\n\n')) {
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

function userJwt(role: 'TENANT' | 'LANDLORD' | 'AGENT' = 'TENANT'): string {
    return jwt.sign(
        {
            sub: randomUUID(),
            email: `${role.toLowerCase()}@smoke.test`,
            role,
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        },
        SECRET as string,
        { expiresIn: '5m' }
    );
}

async function main() {
    let failures = 0;
    const fail = (label: string, msg: string) => {
        console.error(`✗ ${label}: ${msg}`);
        failures += 1;
    };
    const pass = (label: string) => console.log(`✓ ${label}`);

    // 1. properties.search
    {
        const auth = `Bearer ${userJwt('TENANT')}`;
        const { status, events } = await postDev(
            'properties.search',
            { args: { limit: 5 } },
            auth
        );
        if (status !== 200) fail('properties.search status', `got ${status}`);
        else {
            const hasUi = events.some(
                (e) =>
                    e.type === 'ui' &&
                    (e.payload.component as { type?: string })?.type === 'PropertyGrid'
            );
            const hasResult = events.some(
                (e) => e.type === 'tool_call_result' && (e.payload as any).ok === true
            );
            const ended = events.at(-1)?.type === 'done';
            if (!hasUi) fail('properties.search', 'no PropertyGrid ui event');
            if (!hasResult) fail('properties.search', 'no tool_call_result event');
            if (!ended) fail('properties.search', `last event was ${events.at(-1)?.type}`);
            if (hasUi && hasResult && ended) {
                pass('properties.search → PropertyGrid + tool_call_result + done');
            }
        }
    }

    // 2. maintenance.submit confirm-gate (no skipConfirm)
    {
        const auth = `Bearer ${userJwt('TENANT')}`;
        const { status, events } = await postDev(
            'maintenance.submit',
            {
                args: {
                    propertyId: randomUUID(),
                    category: 'PLUMBING',
                    description: 'smoke test only — should be gated by confirmation, never executed',
                    priority: 'MEDIUM',
                },
            },
            auth
        );
        if (status !== 200) fail('maintenance.submit status', `got ${status}`);
        else {
            const hasConfirmEvt = events.some((e) => e.type === 'confirm_required');
            const hasConfirmCard = events.some(
                (e) =>
                    e.type === 'ui' &&
                    (e.payload.component as { type?: string })?.type === 'ConfirmationCard'
            );
            const hasResult = events.some((e) => e.type === 'tool_call_result');
            if (!hasConfirmEvt) fail('maintenance.submit', 'no confirm_required event');
            if (!hasConfirmCard) fail('maintenance.submit', 'no ConfirmationCard ui event');
            if (hasResult)
                fail(
                    'maintenance.submit',
                    'tool_call_result fired before user confirmed (gate bypassed!)'
                );
            if (hasConfirmEvt && hasConfirmCard && !hasResult) {
                pass('maintenance.submit (no skipConfirm) → confirm-gated, body not run');
            }
        }
    }

    // 3. ui.render with a QuickActionGroup
    {
        const auth = `Bearer ${userJwt('TENANT')}`;
        const { status, events } = await postDev(
            'ui.render',
            {
                args: {
                    fragment: {
                        type: 'QuickActionGroup',
                        props: {
                            prompt: 'How urgent is this?',
                            actions: [
                                { id: 'low', label: 'Whenever', kind: 'subtle' },
                                { id: 'medium', label: 'This week', kind: 'secondary' },
                                { id: 'emergency', label: 'Right now', kind: 'danger' },
                            ],
                        },
                    },
                },
                skipConfirm: true,
            },
            auth
        );
        if (status !== 200) fail('ui.render status', `got ${status}`);
        else {
            const ui = events.find(
                (e) =>
                    e.type === 'ui' &&
                    (e.payload.component as { type?: string })?.type === 'QuickActionGroup'
            );
            if (!ui) fail('ui.render', 'no QuickActionGroup ui event');
            else pass('ui.render → QuickActionGroup emitted');
        }
    }

    // 4. unknown tool
    {
        const auth = `Bearer ${userJwt('TENANT')}`;
        const { status, events } = await postDev(
            'does.not.exist',
            { args: {} },
            auth
        );
        if (status !== 200) fail('unknown-tool status', `got ${status}`);
        else {
            const hasErrorCard = events.some(
                (e) =>
                    e.type === 'ui' &&
                    (e.payload.component as { type?: string })?.type === 'ErrorCard'
            );
            const hasErrorEvt = events.some(
                (e) => e.type === 'error' && (e.payload as any).code === 'TOOL_NOT_FOUND'
            );
            if (!hasErrorCard) fail('unknown-tool', 'no ErrorCard fragment');
            if (!hasErrorEvt) fail('unknown-tool', 'no error event');
            if (hasErrorCard && hasErrorEvt) pass('unknown-tool → ErrorCard + error event');
        }
    }

    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: P3 substrate (DB read + UI fragments + confirm gate + error path) wired correctly');
    process.exit(0);
}

main().catch((e) => {
    console.error('Smoke test crashed:', e);
    process.exit(2);
});
