/**
 * HomeAI demo seed (Canada-flavoured).
 *
 * Wipes the schema in reverse-dep order then inserts a believable demo dataset
 * (~870 rows total) of Canadian users, properties, leases, payments, etc.
 *
 * Determinism: re-running with the same SEED_KEY produces identical output —
 * good for screenshots and regression checks. Set SEED_KEY env var to override
 * the default 'homeai-ca-2026'.
 *
 * Production guard: refuses to run when NODE_ENV === 'production' unless
 * ALLOW_PROD_SEED=true is also set.
 *
 * Demo accounts (all use password DemoPass123!):
 *   - admin@homeai.demo      (ADMIN)
 *   - landlord@homeai.demo   (LANDLORD)  — owns 4 properties incl 2 with live leases
 *   - tenant@homeai.demo     (TENANT)    — active lease + payment history + maintenance
 *   - agent@homeai.demo      (AGENT)     — 6 jobs across statuses
 *   - tenant2@homeai.demo    (TENANT)    — mid-onboarding (PENDING_SIGNATURES)
 */

import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================================================
// DETERMINISTIC PRNG
// ============================================================================

class XorShift32 {
    private state: number;

    constructor(seed: string) {
        let h = 1779033703 ^ seed.length;
        for (let i = 0; i < seed.length; i++) {
            h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        this.state = h || 0x9e3779b9;
    }

    next(): number {
        let x = this.state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x;
        return ((x >>> 0) / 0xffffffff);
    }
}

const prng = new XorShift32(process.env.SEED_KEY ?? 'homeai-ca-2026');
const rand = () => prng.next();

// ============================================================================
// HELPERS
// ============================================================================

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

function randomElement<T>(arr: readonly T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(rand() * (max - min + 1)) + min;
}

function pickN<T>(arr: readonly T[], n: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < Math.min(n, copy.length); i++) {
        const idx = Math.floor(rand() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

function randomDateInLastNDays(n: number): Date {
    const now = Date.now();
    const past = now - n * 24 * 60 * 60 * 1000;
    return new Date(past + rand() * (now - past));
}

function randomDateBetween(start: Date, end: Date): Date {
    return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
}

function addDays(d: Date, days: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return out;
}

function weighted<T>(choices: Array<{ value: T; weight: number }>): T {
    const total = choices.reduce((s, c) => s + c.weight, 0);
    let r = rand() * total;
    for (const c of choices) {
        if (r < c.weight) return c.value;
        r -= c.weight;
    }
    return choices[choices.length - 1].value;
}

function uuidShort(): string {
    return Math.floor(rand() * 0xffffffff).toString(16).padStart(8, '0');
}

function maybe<T>(value: T, probability: number): T | null {
    return rand() < probability ? value : null;
}

// ============================================================================
// FIXTURES — Canadian
// ============================================================================

const CITIES = [
    {
        city: 'Toronto', province: 'ON', timezone: 'America/Toronto',
        areaCode: '416', postalPrefixes: ['M5V', 'M4W', 'M5H', 'M6G', 'M5J', 'M4Y', 'M5T', 'M6K', 'M3J'],
        neighborhoods: ['Downtown', 'Liberty Village', 'King West', 'Yorkville', 'Leslieville', 'The Beaches', 'Kensington Market', 'Annex', 'Cabbagetown', 'Distillery District'],
        weight: 60,
        rentMid: 2800,
    },
    {
        city: 'Vancouver', province: 'BC', timezone: 'America/Vancouver',
        areaCode: '604', postalPrefixes: ['V6B', 'V5K', 'V6H', 'V6E', 'V6Z', 'V5T'],
        neighborhoods: ['Yaletown', 'Gastown', 'Kitsilano', 'Mount Pleasant', 'Coal Harbour', 'False Creek', 'West End'],
        weight: 20,
        rentMid: 3000,
    },
    {
        city: 'Montreal', province: 'QC', timezone: 'America/Toronto',
        areaCode: '514', postalPrefixes: ['H2X', 'H3A', 'H2J', 'H2T', 'H1Y'],
        neighborhoods: ['Plateau-Mont-Royal', 'Old Montreal', 'Mile End', 'Griffintown', 'Outremont'],
        weight: 10,
        rentMid: 1900,
    },
    {
        city: 'Calgary', province: 'AB', timezone: 'America/Edmonton',
        areaCode: '403', postalPrefixes: ['T2P', 'T2R', 'T3C', 'T2N'],
        neighborhoods: ['Beltline', 'Mission', 'Hillhurst', 'Kensington', 'Bridgeland', 'Inglewood'],
        weight: 10,
        rentMid: 1800,
    },
] as const;

type City = typeof CITIES[number];

const STREET_NAMES = [
    'King', 'Queen', 'Bay', 'Yonge', 'Bloor', 'Dundas', 'College', 'Spadina',
    'Bathurst', 'Adelaide', 'Wellington', 'Front', 'Richmond', 'Ossington',
    'Granville', 'Robson', 'Davie', 'Howe', 'Hornby', 'Burrard',
    'Saint-Denis', 'Saint-Laurent', 'Sherbrooke', 'Mont-Royal', 'Rachel',
    'Stephen Avenue', '4 Street', '17 Avenue', 'Memorial', 'Edmonton Trail',
    'Dufferin', 'Roncesvalles', 'Eglinton', 'St. Clair', 'Lansdowne',
];

const STREET_SUFFIXES = ['St', 'Ave', 'Blvd', 'Rd', 'Cres', 'Way', 'Lane', 'Pl'];

const FEMININE_NAMES = ['Sarah', 'Emily', 'Jessica', 'Ashley', 'Amanda', 'Megan', 'Priya', 'Aisha', 'Maya', 'Sophie', 'Olivia', 'Chloe', 'Maria', 'Jasmine', 'Aaliyah', 'Isabel', 'Yuki', 'Mei', 'Fatima', 'Anya', 'Hannah', 'Grace', 'Lily', 'Rachel'];
const MASCULINE_NAMES = ['Michael', 'David', 'James', 'Christopher', 'Daniel', 'Matthew', 'Andrew', 'Joshua', 'Ryan', 'John', 'Carlos', 'Liam', 'Noah', 'Ethan', 'Mason', 'Ahmed', 'Omar', 'Wei', 'Hiro', 'Raj', 'Marcus', 'Tyler', 'Nathan', 'Adam'];
const NEUTRAL_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Cameron', 'Jamie', 'Rowan'];
const ALL_FIRST_NAMES = [...FEMININE_NAMES, ...MASCULINE_NAMES, ...NEUTRAL_NAMES];

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Anderson', 'Wilson', 'Lee', 'Tremblay', 'Lefebvre', 'Roy', 'Gagnon', 'Chen', 'Singh', 'Patel', 'Khan', 'Nguyen', 'Wang', 'Kim', 'Tanaka', 'Ali', 'Hassan', 'Russo', 'MacDonald', 'Bouchard', 'Côté', 'Beaulieu', 'Reid'];

const PROPERTY_NAMES = [
    'The Sterling', 'Lumière Lofts', 'Trinity Square Residences', 'Harbour Pointe',
    'The Bay Tower', 'Adelaide Court', 'King West Lofts', 'Liberty Place',
    'Yorkville Plaza', 'Distillery Square', 'Annex Manor', 'Cabbagetown Heritage',
    'Granville Place', 'Gastown Lofts', 'False Creek Towers', 'Yaletown Park',
    'Coal Harbour Marina', 'Kits Beach House', 'Mount Pleasant Common',
    'Le Plateau Residences', 'Old Port Lofts', 'Mile End Studios', 'Griffintown Place',
    'Calgary Tower View', 'Beltline Walk', 'Mission Square', 'Bridgeland Homes',
    'Bloor Heights', 'Eglinton Junction', 'St. Clair Park', 'Ossington Avenue Lofts',
    'Robson Court', 'Davie Village Apartments', 'Hornby Garden',
    'Saint-Denis Studios', 'Sherbrooke Manor', 'Riverdale Residence',
    'Lakeshore Vista', 'Bridgepoint Loft', '17 Ave Penthouse',
    'Westside Commons', 'Eastview Heights', 'Northgate Apartments', 'Southport Place',
];

const AMENITIES = [
    'In-suite laundry', 'Dishwasher', 'Air conditioning', 'Heating included',
    'Hardwood floors', 'Stainless steel appliances', 'Walk-in closet',
    'Balcony', 'Patio', 'Backyard', 'Garage parking', 'Underground parking',
    'Gym', 'Pool', 'Sauna', 'Concierge', 'Rooftop terrace',
    'Pet-friendly', 'Storage locker', 'Bike room', 'Visitor parking',
    'High-speed internet', 'Fireplace', 'Smart home features',
];

const PROPERTY_DESCRIPTIONS = [
    'Bright south-facing unit with floor-to-ceiling windows and city views. Recently renovated kitchen with quartz countertops.',
    'Beautifully renovated heritage building blending classic charm with modern finishes. Steps from transit and great restaurants.',
    'Spacious open-concept layout perfect for entertaining. Walk to coffee shops, parks, and the waterfront.',
    'Quiet tree-lined street, family-friendly neighbourhood with top schools nearby. Backyard with mature trees.',
    'Walking distance to restaurants, cafes, and parks. Transit at your doorstep — bike room and storage included.',
    'Recently updated kitchen with quartz countertops and high-end appliances. In-suite laundry, balcony, pet-friendly.',
    'Sun-filled corner unit with two private balconies overlooking the harbour. Underground parking, locker.',
    'Boutique low-rise with only 12 suites, professionally managed building. Quiet street, walkable to everything.',
    'Loft-style suite with exposed brick, original beams, and 11-foot ceilings. Heritage character with modern updates.',
    'Modern penthouse with private rooftop terrace and panoramic skyline views. Concierge, gym, indoor pool.',
];

const MAINTENANCE_TITLES_BY_CATEGORY: Record<string, string[]> = {
    PLUMBING: ['Leaky kitchen faucet', 'Toilet runs constantly', 'Low water pressure in shower', 'Drain backed up'],
    ELECTRICAL: ['Outlet not working in bedroom', 'Breaker keeps tripping', 'Light fixture flickering', 'Smoke detector beeping'],
    HVAC: ['No heat in living room', 'AC not cooling', 'Furnace making noise', 'Thermostat unresponsive'],
    APPLIANCES: ['Fridge not cooling', 'Oven won\'t heat up', 'Washing machine vibrating', 'Dishwasher leaking'],
    STRUCTURAL: ['Cracked tile in kitchen', 'Window won\'t close properly', 'Door hinge loose', 'Drywall damaged in hallway'],
    PEST: ['Mice in kitchen', 'Ants in bathroom'],
    GENERAL: ['Lightbulb replacement needed', 'Touch-up paint requested', 'Carpet cleaning needed'],
};

const MAINTENANCE_CATEGORIES = Object.keys(MAINTENANCE_TITLES_BY_CATEGORY);

const AGENT_JOB_TITLES_BY_TYPE: Record<string, string[]> = {
    PROPERTY_VIEWING: ['Show 2BR to potential tenants', 'Open house — Saturday afternoon', 'Private showing with applicant'],
    PROPERTY_AUDIT: ['Annual property condition audit', 'Pre-listing assessment', 'Move-out inspection'],
    MAINTENANCE: ['Coordinate plumbing repair', 'Oversee paint touch-up', 'Vendor walkthrough'],
    KEY_HANDOVER: ['New tenant move-in — keys + welcome', 'Returning tenant — re-key needed'],
    INSPECTION: ['Move-in condition inspection', 'Quarterly walkthrough', 'Insurance claim documentation'],
    PHOTOGRAPHY: ['Listing photography — apartment', 'Listing photography + 3D tour'],
};

const PROPERTY_TYPES_WEIGHTED = [
    { value: 'APARTMENT', weight: 52 },
    { value: 'HOUSE', weight: 22 },
    { value: 'TOWNHOUSE', weight: 15 },
    { value: 'STUDIO', weight: 5 },
    { value: 'PENTHOUSE', weight: 3 },
    { value: 'DUPLEX', weight: 2 },
    { value: 'BUNGALOW', weight: 1 },
];

// ============================================================================
// DEMO ACCOUNTS — fixed UUIDs + emails + state
// ============================================================================

const DEMO_PASSWORD = 'DemoPass123!';

const DEMO_ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const DEMO_LANDLORD_ID = '22222222-2222-2222-2222-222222222222';
const DEMO_TENANT_ID = '33333333-3333-3333-3333-333333333333';
const DEMO_AGENT_ID = '44444444-4444-4444-4444-444444444444';
const DEMO_TENANT2_ID = '55555555-5555-5555-5555-555555555555';

const DEMO_ACCOUNTS = [
    {
        id: DEMO_ADMIN_ID,
        email: 'admin@homeai.demo',
        firstName: 'Alex',
        lastName: 'Reid',
        phone: '+14165550100',
        role: 'ADMIN' as const,
        verificationLevel: 'PLATINUM' as const,
        city: CITIES[0], // Toronto
    },
    {
        id: DEMO_LANDLORD_ID,
        email: 'landlord@homeai.demo',
        firstName: 'Sarah',
        lastName: 'Chen',
        phone: '+14165550101',
        role: 'LANDLORD' as const,
        verificationLevel: 'GOLD' as const,
        city: CITIES[0], // Toronto
    },
    {
        id: DEMO_TENANT_ID,
        email: 'tenant@homeai.demo',
        firstName: 'John',
        lastName: 'Carter',
        phone: '+14165550102',
        role: 'TENANT' as const,
        verificationLevel: 'GOLD' as const,
        city: CITIES[0], // Toronto
    },
    {
        id: DEMO_AGENT_ID,
        email: 'agent@homeai.demo',
        firstName: 'Priya',
        lastName: 'Singh',
        phone: '+16045550103',
        role: 'AGENT' as const,
        verificationLevel: 'GOLD' as const,
        city: CITIES[1], // Vancouver
    },
    {
        id: DEMO_TENANT2_ID,
        email: 'tenant2@homeai.demo',
        firstName: 'Maya',
        lastName: 'Lefebvre',
        phone: '+15145550104',
        role: 'TENANT' as const,
        verificationLevel: 'SILVER' as const,
        city: CITIES[2], // Montreal
    },
];

// ============================================================================
// FAKER-LIKE GENERATORS
// ============================================================================

function pickCity(): City {
    return weighted(CITIES.map(c => ({ value: c, weight: c.weight })));
}

function makePostalCode(city: City): string {
    const prefix = randomElement(city.postalPrefixes);
    const rest = `${randomInt(0, 9)}${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(0, 9)}`;
    return `${prefix} ${rest}`;
}

function makeStreetAddress(): string {
    const num = randomInt(10, 999);
    const name = randomElement(STREET_NAMES);
    const suffix = randomElement(STREET_SUFFIXES);
    return `${num} ${name} ${suffix}`;
}

function makePhone(city: City): string {
    return `+1${city.areaCode}${randomInt(2000000, 9999999)}`;
}

function makeEmail(firstName: string, lastName: string, salt: number): string {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${salt}@homeai-demo.test`;
}

function makeAvatarUrl(userId: string): string {
    return `https://i.pravatar.cc/150?u=${userId}`;
}

function makePropertyImage(propertyId: string, n: number): string {
    return `https://picsum.photos/seed/${propertyId}-${n}/800/600`;
}

function makeMaintenanceImage(requestId: string, n: number): string {
    return `https://picsum.photos/seed/maint-${requestId}-${n}/600/400`;
}

function makeDocUrl(userId: string, docType: string): string {
    return `https://example.com/docs/${userId}/${docType}.pdf`;
}

function makeMatterportUrl(): string {
    return `https://my.matterport.com/show/?m=mock${uuidShort()}`;
}

// ============================================================================
// SEED — CLEARDOWN
// ============================================================================

async function clearDown(): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    // Reverse-dep order. Some are cascade-delete via FK but we list them
    // explicitly to make the dependency invariant visible.
    await prisma.aiSessionMessage.deleteMany();
    await prisma.aiSession.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.agentAvailability.deleteMany();
    await prisma.applicantInvitation.deleteMany();
    await prisma.session.deleteMany();
    await prisma.connectedAccount.deleteMany();
    await prisma.document.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.deviceToken.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.agentJob.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    // Escrow has its own table in some shapes of the schema; if it's modelled
    // as a column on Transaction, this is a no-op.
    try {
        const maybeEscrow = (prisma as unknown as { escrow?: { deleteMany: () => Promise<unknown> } }).escrow;
        if (maybeEscrow) await maybeEscrow.deleteMany();
    } catch { /* ignore — no Escrow table */ }
    await prisma.transaction.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.application.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.propertyMedia.deleteMany();
    await prisma.property.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
}

// ============================================================================
// SEED — USERS
// ============================================================================

interface SeededUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'TENANT' | 'LANDLORD' | 'AGENT' | 'ADMIN';
    verificationLevel: 'UNVERIFIED' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    regionCode: string;
    city: City;
}

async function seedUsers(): Promise<{
    demo: Record<string, SeededUser>;
    admins: SeededUser[];
    landlords: SeededUser[];
    tenants: SeededUser[];
    agents: SeededUser[];
}> {
    console.log('👤 Seeding users...');
    const sharedHash = await hashPassword(DEMO_PASSWORD);

    // Demo accounts — fixed UUIDs.
    const demoSeeded: Record<string, SeededUser> = {};
    for (const acct of DEMO_ACCOUNTS) {
        await prisma.user.create({
            data: {
                id: acct.id,
                email: acct.email,
                passwordHash: sharedHash,
                firstName: acct.firstName,
                lastName: acct.lastName,
                phone: acct.phone,
                role: acct.role,
                verificationLevel: acct.verificationLevel,
                regionCode: 'CA',
                isActive: true,
                isEmailVerified: true,
                twoFactorEnabled: false,
                avatarUrl: makeAvatarUrl(acct.id),
                createdAt: addDays(new Date(), -180),
                updatedAt: new Date(),
            },
        });
        demoSeeded[acct.email] = {
            id: acct.id,
            email: acct.email,
            firstName: acct.firstName,
            lastName: acct.lastName,
            phone: acct.phone,
            role: acct.role,
            verificationLevel: acct.verificationLevel,
            regionCode: 'CA',
            city: acct.city,
        };
    }

    // 1 extra ADMIN (reviewer-helper) + 12 LANDLORDs + 30 TENANTs + 8 AGENTs.
    const admins: SeededUser[] = [demoSeeded['admin@homeai.demo']];
    const landlords: SeededUser[] = [demoSeeded['landlord@homeai.demo']];
    const tenants: SeededUser[] = [demoSeeded['tenant@homeai.demo'], demoSeeded['tenant2@homeai.demo']];
    const agents: SeededUser[] = [demoSeeded['agent@homeai.demo']];

    const profile = async (count: number, role: SeededUser['role'], bucket: SeededUser[]) => {
        for (let i = 0; i < count; i++) {
            const firstName = randomElement(ALL_FIRST_NAMES);
            const lastName = randomElement(LAST_NAMES);
            const city = pickCity();
            const verificationLevel = weighted([
                { value: 'UNVERIFIED' as const, weight: 30 },
                { value: 'BRONZE' as const, weight: 35 },
                { value: 'SILVER' as const, weight: 20 },
                { value: 'GOLD' as const, weight: 12 },
                { value: 'PLATINUM' as const, weight: 3 },
            ]);
            const created = await prisma.user.create({
                data: {
                    email: makeEmail(firstName, lastName, bucket.length + 1),
                    passwordHash: sharedHash,
                    firstName,
                    lastName,
                    phone: makePhone(city),
                    role,
                    verificationLevel,
                    regionCode: 'CA',
                    isActive: true,
                    isEmailVerified: rand() < 0.9,
                    twoFactorEnabled: rand() < 0.15,
                    avatarUrl: makeAvatarUrl(`gen-${role}-${i}`),
                    createdAt: randomDateInLastNDays(180),
                    updatedAt: new Date(),
                },
            });
            bucket.push({
                id: created.id,
                email: created.email,
                firstName: created.firstName ?? '',
                lastName: created.lastName ?? '',
                phone: created.phone ?? '',
                role,
                verificationLevel,
                regionCode: 'CA',
                city,
            });
        }
    };

    await profile(1, 'ADMIN', admins);
    await profile(11, 'LANDLORD', landlords);
    await profile(28, 'TENANT', tenants);
    await profile(7, 'AGENT', agents);

    console.log(`  ✓ ${admins.length + landlords.length + tenants.length + agents.length} users (${admins.length} admins, ${landlords.length} landlords, ${tenants.length} tenants, ${agents.length} agents)`);

    return { demo: demoSeeded, admins, landlords, tenants, agents };
}

// ============================================================================
// SEED — USER PROFILES
// ============================================================================

async function seedUserProfiles(allUsers: SeededUser[]): Promise<void> {
    console.log('📇 Seeding user profiles...');
    const nonAdmins = allUsers.filter(u => u.role !== 'ADMIN');
    for (const user of nonAdmins) {
        const profileData: Record<string, unknown> = {
            bio: `${user.firstName} is a ${user.role.toLowerCase()} based in ${user.city.city}, ${user.city.province}.`,
            city: user.city.city,
            province: user.city.province,
        };
        if (user.role === 'AGENT') {
            profileData.licenseNumber = `RECO-${randomInt(100000, 999999)}`;
            profileData.licenseRegulator = user.city.province === 'BC' ? 'BCFSA' : user.city.province === 'QC' ? 'OACIQ' : 'RECO';
            profileData.specialties = pickN(['Residential rentals', 'Condos', 'Short-term', 'Property management', 'New construction'], randomInt(1, 3));
        } else if (user.role === 'LANDLORD') {
            profileData.preferredPaymentMethod = 'bank_transfer';
        } else {
            profileData.employmentStatus = randomElement(['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'EMPLOYED']);
            profileData.monthlyIncome = randomInt(3500, 12000);
        }
        await prisma.userProfile.create({
            data: {
                userId: user.id,
                profileData: profileData as Prisma.JsonObject,
                createdAt: randomDateInLastNDays(160),
                updatedAt: new Date(),
            },
        });
    }
    console.log(`  ✓ ${nonAdmins.length} user profiles`);
}

// ============================================================================
// SEED — PROPERTIES + MEDIA
// ============================================================================

interface SeededProperty {
    id: string;
    ownerId: string;
    name: string;
    listingType: 'RENT' | 'SALE' | 'SHORT_LET';
    price: number;
    monthlyRent: number;
    status: string;
    city: City;
    regionCode: string;
}

async function seedProperties(landlords: SeededUser[]): Promise<SeededProperty[]> {
    console.log('🏠 Seeding properties + media...');
    const properties: SeededProperty[] = [];
    let propertiesCreated = 0;

    // First: 4 curated properties for the demo landlord (Sarah Chen).
    const demoLandlord = landlords.find(l => l.email === 'landlord@homeai.demo')!;
    const sarahProperties = [
        // [0] RENTED — will host the demo tenant's active lease.
        { name: 'King West Lofts #1204', listingType: 'RENT' as const, status: 'RENTED', city: CITIES[0], type: 'APARTMENT', bedrooms: 2, bathrooms: 2, rent: 3200 },
        // [1] RENTED — second occupied unit.
        { name: 'Liberty Village Junction #408', listingType: 'RENT' as const, status: 'RENTED', city: CITIES[0], type: 'APARTMENT', bedrooms: 1, bathrooms: 1, rent: 2600 },
        // [2] ACTIVE — listed; will receive pending applications (incl. tenant2@homeai.demo with PENDING_SIGNATURES).
        { name: 'Yorkville Plaza #2902', listingType: 'RENT' as const, status: 'ACTIVE', city: CITIES[0], type: 'APARTMENT', bedrooms: 2, bathrooms: 2, rent: 3800 },
        // [3] DRAFT — not yet listed.
        { name: 'The Annex Heritage', listingType: 'RENT' as const, status: 'DRAFT', city: CITIES[0], type: 'HOUSE', bedrooms: 3, bathrooms: 2, rent: 4500 },
    ];
    for (const p of sarahProperties) {
        const created = await prisma.property.create({
            data: {
                ownerId: demoLandlord.id,
                name: p.name,
                description: randomElement(PROPERTY_DESCRIPTIONS),
                propertyType: p.type as never,
                listingType: p.listingType,
                price: p.rent,
                priceUnit: 'PER_MONTH',
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                squareFeet: randomInt(700, 1800),
                yearBuilt: randomInt(1990, 2023),
                addressStreet: makeStreetAddress(),
                addressCity: p.city.city,
                addressState: p.city.province,
                addressZip: makePostalCode(p.city),
                addressNeighborhood: randomElement(p.city.neighborhoods),
                latitude: 43.65 + (rand() - 0.5) * 0.1,
                longitude: -79.38 + (rand() - 0.5) * 0.1,
                amenities: pickN(AMENITIES, randomInt(5, 10)),
                status: p.status as never,
                verificationTier: 'GOLD',
                regionCode: 'CA',
                createdAt: addDays(new Date(), -randomInt(60, 180)),
                updatedAt: new Date(),
            },
        });
        properties.push({
            id: created.id,
            ownerId: demoLandlord.id,
            name: p.name,
            listingType: p.listingType,
            price: p.rent,
            monthlyRent: p.rent,
            status: p.status,
            city: p.city,
            regionCode: 'CA',
        });
        propertiesCreated++;
    }

    // Other landlords: ~3.5 properties each.
    const otherLandlords = landlords.filter(l => l.email !== 'landlord@homeai.demo');
    for (const landlord of otherLandlords) {
        const n = randomInt(2, 5);
        for (let i = 0; i < n; i++) {
            const city = landlord.city;
            const type = weighted(PROPERTY_TYPES_WEIGHTED);
            const listingType = weighted([
                { value: 'RENT' as const, weight: 85 },
                { value: 'SALE' as const, weight: 10 },
                { value: 'SHORT_LET' as const, weight: 5 },
            ]);
            const status = weighted([
                { value: 'ACTIVE' as const, weight: 60 },
                { value: 'RENTED' as const, weight: 22 },
                { value: 'DRAFT' as const, weight: 7 },
                { value: 'PENDING_REVIEW' as const, weight: 7 },
                { value: 'INACTIVE' as const, weight: 4 },
            ]);
            const rent = Math.round((city.rentMid + (rand() - 0.5) * 1500) / 50) * 50;
            const priceUnit = listingType === 'SHORT_LET' ? 'PER_NIGHT' : listingType === 'SALE' ? 'TOTAL' : 'PER_MONTH';
            const price = listingType === 'SHORT_LET' ? randomInt(80, 250) :
                           listingType === 'SALE' ? randomInt(400, 1200) * 1000 :
                           rent;
            const created = await prisma.property.create({
                data: {
                    ownerId: landlord.id,
                    name: randomElement(PROPERTY_NAMES),
                    description: randomElement(PROPERTY_DESCRIPTIONS),
                    propertyType: type as never,
                    listingType,
                    price,
                    priceUnit,
                    bedrooms: randomInt(1, 4),
                    bathrooms: randomInt(1, 3),
                    squareFeet: randomInt(500, 2400),
                    yearBuilt: randomInt(1965, 2024),
                    addressStreet: makeStreetAddress(),
                    addressCity: city.city,
                    addressState: city.province,
                    addressZip: makePostalCode(city),
                    addressNeighborhood: randomElement(city.neighborhoods),
                    latitude: 43.65 + (rand() - 0.5) * 0.1,
                    longitude: -79.38 + (rand() - 0.5) * 0.1,
                    amenities: pickN(AMENITIES, randomInt(3, 9)),
                    status: status as never,
                    verificationTier: weighted([
                        { value: 'UNVERIFIED' as const, weight: 35 },
                        { value: 'BRONZE' as const, weight: 30 },
                        { value: 'SILVER' as const, weight: 20 },
                        { value: 'GOLD' as const, weight: 12 },
                        { value: 'PLATINUM' as const, weight: 3 },
                    ]),
                    regionCode: 'CA',
                    createdAt: randomDateInLastNDays(120),
                    updatedAt: new Date(),
                },
            });
            properties.push({
                id: created.id,
                ownerId: landlord.id,
                name: created.name,
                listingType,
                price: Number(price),
                monthlyRent: rent,
                status,
                city,
                regionCode: 'CA',
            });
            propertiesCreated++;
        }
    }

    // Media: ≥3 IMAGE per property + selective FLOOR_PLAN/TOUR_3D/VIDEO/DOCUMENT.
    let mediaCount = 0;
    for (const p of properties) {
        const imageCount = randomInt(3, 6);
        for (let i = 0; i < imageCount; i++) {
            await prisma.propertyMedia.create({
                data: {
                    propertyId: p.id,
                    url: makePropertyImage(p.id, i),
                    type: 'IMAGE',
                    isPrimary: i === 0,
                    caption: i === 0 ? 'Main listing photo' : null,
                    orderIndex: i,
                    createdAt: addDays(new Date(), -randomInt(0, 90)),
                },
            });
            mediaCount++;
        }
        if (rand() < 0.5) {
            await prisma.propertyMedia.create({
                data: {
                    propertyId: p.id,
                    url: makeDocUrl(p.id, 'floor-plan'),
                    type: 'FLOOR_PLAN',
                    isPrimary: false,
                    caption: 'Floor plan',
                    orderIndex: 100,
                    createdAt: addDays(new Date(), -randomInt(0, 90)),
                },
            });
            mediaCount++;
        }
        if (rand() < 0.2) {
            await prisma.propertyMedia.create({
                data: {
                    propertyId: p.id,
                    url: makeMatterportUrl(),
                    type: 'TOUR_3D',
                    isPrimary: false,
                    caption: '3D virtual tour',
                    orderIndex: 110,
                    createdAt: addDays(new Date(), -randomInt(0, 90)),
                },
            });
            mediaCount++;
        }
        if (rand() < 0.15) {
            await prisma.propertyMedia.create({
                data: {
                    propertyId: p.id,
                    url: makePropertyImage(p.id, 99),
                    type: 'VIDEO',
                    isPrimary: false,
                    caption: 'Walkthrough video',
                    orderIndex: 120,
                    createdAt: addDays(new Date(), -randomInt(0, 90)),
                },
            });
            mediaCount++;
        }
    }

    console.log(`  ✓ ${propertiesCreated} properties + ${mediaCount} media`);
    return properties;
}

// ============================================================================
// SEED — VERIFICATIONS
// ============================================================================

async function seedVerifications(
    allUsers: SeededUser[],
    properties: SeededProperty[],
    reviewerId: string,
): Promise<void> {
    console.log('🪪 Seeding verifications...');
    const nonAdmins = allUsers.filter(u => u.role !== 'ADMIN');
    let count = 0;

    const docTypes = ['drivers_license_ca', 'passport_ca', 'pr_card', 'citizenship_card'];

    for (const user of nonAdmins) {
        // IDENTITY (every non-admin).
        const status = weighted([
            { value: 'APPROVED' as const, weight: 65 },
            { value: 'PENDING' as const, weight: 20 },
            { value: 'IN_REVIEW' as const, weight: 10 },
            { value: 'REJECTED' as const, weight: 5 },
        ]);
        const docType = randomElement(docTypes);
        await prisma.verification.create({
            data: {
                userId: user.id,
                requestedBy: user.id,
                type: 'IDENTITY',
                level: user.verificationLevel,
                status,
                documentUrl: makeDocUrl(user.id, docType),
                documentType: docType,
                documentNumber: `MOCK-${uuidShort()}`,
                submittedAt: randomDateInLastNDays(120),
                reviewedAt: status === 'APPROVED' || status === 'REJECTED' ? randomDateInLastNDays(60) : null,
                reviewedById: status === 'APPROVED' || status === 'REJECTED' ? reviewerId : null,
                metadata: {
                    provider: 'onfido',
                    applicantId: `appl_mock_${uuidShort()}`,
                    livenessChecked: true,
                } as Prisma.JsonObject,
                createdAt: randomDateInLastNDays(150),
                updatedAt: new Date(),
            },
        });
        count++;

        // ADDRESS for GOLD/PLATINUM only.
        if (user.verificationLevel === 'GOLD' || user.verificationLevel === 'PLATINUM') {
            await prisma.verification.create({
                data: {
                    userId: user.id,
                    requestedBy: user.id,
                    type: 'ADDRESS',
                    level: user.verificationLevel,
                    status: 'APPROVED',
                    documentUrl: makeDocUrl(user.id, 'utility-bill'),
                    documentType: 'utility_bill',
                    submittedAt: randomDateInLastNDays(120),
                    reviewedAt: randomDateInLastNDays(60),
                    reviewedById: reviewerId,
                    metadata: {} as Prisma.JsonObject,
                    createdAt: randomDateInLastNDays(120),
                    updatedAt: new Date(),
                },
            });
            count++;
        }

        // PHONE for a subset.
        if (rand() < 0.1) {
            await prisma.verification.create({
                data: {
                    userId: user.id,
                    requestedBy: user.id,
                    type: 'PHONE',
                    level: 'BRONZE',
                    status: 'APPROVED',
                    documentType: 'sms_code',
                    submittedAt: randomDateInLastNDays(120),
                    reviewedAt: randomDateInLastNDays(60),
                    metadata: {} as Prisma.JsonObject,
                    createdAt: randomDateInLastNDays(120),
                    updatedAt: new Date(),
                },
            });
            count++;
        }
    }

    // PROPERTY_OWNERSHIP for GOLD/PLATINUM tier properties.
    const goldProperties = properties.filter(p => rand() < 0.15);
    for (const p of goldProperties) {
        await prisma.verification.create({
            data: {
                propertyId: p.id,
                requestedBy: p.ownerId,
                type: 'PROPERTY_OWNERSHIP',
                level: 'GOLD',
                status: 'APPROVED',
                documentUrl: makeDocUrl(p.id, 'title-search'),
                documentType: 'title_search',
                submittedAt: randomDateInLastNDays(90),
                reviewedAt: randomDateInLastNDays(30),
                reviewedById: reviewerId,
                metadata: { titleRegistry: 'Teranet (Ontario)' } as Prisma.JsonObject,
                createdAt: randomDateInLastNDays(90),
                updatedAt: new Date(),
            },
        });
        count++;
    }

    console.log(`  ✓ ${count} verifications`);
}

// ============================================================================
// SEED — APPLICATIONS
// ============================================================================

interface SeededApplication {
    id: string;
    propertyId: string;
    tenantId: string;
    status: string;
}

async function seedApplications(
    properties: SeededProperty[],
    tenants: SeededUser[],
    demoTenant: SeededUser,
    demoTenant2: SeededUser,
    sarahListedProperty: SeededProperty,
): Promise<SeededApplication[]> {
    console.log('📝 Seeding applications...');
    const apps: SeededApplication[] = [];

    // tenant2's APPROVED application on Sarah's listed property — drives the
    // PENDING_SIGNATURES lease state.
    const a1 = await prisma.application.create({
        data: {
            propertyId: sarahListedProperty.id,
            tenantId: demoTenant2.id,
            status: 'APPROVED',
            moveInDate: addDays(new Date(), 14),
            leaseTerm: 12,
            personalInfo: {
                firstName: demoTenant2.firstName,
                lastName: demoTenant2.lastName,
                email: demoTenant2.email,
            } as Prisma.JsonObject,
            employmentInfo: {
                status: 'EMPLOYED',
                employer: 'Bell Canada',
                position: 'Software Engineer',
                monthlyIncome: 9500,
            } as Prisma.JsonObject,
            documents: [makeDocUrl(demoTenant2.id, 'employment-letter')] as Prisma.JsonArray,
            additionalNotes: 'Excited to move in — no pets, non-smoker.',
            submittedAt: addDays(new Date(), -7),
            updatedAt: addDays(new Date(), -2),
        },
    });
    apps.push({ id: a1.id, propertyId: sarahListedProperty.id, tenantId: demoTenant2.id, status: 'APPROVED' });

    // Pending applicants on Sarah's listed property — 3 of them.
    for (let i = 0; i < 3; i++) {
        const tenant = randomElement(tenants.filter(t => t.id !== demoTenant.id && t.id !== demoTenant2.id));
        const created = await prisma.application.create({
            data: {
                propertyId: sarahListedProperty.id,
                tenantId: tenant.id,
                status: i === 0 ? 'UNDER_REVIEW' : 'PENDING',
                moveInDate: addDays(new Date(), randomInt(14, 60)),
                leaseTerm: 12,
                personalInfo: {
                    firstName: tenant.firstName,
                    lastName: tenant.lastName,
                    email: tenant.email,
                } as Prisma.JsonObject,
                employmentInfo: {
                    status: randomElement(['EMPLOYED', 'SELF_EMPLOYED']),
                    monthlyIncome: randomInt(4500, 11000),
                } as Prisma.JsonObject,
                submittedAt: randomDateInLastNDays(14),
                updatedAt: randomDateInLastNDays(7),
            },
        });
        apps.push({ id: created.id, propertyId: sarahListedProperty.id, tenantId: tenant.id, status: i === 0 ? 'UNDER_REVIEW' : 'PENDING' });
    }

    // Random applications across other ACTIVE rental properties.
    const rentableProps = properties.filter(p => p.status === 'ACTIVE' && p.listingType === 'RENT' && p.id !== sarahListedProperty.id);
    let extras = 0;
    while (apps.length < 45 && extras < 60) {
        const property = randomElement(rentableProps);
        const tenant = randomElement(tenants.filter(t => t.id !== demoTenant.id && t.id !== demoTenant2.id));
        const status = weighted([
            { value: 'PENDING' as const, weight: 40 },
            { value: 'UNDER_REVIEW' as const, weight: 20 },
            { value: 'APPROVED' as const, weight: 18 },
            { value: 'REJECTED' as const, weight: 13 },
            { value: 'LEASE_OFFERED' as const, weight: 7 },
            { value: 'WITHDRAWN' as const, weight: 2 },
        ]);
        try {
            const created = await prisma.application.create({
                data: {
                    propertyId: property.id,
                    tenantId: tenant.id,
                    status: status as never,
                    moveInDate: addDays(new Date(), randomInt(14, 90)),
                    leaseTerm: randomElement([6, 12, 12, 24]),
                    personalInfo: {
                        firstName: tenant.firstName,
                        lastName: tenant.lastName,
                        email: tenant.email,
                    } as Prisma.JsonObject,
                    employmentInfo: {
                        status: randomElement(['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT']),
                        monthlyIncome: randomInt(3000, 12000),
                    } as Prisma.JsonObject,
                    submittedAt: randomDateInLastNDays(30),
                    updatedAt: randomDateInLastNDays(15),
                },
            });
            apps.push({ id: created.id, propertyId: property.id, tenantId: tenant.id, status });
        } catch { /* unique constraint maybe; skip */ }
        extras++;
    }

    console.log(`  ✓ ${apps.length} applications`);
    return apps;
}

// ============================================================================
// SEED — LEASES (+ flip property status to RENTED)
// ============================================================================

interface SeededLease {
    id: string;
    propertyId: string;
    tenantId: string;
    landlordId: string;
    monthlyRent: number;
    startDate: Date;
    endDate: Date;
    status: string;
}

async function seedLeases(
    properties: SeededProperty[],
    demoLandlord: SeededUser,
    demoTenant: SeededUser,
    demoTenant2: SeededUser,
    sarahProperties: SeededProperty[],
): Promise<SeededLease[]> {
    console.log('📄 Seeding leases...');
    const leases: SeededLease[] = [];

    // Demo: John's ACTIVE lease on Sarah's #1204.
    const sarahActive1 = sarahProperties[0];
    const johnStart = addDays(new Date(), -120);
    const johnEnd = addDays(johnStart, 365);
    const johnLease = await prisma.lease.create({
        data: {
            propertyId: sarahActive1.id,
            tenantId: demoTenant.id,
            landlordId: demoLandlord.id,
            startDate: johnStart,
            endDate: johnEnd,
            monthlyRent: sarahActive1.monthlyRent,
            securityDeposit: sarahActive1.monthlyRent,
            terms: {
                paymentDueDay: 1,
                lateFeePercentage: 5,
                gracePeriodDays: 5,
                noticePeriodDays: 60,
                petsAllowed: true,
                sublettingAllowed: false,
                maintenanceResponsibility: 'landlord',
            } as Prisma.JsonObject,
            status: 'ACTIVE',
            signedByTenant: true,
            signedByLandlord: true,
            createdAt: addDays(johnStart, -3),
            updatedAt: addDays(johnStart, 1),
        },
    });
    leases.push({
        id: johnLease.id,
        propertyId: sarahActive1.id,
        tenantId: demoTenant.id,
        landlordId: demoLandlord.id,
        monthlyRent: sarahActive1.monthlyRent,
        startDate: johnStart,
        endDate: johnEnd,
        status: 'ACTIVE',
    });

    // Demo: tenant2's PENDING_SIGNATURES lease on Sarah's listed property.
    const sarahListed = sarahProperties[2];
    const mayaStart = addDays(new Date(), 14);
    const mayaEnd = addDays(mayaStart, 365);
    const mayaLease = await prisma.lease.create({
        data: {
            propertyId: sarahListed.id,
            tenantId: demoTenant2.id,
            landlordId: demoLandlord.id,
            startDate: mayaStart,
            endDate: mayaEnd,
            monthlyRent: sarahListed.monthlyRent,
            securityDeposit: sarahListed.monthlyRent,
            terms: {
                paymentDueDay: 1,
                noticePeriodDays: 60,
                petsAllowed: false,
                sublettingAllowed: false,
                maintenanceResponsibility: 'landlord',
            } as Prisma.JsonObject,
            status: 'PENDING_SIGNATURES',
            signedByTenant: true,
            signedByLandlord: false,
            createdAt: addDays(new Date(), -2),
            updatedAt: addDays(new Date(), -1),
        },
    });
    leases.push({
        id: mayaLease.id,
        propertyId: sarahListed.id,
        tenantId: demoTenant2.id,
        landlordId: demoLandlord.id,
        monthlyRent: sarahListed.monthlyRent,
        startDate: mayaStart,
        endDate: mayaEnd,
        status: 'PENDING_SIGNATURES',
    });

    // Sarah's second RENTED property — assigned to a random tenant.
    const sarahActive2 = sarahProperties[1];
    const otherTenant = leases.length > 0 ? null : null; // placeholder for clarity

    // Bulk-create leases for remaining RENTED properties (one per property).
    const rentedProperties = properties.filter(p => p.status === 'RENTED' && p.id !== sarahActive1.id && p.id !== sarahActive2.id);
    // Add Sarah's second to the list for a normal-style lease assignment.
    const rentedList = [sarahActive2, ...rentedProperties];

    // Need tenants for these — anyone who isn't the demo tenants.
    const availableTenants = (await prisma.user.findMany({
        where: { role: 'TENANT', id: { notIn: [demoTenant.id, demoTenant2.id] } },
        select: { id: true },
    })).map(u => u.id);

    let tenantIdx = 0;
    for (const property of rentedList) {
        const tenantId = availableTenants[tenantIdx % availableTenants.length];
        tenantIdx++;
        const start = addDays(new Date(), -randomInt(30, 200));
        const end = addDays(start, 365);
        const created = await prisma.lease.create({
            data: {
                propertyId: property.id,
                tenantId,
                landlordId: property.ownerId,
                startDate: start,
                endDate: end,
                monthlyRent: property.monthlyRent,
                securityDeposit: property.monthlyRent,
                terms: {
                    paymentDueDay: 1,
                    noticePeriodDays: 60,
                    maintenanceResponsibility: 'landlord',
                } as Prisma.JsonObject,
                status: 'ACTIVE',
                signedByTenant: true,
                signedByLandlord: true,
                createdAt: addDays(start, -3),
                updatedAt: start,
            },
        });
        leases.push({
            id: created.id,
            propertyId: property.id,
            tenantId,
            landlordId: property.ownerId,
            monthlyRent: property.monthlyRent,
            startDate: start,
            endDate: end,
            status: 'ACTIVE',
        });
    }

    // One EXPIRED lease (last month) to drive the renewal-prompt UI.
    const expirableLandlord = (await prisma.user.findFirst({ where: { role: 'LANDLORD', id: { not: demoLandlord.id } }, select: { id: true } }))!;
    const expirableProperty = properties.find(p => p.ownerId === expirableLandlord.id && p.status === 'ACTIVE');
    if (expirableProperty && availableTenants.length > 0) {
        const expStart = addDays(new Date(), -395);
        const expEnd = addDays(new Date(), -30);
        await prisma.lease.create({
            data: {
                propertyId: expirableProperty.id,
                tenantId: availableTenants[tenantIdx % availableTenants.length],
                landlordId: expirableLandlord.id,
                startDate: expStart,
                endDate: expEnd,
                monthlyRent: expirableProperty.monthlyRent,
                securityDeposit: expirableProperty.monthlyRent,
                terms: {} as Prisma.JsonObject,
                status: 'EXPIRED',
                signedByTenant: true,
                signedByLandlord: true,
                createdAt: addDays(expStart, -3),
                updatedAt: expEnd,
            },
        });
        leases.push({
            id: 'expired-marker',
            propertyId: expirableProperty.id,
            tenantId: availableTenants[tenantIdx % availableTenants.length],
            landlordId: expirableLandlord.id,
            monthlyRent: expirableProperty.monthlyRent,
            startDate: expStart,
            endDate: expEnd,
            status: 'EXPIRED',
        });
    }

    // Flip property status to RENTED for all properties with an ACTIVE lease.
    for (const lease of leases) {
        if (lease.status === 'ACTIVE') {
            await prisma.property.update({
                where: { id: lease.propertyId },
                data: { status: 'RENTED' },
            });
        }
    }

    console.log(`  ✓ ${leases.length} leases (incl. demo: tenant ACTIVE, tenant2 PENDING_SIGNATURES, 1 EXPIRED)`);
    return leases;
}

// ============================================================================
// SEED — TRANSACTIONS
// ============================================================================

async function seedTransactions(leases: SeededLease[]): Promise<number> {
    console.log('💵 Seeding transactions...');
    let count = 0;

    for (const lease of leases) {
        if (lease.status !== 'ACTIVE') continue;

        // RENT payments: one per month since startDate, most recent maybe pending.
        const now = Date.now();
        const monthsSinceStart = Math.min(12, Math.max(1, Math.floor((now - lease.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))));
        for (let m = 0; m < monthsSinceStart; m++) {
            const paymentDate = addDays(lease.startDate, m * 30 + randomInt(-2, 5));
            const isLatest = m === monthsSinceStart - 1;
            const status = isLatest && rand() < 0.2 ? 'PENDING' : rand() < 0.02 ? 'FAILED' : 'COMPLETED';
            await prisma.transaction.create({
                data: {
                    type: 'RENT_PAYMENT',
                    payerId: lease.tenantId,
                    payeeId: lease.landlordId,
                    propertyId: lease.propertyId,
                    amount: lease.monthlyRent,
                    currency: 'CAD',
                    status,
                    paymentMethod: randomElement(['card', 'bank_transfer']).toUpperCase(),
                    paymentReference: `PAY_${paymentDate.getTime()}_${uuidShort()}`,
                    metadata: {
                        month: `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`,
                        stripeChargeId: `ch_mock_${uuidShort()}`,
                    } as Prisma.JsonObject,
                    createdAt: paymentDate,
                    updatedAt: paymentDate,
                },
            });
            count++;
        }

        // SECURITY_DEPOSIT (one per active lease).
        await prisma.transaction.create({
            data: {
                type: 'SECURITY_DEPOSIT',
                payerId: lease.tenantId,
                payeeId: lease.landlordId,
                propertyId: lease.propertyId,
                amount: lease.monthlyRent,
                currency: 'CAD',
                status: 'COMPLETED',
                paymentMethod: 'CARD',
                paymentReference: `PAY_DEP_${lease.id.slice(0, 8)}`,
                escrowId: `ESC_${lease.id.slice(0, 12)}`,
                metadata: {
                    purpose: 'security deposit',
                    stripeChargeId: `ch_mock_${uuidShort()}`,
                } as Prisma.JsonObject,
                createdAt: addDays(lease.startDate, -1),
                updatedAt: lease.startDate,
            },
        });
        count++;

        // SERVICE_FEE (platform's 2.5% on the deposit).
        await prisma.transaction.create({
            data: {
                type: 'SERVICE_FEE',
                payerId: lease.landlordId,
                payeeId: lease.landlordId,
                propertyId: lease.propertyId,
                amount: Math.round(lease.monthlyRent * 0.025 * 100) / 100,
                currency: 'CAD',
                status: 'COMPLETED',
                paymentMethod: 'CARD',
                paymentReference: `FEE_${lease.id.slice(0, 8)}`,
                metadata: { feeType: 'escrow_setup' } as Prisma.JsonObject,
                createdAt: addDays(lease.startDate, -1),
                updatedAt: lease.startDate,
            },
        });
        count++;
    }

    console.log(`  ✓ ${count} transactions`);
    return count;
}

// ============================================================================
// SEED — MAINTENANCE
// ============================================================================

async function seedMaintenance(leases: SeededLease[], agents: SeededUser[], demoTenant: SeededUser): Promise<void> {
    console.log('🔧 Seeding maintenance requests...');
    const activeLeases = leases.filter(l => l.status === 'ACTIVE');
    if (activeLeases.length === 0) return;

    let count = 0;

    // Demo: John has 1 IN_PROGRESS maintenance ticket.
    const johnLease = activeLeases.find(l => l.tenantId === demoTenant.id);
    if (johnLease) {
        const category = 'PLUMBING';
        const title = randomElement(MAINTENANCE_TITLES_BY_CATEGORY[category]);
        await prisma.maintenanceRequest.create({
            data: {
                propertyId: johnLease.propertyId,
                tenantId: johnLease.tenantId,
                assignedAgentId: agents[0].id,
                title,
                description: `${title}. Started yesterday — please send someone soon.`,
                category,
                urgency: 'MEDIUM',
                priority: 'MEDIUM',
                status: 'IN_PROGRESS',
                preferredDate: addDays(new Date(), 2),
                preferredTimeSlot: 'morning',
                photos: [makeMaintenanceImage(johnLease.id, 1), makeMaintenanceImage(johnLease.id, 2)],
                images: [],
                createdAt: addDays(new Date(), -2),
                updatedAt: addDays(new Date(), -1),
            },
        });
        count++;
    }

    // Random maintenance across other ACTIVE leases + a few historical COMPLETED ones.
    for (const lease of activeLeases) {
        if (lease.tenantId === demoTenant.id) continue;
        const requestsForThisLease = randomInt(0, 2);
        for (let i = 0; i < requestsForThisLease; i++) {
            const category = randomElement(MAINTENANCE_CATEGORIES);
            const title = randomElement(MAINTENANCE_TITLES_BY_CATEGORY[category]);
            const status = weighted([
                { value: 'SUBMITTED' as const, weight: 30 },
                { value: 'ACKNOWLEDGED' as const, weight: 15 },
                { value: 'IN_PROGRESS' as const, weight: 25 },
                { value: 'COMPLETED' as const, weight: 25 },
                { value: 'ON_HOLD' as const, weight: 5 },
            ]);
            const created = randomDateInLastNDays(60);
            await prisma.maintenanceRequest.create({
                data: {
                    propertyId: lease.propertyId,
                    tenantId: lease.tenantId,
                    assignedAgentId: status === 'SUBMITTED' ? null : randomElement(agents).id,
                    title,
                    description: `${title}. Reported by tenant.`,
                    category,
                    urgency: randomElement(['LOW', 'MEDIUM', 'MEDIUM', 'HIGH'] as const),
                    priority: randomElement(['LOW', 'MEDIUM', 'MEDIUM', 'HIGH'] as const),
                    status: status as never,
                    photos: [makeMaintenanceImage(lease.id + i, 1)],
                    images: [],
                    completedAt: status === 'COMPLETED' ? addDays(created, randomInt(1, 14)) : null,
                    resolvedAt: status === 'COMPLETED' ? addDays(created, randomInt(1, 14)) : null,
                    cost: status === 'COMPLETED' ? randomInt(75, 850) : null,
                    createdAt: created,
                    updatedAt: created,
                },
            });
            count++;
        }
    }

    console.log(`  ✓ ${count} maintenance requests`);
}

// ============================================================================
// SEED — AGENT JOBS
// ============================================================================

async function seedAgentJobs(agents: SeededUser[], landlords: SeededUser[], properties: SeededProperty[], demoAgent: SeededUser): Promise<void> {
    console.log('🏃 Seeding agent jobs...');
    const jobTypes = Object.keys(AGENT_JOB_TITLES_BY_TYPE);
    let count = 0;

    // Demo agent: 3 COMPLETED + 2 IN_PROGRESS + 1 OPEN unassigned.
    const sarahLandlord = landlords.find(l => l.email === 'landlord@homeai.demo')!;
    const sarahProps = properties.filter(p => p.ownerId === sarahLandlord.id);
    const someoneProperty = randomElement(properties);
    const demoJobs = [
        { type: 'PROPERTY_VIEWING', status: 'COMPLETED', earnings: 75, daysAgo: 7 },
        { type: 'INSPECTION', status: 'COMPLETED', earnings: 120, daysAgo: 14 },
        { type: 'PHOTOGRAPHY', status: 'COMPLETED', earnings: 250, daysAgo: 21 },
        { type: 'KEY_HANDOVER', status: 'IN_PROGRESS', earnings: 50, daysAgo: 1 },
        { type: 'PROPERTY_AUDIT', status: 'IN_PROGRESS', earnings: 180, daysAgo: 2 },
        { type: 'PROPERTY_VIEWING', status: 'OPEN', earnings: 75, daysAgo: 0, unassigned: true },
    ];
    for (const j of demoJobs) {
        const property = j.type === 'PROPERTY_VIEWING' && rand() < 0.5 ? sarahProps[0] : someoneProperty;
        const created = addDays(new Date(), -j.daysAgo);
        const scheduled = j.status === 'OPEN' ? addDays(new Date(), randomInt(3, 14))
                        : j.status === 'IN_PROGRESS' ? addDays(new Date(), 1)
                        : addDays(new Date(), -j.daysAgo);
        await prisma.agentJob.create({
            data: {
                type: j.type as never,
                title: randomElement(AGENT_JOB_TITLES_BY_TYPE[j.type]),
                description: `Demo job — ${j.type.toLowerCase().replace('_', ' ')}`,
                category: j.type,
                propertyId: property?.id ?? null,
                requesterId: sarahLandlord.id,
                createdById: sarahLandlord.id,
                assignedAgentId: j.unassigned ? null : demoAgent.id,
                status: j.status as never,
                priority: 'MEDIUM',
                earnings: j.earnings,
                payout: j.earnings,
                scheduledDate: scheduled,
                scheduledTime: 'morning',
                completedAt: j.status === 'COMPLETED' ? created : null,
                createdAt: created,
                updatedAt: created,
            },
        });
        count++;
    }

    // ~16 random jobs across the other agents.
    const otherAgents = agents.filter(a => a.id !== demoAgent.id);
    for (let i = 0; i < 16; i++) {
        const type = randomElement(jobTypes);
        const status = weighted([
            { value: 'OPEN' as const, weight: 18 },
            { value: 'ASSIGNED' as const, weight: 23 },
            { value: 'IN_PROGRESS' as const, weight: 27 },
            { value: 'COMPLETED' as const, weight: 32 },
        ]);
        const created = randomDateInLastNDays(45);
        const property = rand() < 0.8 ? randomElement(properties) : null;
        await prisma.agentJob.create({
            data: {
                type: type as never,
                title: randomElement(AGENT_JOB_TITLES_BY_TYPE[type]),
                description: `${type.toLowerCase().replace('_', ' ')} for landlord`,
                category: type,
                propertyId: property?.id ?? null,
                requesterId: property?.ownerId ?? randomElement(landlords).id,
                createdById: property?.ownerId ?? randomElement(landlords).id,
                assignedAgentId: status === 'OPEN' ? null : randomElement(otherAgents).id,
                status: status as never,
                priority: randomElement(['LOW', 'MEDIUM', 'HIGH'] as const),
                earnings: randomInt(50, 300),
                payout: randomInt(50, 300),
                scheduledDate: status === 'OPEN' || status === 'ASSIGNED' ? addDays(new Date(), randomInt(1, 14)) : addDays(new Date(), -randomInt(0, 14)),
                completedAt: status === 'COMPLETED' ? addDays(new Date(), -randomInt(1, 14)) : null,
                createdAt: created,
                updatedAt: created,
            },
        });
        count++;
    }

    console.log(`  ✓ ${count} agent jobs`);
}

// ============================================================================
// SEED — CONVERSATIONS + MESSAGES
// ============================================================================

async function seedConversations(
    landlords: SeededUser[],
    tenants: SeededUser[],
    properties: SeededProperty[],
    demoLandlord: SeededUser,
    demoTenant: SeededUser,
    sarahActive1: SeededProperty,
): Promise<void> {
    console.log('💬 Seeding conversations + messages...');
    let convCount = 0;
    let msgCount = 0;

    const ensureConversation = async (
        type: 'DIRECT' | 'PROPERTY_INQUIRY' | 'APPLICATION' | 'SUPPORT',
        participants: string[],
        propertyId: string | null,
        messages: Array<{ senderId: string; content: string; minutesAgo: number }>,
    ) => {
        const conv = await prisma.conversation.create({
            data: {
                type,
                propertyId,
                createdAt: addDays(new Date(), -randomInt(1, 21)),
                updatedAt: new Date(),
            },
        });
        convCount++;
        for (const p of participants) {
            await prisma.conversationParticipant.create({
                data: {
                    conversationId: conv.id,
                    userId: p,
                    lastReadAt: rand() < 0.5 ? null : addDays(new Date(), -1),
                },
            });
        }
        for (const m of messages) {
            await prisma.message.create({
                data: {
                    conversationId: conv.id,
                    senderId: m.senderId,
                    content: m.content,
                    messageType: 'TEXT',
                    isRead: m.minutesAgo > 60 * 24 ? true : rand() < 0.3,
                    read: m.minutesAgo > 60 * 24 ? true : rand() < 0.3,
                    createdAt: new Date(Date.now() - m.minutesAgo * 60 * 1000),
                },
            });
            msgCount++;
        }
    };

    // Demo: John ↔ Sarah PROPERTY_INQUIRY (6 messages, last in past hour).
    await ensureConversation(
        'PROPERTY_INQUIRY',
        [demoLandlord.id, demoTenant.id],
        sarahActive1.id,
        [
            { senderId: demoTenant.id, content: 'Hi Sarah — is the unit still available? Looking to move in next month.', minutesAgo: 60 * 24 * 5 },
            { senderId: demoLandlord.id, content: 'Hi John! Yes, still available. Want to schedule a viewing?', minutesAgo: 60 * 24 * 5 - 20 },
            { senderId: demoTenant.id, content: 'Saturday morning works for me.', minutesAgo: 60 * 24 * 4 },
            { senderId: demoLandlord.id, content: 'Great, 10am? I\'ll send the building address.', minutesAgo: 60 * 24 * 4 - 5 },
            { senderId: demoTenant.id, content: 'Perfect, see you then.', minutesAgo: 60 * 24 * 4 - 1 },
            { senderId: demoLandlord.id, content: 'Loved meeting you yesterday — application looks great. Let me know if anything changes!', minutesAgo: 45 },
        ],
    );

    // Random PROPERTY_INQUIRY conversations on popular listings.
    const popularListings = properties.filter(p => p.status === 'ACTIVE' && p.listingType === 'RENT').slice(0, 9);
    for (const property of popularListings) {
        const tenant = randomElement(tenants.filter(t => t.id !== demoTenant.id));
        await ensureConversation(
            'PROPERTY_INQUIRY',
            [property.ownerId, tenant.id],
            property.id,
            [
                { senderId: tenant.id, content: 'Hi! Interested in this place. Is parking included?', minutesAgo: randomInt(60, 60 * 24 * 7) },
                { senderId: property.ownerId, content: 'Yes — one underground spot. Want to set up a viewing?', minutesAgo: randomInt(60, 60 * 24 * 6) },
                { senderId: tenant.id, content: 'Definitely. When works?', minutesAgo: randomInt(30, 60 * 24 * 5) },
            ],
        );
    }

    // 4 APPLICATION conversations.
    for (let i = 0; i < 4; i++) {
        const property = randomElement(properties.filter(p => p.status === 'ACTIVE'));
        const tenant = randomElement(tenants.filter(t => t.id !== demoTenant.id));
        await ensureConversation(
            'APPLICATION',
            [property.ownerId, tenant.id],
            property.id,
            [
                { senderId: tenant.id, content: 'Submitted my application — let me know if you need anything else.', minutesAgo: randomInt(60 * 5, 60 * 24 * 5) },
                { senderId: property.ownerId, content: 'Got it, reviewing now. Will get back to you within 48h.', minutesAgo: randomInt(60, 60 * 24 * 3) },
            ],
        );
    }

    // 2 DIRECT conversations.
    await ensureConversation('DIRECT', [demoLandlord.id, randomElement(landlords.filter(l => l.id !== demoLandlord.id)).id], null, [
        { senderId: demoLandlord.id, content: 'Hey — any tenant referrals you can send my way?', minutesAgo: 60 * 24 * 10 },
    ]);
    await ensureConversation('DIRECT', [demoTenant.id, demoAgentId()], null, [
        { senderId: demoTenant.id, content: 'Thanks for the showing last week!', minutesAgo: 60 * 24 * 7 },
    ]);

    console.log(`  ✓ ${convCount} conversations, ${msgCount} messages`);
}

function demoAgentId(): string {
    return DEMO_AGENT_ID;
}

// ============================================================================
// SEED — NOTIFICATIONS
// ============================================================================

async function seedNotifications(allUsers: SeededUser[], demoTenant: SeededUser): Promise<void> {
    console.log('🔔 Seeding notifications...');
    let count = 0;

    // Demo: John gets 5 with mix of read/unread.
    const johnNotifs = [
        { type: 'PAYMENT_DUE', title: 'Rent due in 3 days', body: 'Your monthly rent of $3,200 is due on the 1st.', isRead: false, minutesAgo: 60 * 24 },
        { type: 'MAINTENANCE_UPDATE', title: 'Maintenance update', body: 'Plumber scheduled for Tuesday morning.', isRead: false, minutesAgo: 60 * 6 },
        { type: 'MESSAGE_NEW', title: 'New message from Sarah Chen', body: 'Loved meeting you yesterday — application looks great.', isRead: false, minutesAgo: 45 },
        { type: 'PROPERTY_PRICE_CHANGE', title: 'A saved property dropped in price', body: 'One of your favourites is now $2,500/mo.', isRead: true, minutesAgo: 60 * 24 * 3 },
        { type: 'GENERAL', title: 'Welcome to HomeAI', body: 'Tour the new tenant dashboard.', isRead: true, minutesAgo: 60 * 24 * 14 },
    ];
    for (const n of johnNotifs) {
        await prisma.notification.create({
            data: {
                userId: demoTenant.id,
                type: n.type as never,
                title: n.title,
                body: n.body,
                message: n.body,
                channels: ['push', 'email'],
                isRead: n.isRead,
                read: n.isRead,
                data: {} as Prisma.JsonObject,
                createdAt: new Date(Date.now() - n.minutesAgo * 60 * 1000),
                updatedAt: new Date(Date.now() - n.minutesAgo * 60 * 1000),
            },
        });
        count++;
    }

    // Random notifications for everyone else.
    const others = allUsers.filter(u => u.id !== demoTenant.id);
    for (const user of others) {
        const n = randomInt(0, 5);
        for (let i = 0; i < n; i++) {
            const type = randomElement([
                'PAYMENT_DUE', 'MESSAGE_NEW', 'APPLICATION_RECEIVED', 'APPLICATION_UPDATE',
                'MAINTENANCE_UPDATE', 'PROPERTY_UPDATE', 'GENERAL', 'VERIFICATION_UPDATE',
            ]);
            const created = rand() < 0.6 ? randomDateInLastNDays(7) : randomDateInLastNDays(60);
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: type as never,
                    title: `Notification: ${type.replace(/_/g, ' ').toLowerCase()}`,
                    body: 'Sample notification content.',
                    message: 'Sample notification content.',
                    channels: pickN(['push', 'email', 'sms'], randomInt(1, 2)),
                    isRead: rand() < 0.6,
                    read: rand() < 0.6,
                    data: {} as Prisma.JsonObject,
                    createdAt: created,
                    updatedAt: created,
                },
            });
            count++;
        }
    }

    console.log(`  ✓ ${count} notifications`);
}

// ============================================================================
// SEED — FAVORITES
// ============================================================================

async function seedFavorites(tenants: SeededUser[], properties: SeededProperty[], demoTenant: SeededUser): Promise<void> {
    console.log('⭐ Seeding favorites...');
    let count = 0;

    const publicListings = properties.filter(p => p.status === 'ACTIVE');

    // John gets exactly 3 favorites.
    const johnFavs = pickN(publicListings, 3);
    for (const p of johnFavs) {
        await prisma.favorite.create({
            data: {
                userId: demoTenant.id,
                propertyId: p.id,
                createdAt: randomDateInLastNDays(30),
            },
        });
        count++;
    }

    // Other tenants: 0-3 favorites each.
    const others = tenants.filter(t => t.id !== demoTenant.id);
    for (const tenant of others) {
        const favs = pickN(publicListings, randomInt(0, 3));
        for (const p of favs) {
            try {
                await prisma.favorite.create({
                    data: {
                        userId: tenant.id,
                        propertyId: p.id,
                        createdAt: randomDateInLastNDays(60),
                    },
                });
                count++;
            } catch { /* composite key collision; skip */ }
        }
    }

    console.log(`  ✓ ${count} favorites`);
}

// ============================================================================
// SEED — DEVICE TOKENS
// ============================================================================

async function seedDeviceTokens(demoUsers: SeededUser[], otherUsers: SeededUser[]): Promise<void> {
    console.log('📱 Seeding device tokens...');
    let count = 0;
    const all = [...demoUsers, ...pickN(otherUsers, 3)];
    for (const user of all) {
        await prisma.deviceToken.create({
            data: {
                userId: user.id,
                token: `fcm_mock_${user.id.slice(0, 8)}_${uuidShort()}`,
                deviceId: `device_${uuidShort()}`,
                platform: randomElement(['ios', 'android']),
                active: true,
                createdAt: randomDateInLastNDays(60),
                updatedAt: new Date(),
            },
        });
        count++;
    }
    console.log(`  ✓ ${count} device tokens`);
}

// ============================================================================
// SEED — AI SESSIONS
// ============================================================================

async function seedAiSessions(demoUsers: SeededUser[]): Promise<void> {
    console.log('🤖 Seeding AI sessions...');
    let sessionCount = 0;
    let messageCount = 0;

    for (const user of demoUsers) {
        const n = user.role === 'TENANT' || user.role === 'LANDLORD' ? 2 : 1;
        for (let i = 0; i < n; i++) {
            const session = await prisma.aiSession.create({
                data: {
                    userId: user.id,
                    title: i === 0 ? 'Getting started with HomeAI' : 'Lease term questions',
                    contextSeed: {} as Prisma.JsonObject,
                    lastMessageAt: randomDateInLastNDays(7),
                    createdAt: randomDateInLastNDays(14),
                    updatedAt: new Date(),
                },
            });
            sessionCount++;
            await prisma.aiSessionMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'USER',
                    content: i === 0 ? 'How do I list a new property?' : 'What\'s a typical security deposit in Ontario?',
                    createdAt: randomDateInLastNDays(7),
                },
            });
            await prisma.aiSessionMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'ASSISTANT',
                    content: i === 0 ? 'You can list a new property from the Properties tab — click + New Listing.' : 'In Ontario, the maximum security deposit is one month\'s rent (a.k.a. last-month-rent deposit).',
                    createdAt: randomDateInLastNDays(7),
                },
            });
            messageCount += 2;
        }
    }

    console.log(`  ✓ ${sessionCount} AI sessions, ${messageCount} messages`);
}

async function seedIntegrationData(
    demo: Record<string, SeededUser>,
    properties: Array<{ id: string; ownerId: string }>,
    leases: Array<{ id: string; tenantId: string; landlordId: string }>,
): Promise<void> {
    const landlord = demo['landlord@homeai.demo'];
    const tenant = demo['tenant@homeai.demo'];
    const agent = demo['agent@homeai.demo'];
    const property = properties.find(item => item.ownerId === landlord.id)!;
    const lease = leases.find(item => item.tenantId === tenant.id && item.landlordId === landlord.id);

    await prisma.agentAvailability.create({
        data: { agentId: agent.id, date: new Date('2026-09-01'), startTime: '09:00', endTime: '17:00', recurring: true, recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    });
    await prisma.applicantInvitation.create({
        data: {
            tokenHash: crypto.createHash('sha256').update('demo-applicant-invitation').digest('hex'),
            landlordId: landlord.id,
            propertyId: property.id,
            email: 'invited.tenant@homeai.demo',
            expiresAt: new Date('2030-01-01'),
        },
    });
    await prisma.session.create({
        data: {
            userId: tenant.id,
            tokenHash: crypto.createHash('sha256').update('seed-session').digest('hex'),
            deviceName: 'Seeded browser',
            browser: 'Chromium',
            expiresAt: new Date('2030-01-01'),
        },
    });
    if (lease) {
        await prisma.review.create({
            data: { authorId: tenant.id, subjectId: landlord.id, leaseId: lease.id, type: 'LANDLORD_REVIEW', rating: 5, body: 'Responsive and professional.', isVerified: true },
        });
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
        throw new Error('Refusing to seed in production without ALLOW_PROD_SEED=true');
    }

    console.log('🌱 HomeAI demo seed (Canada)\n');
    console.log(`   SEED_KEY = ${process.env.SEED_KEY ?? 'homeai-ca-2026'} (set SEED_KEY env to override)\n`);

    await clearDown();

    const { demo, admins, landlords, tenants, agents } = await seedUsers();
    const allUsers: SeededUser[] = [...admins, ...landlords, ...tenants, ...agents];
    await seedUserProfiles(allUsers);

    const properties = await seedProperties(landlords);
    const sarahProperties = properties.filter(p => p.ownerId === demo['landlord@homeai.demo'].id);

    await seedVerifications(allUsers, properties, demo['admin@homeai.demo'].id);

    const applications = await seedApplications(
        properties,
        tenants,
        demo['tenant@homeai.demo'],
        demo['tenant2@homeai.demo'],
        sarahProperties[2], // Sarah's listed (ACTIVE) property
    );

    const leases = await seedLeases(
        properties,
        demo['landlord@homeai.demo'],
        demo['tenant@homeai.demo'],
        demo['tenant2@homeai.demo'],
        sarahProperties,
    );

    await seedTransactions(leases);

    await seedMaintenance(leases, agents, demo['tenant@homeai.demo']);

    await seedAgentJobs(agents, landlords, properties, demo['agent@homeai.demo']);

    await seedConversations(
        landlords,
        tenants,
        properties,
        demo['landlord@homeai.demo'],
        demo['tenant@homeai.demo'],
        sarahProperties[0], // Sarah's RENTED property (John's lease)
    );

    await seedNotifications(allUsers, demo['tenant@homeai.demo']);

    await seedFavorites(tenants, properties, demo['tenant@homeai.demo']);

    const demoUsers = Object.values(demo);
    const otherUsers = allUsers.filter(u => !demoUsers.some(d => d.id === u.id));
    await seedDeviceTokens(demoUsers, otherUsers);

    await seedAiSessions(demoUsers);
    await seedIntegrationData(demo, properties, leases);

    // Final summary.
    const counts = {
        users: await prisma.user.count(),
        properties: await prisma.property.count(),
        leases: await prisma.lease.count(),
        transactions: await prisma.transaction.count(),
        applications: await prisma.application.count(),
        verifications: await prisma.verification.count(),
        maintenance: await prisma.maintenanceRequest.count(),
        agentJobs: await prisma.agentJob.count(),
        conversations: await prisma.conversation.count(),
        messages: await prisma.message.count(),
        notifications: await prisma.notification.count(),
        favorites: await prisma.favorite.count(),
        aiSessions: await prisma.aiSession.count(),
    };

    console.log('\n✅ Seed complete\n');
    console.log('📊 Totals:');
    for (const [k, v] of Object.entries(counts)) console.log(`   ${k.padEnd(20)} ${v}`);

    console.log('\n🔑 Demo logins (password: DemoPass123!):');
    for (const acct of DEMO_ACCOUNTS) {
        console.log(`   ${acct.email.padEnd(28)} ${acct.role.padEnd(10)} ${acct.firstName} ${acct.lastName}`);
    }
}

main()
    .catch((err) => {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
