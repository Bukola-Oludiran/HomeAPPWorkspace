/**
 * Mock API route table. Paths are relative to API_BASE_URL (".../api/v1").
 * State lives in memory, so changes (approvals, messages, saved homes) last until reload.
 */

import type { LoginResponse } from '@/types/auth';
import type { PropertySummary, PropertyMarketComparison, PropertyViewAnalytics, FavoriteProperty } from '@/types/property';
import type { PaymentMethod } from '@/lib/api/services/bankingService';
import type { VerificationStatus, PropertyVerification, PropertyVerificationStatus } from '@/lib/api/services/verificationService';
import type { MarketTrend } from '@/lib/api/services/analyticsService';
import type { Bank } from '@/types/lease';
import {
    USERS, PROFILES, PROPERTIES, SUMMARIES, LEASES, APPLICATIONS, MAINTENANCE, TENANT_PAYMENTS, TRANSACTIONS,
    LANDLORD_TRANSACTIONS, BANK_ACCOUNTS, PAYOUTS, PAYOUT_SETTINGS, TENANT_DASHBOARD, LANDLORD_DASHBOARD,
    LANDLORD_ALERTS, LANDLORD_FINANCIALS, AGENT_JOBS, AGENT_EARNINGS, AGENT_SCHEDULE, NOTIFICATIONS,
    NOTIFICATION_PREFERENCES, CONVERSATIONS, MESSAGES, daysFromNow, type MockRole,
} from './data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MockRequest {
    method: string;
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
    body: Record<string, unknown>;
    role: MockRole;
}

/** Return this to send a body other than the standard { success, data } envelope */
export class RawBody {
    body: unknown;
    constructor(body: unknown) {
        this.body = body;
    }
}

export class MockError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

type Handler = (req: MockRequest) => unknown;
type Route = { method: string; pattern: RegExp; keys: string[]; handler: Handler };

const routes: Route[] = [];

function route(method: string, path: string, handler: Handler) {
    const keys: string[] = [];
    const pattern = new RegExp('^' + path.replace(/:(\w+)/g, (_, key: string) => { keys.push(key); return '([^/]+)'; }) + '/?$');
    routes.push({ method, pattern, keys, handler });
}

export function matchRoute(method: string, path: string): { handler: Handler; params: Record<string, string> } | null {
    for (const r of routes) {
        if (r.method !== method) continue;
        const m = path.match(r.pattern);
        if (!m) continue;
        const params: Record<string, string> = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { handler: r.handler, params };
    }
    return null;
}

// ---------------------------------------------------------------------------
// Session: which persona is signed in
// ---------------------------------------------------------------------------

export const ROLE_KEY = 'keystead_mock_role';

export function currentRole(): MockRole {
    try {
        const r = localStorage.getItem(ROLE_KEY);
        if (r === 'TENANT' || r === 'LANDLORD' || r === 'AGENT') return r;
    } catch { /* storage blocked: fall back to tenant */ }
    return 'TENANT';
}

function roleFromEmail(email: unknown): MockRole {
    const e = String(email ?? '').toLowerCase();
    if (e.includes('landlord')) return 'LANDLORD';
    if (e.includes('agent')) return 'AGENT';
    return 'TENANT';
}

function authenticated(role: MockRole): Extract<LoginResponse, { requires2FA: false }> {
    try { localStorage.setItem(ROLE_KEY, role); } catch { /* ignore */ }
    return {
        user: USERS[role],
        tokens: { accessToken: `mock-access-${role.toLowerCase()}`, refreshToken: `mock-refresh-${role.toLowerCase()}`, expiresIn: 3600 },
        requires2FA: false,
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const notFound = (what: string) => { throw new MockError(404, 'NOT_FOUND', `${what} not found`); };
const findById = <T extends { id: string }>(list: T[], id: string, what: string): T => list.find((x) => x.id === id) ?? notFound(what);
const ok = (message: string) => ({ message });
const newId = () => crypto.randomUUID();

const savedIds = new Set<string>([SUMMARIES[5].id, SUMMARIES[3].id]);

function filterProperties(q: Record<string, string>): PropertySummary[] {
    const text = (q.query || q.q || q.location || q.city || '').toLowerCase();
    return SUMMARIES.filter((p) => {
        if (q.listingType && p.listingType !== q.listingType) return false;
        if (q.propertyType && p.propertyType !== q.propertyType) return false;
        if (q.minPrice && p.price < Number(q.minPrice)) return false;
        if (q.maxPrice && p.price > Number(q.maxPrice)) return false;
        if (q.bedrooms && (p.bedrooms ?? 0) < Number(q.bedrooms)) return false;
        if ((q.verified === 'true' || q.isVerified === 'true') && !p.isVerified) return false;
        if (text) {
            const hay = [p.name, p.address.city, p.address.state, p.address.neighborhood, p.address.street].join(' ').toLowerCase();
            if (!hay.includes(text)) return false;
        }
        return true;
    });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

route('POST', '/auth/login', (req) => authenticated(roleFromEmail(req.body.email)));
route('POST', '/auth/login/oauth/:provider', () => authenticated('TENANT'));
route('POST', '/auth/logout', () => ok('Logged out'));
route('POST', '/auth/refresh-token', (req) => authenticated(req.role).tokens);
route('POST', '/auth/register/initiate', () => ({ message: 'Verification code sent', verificationToken: 'mock-verification', expiresAt: daysFromNow(1) }));
route('POST', '/auth/register/verify-email', () => ({ verified: true, message: 'Email verified' }));
route('POST', '/auth/register/complete', (req) => authenticated(roleFromEmail(req.body.email)));
route('POST', '/auth/forgot-password', () => ok('If that email is registered, a reset link is on its way'));
route('POST', '/auth/reset-password', () => ok('Password updated'));
route('POST', '/auth/2fa/challenge/verify', (req) => authenticated(req.role));
route('POST', '/auth/2fa/setup', () => ({ secret: 'MOCKSECRET', qrCodeUrl: '', recoveryCodes: ['KST-1A2B', 'KST-3C4D', 'KST-5E6F'] }));
route('GET', '/auth/2fa/recovery-codes', () => ({ codes: ['KST-1A2B', 'KST-3C4D', 'KST-5E6F', 'KST-7G8H'] }));
route('GET', '/auth/sessions', () => [
    { id: newId(), deviceName: 'Chrome on macOS', ipAddress: '102.89.33.10', location: 'Lagos, NG', lastActiveAt: daysFromNow(0), createdAt: daysFromNow(-3), isCurrent: true },
    { id: newId(), deviceName: 'Keystead for iPhone', ipAddress: '102.89.40.21', location: 'Lagos, NG', lastActiveAt: daysFromNow(-2), createdAt: daysFromNow(-30), isCurrent: false },
]);

// ---------------------------------------------------------------------------
// Users and profiles
// ---------------------------------------------------------------------------

route('GET', '/users/me', (req) => USERS[req.role]);
route('PUT', '/users/me', (req) => Object.assign(USERS[req.role], req.body));
route('PATCH', '/users/me', (req) => Object.assign(USERS[req.role], req.body));
route('GET', '/users/me/privacy', () => PROFILES.privacy);
route('GET', '/users/me/profile/tenant', () => PROFILES.tenant);
route('GET', '/users/me/profile/landlord', () => PROFILES.landlord);
route('GET', '/users/me/profile/agent', () => PROFILES.agent);
route('GET', '/users/me/profile/agent/certifications', () => [
    { id: newId(), name: 'Registered estate agent', issuer: 'LASRERA', expiryDate: daysFromNow(400) },
]);
route('GET', '/users/me/connected-accounts', (req) => [{ provider: 'google', email: USERS[req.role].email, connectedAt: daysFromNow(-200) }]);
route('GET', '/users/me/wallet', () => ({ walletAddress: undefined, balance: 0 }));
route('GET', '/users/me/documents', () => [
    { id: newId(), name: 'National ID (NIN slip).pdf', type: 'IDENTITY', subtype: 'NIN', url: '#', createdAt: daysFromNow(-40) },
    { id: newId(), name: 'Utility bill - September.pdf', type: 'ADDRESS', url: '#', createdAt: daysFromNow(-35) },
]);
route('GET', '/users/me/bank-accounts', () => BANK_ACCOUNTS);
route('GET', '/users/me/payout-settings', () => PAYOUT_SETTINGS);
route('GET', '/users/me/payouts', () => PAYOUTS);
route('GET', '/users/me/payment-methods', (): PaymentMethod[] => [
    { id: 'pm-1', type: 'card', brand: 'Verve', last4: '4081', isDefault: true, createdAt: daysFromNow(-90) },
    { id: 'pm-2', type: 'bank_transfer', isDefault: false, createdAt: daysFromNow(-60) },
]);
route('GET', '/users/me/favorites', (): FavoriteProperty[] =>
    SUMMARIES.filter((p) => savedIds.has(p.id)).map((p) => ({ id: p.id, property: p, createdAt: daysFromNow(-7) })));
route('POST', '/users/me/favorites/:id', (req) => { savedIds.add(req.params.id); return ok('Saved'); });
route('DELETE', '/users/me/favorites/:id', (req) => { savedIds.delete(req.params.id); return ok('Removed'); });
route('GET', '/users/public/landlord/:id', () => ({ ...PROFILES.landlord, user: USERS.LANDLORD }));
route('GET', '/users/public/tenant/:id', () => ({ ...PROFILES.tenant, user: USERS.TENANT }));
route('GET', '/users/public/agent/:id', () => ({ ...PROFILES.agent, user: USERS.AGENT, certifications: [{ id: newId(), name: 'Registered estate agent', issuer: 'LASRERA' }] }));

route('GET', '/banking/banks', (): Bank[] => [
    { code: '044', name: 'Access Bank', slug: 'access-bank' },
    { code: '058', name: 'GTBank', slug: 'guaranty-trust-bank' },
    { code: '033', name: 'United Bank for Africa', slug: 'united-bank-for-africa' },
    { code: '057', name: 'Zenith Bank', slug: 'zenith-bank' },
    { code: '50515', name: 'Moniepoint', slug: 'moniepoint' },
]);
route('POST', '/banking/resolve', (req) => ({ accountNumber: req.body.accountNumber, accountName: 'TUNDE BAKARE', bankCode: req.body.bankCode }));

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

route('GET', '/properties', (req) => filterProperties(req.query));
route('GET', '/properties/featured', (req) =>
    [...SUMMARIES].sort((a, b) => Number(b.isVerified) - Number(a.isVerified)).slice(0, Number(req.query.limit) || 6));
route('GET', '/properties/nearby', () => SUMMARIES.slice(0, 4));
route('GET', '/properties/search', (req) => {
    const all = filterProperties(req.query);
    const limit = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    return new RawBody({
        success: true,
        data: all.slice((page - 1) * limit, page * limit),
        pagination: { total: all.length, page, totalPages: Math.max(1, Math.ceil(all.length / limit)) },
    });
});
route('GET', '/properties/:id', (req) => findById(PROPERTIES, req.params.id, 'Property'));
route('GET', '/properties/:id/analytics/views', (): PropertyViewAnalytics => ({
    totalViews: 1284,
    uniqueViews: 902,
    viewsByDay: Array.from({ length: 14 }, (_, i) => ({ date: daysFromNow(i - 13).slice(0, 10), views: 60 + ((i * 37) % 55) })),
    viewsBySource: [{ source: 'Search', views: 640 }, { source: 'Saved homes', views: 310 }, { source: 'Shared links', views: 334 }],
}));
route('GET', '/properties/:id/analytics/market-comparison', (req): PropertyMarketComparison => {
    const p = findById(PROPERTIES, req.params.id, 'Property');
    return {
        propertyId: p.id,
        propertyPrice: p.price,
        priceUnit: p.priceUnit,
        marketAnalysis: {
            areaName: p.address.neighborhood ?? p.address.city ?? '', propertyType: p.propertyType, bedrooms: p.bedrooms ?? 0,
            sampleSize: 38, averagePrice: Math.round(p.price * 1.04), medianPrice: p.price, minPrice: Math.round(p.price * 0.7),
            maxPrice: Math.round(p.price * 1.5), percentile: 55, competitiveness: 'Competitive',
        },
        recommendation: { action: 'Keep price', suggestedPrice: p.price, potentialImpact: 'Priced in line with similar checked homes nearby.', confidence: 0.78 },
    };
});

// ---------------------------------------------------------------------------
// Landlord
// ---------------------------------------------------------------------------

route('GET', '/landlord/dashboard', () => LANDLORD_DASHBOARD);
route('GET', '/landlord/dashboard/analytics', () => ({ viewsThisMonth: 3120, enquiries: 46, conversionRate: 4.2 }));
route('GET', '/landlord/properties', () => SUMMARIES);
route('GET', '/landlord/applicants', (req) => APPLICATIONS.filter((a) => !req.query.status || a.status === req.query.status));
route('GET', '/landlord/applicants/:id', (req) => findById(APPLICATIONS, req.params.id, 'Application'));
route('POST', '/landlord/applicants/:id/approve', (req) => Object.assign(findById(APPLICATIONS, req.params.id, 'Application'), { status: 'APPROVED', updatedAt: daysFromNow(0) }));
route('POST', '/landlord/applicants/:id/reject', (req) => Object.assign(findById(APPLICATIONS, req.params.id, 'Application'), { status: 'REJECTED', rejectionReason: req.body.reason, updatedAt: daysFromNow(0) }));
route('GET', '/landlord/financials', () => LANDLORD_FINANCIALS);
route('GET', '/landlord/financials/summary', () => LANDLORD_FINANCIALS);
route('GET', '/landlord/financials/transactions', () => LANDLORD_TRANSACTIONS);
route('GET', '/landlord/alerts', () => LANDLORD_ALERTS);
route('GET', '/landlord/jobs', () => AGENT_JOBS);

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

route('GET', '/tenant/dashboard', () => TENANT_DASHBOARD);
route('GET', '/tenant/rental', () => ({
    property: SUMMARIES[0],
    lease: { id: LEASES[0].id, startDate: LEASES[0].startDate, endDate: LEASES[0].endDate, monthlyRent: LEASES[0].monthlyRent, status: LEASES[0].status },
    landlord: { id: USERS.LANDLORD.id, name: 'Tunde Bakare', phone: USERS.LANDLORD.phone ?? undefined },
}));
route('GET', '/tenant/applications', () => APPLICATIONS.filter((a) => a.tenantId === USERS.TENANT.id));
route('GET', '/tenant/applications/:id', (req) => findById(APPLICATIONS, req.params.id, 'Application'));
route('POST', '/tenant/applications', (req) => {
    const property = SUMMARIES.find((p) => p.id === req.body.propertyId);
    const app = {
        id: newId(), propertyId: String(req.body.propertyId), property, tenantId: USERS.TENANT.id, status: 'PENDING' as const,
        message: req.body.message as string | undefined, moveInDate: String(req.body.moveInDate ?? daysFromNow(30)),
        employmentStatus: 'EMPLOYED' as const, monthlyIncome: Number(req.body.monthlyIncome) || 0,
        createdAt: daysFromNow(0), updatedAt: daysFromNow(0),
    };
    APPLICATIONS.unshift(app);
    return app;
});
route('GET', '/tenant/saved', () => SUMMARIES.filter((p) => savedIds.has(p.id)));
route('POST', '/tenant/saved/:id', (req) => { savedIds.add(req.params.id); return ok('Saved'); });
route('DELETE', '/tenant/saved/:id', (req) => { savedIds.delete(req.params.id); return ok('Removed'); });
route('GET', '/tenant/payments', () => TENANT_PAYMENTS);

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

route('GET', '/agent/jobs', () => AGENT_JOBS.filter((j) => j.status === 'Open'));
route('GET', '/agent/jobs/accepted', () => AGENT_JOBS.filter((j) => j.status === 'Accepted' || j.status === 'Completed'));
route('POST', '/agent/jobs/:id/accept', (req) => Object.assign(findById(AGENT_JOBS, req.params.id, 'Job'), { status: 'Accepted' }));
route('POST', '/agent/jobs/:id/decline', (req) => Object.assign(findById(AGENT_JOBS, req.params.id, 'Job'), { status: 'Cancelled' }));
route('POST', '/agent/jobs/:id/complete', (req) => Object.assign(findById(AGENT_JOBS, req.params.id, 'Job'), { status: 'Completed' }));
route('GET', '/agent/schedule', () => AGENT_SCHEDULE);
route('GET', '/agent/availability', () => AGENT_SCHEDULE.availability);
route('GET', '/agent/earnings', () => AGENT_EARNINGS);
route('GET', '/agent/earnings/history', () => PAYOUTS);

// ---------------------------------------------------------------------------
// Leases, maintenance, transactions
// ---------------------------------------------------------------------------

route('GET', '/leases', () => LEASES);
route('GET', '/leases/:id', (req) => findById(LEASES, req.params.id, 'Lease'));
route('GET', '/leases/:id/document', () => ({ documentUrl: '#' }));
route('GET', '/maintenance', () => MAINTENANCE);
route('GET', '/maintenance/:id', (req) => findById(MAINTENANCE, req.params.id, 'Maintenance request'));
route('POST', '/maintenance', (req) => {
    const item = {
        ...MAINTENANCE[1], id: newId(), title: String(req.body.title ?? 'New request'), description: String(req.body.description ?? ''),
        status: 'SUBMITTED' as const, createdAt: daysFromNow(0), updatedAt: daysFromNow(0),
    };
    MAINTENANCE.unshift(item);
    return item;
});
route('GET', '/transactions', () => TRANSACTIONS);
route('GET', '/transactions/:id', (req) => findById(TRANSACTIONS, req.params.id, 'Transaction'));

// ---------------------------------------------------------------------------
// Messages and notifications
// ---------------------------------------------------------------------------

route('GET', '/messages/conversations', (req) =>
    CONVERSATIONS.filter((c) => c.participants.some((p) => p.role === req.role)));
route('GET', '/messages/conversations/:id', (req) => MESSAGES[req.params.id] ?? []);
route('POST', '/messages/conversations/:id', (req) => {
    const message = {
        id: newId(), conversationId: req.params.id, senderId: USERS[req.role].id,
        content: String(req.body.content ?? ''), isRead: true, createdAt: daysFromNow(0),
    };
    (MESSAGES[req.params.id] ??= []).push(message);
    const convo = CONVERSATIONS.find((c) => c.id === req.params.id);
    if (convo) Object.assign(convo, { lastMessage: message, updatedAt: message.createdAt });
    return message;
});

route('GET', '/notifications', () => NOTIFICATIONS);
route('GET', '/notifications/unread-count', () => ({ count: NOTIFICATIONS.filter((n) => !n.isRead).length }));
route('GET', '/notifications/preferences', () => NOTIFICATION_PREFERENCES);
route('GET', '/notifications/devices', () => []);
route('POST', '/notifications/mark-read', (req) => {
    const ids = (req.body.notificationIds ?? req.body.ids ?? []) as string[];
    NOTIFICATIONS.forEach((n) => { if (ids.includes(n.id)) n.isRead = true; });
    return ok('Marked as read');
});
route('POST', '/notifications/mark-all-read', () => { NOTIFICATIONS.forEach((n) => { n.isRead = true; }); return ok('All marked as read'); });

// ---------------------------------------------------------------------------
// Verification, analytics, reports, integrations
// ---------------------------------------------------------------------------

route('GET', '/verification/status', (req): VerificationStatus => ({
    userId: USERS[req.role].id, identityVerified: true, addressVerified: req.role !== 'TENANT', documentsVerified: req.role === 'LANDLORD',
    tier: USERS[req.role].verificationLevel, score: req.role === 'TENANT' ? 62 : 84, verificationLevel: USERS[req.role].verificationLevel,
    pendingVerifications: req.role === 'TENANT' ? 1 : 0, lastUpdated: daysFromNow(-10),
}));
route('GET', '/verification/properties', (): PropertyVerification[] =>
    SUMMARIES.map((p) => ({ id: newId(), propertyId: p.id, status: p.isVerified ? 'APPROVED' : 'PENDING', tier: p.verificationTier, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-5) })));
route('GET', '/verification/properties/:id', (req): PropertyVerificationStatus => {
    const p = findById(SUMMARIES, req.params.id, 'Property');
    return {
        propertyId: p.id, tier: p.verificationTier, score: p.isVerified ? 80 : 20,
        verifications: [
            { id: newId(), type: 'OWNERSHIP', status: p.isVerified ? 'APPROVED' : 'PENDING', documentType: 'Certificate of Occupancy', createdAt: daysFromNow(-30), updatedAt: daysFromNow(-20) },
            { id: newId(), type: 'LANDLORD_IDENTITY', status: 'APPROVED', documentType: 'NIN', createdAt: daysFromNow(-60), updatedAt: daysFromNow(-55) },
        ],
    };
});
route('GET', '/verification/admin/pending', () => []);

route('GET', '/analytics/market-trends', (): MarketTrend[] =>
    ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((period, i) => ({ period, averagePrice: 6200000 + i * 120000, medianPrice: 5800000 + i * 100000, listingCount: 140 + i * 6, demandIndex: 68 + i })));

route('GET', '/reports', () => []);
route('GET', '/users/me/billing-statements', () => []);
route('GET', '/users/:id/reviews', () => []);
route('GET', '/tenant/applicant-invitations/:token', () => ({
    email: USERS.TENANT.email, expiresAt: daysFromNow(7), acceptedAt: null,
    property: { name: SUMMARIES[1].name }, landlord: { firstName: 'Tunde', lastName: 'Bakare' },
}));
route('POST', '/tenant/applicant-invitations/:token', () => ({ acceptedAt: daysFromNow(0) }));
route('POST', '/exports', () => new RawBody(new Blob(['id,description,amount\n1,Rent payment,550000\n'], { type: 'text/csv' })));
