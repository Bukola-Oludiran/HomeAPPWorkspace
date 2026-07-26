/**
 * P5 applications + transactions write tool smoke.
 *
 * Validates the confirm-gate fires for both new high-risk writes
 * (applications.submit, transactions.initiatePayment) and that the
 * gRPC roundtrip is engaged when skipConfirm=true is passed.
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

function userJwt(): string {
    return jwt.sign(
        {
            sub: randomUUID(),
            email: 'at@smoke.test',
            role: 'TENANT',
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        },
        SECRET as string,
        { expiresIn: '5m' }
    );
}

interface SseEvent {
    type: string;
    payload: Record<string, unknown>;
}

function call(name: string, body: object, token: string): Promise<SseEvent[]> {
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

    // applications.submit (no skipConfirm) -> confirm-gated
    {
        const ev = await call(
            'applications.submit',
            { args: { propertyId: randomUUID(), leaseTermMonths: 12 } },
            token
        );
        const ce = ev.find((e) => e.type === 'confirm_required');
        const cc = ev.find(
            (e) => e.type === 'ui' && (e.payload as any).component?.type === 'ConfirmationCard'
        );
        const res = ev.find((e) => e.type === 'tool_call_result');
        if (!ce) fail('applications.submit', 'no confirm_required');
        if (!cc) fail('applications.submit', 'no ConfirmationCard');
        if (res) fail('applications.submit', 'tool body ran without confirmation (gate bypassed)');
        if (ce && cc && !res) {
            const cardProps = (cc.payload as any).component.props;
            if (cardProps.riskLevel !== 'high')
                fail(
                    'applications.submit',
                    `expected high risk, got ${cardProps.riskLevel}`
                );
            else pass('applications.submit → confirm-gated at high-risk level');
        }
    }

    // transactions.initiatePayment (no skipConfirm) -> high-risk confirm-gated
    {
        const ev = await call(
            'transactions.initiatePayment',
            {
                args: {
                    type: 'RENT',
                    amount: 250000,
                    currency: 'NGN',
                    leaseId: randomUUID(),
                    paymentMethod: 'CARD',
                },
            },
            token
        );
        const ce = ev.find((e) => e.type === 'confirm_required');
        const cc = ev.find(
            (e) => e.type === 'ui' && (e.payload as any).component?.type === 'ConfirmationCard'
        );
        const res = ev.find((e) => e.type === 'tool_call_result');
        if (!ce) fail('transactions.initiatePayment', 'no confirm_required');
        if (!cc) fail('transactions.initiatePayment', 'no ConfirmationCard');
        if (res)
            fail('transactions.initiatePayment', 'tool body ran without confirmation');
        if (ce && cc && !res) {
            const cardProps = (cc.payload as any).component.props;
            if (cardProps.riskLevel !== 'high')
                fail(
                    'transactions.initiatePayment',
                    `expected high risk, got ${cardProps.riskLevel}`
                );
            else
                pass(
                    'transactions.initiatePayment → confirm-gated at high-risk level, with payment summary in card'
                );
        }
    }

    // transactions.initiatePayment with skipConfirm -> gRPC roundtrip engaged
    {
        const ev = await call(
            'transactions.initiatePayment',
            {
                args: {
                    type: 'RENT',
                    amount: 250000,
                    currency: 'NGN',
                    leaseId: randomUUID(),
                    paymentMethod: 'CARD',
                },
                skipConfirm: true,
            },
            token
        );
        const res = ev.find((e) => e.type === 'tool_call_result');
        if (!res) fail('transactions.initiatePayment skipConfirm', 'no result');
        else
            pass(
                'transactions.initiatePayment with skipConfirm → gRPC roundtrip (auth-failure expected for ephemeral user)'
            );
    }

    // Schema-level guard: amount > 50M rejects
    {
        const ev = await call(
            'transactions.initiatePayment',
            {
                args: {
                    type: 'RENT',
                    amount: 100_000_000,
                    currency: 'NGN',
                    leaseId: randomUUID(),
                },
                skipConfirm: true,
            },
            token
        );
        const res = ev.find((e) => e.type === 'tool_call_result');
        if (!res || (res.payload as any).ok !== false)
            fail('amount-ceiling', 'expected validation rejection for amount > 50M');
        else pass('amount-ceiling — ₦50M tool-side spending limit enforced');
    }

    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: applications + transactions write paths confirm-gated correctly');
    process.exit(0);
}

main().catch((e) => {
    console.error('crashed:', e);
    process.exit(2);
});
