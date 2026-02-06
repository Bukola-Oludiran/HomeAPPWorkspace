/**
 * Agent Service
 * API calls for agent-specific operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
    AgentJob,
    AgentEarnings,
    AgentScheduleItem,
} from '../../../types/dashboard';
import type { Payout, RequestPayoutRequest } from '../../../types/lease';

/**
 * Get available jobs for agents
 */
export async function getAvailableJobs(params?: { type?: string; city?: string; page?: number; limit?: number }) {
    return api.get<AgentJob[]>(API_ENDPOINTS.AGENT.JOBS, params);
}

/**
 * Get agent's accepted jobs
 */
export async function getAcceptedJobs(params?: { status?: string; page?: number; limit?: number }) {
    return api.get<AgentJob[]>(API_ENDPOINTS.AGENT.JOBS_ACCEPTED, params);
}

/**
 * Accept a job
 */
export async function acceptJob(id: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.AGENT.JOB_ACCEPT(id));
}

/**
 * Decline a job
 */
export async function declineJob(id: string, reason?: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.AGENT.JOB_DECLINE(id), { reason });
}

/**
 * Complete a job
 */
export async function completeJob(id: string, data: { notes?: string; photos?: string[] }) {
    return api.put<{ message: string }>(API_ENDPOINTS.AGENT.JOB_COMPLETE(id), data);
}

/**
 * Get agent's schedule
 */
export async function getSchedule(params?: { startDate?: string; endDate?: string }) {
    return api.get<AgentScheduleItem[]>(API_ENDPOINTS.AGENT.SCHEDULE, params);
}

/**
 * Get earnings summary
 */
export async function getEarnings() {
    return api.get<AgentEarnings>(API_ENDPOINTS.AGENT.EARNINGS);
}

/**
 * Get payout history
 */
export async function getPayoutHistory(params?: { page?: number; limit?: number }) {
    return api.get<Payout[]>(API_ENDPOINTS.AGENT.EARNINGS_HISTORY, params);
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(data: RequestPayoutRequest) {
    return api.post<{ message: string; payoutId?: string }>(API_ENDPOINTS.AGENT.EARNINGS_WITHDRAW, data);
}

// Export all functions as named exports and as default object
export const agentService = {
    getAvailableJobs,
    getAcceptedJobs,
    acceptJob,
    declineJob,
    completeJob,
    getSchedule,
    getEarnings,
    getPayoutHistory,
    requestWithdrawal,
};

export default agentService;
