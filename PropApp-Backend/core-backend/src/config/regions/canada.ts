/**
 * Canada Region Configuration
 * Per HomeAI-Canada-Integrations.md
 */

import { RegionConfig } from './types';

/**
 * Province-specific configuration
 */
interface ProvinceConfig {
    name: string;
    timezone: string;
    landRegistry: string;
    realEstateRegulator: string;
    primaryLanguage?: string;
    tenantLaw: {
        maxDeposit: number | string;
        depositType?: string;
        petDeposit?: number;
        landlordNotice: number;
        tenantNotice: number;
        rentControl: boolean;
        tribunal: string;
    };
    specialFeatures?: string[];
    specialRequirements?: string[];
}

export const CanadaConfig: RegionConfig = {
    code: 'CA',
    name: 'Canada',

    currency: {
        code: 'CAD',
        symbol: '$',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        allowed: ['CAD', 'USD'],
    },

    locale: {
        language: 'en-CA', // Primary language
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '12h',
    },

    timezone: 'America/Toronto',

    features: {
        escrowEnabled: true,
        blockchainEnabled: false,
        aiAssistantEnabled: true,
        shortLetEnabled: true,
        landSalesEnabled: true,
        agentMarketplaceEnabled: true,
        mortgageIntegrationEnabled: true,
    },

    providers: {
        payment: {
            primary: 'stripe',
            fallback: ['moneris'],
            supportedMethods: ['card', 'bank_transfer', 'open_banking'],
            escrowProvider: 'stripe_connect',
        },
        identity: {
            primary: 'onfido',
            fallback: ['jumio', 'trulioo'],
            requiredDocuments: ['drivers_license', 'passport'],
            supportedIdTypes: ['drivers_license_ca', 'passport_ca', 'pr_card', 'citizenship_card'],
            biometricEnabled: true,
            livenessCheckRequired: true,
        },
        document: {
            primary: 'dye_durham',
            fallback: ['manual_review'],
            propertyRegistry: 'multi_provincial',
            regulatoryBody: 'provincial',
        },
        communication: {
            sms: { primary: 'twilio', fallback: ['messagebird'] },
            email: { primary: 'sendgrid', fallback: ['ses'] },
            push: { primary: 'fcm', fallback: [] },
        },
        maps: {
            primary: 'google_maps',
            fallback: ['mapbox'],
            geocodingProvider: 'google_maps',
        },
        blockchain: {
            network: 'polygon',
            rpcProvider: 'alchemy',
            fallbackRpc: 'infura',
        },
    },

    verification: {
        tiers: [
            {
                id: 'basic',
                name: 'Basic',
                requirements: ['identity_verified'],
                benefits: ['can_list', 'can_apply'],
                visibilityBoost: 0,
            },
            {
                id: 'verified',
                name: 'Verified',
                requirements: ['identity_verified', 'address_verified'],
                benefits: ['verified_badge', 'priority_support'],
                visibilityBoost: 10,
            },
            {
                id: 'professional',
                name: 'Professional',
                requirements: ['identity_verified', 'address_verified', 'agent_license'],
                benefits: ['professional_badge', 'featured_listings'],
                visibilityBoost: 25,
            },
        ],
        propertyDocuments: [
            {
                id: 'title_search',
                name: 'Title Search',
                description: 'Recent title search from provincial land registry',
                required: true,
                validityPeriod: 30,
                verificationMethod: 'dye_durham_api',
            },
            {
                id: 'property_tax',
                name: 'Property Tax Statement',
                description: 'Current year property tax statement',
                required: false,
                validityPeriod: 365,
                verificationMethod: 'manual_review',
            },
        ],
    },

    compliance: {
        dataProtection: 'pipeda',
        taxReporting: true,
        amlKycLevel: 'standard',
        transactionLimits: {
            singleTransaction: 100000, // CAD
            dailyLimit: 500000,
            requiresEnhancedKyc: 25000,
        },
    },
};

/**
 * Province-specific configurations
 */
export const CanadaProvinces: Record<string, ProvinceConfig> = {
    ON: {
        name: 'Ontario',
        timezone: 'America/Toronto',
        landRegistry: 'teranet',
        realEstateRegulator: 'RECO',
        tenantLaw: {
            maxDeposit: 'last_month_rent',
            depositType: 'last_month_only',
            landlordNotice: 60,
            tenantNotice: 60,
            rentControl: true,
            tribunal: 'Landlord and Tenant Board',
        },
    },
    BC: {
        name: 'British Columbia',
        timezone: 'America/Vancouver',
        landRegistry: 'ltsa',
        realEstateRegulator: 'BCFSA',
        tenantLaw: {
            maxDeposit: 0.5,
            petDeposit: 0.5,
            landlordNotice: 60,
            tenantNotice: 30,
            rentControl: true,
            tribunal: 'Residential Tenancy Branch',
        },
        specialFeatures: ['lotr'],
    },
    AB: {
        name: 'Alberta',
        timezone: 'America/Edmonton',
        landRegistry: 'spin2',
        realEstateRegulator: 'RECA',
        tenantLaw: {
            maxDeposit: 1,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: false,
            tribunal: 'Residential Tenancy Dispute Resolution Service',
        },
    },
    QC: {
        name: 'Quebec',
        timezone: 'America/Montreal',
        landRegistry: 'registre_foncier',
        realEstateRegulator: 'OACIQ',
        primaryLanguage: 'fr-CA',
        tenantLaw: {
            maxDeposit: 0,
            landlordNotice: 180,
            tenantNotice: 90,
            rentControl: true,
            tribunal: 'Tribunal administratif du logement',
        },
        specialRequirements: ['french_language_compliance'],
    },
    MB: {
        name: 'Manitoba',
        timezone: 'America/Winnipeg',
        landRegistry: 'property_registry',
        realEstateRegulator: 'MREA',
        tenantLaw: {
            maxDeposit: 0.5,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: false,
            tribunal: 'Residential Tenancies Branch',
        },
    },
    SK: {
        name: 'Saskatchewan',
        timezone: 'America/Regina',
        landRegistry: 'isc_land_titles',
        realEstateRegulator: 'SREC',
        tenantLaw: {
            maxDeposit: 1,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: false,
            tribunal: 'Office of Residential Tenancies',
        },
    },
    NS: {
        name: 'Nova Scotia',
        timezone: 'America/Halifax',
        landRegistry: 'property_online',
        realEstateRegulator: 'NSREC',
        tenantLaw: {
            maxDeposit: 0.5,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: true,
            tribunal: 'Residential Tenancies Board',
        },
    },
    NB: {
        name: 'New Brunswick',
        timezone: 'America/Moncton',
        landRegistry: 'snb_land_registry',
        realEstateRegulator: 'NBREA',
        tenantLaw: {
            maxDeposit: 1,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: false,
            tribunal: 'Residential Tenancies Tribunal',
        },
    },
    NL: {
        name: 'Newfoundland and Labrador',
        timezone: 'America/St_Johns',
        landRegistry: 'registry_of_deeds',
        realEstateRegulator: 'NLREC',
        tenantLaw: {
            maxDeposit: 0.75,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: false,
            tribunal: 'Residential Tenancies Division',
        },
    },
    PE: {
        name: 'Prince Edward Island',
        timezone: 'America/Halifax',
        landRegistry: 'pei_land_registry',
        realEstateRegulator: 'PEIRREC',
        tenantLaw: {
            maxDeposit: 1,
            landlordNotice: 90,
            tenantNotice: 30,
            rentControl: true,
            tribunal: 'IRAC Residential Tenancies',
        },
    },
};

/**
 * Real estate regulatory bodies lookup
 */
export const CanadaRealEstateRegulators: Record<string, { name: string; url: string }> = {
    ON: { name: 'RECO', url: 'https://www.reco.on.ca/RegistrantSearch' },
    BC: { name: 'BCFSA', url: 'https://www.bcfsa.ca/public-resources/real-estate/find-professional' },
    AB: { name: 'RECA', url: 'https://www.reca.ca/consumers/find-a-professional/' },
    QC: { name: 'OACIQ', url: 'https://www.oaciq.com/en/find-a-broker' },
    MB: { name: 'MREA', url: 'https://realestatemanitoba.com' },
    SK: { name: 'SREC', url: 'https://www.srec.ca/find-an-agent' },
    NS: { name: 'NSREC', url: 'https://nsrec.ns.ca/find-a-licensee/' },
    NB: { name: 'NBREA', url: 'https://www.nbrea.ca/find-an-agent' },
    NL: { name: 'NLREC', url: 'https://www.nlrec.ca' },
    PE: { name: 'PEIRREC', url: 'http://www.peirrec.com' },
};
