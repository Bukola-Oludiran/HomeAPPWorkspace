/**
 * Maintenance Service
 * API calls for maintenance request operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type { PaginatedResponse } from '../../../types/api';
import type {
    MaintenanceRequest,
    CreateMaintenanceRequest,
    UpdateMaintenanceRequest,
    AssignMaintenanceAgentRequest,
    MaintenanceFilters,
} from '../../../types/lease';

/**
 * Get maintenance requests
 */
export async function getMaintenanceRequests(params?: MaintenanceFilters) {
    return api.get<PaginatedResponse<MaintenanceRequest>>(API_ENDPOINTS.MAINTENANCE.LIST, params as Record<string, unknown>);
}

/**
 * Get maintenance request details
 */
export async function getMaintenanceRequestById(id: string) {
    return api.get<MaintenanceRequest>(API_ENDPOINTS.MAINTENANCE.DETAIL(id));
}

/**
 * Create a maintenance request (Tenant)
 */
export async function createMaintenanceRequest(data: CreateMaintenanceRequest) {
    return api.post<MaintenanceRequest>(API_ENDPOINTS.MAINTENANCE.CREATE, data);
}

/**
 * Update a maintenance request
 */
export async function updateMaintenanceRequest(id: string, data: UpdateMaintenanceRequest) {
    return api.put<MaintenanceRequest>(API_ENDPOINTS.MAINTENANCE.UPDATE(id), data);
}

/**
 * Assign an agent to a maintenance request (Landlord)
 */
export async function assignMaintenanceAgent(id: string, data: AssignMaintenanceAgentRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.MAINTENANCE.ASSIGN(id), data);
}

// Export all functions as named exports and as default object
export const maintenanceService = {
    getMaintenanceRequests,
    getMaintenanceRequestById,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    assignMaintenanceAgent,
};

export default maintenanceService;
