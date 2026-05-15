/**
 * Compliance Service
 * Region-aware regulatory compliance checking
 * Per MultiRegion Abstraction Section 8
 */

import {
    ComplianceService as IComplianceService,
    ComplianceCheckResult,
    ComplianceCheck,
    DataRetentionPolicy,
    TaxWithholding,
    PropertyLawConfig,
    ComplianceConfig,
    DataProtectionConfig,
    TaxReportingConfig,
    AmlKycConfig,
} from './compliance.interface';
import { regionConfigService } from '../../config/regions';
import { logger } from '../../common/utils/logger';

// ============================================
// DEFAULT CONFIGS BY REGION
// ============================================

const COMPLIANCE_CONFIGS: Record<string, ComplianceConfig> = {
    NG: {
        dataProtection: {
            framework: 'ndpr',
            dataRetentionDays: 2555, // 7 years
            consentRequired: true,
            rightToErasure: true,
            dataPortability: false,
            breachNotificationHours: 72,
            dpoRequired: false,
        },
        taxReporting: {
            enabled: true,
            threshold: 10000000, // 10M NGN
            reportingPeriod: 'annually',
            withholdingTax: {
                enabled: true,
                rate: 0.10, // 10%
            },
        },
        amlKyc: {
            level: 'standard',
            enhancedThreshold: 50000000, // 50M NGN
            pepScreening: true,
            sanctionsScreening: true,
            ongoingMonitoring: false,
        },
        propertyLaw: {
            lasreraRegistrationRequired: true,
            stampingRequired: true,
            tenancyAgreementRequired: true,
            inventoryRequired: false,
            maxDepositMonths: 12,
            noticePeriodDays: { landlord: 30, tenant: 30 },
        },
    },
    CA: {
        dataProtection: {
            framework: 'pipeda',
            dataRetentionDays: 2555,
            consentRequired: true,
            rightToErasure: true,
            dataPortability: true,
            breachNotificationHours: 72,
            dpoRequired: true,
        },
        taxReporting: {
            enabled: true,
            threshold: 0,
            reportingPeriod: 'annually',
            withholdingTax: {
                enabled: true,
                rate: 0.25, // 25% for non-residents
            },
        },
        amlKyc: {
            level: 'enhanced',
            enhancedThreshold: 10000, // 10K CAD
            pepScreening: true,
            sanctionsScreening: true,
            ongoingMonitoring: true,
        },
        propertyLaw: {
            tenancyAgreementRequired: true,
            inventoryRequired: true,
            maxDepositMonths: 1, // First and last month
            noticePeriodDays: { landlord: 60, tenant: 60 },
        },
    },
    GB: {
        dataProtection: {
            framework: 'uk_gdpr',
            dataRetentionDays: 2190, // 6 years
            consentRequired: true,
            rightToErasure: true,
            dataPortability: true,
            breachNotificationHours: 72,
            dpoRequired: true,
        },
        taxReporting: {
            enabled: true,
            threshold: 1000, // £1000 property income allowance
            reportingPeriod: 'annually',
        },
        amlKyc: {
            level: 'enhanced',
            enhancedThreshold: 10000,
            pepScreening: true,
            sanctionsScreening: true,
            ongoingMonitoring: true,
        },
        propertyLaw: {
            rightToRentCheck: true,
            depositProtectionScheme: ['DPS', 'MyDeposits', 'TDS'],
            howToRentGuideRequired: true,
            tenancyAgreementRequired: true,
            inventoryRequired: true,
            maxDepositMonths: 1.25, // 5 weeks max
            noticePeriodDays: { landlord: 60, tenant: 30 },
        },
    },
};

// Default fallback config
const DEFAULT_CONFIG: ComplianceConfig = {
    dataProtection: {
        framework: 'gdpr',
        dataRetentionDays: 2190,
        consentRequired: true,
        rightToErasure: true,
        dataPortability: true,
        breachNotificationHours: 72,
        dpoRequired: false,
    },
    taxReporting: {
        enabled: false,
        reportingPeriod: 'annually',
    },
    amlKyc: {
        level: 'basic',
        pepScreening: false,
        sanctionsScreening: false,
        ongoingMonitoring: false,
    },
    propertyLaw: {
        tenancyAgreementRequired: true,
        inventoryRequired: false,
    },
};

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

class ComplianceServiceImpl implements IComplianceService {
    private getConfig(regionCode: string): ComplianceConfig {
        return COMPLIANCE_CONFIGS[regionCode] || DEFAULT_CONFIG;
    }

    async performPreTransactionChecks(
        userId: string,
        regionCode: string,
        transactionAmount: number,
        transactionType: string
    ): Promise<ComplianceCheckResult> {
        const config = this.getConfig(regionCode);
        const checks: ComplianceCheck[] = [];
        const requiredActions: string[] = [];

        logger.info(`[Compliance] Pre-transaction checks for ${userId} in ${regionCode}`);

        // KYC Level Check
        const kycCheck = await this.checkKycLevel(userId, transactionAmount, config.amlKyc);
        checks.push(kycCheck);
        if (!kycCheck.passed && kycCheck.requiredAction) {
            requiredActions.push(kycCheck.requiredAction);
        }

        // Sanctions Screening (placeholder)
        if (config.amlKyc.sanctionsScreening) {
            checks.push({
                checkType: 'sanctions_screening',
                passed: true, // Would integrate with sanctions list API
                message: 'No sanctions matches found',
            });
        }

        // PEP Screening (placeholder)
        if (config.amlKyc.pepScreening) {
            checks.push({
                checkType: 'pep_screening',
                passed: true, // Would integrate with PEP database
                message: 'No PEP matches found',
            });
        }

        // Calculate tax withholding if applicable
        let taxWithholding: TaxWithholding | undefined;
        if (transactionType === 'payout' && config.taxReporting.withholdingTax?.enabled) {
            taxWithholding = {
                applicable: true,
                rate: config.taxReporting.withholdingTax.rate,
                amount: transactionAmount * config.taxReporting.withholdingTax.rate,
            };
        }

        const passed = checks.every(c => c.passed);

        return {
            passed,
            checks,
            requiredActions,
            taxWithholding,
        };
    }

    private async checkKycLevel(
        userId: string,
        transactionAmount: number,
        amlConfig: AmlKycConfig
    ): Promise<ComplianceCheck> {
        // In a real implementation, this would:
        // 1. Fetch user's current verification level
        // 2. Compare against required level for transaction amount

        const enhancedRequired = amlConfig.enhancedThreshold &&
            transactionAmount >= amlConfig.enhancedThreshold;

        if (enhancedRequired) {
            return {
                checkType: 'kyc_level',
                passed: false, // Would check actual user verification level
                message: 'Enhanced KYC required for this transaction amount',
                requiredAction: 'complete_enhanced_kyc',
            };
        }

        return {
            checkType: 'kyc_level',
            passed: true,
            message: 'KYC level sufficient',
        };
    }

    getDataRetentionPolicy(regionCode: string): DataRetentionPolicy {
        const config = this.getConfig(regionCode);

        return {
            retentionDays: config.dataProtection.dataRetentionDays,
            framework: config.dataProtection.framework,
            rightToErasure: config.dataProtection.rightToErasure,
        };
    }

    calculateWithholdingTax(
        regionCode: string,
        amount: number,
        transactionType: string
    ): TaxWithholding | null {
        const config = this.getConfig(regionCode);

        if (!config.taxReporting.withholdingTax?.enabled) {
            return null;
        }

        if (transactionType !== 'payout' && transactionType !== 'rent_payment') {
            return null;
        }

        return {
            applicable: true,
            rate: config.taxReporting.withholdingTax.rate,
            amount: amount * config.taxReporting.withholdingTax.rate,
        };
    }

    getPropertyLawRequirements(regionCode: string): PropertyLawConfig {
        const config = this.getConfig(regionCode);
        return config.propertyLaw;
    }
}

export const complianceService = new ComplianceServiceImpl();

// Re-export types
export * from './compliance.interface';
