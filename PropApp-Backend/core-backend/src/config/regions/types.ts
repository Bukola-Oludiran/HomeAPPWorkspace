/**
 * Region Configuration Types
 * Based on HomeAI Multi-Region Abstraction Architecture
 */

// ============================================
// CORE TYPES
// ============================================

export interface RegionConfig {
    code: string;
    name: string;
    currency: CurrencyConfig;
    locale: LocaleConfig;
    timezone: string;
    features: FeatureFlags;
    providers: ProvidersConfig;
    verification: VerificationConfig;
    compliance: ComplianceConfig;
}

export interface CurrencyConfig {
    code: string;
    symbol: string;
    decimalPlaces: number;
    thousandsSeparator: string;
    decimalSeparator: string;
    /**
     * Currencies the region will accept on inbound writes (POST /transactions, etc.).
     * Always include the primary `code`. List additional codes (e.g. USD for cross-border)
     * to relax the region-aware validation in the transactions handler.
     */
    allowed: string[];
}

export interface LocaleConfig {
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
}

export interface FeatureFlags {
    escrowEnabled: boolean;
    blockchainEnabled: boolean;
    aiAssistantEnabled: boolean;
    shortLetEnabled: boolean;
    landSalesEnabled: boolean;
    agentMarketplaceEnabled: boolean;
    mortgageIntegrationEnabled: boolean;
}

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

export interface ProvidersConfig {
    payment: PaymentProviderConfig;
    identity: IdentityProviderConfig;
    document: DocumentProviderConfig;
    communication: CommunicationProviderConfig;
    maps: MapsProviderConfig;
    blockchain: BlockchainProviderConfig;
}

export interface PaymentProviderConfig {
    primary: string;
    fallback: string[];
    supportedMethods: PaymentMethod[];
    escrowProvider: string;
}

export type PaymentMethod =
    | 'card'
    | 'bank_transfer'
    | 'ussd'
    | 'mobile_money'
    | 'qr'
    | 'open_banking';

export interface IdentityProviderConfig {
    primary: string;
    fallback: string[];
    requiredDocuments: string[];
    supportedIdTypes: string[];
    biometricEnabled: boolean;
    livenessCheckRequired: boolean;
}

export interface DocumentProviderConfig {
    primary: string;
    fallback: string[];
    propertyRegistry?: string;
    regulatoryBody?: string;
}

export interface CommunicationProviderConfig {
    sms: ChannelConfig;
    email: ChannelConfig;
    push: ChannelConfig;
    whatsapp?: ChannelConfig;
}

export interface ChannelConfig {
    primary: string;
    fallback: string[];
}

export interface MapsProviderConfig {
    primary: string;
    fallback: string[];
    geocodingProvider?: string;
}

export interface BlockchainProviderConfig {
    network: string;
    rpcProvider: string;
    fallbackRpc?: string;
}

// ============================================
// VERIFICATION CONFIGURATION
// ============================================

export interface VerificationConfig {
    tiers: VerificationTierConfig[];
    propertyDocuments: PropertyDocumentConfig[];
    expirationRules?: ExpirationRuleConfig[];
}

export interface VerificationTierConfig {
    id: string;
    name: string;
    requirements: string[];
    benefits: string[];
    visibilityBoost: number;
}

export interface PropertyDocumentConfig {
    id: string;
    name: string;
    description: string;
    required: boolean;
    validityPeriod: number | null; // Days, null = no expiry
    verificationMethod: string;
}

export interface ExpirationRuleConfig {
    documentType: string;
    warningDays: number;
    gracePeriodDays: number;
}

// ============================================
// COMPLIANCE CONFIGURATION
// ============================================

export interface ComplianceConfig {
    dataProtection: string;
    taxReporting: boolean;
    amlKycLevel: 'standard' | 'enhanced';
    transactionLimits?: TransactionLimitsConfig;
    rightToRent?: boolean;
    depositProtection?: boolean;
}

export interface TransactionLimitsConfig {
    singleTransaction: number;
    dailyLimit: number;
    requiresEnhancedKyc: number;
}
