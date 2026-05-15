/**
 * Users contract — Zod request schemas + inferred request types for the
 * users module. Consolidates the five sub-DTO files the backend keeps
 * split by feature area (core profile, profiles, payment-methods,
 * privacy, connected-accounts).
 */

import { z } from 'zod';

// ============================================
// CORE PROFILE
// ============================================

export const updateProfileSchema = z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
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
// PREFERENCES & NOTIFICATIONS
// ============================================

export const updatePreferencesSchema = z.object({
    language: z.string().length(2).optional(),
    currency: z.string().length(3).optional(),
    timezone: z.string().optional(),
    searchPreferences: z
        .object({
            propertyTypes: z.array(z.string()).optional(),
            locations: z.array(z.string()).optional(),
            priceRange: z
                .object({
                    min: z.number().optional(),
                    max: z.number().optional(),
                })
                .optional(),
            bedrooms: z.number().optional(),
        })
        .optional(),
});

export const updateNotificationSettingsSchema = z.object({
    email: z
        .object({
            enabled: z.boolean(),
            frequency: z.enum(['instant', 'daily', 'weekly']).optional(),
            types: z.array(z.string()).optional(),
        })
        .optional(),
    sms: z
        .object({
            enabled: z.boolean(),
            types: z.array(z.string()).optional(),
        })
        .optional(),
    push: z
        .object({
            enabled: z.boolean(),
            types: z.array(z.string()).optional(),
        })
        .optional(),
});

// ============================================
// WALLET INTEGRATION
// ============================================

export const connectWalletSchema = z.object({
    walletAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
    signature: z.string().min(1, 'Signature is required'),
    message: z.string().min(1, 'Message is required'),
});

// ============================================
// ROLE-SPECIFIC PROFILES
// ============================================

export const tenantProfileSchema = z.object({
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    preferences: z
        .object({
            desiredBedrooms: z.string().optional(),
            monthlyBudgetMax: z.number().positive().optional(),
            desiredAmenities: z.array(z.string()).optional(),
            moveInTimeline: z.string().optional(),
        })
        .optional(),
    privacySettings: z
        .object({
            allowLandlordSearch: z.boolean().optional(),
            showIncomeBadge: z.boolean().optional(),
        })
        .optional(),
});

export const landlordProfileSchema = z.object({
    businessName: z.string().max(200).optional(),
    businessEmail: z.string().email().optional(),
    businessPhone: z.string().optional(),
    businessAddress: z
        .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
        })
        .optional(),
    publicVisibility: z
        .object({
            showContactPhone: z.boolean().optional(),
            showBusinessAddress: z.boolean().optional(),
            showVerificationBadge: z.boolean().optional(),
        })
        .optional(),
});

export const agentProfileSchema = z.object({
    professionalName: z.string().max(200).optional(),
    businessEmail: z.string().email().optional(),
    businessPhone: z.string().optional(),
    serviceAreas: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    publicVisibility: z
        .object({
            showContactEmail: z.boolean().optional(),
            showPhoneNumber: z.boolean().optional(),
            profileSearchable: z.boolean().optional(),
        })
        .optional(),
});

export const addCertificationSchema = z.object({
    name: z.string().min(3).max(200),
    issuer: z.string().min(3).max(200),
    expiryDate: z.string().optional(),
    documentUrl: z.string().url().optional(),
});

// ============================================
// PAYMENT METHODS
// ============================================

export const addPaymentMethodSchema = z.object({
    paymentToken: z.string().min(1, 'Payment token is required'),
    setAsDefault: z.boolean().default(false),
});

export const paymentMethodQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// PRIVACY SETTINGS
// ============================================

export const privacySettingsSchema = z.object({
    profileVisibility: z.enum(['public', 'verified_users_only', 'private']).optional(),
    showPhoneToPublic: z.boolean().optional(),
    showEmailToPublic: z.boolean().optional(),
    showAddressToPublic: z.boolean().optional(),
    allowSearchDiscovery: z.boolean().optional(),
    showVerificationBadge: z.boolean().optional(),
    showActivityStatus: z.boolean().optional(),
    allowMarketingEmails: z.boolean().optional(),
    allowDataSharing: z.boolean().optional(),
});

// ============================================
// CONNECTED (SOCIAL) ACCOUNTS
// ============================================

export const linkAccountSchema = z.object({
    idToken: z.string().min(10),
});

// ============================================
// REQUEST TYPES
// ============================================

export type UpdateProfileRequest = z.input<typeof updateProfileSchema>;
export type UpdatePasswordRequest = z.input<typeof updatePasswordSchema>;
export type UpdatePreferencesRequest = z.input<typeof updatePreferencesSchema>;
export type UpdateNotificationSettingsRequest = z.input<typeof updateNotificationSettingsSchema>;
export type ConnectWalletRequest = z.input<typeof connectWalletSchema>;
export type TenantProfileRequest = z.input<typeof tenantProfileSchema>;
export type LandlordProfileRequest = z.input<typeof landlordProfileSchema>;
export type AgentProfileRequest = z.input<typeof agentProfileSchema>;
export type AddCertificationRequest = z.input<typeof addCertificationSchema>;
export type AddPaymentMethodRequest = z.input<typeof addPaymentMethodSchema>;
export type PaymentMethodQueryRequest = z.input<typeof paymentMethodQuerySchema>;
export type PrivacySettingsRequest = z.input<typeof privacySettingsSchema>;
export type LinkAccountRequest = z.input<typeof linkAccountSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
export type UpdateNotificationSettingsDto = z.infer<typeof updateNotificationSettingsSchema>;
export type ConnectWalletDto = z.infer<typeof connectWalletSchema>;
export type TenantProfileDto = z.infer<typeof tenantProfileSchema>;
export type LandlordProfileDto = z.infer<typeof landlordProfileSchema>;
export type AgentProfileDto = z.infer<typeof agentProfileSchema>;
export type AddCertificationDto = z.infer<typeof addCertificationSchema>;
export type AddPaymentMethodDto = z.infer<typeof addPaymentMethodSchema>;
export type PaymentMethodQueryDto = z.infer<typeof paymentMethodQuerySchema>;
export type PrivacySettingsDto = z.infer<typeof privacySettingsSchema>;
export type LinkAccountDto = z.infer<typeof linkAccountSchema>;

// ============================================
// DEFAULTS — kept here so backend services have a single source for
// the canonical "starter" shape of a privacy record.
// ============================================

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettingsDto = {
    profileVisibility: 'public',
    showPhoneToPublic: false,
    showEmailToPublic: false,
    showAddressToPublic: false,
    allowSearchDiscovery: true,
    showVerificationBadge: true,
    showActivityStatus: false,
    allowMarketingEmails: false,
    allowDataSharing: false,
};
