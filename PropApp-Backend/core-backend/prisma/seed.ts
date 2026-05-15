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
    await prisma.propertyMedia.deleteMany();
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
    // CREATE USER PROFILES
    // ----------------------------------------
    console.log('👤 Creating user profiles...');

    const allUsers = [...landlords, ...tenants, ...agents];
    for (const user of allUsers) {
        await prisma.userProfile.create({
            data: {
                userId: user.id,
                profileData: JSON.parse(JSON.stringify({
                    bio: `${user.role === 'LANDLORD' ? 'Property owner' : user.role === 'TENANT' ? 'Looking for quality housing' : 'Certified real estate agent'} in Nigeria`,
                    languages: ['English', 'Yoruba', 'Igbo', 'Hausa'][Math.floor(Math.random() * 4)],
                    preferences: {
                        notifications: { email: true, sms: true, push: true },
                        currency: 'NGN',
                        language: 'en',
                    },
                    ...(user.role === 'LANDLORD' && {
                        propertyManagementExperience: randomElement(['1-2 years', '3-5 years', '5+ years']),
                        preferredTenantType: randomElement(['families', 'professionals', 'students', 'any']),
                    }),
                    ...(user.role === 'TENANT' && {
                        occupation: randomElement(['Software Engineer', 'Doctor', 'Banker', 'Teacher', 'Entrepreneur']),
                        housingPreferences: {
                            preferredLocations: randomElement([['Lekki', 'Victoria Island'], ['Ikoyi', 'Lekki'], ['Yaba', 'Surulere']]),
                            maxBudget: randomElement([1500000, 2000000, 3000000, 5000000]),
                            preferredPropertyTypes: randomElement([['APARTMENT'], ['APARTMENT', 'DUPLEX'], ['HOUSE']]),
                        },
                    }),
                    ...(user.role === 'AGENT' && {
                        licenseNumber: `LASRERA-${Date.now().toString().slice(-6)}`,
                        specializations: randomElement([['residential', 'rentals'], ['luxury', 'sales'], ['commercial', 'rentals']]),
                        serviceAreas: randomElement([['Lekki', 'Victoria Island'], ['Ikoyi', 'Banana Island'], ['Ikeja', 'Maryland']]),
                        yearsExperience: randomElement([2, 3, 5, 8, 10]),
                        completedTransactions: randomElement([15, 30, 50, 100]),
                    }),
                })),
            },
        });
    }
    console.log(`  ✓ User Profiles: ${allUsers.length} created`);

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

        // Add property media (images, 3D tours, videos)
        const mediaData: { propertyId: string; url: string; type: 'IMAGE' | 'VIDEO' | 'TOUR_3D' | 'FLOOR_PLAN' | 'DOCUMENT'; isPrimary: boolean; orderIndex: number }[] = [
            {
                propertyId: property.id,
                url: `https://picsum.photos/seed/${property.id}-1/800/600`,
                type: 'IMAGE' as const,
                isPrimary: true,
                orderIndex: 0,
            },
            {
                propertyId: property.id,
                url: `https://picsum.photos/seed/${property.id}-2/800/600`,
                type: 'IMAGE' as const,
                isPrimary: false,
                orderIndex: 1,
            },
            {
                propertyId: property.id,
                url: `https://picsum.photos/seed/${property.id}-3/800/600`,
                type: 'IMAGE' as const,
                isPrimary: false,
                orderIndex: 2,
            },
        ];

        // Add 3D tour for some properties
        if (i % 3 === 0) {
            mediaData.push({
                propertyId: property.id,
                url: `https://my.matterport.com/show/?m=sample${property.id.slice(0, 8)}`,
                type: 'TOUR_3D' as const,
                isPrimary: false,
                orderIndex: 10,
            });
        }

        // Add video tour for some properties
        if (i % 4 === 0) {
            mediaData.push({
                propertyId: property.id,
                url: `https://www.youtube.com/watch?v=sample${property.id.slice(0, 8)}`,
                type: 'VIDEO' as const,
                isPrimary: false,
                orderIndex: 11,
            });
        }

        // Add floor plan for some properties
        if (i % 2 === 0) {
            mediaData.push({
                propertyId: property.id,
                url: `https://picsum.photos/seed/${property.id}-fp/600/400`,
                type: 'FLOOR_PLAN' as const,
                isPrimary: false,
                orderIndex: 12,
            });
        }

        await prisma.propertyMedia.createMany({ data: mediaData });

        properties.push(property);
    }
    console.log(`  ✓ Properties: ${properties.length} created with media (images, 3D tours, videos)`);

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
    // CREATE ESCROWS
    // ----------------------------------------
    console.log('🔐 Creating escrows...');

    const escrows = [];
    for (let i = 0; i < Math.min(2, leases.length); i++) {
        const lease = leases[i];
        const escrowAmount = Number(lease.securityDeposit) || 200000;
        const platformFee = escrowAmount * 0.025; // 2.5% platform fee

        // Create a transaction for escrow
        const escrowTransaction = await prisma.transaction.create({
            data: {
                type: 'SECURITY_DEPOSIT',
                payerId: lease.tenantId,
                payeeId: lease.landlordId,
                propertyId: lease.propertyId,
                amount: escrowAmount,
                currency: 'NGN',
                status: 'COMPLETED',
                metadata: JSON.parse(JSON.stringify({ escrowType: 'security_deposit', leaseId: lease.id })),
            },
        });

        // Create escrow record linked to transaction
        const escrow = await prisma.escrow.create({
            data: {
                transactionId: escrowTransaction.id,
                payerId: lease.tenantId,
                payeeId: lease.landlordId,
                amount: escrowAmount,
                platformFee: platformFee,
                status: randomElement(['FUNDED', 'FUNDED', 'RELEASED']),
                releaseAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                blockchainEscrowId: `ESC-${Date.now().toString().slice(-8)}`,
                confirmedAt: new Date(),
                ...(i === 1 && { releasedAt: new Date() }), // Second escrow is released
            },
        });
        escrows.push(escrow);
    }
    console.log(`  ✓ Escrows: ${escrows.length} created`);

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
    // CREATE APPLICATIONS
    // ----------------------------------------
    console.log('📝 Creating applications...');

    const availableProperties = properties.filter(p => p.status === 'ACTIVE' && p.listingType === 'RENT');
    const applications = [];

    for (let i = 0; i < Math.min(4, availableProperties.length); i++) {
        const property = availableProperties[i];
        const tenant = tenants[i % tenants.length];

        const application = await prisma.application.create({
            data: {
                propertyId: property.id,
                tenantId: tenant.id,
                status: randomElement(['PENDING', 'PENDING', 'APPROVED', 'REJECTED']),
                additionalNotes: `I am interested in renting this property. I am a ${randomElement(['software engineer', 'banker', 'doctor', 'teacher'])} with stable income.`,
                moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                employmentInfo: JSON.parse(JSON.stringify({ status: randomElement(['EMPLOYED', 'SELF_EMPLOYED']), monthlyIncome: randomElement([300000, 500000, 750000, 1000000]) })),
            },
        });
        applications.push(application);
    }
    console.log(`  ✓ Applications: ${applications.length} created`);

    // ----------------------------------------
    // CREATE VERIFICATIONS
    // ----------------------------------------
    console.log('✅ Creating verifications...');

    // User identity verifications
    for (const user of [...tenants, ...landlords]) {
        await prisma.verification.create({
            data: {
                userId: user.id,
                type: 'IDENTITY',
                level: user.verificationLevel === 'GOLD' ? 'GOLD' : user.verificationLevel === 'SILVER' ? 'SILVER' : 'BRONZE',
                status: user.verificationLevel !== 'UNVERIFIED' ? 'APPROVED' : 'PENDING',
                documentType: 'NIN',
                documentUrl: `https://storage.example.com/docs/${user.id}/nin.pdf`,
                metadata: JSON.parse(JSON.stringify({ idNumber: '12345678901', verifiedAt: new Date().toISOString() })),
            },
        });
    }

    // Property verifications
    for (const property of properties.filter(p => p.verificationTier !== 'UNVERIFIED')) {
        await prisma.verification.create({
            data: {
                propertyId: property.id,
                type: 'COFO',
                level: property.verificationTier,
                status: 'APPROVED',
                documentType: 'certificate_of_occupancy',
                documentUrl: `https://storage.example.com/docs/${property.id}/cofo.pdf`,
                metadata: JSON.parse(JSON.stringify({ registryNumber: `COFO-${property.id.slice(0, 8)}`, verifiedAt: new Date().toISOString() })),
            },
        });
    }
    console.log(`  ✓ Verifications: ${tenants.length + landlords.length + properties.filter(p => p.verificationTier !== 'UNVERIFIED').length} created`);

    // ----------------------------------------
    // CREATE MAINTENANCE REQUESTS
    // ----------------------------------------
    console.log('🔧 Creating maintenance requests...');

    const maintenanceRequests = [];
    const maintenanceIssues = [
        { title: 'AC not cooling', description: 'The living room AC unit is not cooling properly', priority: 'MEDIUM', category: 'HVAC' },
        { title: 'Leaking faucet', description: 'Kitchen sink faucet is dripping constantly', priority: 'LOW', category: 'PLUMBING' },
        { title: 'Power outage in bedroom', description: 'Electrical outlets in master bedroom stopped working', priority: 'HIGH', category: 'ELECTRICAL' },
    ];

    for (let i = 0; i < Math.min(leases.length, maintenanceIssues.length); i++) {
        const lease = leases[i];
        const issue = maintenanceIssues[i];

        const request = await prisma.maintenanceRequest.create({
            data: {
                propertyId: lease.propertyId,
                tenantId: lease.tenantId,
                title: issue.title,
                description: issue.description,
                priority: issue.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY',
                category: issue.category,
                status: randomElement(['SUBMITTED', 'IN_PROGRESS', 'COMPLETED']),
                images: [`https://picsum.photos/seed/${lease.id}/400/300`],
            },
        });
        maintenanceRequests.push(request);
    }
    console.log(`  ✓ Maintenance requests: ${maintenanceRequests.length} created`);

    // ----------------------------------------
    // CREATE AGENT JOBS
    // ----------------------------------------
    console.log('👷 Creating agent jobs...');

    const agentJobs = [];
    const jobTypes = ['PROPERTY_VIEWING', 'INSPECTION', 'KEY_HANDOVER', 'PROPERTY_AUDIT'] as const;

    for (let i = 0; i < Math.min(4, properties.length); i++) {
        const property = properties[i];
        const agent = agents[i % agents.length];
        const landlord = landlords.find(l => l.id === property.ownerId) || landlords[0];

        const job = await prisma.agentJob.create({
            data: {
                propertyId: property.id,
                assignedAgentId: i < 2 ? agent.id : null, // Some jobs unassigned
                requesterId: landlord.id,
                type: jobTypes[i % jobTypes.length] as 'PROPERTY_VIEWING' | 'PROPERTY_AUDIT' | 'KEY_HANDOVER' | 'INSPECTION',
                description: `${jobTypes[i % jobTypes.length].replace('_', ' ')} for ${property.name}`,
                status: randomElement(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']),
                scheduledDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
                earnings: randomElement([5000, 7500, 10000, 15000]),
            },
        });
        agentJobs.push(job);
    }
    console.log(`  ✓ Agent jobs: ${agentJobs.length} created`);

    // ----------------------------------------
    // CREATE CONVERSATIONS & MESSAGES
    // ----------------------------------------
    console.log('💬 Creating conversations and messages...');

    const conversations = [];
    for (let i = 0; i < Math.min(3, properties.length); i++) {
        const property = properties[i];
        const tenant = tenants[i % tenants.length];
        const landlord = landlords.find(l => l.id === property.ownerId) || landlords[0];

        const conversation = await prisma.conversation.create({
            data: {
                propertyId: property.id,
                participants: {
                    create: [
                        { userId: tenant.id },
                        { userId: landlord.id },
                    ],
                },
            },
        });

        // Add messages to conversation
        await prisma.message.createMany({
            data: [
                {
                    conversationId: conversation.id,
                    senderId: tenant.id,
                    content: `Hello, I am interested in ${property.name}. Is it still available?`,
                },
                {
                    conversationId: conversation.id,
                    senderId: landlord.id,
                    content: `Yes, the property is still available. Would you like to schedule a viewing?`,
                },
                {
                    conversationId: conversation.id,
                    senderId: tenant.id,
                    content: `That would be great! I am available this weekend.`,
                },
            ],
        });

        conversations.push(conversation);
    }
    console.log(`  ✓ Conversations: ${conversations.length} created with ${conversations.length * 3} messages`);

    // ----------------------------------------
    // CREATE FAVORITES
    // ----------------------------------------
    console.log('❤️ Creating favorites...');

    let favoritesCount = 0;
    for (const tenant of tenants) {
        // Each tenant saves 2-3 random properties
        const shuffledProperties = [...properties].sort(() => Math.random() - 0.5);
        const propertiesToSave = shuffledProperties.slice(0, randomElement([2, 3]));

        for (const property of propertiesToSave) {
            await prisma.favorite.create({
                data: {
                    userId: tenant.id,
                    propertyId: property.id,
                },
            });
            favoritesCount++;
        }
    }
    console.log(`  ✓ Favorites: ${favoritesCount} created`);

    // ----------------------------------------
    // SUMMARY
    // ----------------------------------------
    console.log('\n✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Users: ${1 + landlords.length + tenants.length + agents.length}`);
    console.log(`   • User Profiles: ${allUsers.length}`);
    console.log(`   • Properties: ${properties.length} (with ${properties.length * 3}+ media items)`);
    console.log(`   • Applications: ${applications.length}`);
    console.log(`   • Leases: ${leases.length}`);
    console.log(`   • Transactions: ${leases.length * 2 + escrows.length}`);
    console.log(`   • Escrows: ${escrows.length}`);
    console.log(`   • Verifications: ${tenants.length + landlords.length + properties.filter(p => p.verificationTier !== 'UNVERIFIED').length}`);
    console.log(`   • Maintenance Requests: ${maintenanceRequests.length}`);
    console.log(`   • Agent Jobs: ${agentJobs.length}`);
    console.log(`   • Conversations: ${conversations.length} (with ${conversations.length * 3} messages)`);
    console.log(`   • Favorites: ${favoritesCount}`);
    console.log(`   • Notifications: ${tenants.length}`);
    console.log('\n🔐 Login credentials (all users):');
    console.log('   Password: Password123!');
    console.log('\n📧 Test accounts:');
    console.log('   • Admin: admin@homeai.ng');
    console.log('   • Landlord: landlord1@homeai.ng, landlord2@homeai.ng');
    console.log('   • Tenant: tenant1@homeai.ng, tenant2@homeai.ng, tenant3@homeai.ng');
    console.log('   • Agent: agent1@homeai.ng, agent2@homeai.ng');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
