/**
 * Mock API fixtures for `npm run dev:mock`.
 * Typed against the same types the services use, so a contract change that
 * breaks these shapes fails the type-check instead of the UI.
 */

import type { User, UserWithProfile, TenantProfile, LandlordProfile, AgentProfile, PrivacySettings } from '@/types/auth';
import type { Property, PropertySummary } from '@/types/property';
import type {
    TenantDashboard,
    TenantPayment,
    LandlordDashboard,
    LandlordFinancialSummary,
    LandlordTransaction,
    Alert,
    AgentJob,
    AgentEarnings,
    AgentScheduleResponse,
    Notification,
    NotificationPreferences,
    Conversation,
    Message,
} from '@/types/dashboard';
import type { Lease, RentalApplication, MaintenanceRequest, Transaction, Payout, BankAccount, PayoutSettings } from '@/types/lease';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
export const daysFromNow = (n: number) => new Date(Date.now() + n * DAY).toISOString();
/** An appointment n days from now at the given hour, Lagos time (UTC+1) */
const appointment = (n: number, hour: number) => { const d = new Date(Date.now() + n * DAY); d.setUTCHours(hour - 1, 0, 0, 0); return d.toISOString(); };
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const photo = (unsplashId: string, w = 1200) => `https://images.unsplash.com/photo-${unsplashId}?w=${w}&q=70`;

const PHOTOS = [
    '1600596542815-ffad4c1539a9',
    '1600585154340-be6161a56a0c',
    '1512917774080-9991f1c4c750',
    '1613490493576-7fde63acd811',
    '1560518883-ce09059eeffa',
    '1560448204-e02f11c3d0e2',
    '1502672260266-1c1ef2d93688',
    '1484154218962-a197022b5858',
];

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export type MockRole = 'TENANT' | 'LANDLORD' | 'AGENT';

const baseUser = {
    phone: '+2348031234567',
    isEmailVerified: true,
    is2FAEnabled: false,
    regionCode: 'NG',
    walletAddress: null,
    createdAt: daysFromNow(-400),
    updatedAt: daysFromNow(-3),
};

export const USERS: Record<MockRole, UserWithProfile> = {
    TENANT: {
        ...baseUser,
        id: id(1),
        email: 'tenant@keystead.dev',
        role: 'TENANT',
        firstName: 'Adaeze',
        lastName: 'Okafor',
        avatarUrl: null,
        verificationLevel: 'SILVER',
        bio: 'Product designer relocating from Enugu to Lagos.',
        preferences: { language: 'en', currency: 'NGN', timezone: 'Africa/Lagos' },
        notificationSettings: { email: true, push: true, sms: false, marketingEmails: false },
        privacySettings: { profileVisibility: 'verified_users_only', showPhoneToPublic: false, allowSearchDiscovery: true },
    },
    LANDLORD: {
        ...baseUser,
        id: id(2),
        email: 'landlord@keystead.dev',
        role: 'LANDLORD',
        firstName: 'Tunde',
        lastName: 'Bakare',
        phone: '+2348057654321',
        avatarUrl: null,
        verificationLevel: 'GOLD',
        bio: 'Owner of residential units across Lagos and Abuja.',
        preferences: { language: 'en', currency: 'NGN', timezone: 'Africa/Lagos' },
        notificationSettings: { email: true, push: true, sms: true, marketingEmails: false },
        privacySettings: { profileVisibility: 'public', showPhoneToPublic: false, allowSearchDiscovery: true },
    },
    AGENT: {
        ...baseUser,
        id: id(3),
        email: 'agent@keystead.dev',
        role: 'AGENT',
        firstName: 'Kemi',
        lastName: 'Adeyemi',
        phone: '+2348091112233',
        avatarUrl: null,
        verificationLevel: 'GOLD',
        bio: 'Field agent covering Lekki, Ajah and Victoria Island.',
        preferences: { language: 'en', currency: 'NGN', timezone: 'Africa/Lagos' },
        notificationSettings: { email: true, push: true, sms: true, marketingEmails: false },
        privacySettings: { profileVisibility: 'public', showPhoneToPublic: true, allowSearchDiscovery: true },
    },
};

const person = (u: User) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl });

export const PROFILES = {
    tenant: {
        displayName: 'Adaeze O.',
        bio: 'Quiet professional, no pets, looking for a two-bedroom close to work.',
        preferences: { desiredBedrooms: '2', monthlyBudgetMax: 600000 },
    } satisfies TenantProfile,
    landlord: {
        businessName: 'Bakare Homes Ltd',
        businessEmail: 'lettings@bakarehomes.ng',
        publicVisibility: { showContactPhone: false },
    } satisfies LandlordProfile,
    agent: {
        companyName: 'Keystead Field Services',
        licenseNumber: 'LASRERA/AG/2291',
        specialties: ['Property inspection', 'Tenant viewings', 'Move-in reports'],
        yearsOfExperience: 6,
        serviceAreas: ['Lekki', 'Ajah', 'Victoria Island'],
    } satisfies AgentProfile,
    privacy: {
        profileVisibility: 'verified_users_only',
        showPhoneToPublic: false,
        allowSearchDiscovery: true,
    } satisfies PrivacySettings,
};

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

type Seed = Pick<Property, 'name' | 'propertyType' | 'listingType' | 'price' | 'priceUnit' | 'bedrooms' | 'bathrooms' | 'squareFeet' | 'verificationTier' | 'status'> & {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    description: string;
    amenities: string[];
};

const SEEDS: Seed[] = [
    {
        name: '2-bedroom flat, Lekki Phase 1', propertyType: 'APARTMENT', listingType: 'RENT', status: 'RENTED',
        price: 6600000, priceUnit: 'PER_YEAR', bedrooms: 2, bathrooms: 2, squareFeet: 1150, verificationTier: 'GOLD',
        street: '14 Admiralty Way', neighborhood: 'Lekki Phase 1', city: 'Lekki', state: 'Lagos',
        description: 'Serviced two-bedroom flat with 24-hour power, a shared pool and parking for one car. Five minutes from the Lekki toll gate.',
        amenities: ['24-hour power', 'Swimming pool', 'Parking', 'Security'],
    },
    {
        name: '3-bedroom apartment, Ikoyi', propertyType: 'APARTMENT', listingType: 'RENT', status: 'ACTIVE',
        price: 18000000, priceUnit: 'PER_YEAR', bedrooms: 3, bathrooms: 3, squareFeet: 1900, verificationTier: 'PLATINUM',
        street: '7 Bourdillon Road', neighborhood: 'Old Ikoyi', city: 'Ikoyi', state: 'Lagos',
        description: 'Fully serviced apartment with a gym, elevator and staff quarters. Title documents and landlord identity checked.',
        amenities: ['Gym', 'Elevator', 'Staff quarters', '24-hour power', 'Security'],
    },
    {
        name: 'Studio short-let, Victoria Island', propertyType: 'STUDIO', listingType: 'SHORT_LET', status: 'ACTIVE',
        price: 85000, priceUnit: 'PER_NIGHT', bedrooms: 1, bathrooms: 1, squareFeet: 520, verificationTier: 'SILVER',
        street: '22 Adeola Odeku Street', neighborhood: 'Victoria Island', city: 'Victoria Island', state: 'Lagos',
        description: 'Furnished studio with fast internet and a work desk. Minimum two nights.',
        amenities: ['Wi-Fi', 'Furnished', 'Air conditioning', 'Housekeeping'],
    },
    {
        name: 'Mini flat, Yaba', propertyType: 'APARTMENT', listingType: 'RENT', status: 'ACTIVE',
        price: 1800000, priceUnit: 'PER_YEAR', bedrooms: 1, bathrooms: 1, squareFeet: 480, verificationTier: 'BRONZE',
        street: '3 Herbert Macaulay Way', neighborhood: 'Sabo', city: 'Yaba', state: 'Lagos',
        description: 'Self-contained mini flat close to the university and the tech hubs. Prepaid meter.',
        amenities: ['Prepaid meter', 'Water supply'],
    },
    {
        name: '4-bedroom duplex, Ikeja GRA', propertyType: 'DUPLEX', listingType: 'SALE', status: 'ACTIVE',
        price: 250000000, priceUnit: 'TOTAL', bedrooms: 4, bathrooms: 5, squareFeet: 4200, verificationTier: 'GOLD',
        street: '11 Isaac John Street', neighborhood: 'Ikeja GRA', city: 'Ikeja', state: 'Lagos',
        description: 'Detached duplex on a quiet close with a boys quarters, a garden and parking for four cars. Certificate of Occupancy checked.',
        amenities: ['Boys quarters', 'Garden', 'Parking', 'Borehole'],
    },
    {
        name: '3-bedroom terrace, Maitama', propertyType: 'TOWNHOUSE', listingType: 'RENT', status: 'ACTIVE',
        price: 12000000, priceUnit: 'PER_YEAR', bedrooms: 3, bathrooms: 4, squareFeet: 2400, verificationTier: 'GOLD',
        street: '5 Aguiyi Ironsi Street', neighborhood: 'Maitama', city: 'Abuja', state: 'FCT',
        description: 'Terrace house in a gated estate with shared green space and a playground.',
        amenities: ['Gated estate', 'Playground', 'Parking', 'Security'],
    },
    {
        name: '2-bedroom apartment, Wuse 2', propertyType: 'APARTMENT', listingType: 'RENT', status: 'ACTIVE',
        price: 650000, priceUnit: 'PER_MONTH', bedrooms: 2, bathrooms: 2, squareFeet: 1050, verificationTier: 'UNVERIFIED',
        street: '19 Aminu Kano Crescent', neighborhood: 'Wuse 2', city: 'Abuja', state: 'FCT',
        description: 'Monthly rental close to Banex Plaza. Not yet checked: verification has not started.',
        amenities: ['Parking', 'Water supply'],
    },
    {
        name: '3-bedroom bungalow, GRA Phase 2', propertyType: 'BUNGALOW', listingType: 'RENT', status: 'ACTIVE',
        price: 4500000, priceUnit: 'PER_YEAR', bedrooms: 3, bathrooms: 3, squareFeet: 1800, verificationTier: 'SILVER',
        street: '8 Tombia Street', neighborhood: 'GRA Phase 2', city: 'Port Harcourt', state: 'Rivers',
        description: 'Bungalow with a large compound and a gate house. Landlord identity checked.',
        amenities: ['Compound', 'Gate house', 'Borehole'],
    },
];

export const PROPERTIES: Property[] = SEEDS.map((s, i) => ({
    id: id(100 + i),
    name: s.name,
    description: s.description,
    propertyType: s.propertyType,
    listingType: s.listingType,
    status: s.status,
    price: s.price,
    priceUnit: s.priceUnit,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    squareFeet: s.squareFeet,
    yearBuilt: 2014 + (i % 9),
    amenities: s.amenities,
    verificationTier: s.verificationTier,
    isVerified: s.verificationTier !== 'UNVERIFIED',
    address: {
        street: s.street,
        city: s.city,
        state: s.state,
        lga: null,
        neighborhood: s.neighborhood,
        postalCode: null,
        country: 'NG',
        latitude: 6.43 + i * 0.01,
        longitude: 3.42 + i * 0.01,
    },
    media: [0, 1, 2].map((k) => ({
        id: id(1000 + i * 10 + k),
        url: photo(PHOTOS[(i + k) % PHOTOS.length]),
        type: 'IMAGE' as const,
        isPrimary: k === 0,
        caption: null,
        orderIndex: k,
        metadata: null,
    })),
    owner: { ...person(USERS.LANDLORD), verificationLevel: USERS.LANDLORD.verificationLevel },
    createdAt: daysFromNow(-60 + i * 5),
    updatedAt: daysFromNow(-2),
}));

export const toSummary = (p: Property): PropertySummary => ({
    id: p.id,
    name: p.name,
    propertyType: p.propertyType,
    listingType: p.listingType,
    status: p.status,
    price: p.price,
    priceUnit: p.priceUnit,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    squareFeet: p.squareFeet,
    address: {
        street: p.address.street,
        city: p.address.city,
        state: p.address.state,
        neighborhood: p.address.neighborhood,
        country: p.address.country,
    },
    primaryImage: p.media[0]?.url ?? null,
    verificationTier: p.verificationTier,
    isVerified: p.isVerified,
    createdAt: p.createdAt,
});

export const SUMMARIES = PROPERTIES.map(toSummary);
const [LEKKI, IKOYI, , YABA, , MAITAMA, WUSE] = SUMMARIES;

// ---------------------------------------------------------------------------
// Leases, applications, maintenance
// ---------------------------------------------------------------------------

export const LEASES: Lease[] = [
    {
        id: id(200),
        propertyId: LEKKI.id,
        property: LEKKI,
        landlordId: USERS.LANDLORD.id,
        landlord: person(USERS.LANDLORD),
        tenantId: USERS.TENANT.id,
        tenant: person(USERS.TENANT),
        status: 'ACTIVE',
        startDate: daysFromNow(-275),
        endDate: daysFromNow(90),
        monthlyRent: 550000,
        securityDeposit: 1100000,
        paymentDueDay: 1,
        currency: 'NGN',
        signedByLandlord: true,
        signedByTenant: true,
        landlordSignedAt: daysFromNow(-280),
        tenantSignedAt: daysFromNow(-279),
        renewalOffer: {
            id: id(210),
            leaseId: id(200),
            newEndDate: daysFromNow(455),
            newMonthlyRent: 580000,
            message: 'Happy to renew for another year at the new rate.',
            status: 'PENDING',
            createdAt: daysFromNow(-5),
        },
        createdAt: daysFromNow(-285),
        updatedAt: daysFromNow(-5),
    },
];

export const APPLICATIONS: RentalApplication[] = [
    {
        id: id(300), propertyId: IKOYI.id, property: IKOYI, tenantId: USERS.TENANT.id,
        tenant: { ...person(USERS.TENANT), email: USERS.TENANT.email, phone: USERS.TENANT.phone },
        status: 'UNDER_REVIEW', message: 'Looking to move in at the start of next quarter.',
        moveInDate: daysFromNow(45), employmentStatus: 'EMPLOYED', monthlyIncome: 2400000,
        createdAt: daysFromNow(-6), updatedAt: daysFromNow(-2),
    },
    {
        id: id(301), propertyId: MAITAMA.id, property: MAITAMA, tenantId: id(11),
        tenant: { id: id(11), firstName: 'Ibrahim', lastName: 'Musa', avatarUrl: null, email: 'ibrahim.musa@example.ng', phone: '+2348023344556' },
        status: 'PENDING', message: 'Relocating to Abuja for work in January.',
        moveInDate: daysFromNow(60), employmentStatus: 'EMPLOYED', monthlyIncome: 1800000,
        createdAt: daysFromNow(-3), updatedAt: daysFromNow(-3),
    },
    {
        id: id(302), propertyId: YABA.id, property: YABA, tenantId: id(12),
        tenant: { id: id(12), firstName: 'Chioma', lastName: 'Eze', avatarUrl: null, email: 'chioma.eze@example.ng', phone: '+2348065566778' },
        status: 'APPROVED', message: 'Final-year student with a guarantor.',
        moveInDate: daysFromNow(14), employmentStatus: 'STUDENT', monthlyIncome: 250000,
        createdAt: daysFromNow(-20), updatedAt: daysFromNow(-8),
    },
    {
        id: id(303), propertyId: WUSE.id, property: WUSE, tenantId: id(13),
        tenant: { id: id(13), firstName: 'Seyi', lastName: 'Balogun', avatarUrl: null, email: 'seyi.b@example.ng', phone: '+2348077788990' },
        status: 'REJECTED', rejectionReason: 'Move-in date does not match availability.',
        moveInDate: daysFromNow(7), employmentStatus: 'SELF_EMPLOYED', monthlyIncome: 900000,
        createdAt: daysFromNow(-30), updatedAt: daysFromNow(-25),
    },
];

export const MAINTENANCE: MaintenanceRequest[] = [
    {
        id: id(400), leaseId: LEASES[0].id, lease: { id: LEASES[0].id, property: LEKKI, tenant: person(USERS.TENANT), landlord: person(USERS.LANDLORD) },
        title: 'Kitchen sink leaking', description: 'Water drips from the pipe under the kitchen sink and pools on the floor.',
        category: 'PLUMBING', priority: 'HIGH', status: 'IN_PROGRESS',
        assignedAgentId: USERS.AGENT.id, assignedAgent: { ...person(USERS.AGENT), phone: USERS.AGENT.phone },
        createdAt: daysFromNow(-4), updatedAt: daysFromNow(-1),
    },
    {
        id: id(401), leaseId: LEASES[0].id, lease: { id: LEASES[0].id, property: LEKKI, tenant: person(USERS.TENANT), landlord: person(USERS.LANDLORD) },
        title: 'Bedroom air conditioner not cooling', description: 'The split unit runs but blows warm air.',
        category: 'HVAC', priority: 'MEDIUM', status: 'SUBMITTED',
        createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1),
    },
    {
        id: id(402), leaseId: LEASES[0].id, lease: { id: LEASES[0].id, property: LEKKI, tenant: person(USERS.TENANT), landlord: person(USERS.LANDLORD) },
        title: 'Replace security light bulbs', description: 'Two outdoor security lights are out.',
        category: 'ELECTRICAL', priority: 'LOW', status: 'COMPLETED', completedAt: daysFromNow(-12),
        createdAt: daysFromNow(-18), updatedAt: daysFromNow(-12),
    },
];

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

export const TENANT_PAYMENTS: TenantPayment[] = [
    { id: id(500), amount: 550000, status: 'pending', dueDate: daysFromNow(4) },
    { id: id(501), amount: 550000, status: 'paid', dueDate: daysFromNow(-26), paidDate: daysFromNow(-27) },
    { id: id(502), amount: 550000, status: 'paid', dueDate: daysFromNow(-57), paidDate: daysFromNow(-57) },
    { id: id(503), amount: 550000, status: 'paid', dueDate: daysFromNow(-87), paidDate: daysFromNow(-86) },
];

export const TRANSACTIONS: Transaction[] = [
    { id: id(600), reference: 'KST-RENT-0921', type: 'RENT_PAYMENT', status: 'COMPLETED', amount: 550000, currency: 'NGN', paymentMethod: 'bank_transfer', provider: 'paystack', leaseId: LEASES[0].id, fromUser: { id: USERS.TENANT.id, firstName: 'Adaeze', lastName: 'Okafor' }, toUser: { id: USERS.LANDLORD.id, firstName: 'Tunde', lastName: 'Bakare' }, description: 'Rent payment', createdAt: daysFromNow(-27), completedAt: daysFromNow(-27) },
    { id: id(601), reference: 'KST-RENT-0822', type: 'RENT_PAYMENT', status: 'COMPLETED', amount: 550000, currency: 'NGN', paymentMethod: 'card', provider: 'paystack', leaseId: LEASES[0].id, description: 'Rent payment', createdAt: daysFromNow(-57), completedAt: daysFromNow(-57) },
    { id: id(602), reference: 'KST-DEP-0101', type: 'SECURITY_DEPOSIT', status: 'COMPLETED', amount: 1100000, currency: 'NGN', paymentMethod: 'bank_transfer', provider: 'paystack', leaseId: LEASES[0].id, description: 'Security deposit held in escrow', createdAt: daysFromNow(-280), completedAt: daysFromNow(-279) },
    { id: id(603), reference: 'KST-RENT-1020', type: 'RENT_PAYMENT', status: 'PENDING', amount: 550000, currency: 'NGN', leaseId: LEASES[0].id, description: 'Rent payment', createdAt: daysFromNow(-1) },
];

export const LANDLORD_TRANSACTIONS: LandlordTransaction[] = [
    { id: id(700), type: 'RENT_PAYMENT', amount: 550000, currency: 'NGN', status: 'COMPLETED', propertyId: LEKKI.id, propertyName: LEKKI.name, tenantName: 'Adaeze Okafor', createdAt: daysFromNow(-27) },
    { id: id(701), type: 'RENT_PAYMENT', amount: 1500000, currency: 'NGN', status: 'COMPLETED', propertyId: MAITAMA.id, propertyName: MAITAMA.name, tenantName: 'Ngozi Udeh', createdAt: daysFromNow(-30) },
    { id: id(702), type: 'COMMISSION', amount: -75000, currency: 'NGN', status: 'COMPLETED', propertyId: LEKKI.id, propertyName: LEKKI.name, createdAt: daysFromNow(-27) },
    { id: id(703), type: 'RENT_PAYMENT', amount: 550000, currency: 'NGN', status: 'PENDING', propertyId: LEKKI.id, propertyName: LEKKI.name, tenantName: 'Adaeze Okafor', createdAt: daysFromNow(-1) },
    { id: id(704), type: 'PAYOUT', amount: -1800000, currency: 'NGN', status: 'COMPLETED', createdAt: daysFromNow(-20) },
];

export const BANK_ACCOUNTS: BankAccount[] = [
    { id: id(800), bankCode: '058', bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Bakare Homes Ltd', accountType: 'current', isDefault: true, isVerified: true, createdAt: daysFromNow(-300) },
];

export const PAYOUTS: Payout[] = [
    { id: id(810), amount: 1800000, currency: 'NGN', bankAccountId: BANK_ACCOUNTS[0].id, bankAccount: BANK_ACCOUNTS[0], status: 'COMPLETED', reference: 'PO-1001', description: 'Monthly payout', createdAt: daysFromNow(-20), completedAt: daysFromNow(-19) },
    { id: id(811), amount: 240000, currency: 'NGN', bankAccountId: BANK_ACCOUNTS[0].id, bankAccount: BANK_ACCOUNTS[0], status: 'PROCESSING', reference: 'PO-1002', description: 'Agent earnings', createdAt: daysFromNow(-1) },
];

export const PAYOUT_SETTINGS: PayoutSettings = { payoutSchedule: 'monthly', minimumPayoutAmount: 150000, autoPayoutEnabled: true };

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

export const TENANT_DASHBOARD: TenantDashboard = {
    nextPayment: { amount: 550000, dueDate: daysFromNow(4), status: 'Due Soon' },
    lease: { remaining: '3 months', endDate: daysFromNow(90), status: 'Active' },
    maintenanceRequests: 2,
    property: {
        name: LEKKI.name,
        address: '14 Admiralty Way, Lekki Phase 1',
        image: LEKKI.primaryImage ?? '',
        landlordName: 'Tunde Bakare',
        landlordPhone: USERS.LANDLORD.phone ?? undefined,
        leaseStart: LEASES[0].startDate,
        leaseEnd: LEASES[0].endDate,
        monthlyRent: 550000,
    },
    recentPayments: TENANT_PAYMENTS.slice(1),
    maintenanceLog: [
        { id: id(400), title: 'Kitchen sink leaking', status: 'In progress', statusColor: 'text-pending', icon: 'plumbing', iconBg: 'bg-pending-bg', description: 'Agent visit booked for tomorrow.' },
        { id: id(401), title: 'Bedroom air conditioner', status: 'Submitted', statusColor: 'text-slate-500', icon: 'ac_unit', iconBg: 'bg-neutral-bg', description: 'Waiting for the landlord to assign someone.' },
        { id: id(402), title: 'Security lights replaced', status: 'Completed', statusColor: 'text-verified', icon: 'lightbulb', iconBg: 'bg-verified-bg', description: 'Closed 12 days ago.', completed: true },
    ],
    applicationsList: [
        { id: id(300), address: '7 Bourdillon Road', city: 'Ikoyi', status: 'Under review', statusColor: 'bg-pending-bg text-pending', date: daysFromNow(-6), image: IKOYI.primaryImage ?? '' },
    ],
    savedProperties: [MAITAMA, YABA].map((p) => ({ id: p.id, address: p.address.street ?? '', city: p.address.city ?? '', price: '₦' + p.price.toLocaleString('en-NG'), image: p.primaryImage ?? '' })),
};

export const LANDLORD_DASHBOARD: LandlordDashboard = {
    totalRevenue: 2050000,
    revenueChange: 8.5,
    monthlyRevenue: 2050000,
    occupancyRate: 75,
    vacantUnits: 2,
    activeListings: 6,
    pendingListings: 1,
    actionRequired: 3,
    totalProperties: SUMMARIES.length,
    pendingApplications: 2,
    alertCount: 3,
    properties: SUMMARIES.slice(0, 6).map((p, i) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        occupancyStatus: p.status === 'RENTED' ? 'Occupied' : 'Vacant',
        monthlyRent: p.status === 'RENTED' ? 550000 : null,
        verificationTier: p.verificationTier,
        location: `${p.address.neighborhood}, ${p.address.city}`,
        image: p.primaryImage ?? undefined,
        bedrooms: p.bedrooms ?? undefined,
        views: 120 + i * 37,
        price: p.price,
        priceUnit: p.priceUnit,
    })),
};

export const LANDLORD_ALERTS: Alert[] = [
    { id: id(900), type: 'MAINTENANCE_EMERGENCY', title: 'Leak reported at Lekki Phase 1', description: 'Adaeze Okafor reported a leaking kitchen sink.', priority: 'high', actionUrl: '/landlord/maintenance', actionLabel: 'View request', relatedId: id(400), createdAt: daysFromNow(-1), isRead: false },
    { id: id(901), type: 'APPLICATION_NEW', title: 'New application for Maitama terrace', description: 'Ibrahim Musa applied to rent the 3-bedroom terrace.', priority: 'medium', actionUrl: '/landlord/tenants', actionLabel: 'Review application', relatedId: id(301), createdAt: daysFromNow(-3), isRead: false },
    { id: id(902), type: 'LEASE_EXPIRING', title: 'Lease ending in 90 days', description: 'The Lekki Phase 1 lease ends soon. A renewal offer is waiting for the tenant.', priority: 'low', actionUrl: '/landlord/leases/' + id(200), actionLabel: 'View lease', relatedId: id(200), createdAt: daysFromNow(-5), isRead: true },
];
LANDLORD_DASHBOARD.alerts = LANDLORD_ALERTS;

export const LANDLORD_FINANCIALS: LandlordFinancialSummary = {
    totalRevenue: 24600000,
    pendingPayouts: 550000,
    availableBalance: 3275000,
    recentTransactions: LANDLORD_TRANSACTIONS,
    revenueByProperty: [
        { propertyId: LEKKI.id, propertyName: LEKKI.name, revenue: 6600000 },
        { propertyId: MAITAMA.id, propertyName: MAITAMA.name, revenue: 12000000 },
        { propertyId: YABA.id, propertyName: YABA.name, revenue: 1800000 },
    ],
    revenueByMonth: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => ({ month, amount: 1700000 + i * 70000 })),
    expenseBreakdown: [
        { category: 'Maintenance', amount: 420000 },
        { category: 'Service fees', amount: 300000 },
        { category: 'Insurance', amount: 180000 },
    ],
};

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export const AGENT_JOBS: AgentJob[] = [
    { id: id(1100), type: 'Property inspection', property: IKOYI.name, city: 'Ikoyi', clientName: 'Tunde Bakare', date: appointment(2, 10), earnings: 45000, status: 'Open', priority: 'high', description: 'Gold-tier physical audit: confirm unit layout and photograph the meters.', contactPhone: USERS.LANDLORD.phone ?? undefined },
    { id: id(1101), type: 'Tenant viewing', property: MAITAMA.name, city: 'Abuja', clientName: 'Ibrahim Musa', date: appointment(3, 14), earnings: 20000, status: 'Open', priority: 'medium', description: 'Show the applicant round the terrace and the estate facilities.' },
    { id: id(1102), type: 'Maintenance visit', property: LEKKI.name, city: 'Lekki', clientName: 'Adaeze Okafor', date: appointment(1, 10), earnings: 15000, status: 'Accepted', priority: 'high', description: 'Leaking kitchen sink. Bring a basin wrench.', contactPhone: USERS.TENANT.phone ?? undefined },
    { id: id(1103), type: 'Move-in report', property: YABA.name, city: 'Yaba', clientName: 'Chioma Eze', date: appointment(-6, 11), earnings: 25000, status: 'Completed', priority: 'low' },
];

export const AGENT_EARNINGS: AgentEarnings = {
    availableBalance: 240000,
    pendingBalance: 60000,
    totalEarned: 1385000,
    totalWithdrawn: 1145000,
    earningsByMonth: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => ({ month, amount: 180000 + ((i * 47000) % 120000) })),
};

export const AGENT_SCHEDULE: AgentScheduleResponse = {
    jobs: [
        { id: id(1102), type: 'Maintenance visit', property: LEKKI.name, address: '14 Admiralty Way, Lekki Phase 1', date: daysFromNow(1), time: '10:00', clientName: 'Adaeze Okafor', clientPhone: USERS.TENANT.phone ?? undefined, status: 'Confirmed', payout: 15000 },
        { id: id(1104), type: 'Tenant viewing', property: IKOYI.name, address: '7 Bourdillon Road, Ikoyi', date: daysFromNow(2), time: '14:30', clientName: 'Folake Ade', status: 'Confirmed', payout: 20000 },
    ],
    availability: [
        { id: id(1200), date: daysFromNow(1), startTime: '09:00', endTime: '17:00', recurring: true, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    ],
};

// ---------------------------------------------------------------------------
// Notifications and messages
// ---------------------------------------------------------------------------

export const NOTIFICATIONS: Notification[] = [
    { id: id(1300), type: 'PAYMENT', title: 'Rent due in 4 days', body: '₦550,000 for 14 Admiralty Way is due on the 1st.', isRead: false, createdAt: daysFromNow(-0.2) },
    { id: id(1301), type: 'LEASE', title: 'Renewal offer received', body: 'Your landlord offered to renew for another year.', isRead: false, createdAt: daysFromNow(-5) },
    { id: id(1302), type: 'MAINTENANCE', title: 'Agent assigned', body: 'Kemi Adeyemi will visit about the kitchen sink.', isRead: true, createdAt: daysFromNow(-1) },
    { id: id(1303), type: 'VERIFICATION', title: 'Identity checked', body: 'Your NIN was checked. Your profile is now Silver.', isRead: true, createdAt: daysFromNow(-40) },
];

export const NOTIFICATION_PREFERENCES: NotificationPreferences = {
    email: true, push: true, sms: false,
    types: { payments: true, messages: true, marketing: false },
};

const participant = (u: User) => ({ userId: u.id, firstName: u.firstName ?? '', lastName: u.lastName ?? '', avatarUrl: u.avatarUrl ?? undefined, role: u.role });

export const MESSAGES: Record<string, Message[]> = {
    [id(1400)]: [
        { id: id(1410), conversationId: id(1400), senderId: USERS.TENANT.id, content: 'Good morning. The kitchen sink is leaking again.', isRead: true, createdAt: daysFromNow(-4) },
        { id: id(1411), conversationId: id(1400), senderId: USERS.LANDLORD.id, content: 'Thanks for letting me know. I have asked Kemi to come by tomorrow at 10.', isRead: true, createdAt: daysFromNow(-3.9) },
        { id: id(1412), conversationId: id(1400), senderId: USERS.TENANT.id, content: 'That works. I will be home.', isRead: false, createdAt: daysFromNow(-1) },
    ],
    [id(1401)]: [
        { id: id(1420), conversationId: id(1401), senderId: USERS.AGENT.id, content: 'Hi Adaeze, I will arrive around 10am with the parts.', isRead: false, createdAt: daysFromNow(-0.5) },
    ],
};

export const CONVERSATIONS: Conversation[] = [
    {
        id: id(1400), propertyId: LEKKI.id, property: { id: LEKKI.id, name: LEKKI.name, primaryImage: LEKKI.primaryImage },
        participants: [participant(USERS.TENANT), participant(USERS.LANDLORD)],
        lastMessage: MESSAGES[id(1400)].at(-1), unreadCount: 1, createdAt: daysFromNow(-4), updatedAt: daysFromNow(-1),
    },
    {
        id: id(1401), propertyId: LEKKI.id, property: { id: LEKKI.id, name: LEKKI.name, primaryImage: LEKKI.primaryImage },
        participants: [participant(USERS.TENANT), participant(USERS.AGENT)],
        lastMessage: MESSAGES[id(1401)].at(-1), unreadCount: 1, createdAt: daysFromNow(-0.5), updatedAt: daysFromNow(-0.5),
    },
];
