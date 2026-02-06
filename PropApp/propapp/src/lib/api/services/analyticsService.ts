/**
 * Analytics Service
 * API calls for market analytics and trends
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface MarketTrend {
    period: string;
    averagePrice: number;
    medianPrice: number;
    listingCount: number;
    demandIndex: number;
}

/**
 * Get area market trends
 */
export async function getMarketTrends(params?: { city?: string; state?: string; period?: string }) {
    return api.get<MarketTrend[]>(API_ENDPOINTS.ANALYTICS.MARKET_TRENDS, params as Record<string, unknown>);
}

// Export all functions as named exports and as default object
export const analyticsService = {
    getMarketTrends,
};

export default analyticsService;
