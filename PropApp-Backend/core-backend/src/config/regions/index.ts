/**
 * Region Configuration Service
 * Manages region-specific configurations for multi-region deployment
 */

import { RegionConfig, FeatureFlags } from './types';
import { NigeriaConfig } from './nigeria';
import { CanadaConfig } from './canada';

class RegionConfigService {
    private configs: Map<string, RegionConfig> = new Map();
    private defaultRegion: string = 'NG';

    constructor() {
        // Register available regions
        this.registerConfig(NigeriaConfig);
        this.registerConfig(CanadaConfig);
        // Future regions can be added here:
        // this.registerConfig(GhanaConfig);
        // this.registerConfig(KenyaConfig);
    }

    /**
     * Register a new region configuration
     */
    registerConfig(config: RegionConfig): void {
        this.configs.set(config.code.toUpperCase(), config);
    }

    /**
     * Get configuration for a specific region
     */
    getConfig(regionCode: string): RegionConfig {
        const config = this.configs.get(regionCode.toUpperCase());
        if (!config) {
            throw new Error(`Region ${regionCode} is not configured`);
        }
        return config;
    }

    /**
     * Get the default region configuration
     */
    getDefaultConfig(): RegionConfig {
        return this.getConfig(this.defaultRegion);
    }

    /**
     * Get list of supported region codes
     */
    getSupportedRegions(): string[] {
        return Array.from(this.configs.keys());
    }

    /**
     * Check if a region is supported
     */
    isRegionSupported(regionCode: string): boolean {
        return this.configs.has(regionCode.toUpperCase());
    }

    /**
     * Check if a feature is enabled for a region
     */
    isFeatureEnabled(regionCode: string, feature: keyof FeatureFlags): boolean {
        try {
            const config = this.getConfig(regionCode);
            return config.features[feature] ?? false;
        } catch {
            return false;
        }
    }

    /**
     * Get provider configuration for a region
     */
    getProviderConfig<T extends keyof RegionConfig['providers']>(
        regionCode: string,
        providerType: T
    ): RegionConfig['providers'][T] {
        const config = this.getConfig(regionCode);
        return config.providers[providerType];
    }

    /**
     * Get verification tier configuration
     */
    getVerificationTiers(regionCode: string) {
        const config = this.getConfig(regionCode);
        return config.verification.tiers;
    }

    /**
     * Get required property documents for a region
     */
    getRequiredPropertyDocuments(regionCode: string) {
        const config = this.getConfig(regionCode);
        return config.verification.propertyDocuments.filter(doc => doc.required);
    }

    /**
     * Format currency for a region
     */
    formatCurrency(regionCode: string, amount: number): string {
        const config = this.getConfig(regionCode);
        const { symbol, decimalPlaces, thousandsSeparator, decimalSeparator } = config.currency;

        const parts = amount.toFixed(decimalPlaces).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
        const decimalPart = parts[1];

        return `${symbol}${integerPart}${decimalSeparator}${decimalPart}`;
    }

    /**
     * Get currency code for a region
     */
    getCurrencyCode(regionCode: string): string {
        const config = this.getConfig(regionCode);
        return config.currency.code;
    }

    /**
     * Get the list of currencies a region will accept on inbound writes.
     * Always includes the primary currency; may also list secondary/cross-border ones.
     */
    getAllowedCurrencies(regionCode: string): string[] {
        const config = this.getConfig(regionCode);
        return config.currency.allowed;
    }

    /**
     * Region-aware currency validation. Use at handler entry to reject writes
     * with a currency the user's region doesn't permit. Case-insensitive.
     */
    isCurrencyAllowed(regionCode: string, currency: string): boolean {
        const allowed = this.getAllowedCurrencies(regionCode).map(c => c.toUpperCase());
        return allowed.includes(currency.toUpperCase());
    }

    /**
     * Check if transaction amount requires enhanced KYC
     */
    requiresEnhancedKyc(regionCode: string, amount: number): boolean {
        const config = this.getConfig(regionCode);
        const threshold = config.compliance.transactionLimits?.requiresEnhancedKyc;
        return threshold ? amount >= threshold : false;
    }
}

// Export singleton instance
export const regionConfigService = new RegionConfigService();

// Also export class for testing
export { RegionConfigService };
