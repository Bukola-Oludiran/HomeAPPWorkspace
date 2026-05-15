/**
 * User Module - DTO Validation Schemas
 * Per PRD Section 7.1 & 7.2
 */

import { z } from 'zod';

// ============================================
// USER PROFILE
// ============================================

export const updateProfileSchema = z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    // Role-specific profile data
    profileData: z.record(z.unknown()).optional(),
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
});

// ============================================
// PREFERENCES
// ============================================

export const updatePreferencesSchema = z.object({
    language: z.string().length(2).optional(), // e.g., 'en', 'yo', 'ha', 'ig'
    currency: z.string().length(3).optional(), // e.g., 'NGN', 'USD'
    timezone: z.string().optional(),
    searchPreferences: z.object({
        propertyTypes: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional(),
        priceRange: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
        }).optional(),
        bedrooms: z.number().optional(),
    }).optional(),
});

export const updateNotificationSettingsSchema = z.object({
    email: z.object({
        enabled: z.boolean(),
        frequency: z.enum(['instant', 'daily', 'weekly']).optional(),
        types: z.array(z.string()).optional(),
    }).optional(),
    sms: z.object({
        enabled: z.boolean(),
        types: z.array(z.string()).optional(),
    }).optional(),
    push: z.object({
        enabled: z.boolean(),
        types: z.array(z.string()).optional(),
    }).optional(),
});

// ============================================
// WALLET INTEGRATION (PRD Section 7.2)
// ============================================

export const connectWalletSchema = z.object({
    walletAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
    signature: z.string().min(1, 'Signature is required'),
    message: z.string().min(1, 'Message is required'),
});

// ============================================
// AVATAR
// ============================================

export const uploadAvatarSchema = z.object({
    // File validation happens at multer level
});

// ============================================
// TYPES
// ============================================

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
export type UpdateNotificationSettingsDto = z.infer<typeof updateNotificationSettingsSchema>;
export type ConnectWalletDto = z.infer<typeof connectWalletSchema>;
