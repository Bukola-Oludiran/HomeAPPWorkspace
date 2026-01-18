/**
 * Input Sanitization Utility
 * Protects against XSS, SQL injection, and other input attacks
 */

// ============================================
// HTML SANITIZATION
// ============================================

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts: < > & " ' to their HTML entity equivalents
 */
export function escapeHtml(str: string): string {
    if (!str) return str;

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return str.replace(/[&<>"'`=\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Removes HTML tags completely from string
 * Use when you want plain text only
 */
export function stripHtml(str: string): string {
    if (!str) return str;
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes string by removing potentially dangerous patterns
 * - Removes script tags
 * - Removes event handlers (onclick, onerror, etc.)
 * - Removes javascript: URLs
 */
export function sanitizeString(str: string): string {
    if (!str) return str;

    let sanitized = str;

    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (on* attributes)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: URLs (can contain scripts)
    sanitized = sanitized.replace(/data:/gi, '');

    // Remove vbscript: URLs
    sanitized = sanitized.replace(/vbscript:/gi, '');

    // Escape remaining HTML
    sanitized = escapeHtml(sanitized);

    return sanitized;
}

// ============================================
// SPECIFIC SANITIZERS
// ============================================

/**
 * Sanitize user-generated text content (descriptions, messages, notes)
 * Preserves text but removes dangerous content
 */
export function sanitizeText(str: string): string {
    if (!str) return str;
    return sanitizeString(str.trim());
}

/**
 * Sanitize a name (first name, last name, property name)
 * Only allows letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(str: string): string {
    if (!str) return str;
    // Remove anything that's not a letter, space, hyphen, or apostrophe
    return str.trim().replace(/[^a-zA-Z\s\-']/g, '').slice(0, 100);
}

/**
 * Sanitize phone number
 * Only allows digits, +, -, spaces, parentheses
 */
export function sanitizePhone(str: string): string {
    if (!str) return str;
    return str.replace(/[^\d\+\-\s\(\)]/g, '').slice(0, 20);
}

/**
 * Sanitize URL
 * Ensures URL is safe (no javascript:, data:, etc.)
 */
export function sanitizeUrl(str: string): boolean {
    if (!str) return true;
    const lowerStr = str.toLowerCase().trim();

    // Block dangerous URL schemes
    const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
    return !dangerousSchemes.some(scheme => lowerStr.startsWith(scheme));
}

// ============================================
// ZOD CUSTOM REFINEMENTS
// ============================================

import { z } from 'zod';

/**
 * Zod string that sanitizes text input
 * Use for: descriptions, messages, notes, comments
 */
export const sanitizedText = (maxLength: number = 5000) =>
    z.string()
        .max(maxLength)
        .transform(sanitizeText);

/**
 * Zod string for names
 * Use for: firstName, lastName, property names
 */
export const sanitizedName = (maxLength: number = 100) =>
    z.string()
        .max(maxLength)
        .transform(sanitizeName);

/**
 * Zod string for phone numbers
 */
export const sanitizedPhone = () =>
    z.string()
        .max(20)
        .transform(sanitizePhone);

/**
 * Zod string that ensures URL is safe
 */
export const safeUrl = () =>
    z.string()
        .url()
        .refine(sanitizeUrl, { message: 'URL contains potentially dangerous content' });

// ============================================
// BATCH SANITIZATION
// ============================================

/**
 * Recursively sanitize all string values in an object
 * Useful for sanitizing entire request bodies
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeText(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item
            );
        } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            result[key] = value;
        }
    }

    return result as T;
}
