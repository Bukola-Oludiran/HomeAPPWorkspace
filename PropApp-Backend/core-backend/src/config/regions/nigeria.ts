/**
 * Nigeria Region Configuration
 * Primary market for HomeAI
 */

import { RegionConfig } from './types';

export const NigeriaConfig: RegionConfig = {
    code: 'NG',
    name: 'Nigeria',

    currency: {
        code: 'NGN',
        symbol: '₦',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.'
    },

    locale: {
        language: 'en-NG',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h'
    },

    timezone: 'Africa/Lagos',

    features: {
        escrowEnabled: true,
        blockchainEnabled: true,
        aiAssistantEnabled: true,
        shortLetEnabled: true,
        landSalesEnabled: true,
        agentMarketplaceEnabled: true,
        mortgageIntegrationEnabled: false
    },

    providers: {
        payment: {
            primary: 'paystack',
            fallback: ['flutterwave'],
            supportedMethods: ['card', 'bank_transfer', 'ussd'],
            escrowProvider: 'paystack'
        },

        identity: {
            primary: 'smile_identity',
            fallback: ['verified_africa'],
            requiredDocuments: ['national_id'],
            supportedIdTypes: ['nin', 'voters_card', 'drivers_license', 'passport'],
            biometricEnabled: true,
            livenessCheckRequired: true
        },

        document: {
            primary: 'lasrera',
            fallback: ['manual_review'],
            propertyRegistry: 'lagos_land_registry',
            regulatoryBody: 'lasrera'
        },

        communication: {
            sms: { primary: 'africas_talking', fallback: ['twilio'] },
            email: { primary: 'sendgrid', fallback: ['ses'] },
            push: { primary: 'fcm', fallback: [] },
            whatsapp: { primary: 'twilio', fallback: [] }
        },

        maps: {
            primary: 'google_maps',
            fallback: ['mapbox'],
            geocodingProvider: 'google_maps'
        },

        blockchain: {
            network: 'polygon',
            rpcProvider: 'alchemy',
            fallbackRpc: 'infura'
        }
    },

    verification: {
        tiers: [
            {
                id: 'bronze',
                name: 'Bronze',
                requirements: ['identity_verified'],
                benefits: ['verified_badge'],
                visibilityBoost: 0
            },
            {
                id: 'silver',
                name: 'Silver',
                requirements: ['identity_verified', 'address_verified', 'property_ownership'],
                benefits: ['verified_badge', 'priority_listing'],
                visibilityBoost: 15
            },
            {
                id: 'gold',
                name: 'Gold',
                requirements: ['identity_verified', 'address_verified', 'property_ownership', 'physical_audit'],
                benefits: ['verified_badge', 'priority_listing', 'featured_placement'],
                visibilityBoost: 25
            },
            {
                id: 'platinum',
                name: 'Platinum',
                requirements: ['gold_tier', 'clean_history_6mo', 'rating_4_5_plus'],
                benefits: ['premium_badge', 'top_results', 'dedicated_support'],
                visibilityBoost: 40
            }
        ],

        propertyDocuments: [
            {
                id: 'cofo',
                name: 'Certificate of Occupancy',
                description: 'Official C of O from state government',
                required: true,
                validityPeriod: 1825, // 5 years in days
                verificationMethod: 'land_registry_api'
            },
            {
                id: 'survey_plan',
                name: 'Survey Plan',
                description: 'Approved survey plan',
                required: false,
                validityPeriod: null,
                verificationMethod: 'manual_review'
            },
            {
                id: 'deed_of_assignment',
                name: 'Deed of Assignment',
                description: 'Transfer of property ownership',
                required: false,
                validityPeriod: null,
                verificationMethod: 'manual_review'
            }
        ],

        expirationRules: [
            {
                documentType: 'cofo',
                warningDays: 90,
                gracePeriodDays: 30
            }
        ]
    },

    compliance: {
        dataProtection: 'ndpr', // Nigeria Data Protection Regulation
        taxReporting: true,
        amlKycLevel: 'enhanced',
        transactionLimits: {
            singleTransaction: 50000000, // ₦50M
            dailyLimit: 100000000,       // ₦100M
            requiresEnhancedKyc: 10000000 // ₦10M
        }
    }
};
