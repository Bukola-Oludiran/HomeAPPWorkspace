/**
 * Lease Service
 * API calls for lease-related operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../../../types/api';
import type {
    Lease,
    CreateLeaseRequest,
    UpdateLeaseRequest,
    SendRenewalOfferRequest,
    SignLeaseRequest,
    GenerateLeaseDocumentRequest,
} from '../../../types/lease';

/**
 * Get user's leases
 */
export async function getLeases(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<Lease>>(API_ENDPOINTS.LEASES.LIST, params);
}

/**
 * Get lease details by ID
 */
export async function getLeaseById(id: string) {
    return api.get<Lease>(API_ENDPOINTS.LEASES.DETAIL(id));
}

/**
 * Create a new lease (Landlord)
 */
export async function createLease(data: CreateLeaseRequest) {
    return api.post<Lease>(API_ENDPOINTS.LEASES.CREATE, data);
}

/**
 * Update a lease (Landlord)
 */
export async function updateLease(id: string, data: UpdateLeaseRequest) {
    return api.put<Lease>(API_ENDPOINTS.LEASES.UPDATE(id), data);
}

/**
 * Send a renewal offer to tenant
 */
export async function sendRenewalOffer(id: string, data: SendRenewalOfferRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.LEASES.RENEW(id), data);
}

/**
 * Respond to a renewal offer (Tenant)
 */
export async function respondToRenewal(id: string, accepted: boolean) {
    return api.post<{ message: string }>(API_ENDPOINTS.LEASES.RESPOND(id), { accepted });
}

/**
 * Sign the lease agreement
 */
export async function signLease(id: string, data: SignLeaseRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.LEASES.SIGN(id), data);
}

/**
 * Get lease document
 */
export async function getLeaseDocument(id: string) {
    return api.get<{ documentUrl: string }>(API_ENDPOINTS.LEASES.DOCUMENT(id));
}

/**
 * Generate lease document PDF
 */
export async function generateLeaseDocument(id: string, data?: GenerateLeaseDocumentRequest) {
    return api.post<{ documentUrl: string }>(API_ENDPOINTS.LEASES.DOCUMENT_GENERATE(id), data);
}

// Export all functions as named exports and as default object
export const leaseService = {
    getLeases,
    getLeaseById,
    createLease,
    updateLease,
    sendRenewalOffer,
    respondToRenewal,
    signLease,
    getLeaseDocument,
    generateLeaseDocument,
};

export default leaseService;
