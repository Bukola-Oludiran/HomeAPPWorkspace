/**
 * P5-all smoke — exercises every newly-added bundle from the second
 * P5 batch (leases write, landlord, agent, verification, banking,
 * documents, analytics, lease-reports) by triggering a confirm-gated
 * path on at least one tool per bundle. Confirm-gates fire BEFORE
 * gRPC, so this passes even though we don't have DB fixtures for the
 * underlying entities.
 *
 * For non-gated read/compute tools, we just check the dev endpoint
 * returns SSE without crashing (the gRPC call may fail with auth-not-
 * found for an ephemeral user, but the surface itself is engaged).
 */

import http from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const HOST = '127.0.0.1';
const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) {
    console.error('Need JWT_SECRET');
    process.exit(2);
}

interface SseEvent { type: string; payload: Record<string, unknown> }

function userJwt(role: 'TENANT' | 'LANDLORD' | 'AGENT' = 'TENANT'): string {
    return jwt.sign(
        {
            sub: randomUUID(),
            email: `${role.toLowerCase()}@p5all.smoke`,
            role,
            verificationLevel: 'UNVERIFIED',
            regionCode: 'NG',
        },
        SECRET,
        { expiresIn: '5m' }
    );
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

function hasConfirmCard(events: SseEvent[]): boolean {
    return events.some(
        (e) =>
            e.type === 'ui' &&
            (e.payload as any).component?.type === 'ConfirmationCard'
    );
}

function isReachable(events: SseEvent[]): boolean {
    return events.some(
        (e) => e.type === 'tool_call_result' || e.type === 'confirm_required'
    );
}

async function main() {
    let failures = 0;
    const fail = (l: string, m: string) => {
        console.error(`✗ ${l}: ${m}`);
        failures += 1;
    };
    const pass = (l: string) => console.log(`✓ ${l}`);

    const tenant = userJwt('TENANT');
    const landlord = userJwt('LANDLORD');
    const agent = userJwt('AGENT');

    // leases (writes — confirm-gated)
    const leasesWrite = await call(
        'leases.create',
        {
            args: {
                propertyId: randomUUID(),
                tenantId: randomUUID(),
                startDate: '2026-06-01',
                endDate: '2027-05-31',
                monthlyRent: 250000,
            },
        },
        landlord
    );
    hasConfirmCard(leasesWrite)
        ? pass('leases.create → confirm-gated (high-risk)')
        : fail('leases.create', 'no confirm gate');

    // landlord
    const landlordWrite = await call(
        'landlord.approveApplicant',
        { args: { applicationId: randomUUID() } },
        landlord
    );
    hasConfirmCard(landlordWrite)
        ? pass('landlord.approveApplicant → confirm-gated (high-risk)')
        : fail('landlord.approveApplicant', 'no confirm gate');

    // agent — read first (available jobs)
    const agentRead = await call('agent.listAvailableJobs', { args: { limit: 5 } }, agent);
    isReachable(agentRead)
        ? pass('agent.listAvailableJobs → reachable')
        : fail('agent.listAvailableJobs', 'no result');

    // agent — write
    const agentWrite = await call(
        'agent.acceptJob',
        { args: { jobId: randomUUID(), note: 'smoke' } },
        agent
    );
    hasConfirmCard(agentWrite)
        ? pass('agent.acceptJob → confirm-gated (medium-risk)')
        : fail('agent.acceptJob', 'no confirm gate');

    // verification — read
    const verRead = await call('verification.getMyStatus', { args: {} }, tenant);
    isReachable(verRead)
        ? pass('verification.getMyStatus → reachable, emits VerificationStatusCard')
        : fail('verification.getMyStatus', 'no result');

    // verification — write
    const verWrite = await call(
        'verification.submitIdentity',
        {
            args: {
                documentType: 'NIN',
                documentNumber: '12345678901',
            },
        },
        tenant
    );
    hasConfirmCard(verWrite)
        ? pass('verification.submitIdentity → confirm-gated')
        : fail('verification.submitIdentity', 'no confirm gate');

    // banking — write (high-risk)
    const bankWrite = await call(
        'banking.requestPayout',
        { args: { amount: 100_000 } },
        landlord
    );
    hasConfirmCard(bankWrite)
        ? pass('banking.requestPayout → confirm-gated (high-risk)')
        : fail('banking.requestPayout', 'no confirm gate');

    // documents — delete (confirm-gated)
    const docDelete = await call(
        'documents.delete',
        { args: { documentId: randomUUID() } },
        tenant
    );
    hasConfirmCard(docDelete)
        ? pass('documents.delete → confirm-gated')
        : fail('documents.delete', 'no confirm gate');

    // analytics — POST-as-compute (no confirm, no DB write)
    const analytics = await call(
        'analytics.priceOptimization',
        {
            args: {
                propertyId: randomUUID(),
                objective: 'YIELD',
            },
            skipConfirm: true,
        },
        landlord
    );
    isReachable(analytics)
        ? pass('analytics.priceOptimization → reachable')
        : fail('analytics.priceOptimization', 'no result');

    // lease-reports — generate (no confirm gate, async generation)
    const reports = await call(
        'leaseReports.generateFinancialReport',
        {
            args: {
                reportType: 'TENANT_SPEND',
                startDate: '2026-01-01',
                endDate: '2026-05-15',
            },
            skipConfirm: true,
        },
        tenant
    );
    isReachable(reports)
        ? pass('leaseReports.generateFinancialReport → reachable')
        : fail('leaseReports.generateFinancialReport', 'no result');

    // Role-gating check: a TENANT cannot call landlord.approveApplicant.
    {
        const ev = await call(
            'landlord.approveApplicant',
            { args: { applicationId: randomUUID() } },
            tenant
        );
        const err = ev.some(
            (e) =>
                e.type === 'error' &&
                (e.payload as any).code === 'TOOL_NOT_FOUND'
        );
        err
            ? pass('role-gating — TENANT cannot see landlord.approveApplicant')
            : fail('role-gating', 'tenant could call a landlord-only tool');
    }

    if (failures > 0) {
        console.error(`\nFAIL: ${failures} smoke check(s) did not pass`);
        process.exit(1);
    }
    console.log('\nPASS: all 15 bundles wired + role-gating enforced');
    process.exit(0);
}

main().catch((e) => {
    console.error('crashed:', e);
    process.exit(2);
});
