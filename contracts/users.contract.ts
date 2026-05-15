/**
 * Users contract — Zod request schemas + inferred request types for the
 * users module. Consolidates the five sub-DTO files the backend keeps
 * split by feature area (core profile, profiles, payment-methods,
 * privacy, connected-accounts).
 */

import { z } from 'zod';
import {
    OpenAPIRegistry,
    requireBearerAuth,
    STANDARD_ERROR_RESPONSES,
    successResponse,
} from './openapi';

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

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Users';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerUsersPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });
    const providerParam = z.object({
        provider: z.enum(['google', 'apple', 'facebook']),
    });

    // Core profile
    registry.registerPath({
        method: 'get',
        path: '/users/me',
        tags: [TAG],
        summary: 'Authenticated user\'s full profile.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('User profile', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me',
        tags: [TAG],
        summary: 'Update first/last name, phone, and role-specific profileData.',
        security: requireBearerAuth,
        request: JSON_BODY(updateProfileSchema),
        responses: {
            200: successResponse('Profile updated', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/password',
        tags: [TAG],
        summary: 'Change password (requires current password).',
        security: requireBearerAuth,
        request: JSON_BODY(updatePasswordSchema),
        responses: {
            200: successResponse('Password updated', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/preferences',
        tags: [TAG],
        summary: 'Update language / currency / timezone / search preferences.',
        security: requireBearerAuth,
        request: JSON_BODY(updatePreferencesSchema),
        responses: {
            200: successResponse('Preferences updated', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/notification-settings',
        tags: [TAG],
        summary: 'Update email / sms / push notification preferences.',
        security: requireBearerAuth,
        request: JSON_BODY(updateNotificationSettingsSchema),
        responses: {
            200: successResponse('Notification settings updated', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/users/me',
        tags: [TAG],
        summary: 'Delete the authenticated user\'s account.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Account deleted', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/avatar',
        tags: [TAG],
        summary: 'Upload a new avatar image (multipart/form-data, field name `avatar`).',
        security: requireBearerAuth,
        request: {
            body: {
                content: {
                    'multipart/form-data': {
                        schema: z.object({
                            avatar: z.string().describe('Avatar image binary'),
                        }),
                    },
                },
            },
        },
        responses: {
            200: successResponse('Avatar updated', z.object({ avatarUrl: z.string().url() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/users/me/wallet',
        tags: [TAG],
        summary: 'Get the authenticated user\'s connected wallet address.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Wallet', z.object({ walletAddress: z.string().nullable() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/wallet',
        tags: [TAG],
        summary: 'Connect a wallet via signed message.',
        security: requireBearerAuth,
        request: JSON_BODY(connectWalletSchema),
        responses: {
            200: successResponse('Wallet connected', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/users/public/landlord/{id}',
        tags: [TAG],
        summary: 'Public landlord profile (subject to landlord privacy settings).',
        request: { params: idParam },
        responses: {
            200: successResponse('Public landlord profile', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    // Role-specific profiles
    for (const [role, schema] of [
        ['tenant', tenantProfileSchema],
        ['landlord', landlordProfileSchema],
        ['agent', agentProfileSchema],
    ] as const) {
        registry.registerPath({
            method: 'get',
            path: `/users/me/profile/${role}`,
            tags: [TAG],
            summary: `Get ${role} profile.`,
            security: requireBearerAuth,
            responses: {
                200: successResponse(`${role} profile`, z.unknown()),
                ...STANDARD_ERROR_RESPONSES,
            },
        });

        registry.registerPath({
            method: 'put',
            path: `/users/me/profile/${role}`,
            tags: [TAG],
            summary: `Update ${role} profile.`,
            security: requireBearerAuth,
            request: JSON_BODY(schema),
            responses: {
                200: successResponse('Updated', z.object({ message: z.string() })),
                ...STANDARD_ERROR_RESPONSES,
            },
        });
    }

    registry.registerPath({
        method: 'post',
        path: '/users/me/profile/agent/certifications',
        tags: [TAG],
        summary: 'Add an agent certification.',
        security: requireBearerAuth,
        request: JSON_BODY(addCertificationSchema),
        responses: {
            201: successResponse('Certification added', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/users/me/profile/agent/certifications/{id}',
        tags: [TAG],
        summary: 'Delete an agent certification.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Certification deleted', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    // Payment methods
    registry.registerPath({
        method: 'get',
        path: '/users/me/payment-methods',
        tags: [TAG],
        summary: "List the user's saved payment methods.",
        security: requireBearerAuth,
        responses: {
            200: successResponse('Payment methods', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/payment-methods',
        tags: [TAG],
        summary: 'Add a payment method (tokenized).',
        security: requireBearerAuth,
        request: JSON_BODY(addPaymentMethodSchema),
        responses: {
            201: successResponse('Payment method added', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/payment-methods/{id}/default',
        tags: [TAG],
        summary: 'Set a payment method as the default.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Default updated', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/users/me/payment-methods/{id}',
        tags: [TAG],
        summary: 'Remove a saved payment method.',
        security: requireBearerAuth,
        request: { params: idParam },
        responses: {
            200: successResponse('Payment method removed', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    // Privacy
    registry.registerPath({
        method: 'get',
        path: '/users/me/privacy',
        tags: [TAG],
        summary: 'Get privacy settings.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Privacy settings', privacySettingsSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'put',
        path: '/users/me/privacy',
        tags: [TAG],
        summary: 'Update privacy settings.',
        security: requireBearerAuth,
        request: JSON_BODY(privacySettingsSchema),
        responses: {
            200: successResponse(
                'Privacy settings updated',
                z.object({ message: z.string(), settings: privacySettingsSchema })
            ),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    // Connected (OAuth) accounts
    registry.registerPath({
        method: 'get',
        path: '/users/me/connected-accounts',
        tags: [TAG],
        summary: 'List connected social accounts.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Connected accounts', z.array(z.unknown())),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/users/me/connected-accounts/{provider}',
        tags: [TAG],
        summary: 'Link an OAuth account (google / apple / facebook).',
        security: requireBearerAuth,
        request: { params: providerParam, ...JSON_BODY(linkAccountSchema) },
        responses: {
            201: successResponse('Account linked', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/users/me/connected-accounts/{provider}',
        tags: [TAG],
        summary: 'Unlink an OAuth account.',
        security: requireBearerAuth,
        request: { params: providerParam },
        responses: {
            200: successResponse('Account unlinked', z.object({ message: z.string() })),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};
