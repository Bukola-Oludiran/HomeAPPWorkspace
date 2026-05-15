/**
 * Privacy Settings Service
 * Per APIRevised.md Section 1.2
 */

import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { PrivacySettingsDto, DEFAULT_PRIVACY_SETTINGS } from './privacy.dto';

// ============================================
// SERVICE
// ============================================

class PrivacyService {
    /**
     * Get user's privacy settings
     */
    async getPrivacySettings(userId: string): Promise<PrivacySettingsDto> {
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return DEFAULT_PRIVACY_SETTINGS;
        }

        const profileData = (profile.profileData || {}) as Record<string, unknown>;
        const privacySettings = (profileData.privacy || {}) as Record<string, unknown>;

        return {
            profileVisibility: (privacySettings.profileVisibility as PrivacySettingsDto['profileVisibility']) || DEFAULT_PRIVACY_SETTINGS.profileVisibility,
            showPhoneToPublic: (privacySettings.showPhoneToPublic as boolean) ?? DEFAULT_PRIVACY_SETTINGS.showPhoneToPublic,
            showEmailToPublic: (privacySettings.showEmailToPublic as boolean) ?? DEFAULT_PRIVACY_SETTINGS.showEmailToPublic,
            showAddressToPublic: (privacySettings.showAddressToPublic as boolean) ?? DEFAULT_PRIVACY_SETTINGS.showAddressToPublic,
            allowSearchDiscovery: (privacySettings.allowSearchDiscovery as boolean) ?? DEFAULT_PRIVACY_SETTINGS.allowSearchDiscovery,
            showVerificationBadge: (privacySettings.showVerificationBadge as boolean) ?? DEFAULT_PRIVACY_SETTINGS.showVerificationBadge,
            showActivityStatus: (privacySettings.showActivityStatus as boolean) ?? DEFAULT_PRIVACY_SETTINGS.showActivityStatus,
            allowMarketingEmails: (privacySettings.allowMarketingEmails as boolean) ?? DEFAULT_PRIVACY_SETTINGS.allowMarketingEmails,
            allowDataSharing: (privacySettings.allowDataSharing as boolean) ?? DEFAULT_PRIVACY_SETTINGS.allowDataSharing,
        };
    }

    /**
     * Update user's privacy settings
     */
    async updatePrivacySettings(userId: string, dto: PrivacySettingsDto): Promise<PrivacySettingsDto> {
        // Get existing profile data
        const existingProfile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        const existingData = (existingProfile?.profileData || {}) as Record<string, unknown>;
        const existingPrivacy = (existingData.privacy || {}) as Record<string, unknown>;

        // Merge new settings with existing
        const updatedPrivacy = {
            ...existingPrivacy,
            ...Object.fromEntries(
                Object.entries(dto).filter(([, v]) => v !== undefined)
            ),
        };

        const newProfileData = {
            ...existingData,
            privacy: updatedPrivacy,
        } as Prisma.InputJsonValue;

        const createData = {
            privacy: updatedPrivacy,
        } as Prisma.InputJsonValue;

        // Upsert profile
        await prisma.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                profileData: createData,
            },
            update: {
                profileData: newProfileData,
            },
        });

        // Return updated settings
        return this.getPrivacySettings(userId);
    }
}

export const privacyService = new PrivacyService();
