/**
 * Privacy Settings DTO
 * Per APIRevised.md Section 1.2
 */

import { z } from 'zod';

// ============================================
// PRIVACY SETTINGS SCHEMA
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

export type PrivacySettingsDto = z.infer<typeof privacySettingsSchema>;

// Default privacy settings
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
