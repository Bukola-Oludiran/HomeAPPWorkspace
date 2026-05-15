/**
 * Regulatory Compliance Interface
 * Abstraction for region-specific compliance checks
 * Per MultiRegion Abstraction Section 8
 */

// ============================================
// TYPES
// ============================================

export type DataProtectionFramework =
    | 'gdpr'
    | 'uk_gdpr'
    | 'ndpr'        // Nigeria Data Protection Regulation
    | 'popia'       // South Africa
    | 'dpa_kenya'
    | 'dpa_ghana'
    | 'pipeda';     // Canada

export type AmlKycLevel = 'basic' | 'standard' | 'enhanced';

export interface DataProtectionConfig {
    framework: DataProtectionFramework;
    dataRetentionDays: number;
    consentRequired: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
    breachNotificationHours: number;
    dpoRequired: boolean;
}

export interface TaxReportingConfig {
    enabled: boolean;
    threshold?: number;
    reportingPeriod: 'monthly' | 'quarterly' | 'annually';
    withholdingTax?: {
        enabled: boolean;
        rate: number;
    };
}

export interface AmlKycConfig {
    level: AmlKycLevel;
    enhancedThreshold?: number;
    pepScreening: boolean;
    sanctionsScreening: boolean;
    ongoingMonitoring: boolean;
}

export interface PropertyLawConfig {
    // UK-specific
    rightToRentCheck?: boolean;
    depositProtectionScheme?: string[];
    howToRentGuideRequired?: boolean;

    // Nigeria-specific
    lasreraRegistrationRequired?: boolean;
    stampingRequired?: boolean;

    // Universal
    tenancyAgreementRequired: boolean;
    inventoryRequired: boolean;
    maxDepositMonths?: number;
    noticePeriodDays?: {
        landlord: number;
        tenant: number;
    };
}

export interface ComplianceConfig {
    dataProtection: DataProtectionConfig;
    taxReporting: TaxReportingConfig;
    amlKyc: AmlKycConfig;
    propertyLaw: PropertyLawConfig;
}

// ============================================
// CHECK RESULTS
// ============================================

export interface ComplianceCheck {
    checkType: string;
    passed: boolean;
    message?: string;
    requiredAction?: string;
}

export interface TaxWithholding {
    applicable: boolean;
    rate: number;
    amount: number;
}

export interface ComplianceCheckResult {
    passed: boolean;
    checks: ComplianceCheck[];
    requiredActions: string[];
    taxWithholding?: TaxWithholding;
}

export interface DataRetentionPolicy {
    retentionDays: number;
    framework: DataProtectionFramework;
    rightToErasure: boolean;
}

// ============================================
// SERVICE INTERFACE
// ============================================

export interface ComplianceService {
    performPreTransactionChecks(
        userId: string,
        regionCode: string,
        transactionAmount: number,
        transactionType: string
    ): Promise<ComplianceCheckResult>;

    getDataRetentionPolicy(regionCode: string): DataRetentionPolicy;

    calculateWithholdingTax(
        regionCode: string,
        amount: number,
        transactionType: string
    ): TaxWithholding | null;

    getPropertyLawRequirements(regionCode: string): PropertyLawConfig;
}
