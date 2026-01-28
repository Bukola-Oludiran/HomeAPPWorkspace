/**
 * Landlord Service
 * API calls for landlord-specific operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../../../types/api';
import type { PropertySummary } from '../../../types/property';
import type { RentalApplication } from '../../../types/lease';
import type {
    LandlordDashboard,
    LandlordFinancials,
    LandlordFinancialSummary,
    LandlordTransaction,
    Alert,
    AgentJob,
} from '../../../types/dashboard';

/**
 * Get landlord dashboard data
 */
export async function getDashboard() {
    return api.get<LandlordDashboard>(API_ENDPOINTS.LANDLORD.DASHBOARD);
}

/**
 * Get landlord dashboard analytics
 */
export async function getDashboardAnalytics() {
    return api.get<Record<string, unknown>>(API_ENDPOINTS.LANDLORD.DASHBOARD_ANALYTICS);
}

/**
 * Get landlord's properties
 */
export async function getProperties(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<PropertySummary>>(API_ENDPOINTS.LANDLORD.PROPERTIES, params);
}

/**
 * Get pending applicants
 */
export async function getApplicants(params?: { propertyId?: string; status?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<RentalApplication>>(API_ENDPOINTS.LANDLORD.APPLICANTS, params);
}

/**
 * Get applicant details
 */
export async function getApplicantById(id: string) {
    return api.get<RentalApplication>(API_ENDPOINTS.LANDLORD.APPLICANT(id));
}

/**
 * Approve an applicant
 */
export async function approveApplicant(id: string, data: { moveInDate: string; monthlyRent: number; securityDeposit: number }) {
    return api.put<{ message: string; leaseId?: string }>(API_ENDPOINTS.LANDLORD.APPLICANT_APPROVE(id), data);
}

/**
 * Reject an applicant
 */
export async function rejectApplicant(id: string, reason: string) {
    return api.put<{ message: string }>(API_ENDPOINTS.LANDLORD.APPLICANT_REJECT(id), { reason });
}

/**
 * Get financial overview
 */
export async function getFinancials() {
    return api.get<LandlordFinancials>(API_ENDPOINTS.LANDLORD.FINANCIALS);
}

/**
 * Get financial summary
 */
export async function getFinancialSummary(params?: { startDate?: string; endDate?: string }) {
    return api.get<LandlordFinancialSummary>(API_ENDPOINTS.LANDLORD.FINANCIALS_SUMMARY, params);
}

/**
 * Get transaction history
 */
export async function getTransactions(params?: { page?: number; limit?: number; type?: string }) {
    return api.get<PaginatedResponse<LandlordTransaction>>(API_ENDPOINTS.LANDLORD.FINANCIALS_TRANSACTIONS, params);
}

/**
 * Request a payout
 */
export async function requestPayout(amount: number, bankAccountId: string) {
    return api.post<{ message: string; payoutId?: string }>(API_ENDPOINTS.LANDLORD.FINANCIALS_PAYOUT, { amount, bankAccountId });
}

/**
 * Get actionable alerts
 */
export async function getAlerts() {
    return api.get<Alert[]>(API_ENDPOINTS.LANDLORD.ALERTS);
}

/**
 * Start property verification process
 */
export async function startPropertyVerification(propertyId: string, data: { tier: string; documents: string[] }) {
    return api.post<{ message: string; verificationId?: string }>(API_ENDPOINTS.LANDLORD.PROPERTY_VERIFY(propertyId), data);
}

/**
 * Create an agent job
 */
export async function createAgentJob(data: {
    propertyId: string;
    type: string;
    description: string;
    scheduledDate: string;
    commission: number;
}) {
    return api.post<AgentJob>(API_ENDPOINTS.LANDLORD.JOBS, data);
}

/**
 * Get landlord's created jobs
 */
export async function getJobs(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<AgentJob>>(API_ENDPOINTS.LANDLORD.JOBS, params);
}

// Export all functions as named exports and as default object
export const landlordService = {
    getDashboard,
    getDashboardAnalytics,
    getProperties,
    getApplicants,
    getApplicantById,
    approveApplicant,
    rejectApplicant,
    getFinancials,
    getFinancialSummary,
    getTransactions,
    requestPayout,
    getAlerts,
    startPropertyVerification,
    createAgentJob,
    getJobs,
};

export default landlordService;
