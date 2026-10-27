/**
 * Integration Service
 * API calls for applicant invitations, agent availability, reviews,
 * billing statements and data exports.
 *
 * Reconstructed 2026-10-26 after the original was lost (it was never committed).
 * Request shapes follow @homeai/contracts/integration.contract and the backend
 * modules/integration/integration.routes.ts.
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface CreateInvitationRequest {
    propertyId: string;
    email: string;
    personalInfo?: Record<string, unknown>;
    employmentInfo?: Record<string, unknown>;
}

export interface AvailabilityRequest {
    date: string;
    startTime: string;
    endTime: string;
    recurring?: boolean;
    recurringDays?: string[];
}

export interface CreateReviewRequest {
    subjectId: string;
    contextType: 'LEASE' | 'JOB';
    contextId: string;
    rating: number;
    body?: string;
}

export interface ExportRequest {
    dataset: 'transactions' | 'applications' | 'jobs';
    format: 'csv' | 'pdf' | 'xlsx';
    start?: string;
    end?: string;
}

/**
 * Invite an applicant to apply for one of the landlord's properties
 */
export async function createInvitation(data: CreateInvitationRequest) {
    return api.post<unknown>(API_ENDPOINTS.INTEGRATION.APPLICANT_INVITATIONS, data);
}

/**
 * Look up an invitation by its emailed token (public)
 */
export async function getInvitation(token: string) {
    return api.get<unknown>(API_ENDPOINTS.INTEGRATION.TENANT_INVITATION(token));
}

/**
 * Accept an invitation as the signed-in tenant; returns the created application
 */
export async function acceptInvitation(token: string) {
    return api.post<unknown>(API_ENDPOINTS.INTEGRATION.TENANT_INVITATION(token));
}

/**
 * Add an availability slot for the signed-in agent
 */
export async function createAvailability(data: AvailabilityRequest) {
    return api.post<unknown>(API_ENDPOINTS.AGENT.AVAILABILITY, data);
}

/**
 * Review the other party of a finished lease or completed job
 */
export async function createReview(data: CreateReviewRequest) {
    return api.post<unknown>(API_ENDPOINTS.INTEGRATION.REVIEWS, data);
}

/**
 * Public reviews of a user, with their average rating
 */
export async function getReviews(userId: string, params?: { page?: number; limit?: number }) {
    return api.get<unknown>(API_ENDPOINTS.INTEGRATION.USER_REVIEWS(userId), params);
}

/**
 * Monthly billing statements for the signed-in user
 */
export async function getBillingStatements() {
    return api.get<unknown>(API_ENDPOINTS.INTEGRATION.BILLING_STATEMENTS);
}

/**
 * Export a dataset and save it as a file (CSV, PDF or XLSX)
 */
export async function exportData(data: ExportRequest): Promise<void> {
    const { blob, contentDisposition } = await api.download(API_ENDPOINTS.INTEGRATION.EXPORTS, data);
    const filename =
        contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ??
        `${data.dataset}-${new Date().toISOString().slice(0, 10)}.${data.format}`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// Export all functions as named exports and as default object
export const integrationService = {
    createInvitation,
    getInvitation,
    acceptInvitation,
    createAvailability,
    createReview,
    getReviews,
    getBillingStatements,
    exportData,
};

export default integrationService;
