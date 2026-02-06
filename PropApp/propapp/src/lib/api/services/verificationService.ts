/**
 * Verification Service
 * API calls for identity and property verification
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface VerificationStatus {
    userId?: string;
    identityVerified: boolean;
    addressVerified: boolean;
    documentsVerified?: boolean;
    tier?: string;
    score?: number;
    verificationLevel?: string;
    pendingVerifications?: number;
    lastUpdated?: string;
}

export interface IdentityVerificationRequest {
    type: string;
    idNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}

export interface AddressVerificationRequest {
    documentUrl: string;
    type: string;
    address: string;
}

export interface PropertyVerification {
    id: string;
    propertyId: string;
    status: string;
    tier?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyVerificationItem {
    id: string;
    type: string;
    status: string;
    documentUrl?: string;
    documentType?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyVerificationStatus {
    propertyId: string;
    tier: string | null;
    score: number;
    verifications: PropertyVerificationItem[];
}

export interface PropertyCofoRequest {
    documentUrl: string;
    type: string;
}

export interface PropertyAuditRequest {
    tier: string;
    preferredDate?: string;
}

export interface AdminVerificationAction {
    tier?: string;
    notes?: string;
    reason?: string;
}

/**
 * Get current user's verification status
 */
export async function getVerificationStatus() {
    return api.get<VerificationStatus>(API_ENDPOINTS.VERIFICATION.STATUS);
}

/**
 * Submit identity KYC verification
 */
export async function submitIdentityVerification(data: IdentityVerificationRequest) {
    return api.post<{ message: string; verificationId: string }>(API_ENDPOINTS.VERIFICATION.IDENTITY, data);
}

/**
 * Submit address verification
 */
export async function submitAddressVerification(data: AddressVerificationRequest) {
    return api.post<{ message: string; verificationId: string }>(API_ENDPOINTS.VERIFICATION.ADDRESS, data);
}

/**
 * Get property verifications
 */
export async function getPropertyVerifications(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<PropertyVerification[]>(API_ENDPOINTS.VERIFICATION.PROPERTIES, params as Record<string, unknown>);
}

/**
 * Get property verification status
 */
export async function getPropertyVerificationStatus(propertyId: string) {
    return api.get<PropertyVerificationStatus>(API_ENDPOINTS.VERIFICATION.PROPERTY(propertyId));
}

/**
 * Submit Certificate of Occupancy
 */
export async function submitPropertyCofo(propertyId: string, data: PropertyCofoRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.PROPERTY_COFO(propertyId), data);
}

/**
 * Request property audit
 */
export async function requestPropertyAudit(propertyId: string, data: PropertyAuditRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.PROPERTY_AUDIT(propertyId), data);
}

/**
 * Get pending verifications (Admin)
 */
export async function getAdminPendingVerifications() {
    return api.get<PropertyVerification[]>(API_ENDPOINTS.VERIFICATION.ADMIN_PENDING);
}

/**
 * Approve verification (Admin)
 */
export async function adminApproveVerification(id: string, data: AdminVerificationAction) {
    return api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.ADMIN_APPROVE(id), data);
}

/**
 * Reject verification (Admin)
 */
export async function adminRejectVerification(id: string, data: AdminVerificationAction) {
    return api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.ADMIN_REJECT(id), data);
}

// Export all functions as named exports and as default object
export const verificationService = {
    getVerificationStatus,
    submitIdentityVerification,
    submitAddressVerification,
    getPropertyVerifications,
    getPropertyVerificationStatus,
    submitPropertyCofo,
    requestPropertyAudit,
    getAdminPendingVerifications,
    adminApproveVerification,
    adminRejectVerification,
};

export default verificationService;
