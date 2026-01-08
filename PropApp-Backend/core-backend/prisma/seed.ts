/**
 * Database Seed Script
 * Creates sample data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================
// SEED DATA
// ============================================

const NIGERIAN_CITIES = [
    { city: 'Lagos', state: 'Lagos', neighborhoods: ['Lekki', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba'] },
    { city: 'Abuja', state: 'FCT', neighborhoods: ['Maitama', 'Wuse', 'Garki', 'Asokoro', 'Gwarinpa'] },
    { city: 'Port Harcourt', state: 'Rivers', neighborhoods: ['GRA', 'Trans Amadi', 'Rumuola', 'Eleme', 'Diobu'] },
    { city: 'Ibadan', state: 'Oyo', neighborhoods: ['Bodija', 'UI', 'Ring Road', 'Dugbe', 'Challenge'] },
    { city: 'Kano', state: 'Kano', neighborhoods: ['Nassarawa GRA', 'Bompai', 'Sabon Gari', 'Gyadi', 'Tarauni'] },
];

const PROPERTY_NAMES = [
    'Serenity Heights',
    'Palm View Apartments',
    'Royal Gardens Estate',
    'Sunrise Residence',
    'Ocean Breeze Villa',
    'Green Valley Court',
    'Executive Lodge',
    'Paradise Towers',
    'Harmony Place',
    'Golden Gate Residences',
];

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.transaction.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.application.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.agentJob.deleteMany();
    await prisma.propertyImage.deleteMany();
    await prisma.property.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.deviceToken.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    // ----------------------------------------
    // CREATE USERS
    // ----------------------------------------
    console.log('👤 Creating users...');

    const defaultPassword = await hashPassword('Password123!');

    // Admin user
    const admin = await prisma.user.create({
        data: {
            email: 'admin@homeai.ng',
            passwordHash: defaultPassword,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
            phone: '+2349000000000',
            isEmailVerified: true,
            isActive: true,
            verificationLevel: 'PLATINUM',
            regionCode: 'NG',
        },
    });
    console.log(`  ✓ Admin: ${admin.email}`);

    // Landlords
    const landlords = await Promise.all([
        prisma.user.create({
            data: {
                email: 'landlord1@homeai.ng',
                passwordHash: defaultPassword,
                role: 'LANDLORD',
                firstName: 'Chinedu',
                lastName: 'Okoro',
                phone: '+2348012345671',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'GOLD',
                regionCode: 'NG',
            },
        }),
        prisma.user.create({
            data: {
                email: 'landlord2@homeai.ng',
                passwordHash: defaultPassword,
                role: 'LANDLORD',
                firstName: 'Amaka',
                lastName: 'Nwosu',
                phone: '+2348012345672',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'SILVER',
                regionCode: 'NG',
            },
        }),
    ]);
    console.log(`  ✓ Landlords: ${landlords.length} created`);

    // Tenants
    const tenants = await Promise.all([
        prisma.user.create({
            data: {
                email: 'tenant1@homeai.ng',
                passwordHash: defaultPassword,
                role: 'TENANT',
                firstName: 'Oluwaseun',
                lastName: 'Adeleke',
                phone: '+2348012345681',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'BRONZE',
                regionCode: 'NG',
            },
        }),
        prisma.user.create({
            data: {
                email: 'tenant2@homeai.ng',
                passwordHash: defaultPassword,
                role: 'TENANT',
                firstName: 'Fatima',
                lastName: 'Abubakar',
                phone: '+2348012345682',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'SILVER',
                regionCode: 'NG',
            },
        }),
        prisma.user.create({
            data: {
                email: 'tenant3@homeai.ng',
                passwordHash: defaultPassword,
                role: 'TENANT',
                firstName: 'Emmanuel',
                lastName: 'Okonkwo',
                phone: '+2348012345683',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'UNVERIFIED',
                regionCode: 'NG',
            },
        }),
    ]);
    console.log(`  ✓ Tenants: ${tenants.length} created`);

    // Agents
    const agents = await Promise.all([
        prisma.user.create({
            data: {
                email: 'agent1@homeai.ng',
                passwordHash: defaultPassword,
                role: 'AGENT',
                firstName: 'Blessing',
                lastName: 'Eze',
                phone: '+2348012345691',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'GOLD',
                regionCode: 'NG',
            },
        }),
        prisma.user.create({
            data: {
                email: 'agent2@homeai.ng',
                passwordHash: defaultPassword,
                role: 'AGENT',
                firstName: 'Yusuf',
                lastName: 'Mohammed',
                phone: '+2348012345692',
                isEmailVerified: true,
                isActive: true,
                verificationLevel: 'SILVER',
                regionCode: 'NG',
            },
        }),
    ]);
    console.log(`  ✓ Agents: ${agents.length} created`);

    // ----------------------------------------
    // CREATE PROPERTIES
    // ----------------------------------------
    console.log('🏠 Creating properties...');

    const properties = [];
    for (let i = 0; i < 10; i++) {
        const cityData = randomElement(NIGERIAN_CITIES);
        const landlord = randomElement(landlords);
        const listingType = randomElement(['RENT', 'SALE', 'SHORT_LET'] as const);
        const propertyType = randomElement(['APARTMENT', 'HOUSE', 'DUPLEX', 'BUNGALOW', 'STUDIO'] as const);

        // Price ranges based on listing type
        let price: number;
        let priceUnit: 'PER_MONTH' | 'PER_YEAR' | 'TOTAL' | 'PER_NIGHT';
        if (listingType === 'RENT') {
            price = randomElement([500000, 800000, 1200000, 1500000, 2000000, 3000000, 5000000]);
            priceUnit = 'PER_YEAR';
        } else if (listingType === 'SHORT_LET') {
            price = randomElement([25000, 35000, 50000, 75000, 100000, 150000]);
            priceUnit = 'PER_NIGHT';
        } else {
            price = randomElement([25000000, 45000000, 75000000, 120000000, 250000000, 500000000]);
            priceUnit = 'TOTAL';
        }

        const property = await prisma.property.create({
            data: {
                name: `${PROPERTY_NAMES[i]} - ${cityData.city}`,
                ownerId: landlord.id,
                propertyType,
                listingType,
                price,
                priceUnit,
                bedrooms: randomElement([1, 2, 3, 4, 5]),
                bathrooms: randomElement([1, 2, 3, 4]),
                squareFeet: randomElement([45, 75, 120, 180, 250, 400]),
                addressStreet: `${randomElement([1, 5, 12, 25, 48])} ${randomElement(['Adeola', 'Ahmadu', 'Banana', 'Crescent', 'Diamond'])} Street`,
                addressCity: cityData.city,
                addressState: cityData.state,
                addressNeighborhood: randomElement(cityData.neighborhoods),
                addressZip: randomElement(['100001', '101001', '110001', '200001', '300001']),
                latitude: randomElement([6.45, 6.52, 9.05, 4.85, 7.39]),
                longitude: randomElement([3.39, 7.49, 7.53, 7.03, 3.95]),
                description: `Beautiful ${propertyType.toLowerCase()} located in the heart of ${cityData.city}. This property features modern amenities, 24/7 security, and is close to major landmarks.`,
                status: randomElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING_REVIEW', 'DRAFT']),
                amenities: ['Swimming Pool', 'Gym', 'Garden', 'CCTV', 'Air Conditioning', '24/7 Security'],
                verificationTier: randomElement(['UNVERIFIED', 'BRONZE', 'SILVER', 'GOLD']),
            },
        });

        // Add property images
        await prisma.propertyImage.createMany({
            data: [
                {
                    propertyId: property.id,
                    url: `https://picsum.photos/seed/${property.id}-1/800/600`,
                    isPrimary: true,
                },
                {
                    propertyId: property.id,
                    url: `https://picsum.photos/seed/${property.id}-2/800/600`,
                    isPrimary: false,
                },
                {
                    propertyId: property.id,
                    url: `https://picsum.photos/seed/${property.id}-3/800/600`,
                    isPrimary: false,
                },
            ],
        });

        properties.push(property);
    }
    console.log(`  ✓ Properties: ${properties.length} created with images`);

    // ----------------------------------------
    // CREATE LEASES
    // ----------------------------------------
    console.log('📄 Creating leases...');

    const rentProperties = properties.filter(p => p.listingType === 'RENT' && p.status === 'ACTIVE');
    const leases = [];

    for (let i = 0; i < Math.min(3, rentProperties.length); i++) {
        const property = rentProperties[i];
        const tenant = tenants[i % tenants.length];

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - randomElement([1, 2, 3, 6]));
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        const lease = await prisma.lease.create({
            data: {
                propertyId: property.id,
                tenantId: tenant.id,
                landlordId: property.ownerId,
                startDate,
                endDate,
                monthlyRent: Number(property.price) / 12,
                securityDeposit: (Number(property.price) / 12) * 2,
                status: 'ACTIVE',
                terms: { paymentDay: 1, noticePeriod: 30, petsAllowed: false },
            },
        });
        leases.push(lease);
    }
    console.log(`  ✓ Leases: ${leases.length} created`);

    // ----------------------------------------
    // CREATE TRANSACTIONS
    // ----------------------------------------
    console.log('💰 Creating transactions...');

    for (const lease of leases) {
        // Create rent payment
        await prisma.transaction.create({
            data: {
                type: 'RENT_PAYMENT',
                payerId: lease.tenantId,
                payeeId: lease.landlordId,
                propertyId: lease.propertyId,
                amount: Number(lease.monthlyRent) || 100000,
                currency: 'NGN',
                status: 'COMPLETED',
                metadata: JSON.parse(JSON.stringify({ month: 'January 2024', paymentMethod: 'bank_transfer' })),
            },
        });

        // Create security deposit
        await prisma.transaction.create({
            data: {
                type: 'SECURITY_DEPOSIT',
                payerId: lease.tenantId,
                payeeId: lease.landlordId,
                propertyId: lease.propertyId,
                amount: Number(lease.securityDeposit) || 200000,
                currency: 'NGN',
                status: 'COMPLETED',
                metadata: JSON.parse(JSON.stringify({ depositType: 'initial' })),
            },
        });
    }
    console.log(`  ✓ Transactions: ${leases.length * 2} created`);

    // ----------------------------------------
    // CREATE NOTIFICATIONS
    // ----------------------------------------
    console.log('🔔 Creating notifications...');

    for (const tenant of tenants) {
        await prisma.notification.create({
            data: {
                userId: tenant.id,
                type: 'PAYMENT_DUE',
                title: 'Rent Payment Reminder',
                body: 'Your rent payment is due in 5 days. Please ensure timely payment.',
                channels: ['IN_APP', 'EMAIL'],
                read: false,
            },
        });
    }
    console.log(`  ✓ Notifications: ${tenants.length} created`);

    // ----------------------------------------
    // SUMMARY
    // ----------------------------------------
    console.log('\n✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Users: ${1 + landlords.length + tenants.length + agents.length}`);
    console.log(`   • Properties: ${properties.length}`);
    console.log(`   • Leases: ${leases.length}`);
    console.log(`   • Transactions: ${leases.length * 2}`);
    console.log(`   • Notifications: ${tenants.length}`);
    console.log('\n🔐 Login credentials (all users):');
    console.log('   Password: Password123!');
    console.log('\n📧 Test accounts:');
    console.log('   • Admin: admin@homeai.ng');
    console.log('   • Landlord: landlord1@homeai.ng');
    console.log('   • Tenant: tenant1@homeai.ng');
    console.log('   • Agent: agent1@homeai.ng');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
