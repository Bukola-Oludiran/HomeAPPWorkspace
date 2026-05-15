/**
 * Formatting Utilities
 * Handles currency, units, and locale-aware formatting
 * Based on multi-region abstraction principles
 */

import { regionConfigService } from '../../config/regions';

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Format amount as currency for a specific region
 * Uses region configuration for symbol, decimal places, separators
 */
export function formatCurrency(regionCode: string, amount: number): string {
    return regionConfigService.formatCurrency(regionCode, amount);
}

/**
 * Get currency code for a region
 */
export function getCurrencyCode(regionCode: string): string {
    return regionConfigService.getCurrencyCode(regionCode);
}

// ============================================
// UNIT CONVERSIONS
// ============================================

/**
 * Convert square feet to square meters
 * TODO: Make this region-aware - some regions prefer imperial units
 * Currently always converts to metric (standard across most regions)
 */
export function squareFeetToMeters(squareFeet: number): number {
    return Math.round(squareFeet * 0.092903);
}

/**
 * Convert square meters to square feet
 */
export function squareMetersToFeet(squareMeters: number): number {
    return Math.round(squareMeters / 0.092903);
}

/**
 * Get appropriate area unit for region
 * TODO: Implement based on region preferences in config
 * Currently defaults to metric for all regions
 */
export function getAreaUnit(regionCode: string): 'sqft' | 'sqm' {
    // For now, return metric for all regions
    // Future: Add measurementSystem to RegionConfig
    return 'sqm';
}

// ============================================
// DATE/TIME FORMATTING
// ============================================

/**
 * Format date according to region locale
 */
export function formatDate(regionCode: string, date: Date): string {
    const config = regionConfigService.getConfig(regionCode);
    const locale = config.locale.language;

    // Parse dateFormat from config (e.g., "DD/MM/YYYY")
    // For now, use standard locale formatting
    return date.toLocaleDateString(locale);
}

/**
 * Format date and time according to region locale
 */
export function formatDateTime(regionCode: string, date: Date): string {
    const config = regionConfigService.getConfig(regionCode);
    const locale = config.locale.language;
    const timeFormat = config.locale.timeFormat;

    const options: Intl.DateTimeFormatOptions = {
        hour12: timeFormat === '12h',
        hour: 'numeric',
        minute: '2-digit',
    };

    return date.toLocaleString(locale, options);
}

/**
 * Format time according to region locale
 */
export function formatTime(regionCode: string, date: Date): string {
    const config = regionConfigService.getConfig(regionCode);
    const locale = config.locale.language;
    const timeFormat = config.locale.timeFormat;

    const options: Intl.DateTimeFormatOptions = {
        hour12: timeFormat === '12h',
        hour: 'numeric',
        minute: '2-digit',
    };

    return date.toLocaleTimeString(locale, options);
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format number according to region locale
 */
export function formatNumber(regionCode: string, value: number, decimals = 0): string {
    const config = regionConfigService.getConfig(regionCode);
    const locale = config.locale.language;

    return value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
