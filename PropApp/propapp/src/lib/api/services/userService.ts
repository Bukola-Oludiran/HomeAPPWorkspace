/**
 * User Service
 * API calls for user profile and settings
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
    User,
    UserWithProfile,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserPreferences,
    NotificationSettings,
    PrivacySettings,
    TenantProfile,
    LandlordProfile,
    AgentProfile,
    AgentCertification,
    ConnectedAccount,
    OAuthProvider,
} from '../../../types/auth';
import type { BankAccount, AddBankAccountRequest, PayoutSettings, Payout } from '../../../types/lease';
import type { PaginatedResponse } from '../../../types/api';

/**
 * Get current user profile
 */
export async function getCurrentUser() {
    return api.get<UserWithProfile>(API_ENDPOINTS.USERS.ME);
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest) {
    return api.put<User>(API_ENDPOINTS.USERS.ME, data);
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordRequest) {
    return api.put<{ message: string }>(API_ENDPOINTS.USERS.PASSWORD, data);
}

/**
 * Update user preferences
 */
export async function updatePreferences(data: Partial<UserPreferences>) {
    return api.put<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES, data);
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(data: Partial<NotificationSettings>) {
    return api.put<NotificationSettings>(API_ENDPOINTS.USERS.NOTIFICATION_SETTINGS, data);
}

/**
 * Delete user account
 */
export async function deleteAccount() {
    return api.delete<{ message: string }>(API_ENDPOINTS.USERS.ME);
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{ avatarUrl: string }>(API_ENDPOINTS.USERS.AVATAR, formData);
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings() {
    return api.get<PrivacySettings>(API_ENDPOINTS.USERS.PRIVACY);
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(data: Partial<PrivacySettings>) {
    return api.put<PrivacySettings>(API_ENDPOINTS.USERS.PRIVACY, data);
}

// Role-specific profiles

/**
 * Get tenant profile
 */
export async function getTenantProfile() {
    return api.get<TenantProfile>(API_ENDPOINTS.USERS.PROFILE_TENANT);
}

/**
 * Update tenant profile
 */
export async function updateTenantProfile(data: Partial<TenantProfile>) {
    return api.put<TenantProfile>(API_ENDPOINTS.USERS.PROFILE_TENANT, data);
}

/**
 * Get landlord profile
 */
export async function getLandlordProfile() {
    return api.get<LandlordProfile>(API_ENDPOINTS.USERS.PROFILE_LANDLORD);
}

/**
 * Update landlord profile
 */
export async function updateLandlordProfile(data: Partial<LandlordProfile>) {
    return api.put<LandlordProfile>(API_ENDPOINTS.USERS.PROFILE_LANDLORD, data);
}

/**
 * Get agent profile
 */
export async function getAgentProfile() {
    return api.get<AgentProfile>(API_ENDPOINTS.USERS.PROFILE_AGENT);
}

/**
 * Update agent profile
 */
export async function updateAgentProfile(data: Partial<AgentProfile>) {
    return api.put<AgentProfile>(API_ENDPOINTS.USERS.PROFILE_AGENT, data);
}

/**
 * Add agent certification
 */
export async function addAgentCertification(data: Omit<AgentCertification, 'id'>) {
    return api.post<AgentCertification>(API_ENDPOINTS.USERS.AGENT_CERTIFICATIONS, data);
}

/**
 * Delete agent certification
 */
export async function deleteAgentCertification(id: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.USERS.AGENT_CERTIFICATION(id));
}

// Connected accounts (OAuth)

/**
 * Get connected accounts
 */
export async function getConnectedAccounts() {
    return api.get<ConnectedAccount[]>(API_ENDPOINTS.USERS.CONNECTED_ACCOUNTS);
}

/**
 * Link an OAuth account
 */
export async function linkAccount(provider: OAuthProvider, idToken: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.USERS.CONNECTED_ACCOUNT(provider), { idToken });
}

/**
 * Unlink an OAuth account
 */
export async function unlinkAccount(provider: OAuthProvider) {
    return api.delete<{ message: string }>(API_ENDPOINTS.USERS.CONNECTED_ACCOUNT(provider));
}

// Bank accounts

/**
 * Get user's bank accounts
 */
export async function getBankAccounts() {
    return api.get<BankAccount[]>(API_ENDPOINTS.BANKING.BANK_ACCOUNTS);
}

/**
 * Add a bank account
 */
export async function addBankAccount(data: AddBankAccountRequest) {
    return api.post<BankAccount>(API_ENDPOINTS.BANKING.BANK_ACCOUNTS, data);
}

/**
 * Set default bank account
 */
export async function setDefaultBankAccount(id: string) {
    return api.put<{ message: string }>(API_ENDPOINTS.BANKING.BANK_ACCOUNT_DEFAULT(id));
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.BANKING.BANK_ACCOUNT(id));
}

/**
 * Get payout settings
 */
export async function getPayoutSettings() {
    return api.get<PayoutSettings>(API_ENDPOINTS.BANKING.PAYOUT_SETTINGS);
}

/**
 * Update payout settings
 */
export async function updatePayoutSettings(data: Partial<PayoutSettings>) {
    return api.put<PayoutSettings>(API_ENDPOINTS.BANKING.PAYOUT_SETTINGS, data);
}

/**
 * Get payout history
 */
export async function getPayouts(params?: { page?: number; limit?: number }) {
    return api.get<PaginatedResponse<Payout>>(API_ENDPOINTS.BANKING.PAYOUTS, params);
}

/**
 * Request a payout
 */
export async function requestPayout(data: { amount: number; bankAccountId: string; description?: string }) {
    return api.post<{ message: string; payoutId?: string }>(API_ENDPOINTS.BANKING.PAYOUTS, data);
}

// Public profiles

/**
 * Get public landlord profile
 */
export async function getPublicLandlordProfile(id: string) {
    return api.get<LandlordProfile & { user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'> }>(
        API_ENDPOINTS.USERS.PUBLIC_LANDLORD(id)
    );
}

/**
 * Get public tenant profile
 */
export async function getPublicTenantProfile(id: string) {
    return api.get<TenantProfile & { user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'> }>(
        API_ENDPOINTS.USERS.PUBLIC_TENANT(id)
    );
}

/**
 * Get public agent profile
 */
export async function getPublicAgentProfile(id: string) {
    return api.get<AgentProfile & { user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'>; certifications: AgentCertification[] }>(
        API_ENDPOINTS.USERS.PUBLIC_AGENT(id)
    );
}

// Export all functions as named exports and as default object
export const userService = {
    getCurrentUser,
    updateProfile,
    changePassword,
    updatePreferences,
    updateNotificationSettings,
    deleteAccount,
    uploadAvatar,
    getPrivacySettings,
    updatePrivacySettings,
    getTenantProfile,
    updateTenantProfile,
    getLandlordProfile,
    updateLandlordProfile,
    getAgentProfile,
    updateAgentProfile,
    addAgentCertification,
    deleteAgentCertification,
    getConnectedAccounts,
    linkAccount,
    unlinkAccount,
    getBankAccounts,
    addBankAccount,
    setDefaultBankAccount,
    deleteBankAccount,
    getPayoutSettings,
    updatePayoutSettings,
    getPayouts,
    requestPayout,
    getPublicLandlordProfile,
    getPublicTenantProfile,
    getPublicAgentProfile,
};

export default userService;
