/**
 * Encryption Utility
 * AES-256-GCM encryption for sensitive data at rest
 * Used for: bank account numbers, payment tokens, SSN, etc.
 */

import crypto from 'crypto';
import { env } from '../../config/env';

// ============================================
// CONFIGURATION
// ============================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

// Derive key from environment variable
function getEncryptionKey(): Buffer {
    const keySource = env.ENCRYPTION_KEY || env.JWT_SECRET;

    if (!keySource) {
        throw new Error('ENCRYPTION_KEY or JWT_SECRET must be set');
    }

    // Use PBKDF2 to derive a proper 256-bit key
    return crypto.pbkdf2Sync(
        keySource,
        'homeai-encryption-salt', // Static salt (in production, use per-field salt)
        100000, // iterations
        KEY_LENGTH,
        'sha256'
    );
}

// ============================================
// ENCRYPTION FUNCTIONS
// ============================================

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (base64)
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) {
        return plaintext;
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt data encrypted with encrypt()
 * @param encryptedData - The encrypted string from encrypt()
 * @returns Original plaintext
 */
export function decrypt(encryptedData: string): string {
    if (!encryptedData || !encryptedData.includes(':')) {
        return encryptedData; // Return as-is if not encrypted format
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Check if a string appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
    if (!data) return false;
    const parts = data.split(':');
    return parts.length === 3 && parts.every(p => {
        try {
            Buffer.from(p, 'base64');
            return true;
        } catch {
            return false;
        }
    });
}

/**
 * Hash sensitive data for comparison (one-way)
 * Use for data you don't need to decrypt but need to compare
 */
export function hashSensitiveData(data: string): string {
    return crypto
        .createHmac('sha256', getEncryptionKey())
        .update(data)
        .digest('hex');
}

/**
 * Mask sensitive data for display
 * @param data - The sensitive data
 * @param visibleEnd - Number of characters to show at end (default: 4)
 * @param maskChar - Character to use for masking (default: *)
 */
export function maskSensitiveData(
    data: string,
    visibleEnd: number = 4,
    maskChar: string = '*'
): string {
    if (!data || data.length <= visibleEnd) {
        return maskChar.repeat(4);
    }

    const masked = maskChar.repeat(Math.min(data.length - visibleEnd, 8));
    return masked + data.slice(-visibleEnd);
}

// ============================================
// FIELD-LEVEL ENCRYPTION HELPERS
// ============================================

/**
 * Encrypt an object's sensitive fields
 */
export function encryptFields<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: (keyof T)[]
): T {
    const result = { ...obj };

    for (const field of sensitiveFields) {
        if (typeof result[field] === 'string') {
            result[field] = encrypt(result[field] as string) as T[keyof T];
        }
    }

    return result;
}

/**
 * Decrypt an object's sensitive fields
 */
export function decryptFields<T extends Record<string, unknown>>(
    obj: T,
    sensitiveFields: (keyof T)[]
): T {
    const result = { ...obj };

    for (const field of sensitiveFields) {
        if (typeof result[field] === 'string' && isEncrypted(result[field] as string)) {
            result[field] = decrypt(result[field] as string) as T[keyof T];
        }
    }

    return result;
}
