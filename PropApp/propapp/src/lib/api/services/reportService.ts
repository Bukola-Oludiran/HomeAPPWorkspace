/**
 * Report Service
 * API calls for financial reports
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Report {
    id: string;
    reportType: string;
    startDate: string;
    endDate: string;
    format: string;
    status: string;
    downloadUrl?: string;
    createdAt: string;
}

export interface GenerateReportRequest {
    reportType: string;
    startDate: string;
    endDate: string;
    format?: string;
}

/**
 * Get list of reports
 */
export async function getReports(params?: { page?: number; limit?: number }) {
    return api.get<Report[]>(API_ENDPOINTS.REPORTS.LIST, params);
}

/**
 * Get report details
 */
export async function getReportById(id: string) {
    return api.get<Report>(API_ENDPOINTS.REPORTS.DETAIL(id));
}

/**
 * Generate a new report
 */
export async function generateReport(data: GenerateReportRequest) {
    return api.post<{ message: string; reportId: string }>(API_ENDPOINTS.REPORTS.GENERATE, data);
}

// Export all functions as named exports and as default object
export const reportService = {
    getReports,
    getReportById,
    generateReport,
};

export default reportService;
