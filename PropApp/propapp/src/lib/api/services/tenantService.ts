/**
 * Tenant Service
 * API calls for tenant-specific operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../../../types/api';
import type { PropertySummary } from '../../../types/property';
import type { RentalApplication, SubmitApplicationRequest } from '../../../types/lease';
import type {
    TenantDashboard,
    TenantPayment,
} from '../../../types/dashboard';

/**
 * Get tenant dashboard data
 */
export async function getDashboard() {
    return api.get<TenantDashboard>(API_ENDPOINTS.TENANT.DASHBOARD);
}

/**
 * Get current rental info
 */
export async function getRentalInfo() {
    return api.get<{
        property: PropertySummary;
        lease: {
            id: string;
            startDate: string;
            endDate: string;
            monthlyRent: number;
            status: string;
        };
        landlord: {
            id: string;
            name: string;
            avatarUrl?: string;
            phone?: string;
        };
    }>(API_ENDPOINTS.TENANT.RENTAL);
}

/**
 * Get tenant's applications
 */
export async function getApplications(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<RentalApplication>>(API_ENDPOINTS.TENANT.APPLICATIONS, params);
}

/**
 * Submit a rental application
 */
export async function submitApplication(data: SubmitApplicationRequest) {
    return api.post<RentalApplication>(API_ENDPOINTS.TENANT.APPLICATIONS, data);
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(id: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.TENANT.APPLICATION(id));
}

/**
 * Get saved properties
 */
export async function getSavedProperties() {
    return api.get<PropertySummary[]>(API_ENDPOINTS.TENANT.SAVED);
}

/**
 * Save a property
 */
export async function saveProperty(propertyId: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.TENANT.SAVED_PROPERTY(propertyId));
}

/**
 * Remove a saved property
 */
export async function removeSavedProperty(propertyId: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.TENANT.SAVED_PROPERTY(propertyId));
}

/**
 * Get payment history
 */
export async function getPayments(params?: { page?: number; limit?: number }) {
    return api.get<PaginatedResponse<TenantPayment>>(API_ENDPOINTS.TENANT.PAYMENTS, params);
}

/**
 * Make a payment
 */
export async function makePayment(data: { leaseId: string; amount: number; paymentMethod: string }) {
    return api.post<{
        transactionId: string;
        paymentUrl: string;
        reference: string;
        provider: string;
    }>(API_ENDPOINTS.TENANT.PAYMENTS, data);
}

// Export all functions as named exports and as default object
export const tenantService = {
    getDashboard,
    getRentalInfo,
    getApplications,
    submitApplication,
    withdrawApplication,
    getSavedProperties,
    saveProperty,
    removeSavedProperty,
    getPayments,
    makePayment,
};

export default tenantService;
