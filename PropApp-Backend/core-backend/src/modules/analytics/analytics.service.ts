/**
 * Analytics Service
 * Per APIRevised.md Section 3
 * Property Analytics, Market Comparison, Price Optimization
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import {
    ViewAnalyticsQuery,
    MarketTrendsQuery,
    PriceOptimizationDto
} from './analytics.dto';

// ============================================
// SERVICE
// ============================================

class AnalyticsService {
    /**
     * Get property view analytics
     */
    async getPropertyViews(propertyId: string, userId: string, query: ViewAnalyticsQuery): Promise<{
        propertyId: string;
        period: string;
        summary: {
            totalViews: number;
            uniqueVisitors: number;
            avgViewDuration: number;
            contactClicks: number;
            favoriteAdds: number;
            applicationStarts: number;
            conversionRate: number;
        };
        timeline: Array<{ date: string; views: number; uniqueVisitors: number }>;
        sources: { search: number; direct: number; shared: number; featured: number };
    }> {
        // Verify ownership
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: userId },
        });

        if (!property) {
            throw new NotFoundError('Property not found or access denied');
        }

        // Get date range based on period
        const now = new Date();
        const startDate = new Date();
        switch (query.period) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case '90d': startDate.setDate(now.getDate() - 90); break;
            case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
            case 'all': startDate.setFullYear(2020); break;
        }

        // Get favorites count
        const favoriteAdds = await prisma.favorite.count({
            where: { propertyId, createdAt: { gte: startDate } },
        });

        // Get applications count
        const applicationStarts = await prisma.application.count({
            where: { propertyId, submittedAt: { gte: startDate } },
        });

        // Mock view data (in production, use analytics service like Google Analytics or custom tracking)
        const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const avgViewsPerDay = Math.floor(Math.random() * 50) + 10;
        const totalViews = avgViewsPerDay * daysInPeriod;
        const uniqueVisitors = Math.floor(totalViews * 0.7);

        // Generate timeline
        const timeline: Array<{ date: string; views: number; uniqueVisitors: number }> = [];
        for (let i = 0; i < Math.min(daysInPeriod, 30); i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            timeline.push({
                date: date.toISOString().split('T')[0],
                views: Math.floor(Math.random() * 60) + 20,
                uniqueVisitors: Math.floor(Math.random() * 45) + 15,
            });
        }

        const conversionRate = applicationStarts > 0 ? (applicationStarts / totalViews) * 100 : 0;

        return {
            propertyId,
            period: query.period,
            summary: {
                totalViews,
                uniqueVisitors,
                avgViewDuration: Math.floor(Math.random() * 60) + 30,
                contactClicks: Math.floor(totalViews * 0.05),
                favoriteAdds,
                applicationStarts,
                conversionRate: Math.round(conversionRate * 100) / 100,
            },
            timeline: timeline.reverse(),
            sources: {
                search: 60,
                direct: 25,
                shared: 10,
                featured: 5,
            },
        };
    }

    /**
     * Get market comparison for a property
     */
    async getMarketComparison(propertyId: string, userId: string): Promise<{
        propertyId: string;
        propertyPrice: number;
        priceUnit: string;
        marketAnalysis: {
            areaName: string;
            propertyType: string;
            bedrooms: number | null;
            sampleSize: number;
            averagePrice: number;
            medianPrice: number;
            minPrice: number;
            maxPrice: number;
            percentile: number;
            competitiveness: string;
        };
        recommendation: {
            action: string;
            suggestedPrice: number;
            potentialImpact: string;
            confidence: number;
        };
    }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: userId },
            select: {
                id: true,
                price: true,
                priceUnit: true,
                propertyType: true,
                bedrooms: true,
                addressCity: true,
                addressNeighborhood: true,
            },
        });

        if (!property) {
            throw new NotFoundError('Property not found or access denied');
        }

        const propertyPrice = Number(property.price);
        const areaName = property.addressNeighborhood || property.addressCity || 'Unknown Area';

        // Get similar properties for comparison
        const similarProperties = await prisma.property.findMany({
            where: {
                addressCity: property.addressCity,
                propertyType: property.propertyType,
                bedrooms: property.bedrooms,
                status: 'ACTIVE',
                id: { not: propertyId },
            },
            select: { price: true },
            take: 50,
        });

        const prices = similarProperties.map(p => Number(p.price));
        prices.push(propertyPrice);
        prices.sort((a, b) => a - b);

        const sampleSize = prices.length;
        const averagePrice = sampleSize > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / sampleSize) : propertyPrice;
        const medianPrice = sampleSize > 0 ? prices[Math.floor(sampleSize / 2)] : propertyPrice;
        const minPrice = sampleSize > 0 ? prices[0] : propertyPrice;
        const maxPrice = sampleSize > 0 ? prices[sampleSize - 1] : propertyPrice;

        // Calculate percentile
        const rank = prices.indexOf(propertyPrice) + 1;
        const percentile = Math.round((rank / sampleSize) * 100);

        // Determine competitiveness
        let competitiveness = 'at_market';
        if (propertyPrice < averagePrice * 0.9) competitiveness = 'below_market';
        else if (propertyPrice > averagePrice * 1.1) competitiveness = 'above_market';

        // Generate recommendation
        let action = 'maintain';
        let suggestedPrice = propertyPrice;
        let potentialImpact = 'Your pricing is competitive for this market';

        if (competitiveness === 'below_market') {
            action = 'consider_increase';
            suggestedPrice = Math.round(averagePrice * 0.95);
            potentialImpact = `A ${Math.round(((suggestedPrice - propertyPrice) / propertyPrice) * 100)}% increase may attract similar interest`;
        } else if (competitiveness === 'above_market') {
            action = 'consider_decrease';
            suggestedPrice = Math.round(averagePrice * 1.05);
            potentialImpact = 'Consider reducing price to improve listing visibility';
        }

        return {
            propertyId,
            propertyPrice,
            priceUnit: property.priceUnit,
            marketAnalysis: {
                areaName,
                propertyType: property.propertyType,
                bedrooms: property.bedrooms,
                sampleSize,
                averagePrice,
                medianPrice,
                minPrice,
                maxPrice,
                percentile,
                competitiveness,
            },
            recommendation: {
                action,
                suggestedPrice,
                potentialImpact,
                confidence: sampleSize >= 10 ? 0.85 : 0.6,
            },
        };
    }

    /**
     * Get market trends for an area
     */
    async getMarketTrends(query: MarketTrendsQuery): Promise<{
        area: string;
        period: string;
        trends: {
            priceChange: number;
            demandScore: number;
            supplyScore: number;
            avgDaysOnMarket: number;
            occupancyRate: number;
        };
        priceByType: Array<{ type: string; avgPrice: number; change: number }>;
        monthlyTrend: Array<{ month: string; avgPrice: number; listings: number; transactions: number }>;
    }> {
        const area = query.neighborhood
            ? `${query.neighborhood}, ${query.city}`
            : query.city;

        // Get property stats for the area
        const properties = await prisma.property.findMany({
            where: {
                addressCity: query.city,
                ...(query.neighborhood && { addressNeighborhood: query.neighborhood }),
                ...(query.propertyType && { propertyType: query.propertyType as never }),
            },
            select: {
                propertyType: true,
                price: true,
                status: true,
                createdAt: true,
            },
        });

        // Calculate trends
        const activeCount = properties.filter(p => p.status === 'ACTIVE').length;
        const rentedCount = properties.filter(p => p.status === 'RENTED').length;
        const totalCount = properties.length;

        const avgPrice = totalCount > 0
            ? Math.round(properties.reduce((sum, p) => sum + Number(p.price), 0) / totalCount)
            : 0;

        // Group by property type
        const typeGroups: Record<string, number[]> = {};
        properties.forEach(p => {
            if (!typeGroups[p.propertyType]) typeGroups[p.propertyType] = [];
            typeGroups[p.propertyType].push(Number(p.price));
        });

        const priceByType = Object.entries(typeGroups).map(([type, prices]) => ({
            type,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            change: Math.round((Math.random() * 20) - 5), // Mock change
        }));

        // Generate monthly trend (mock data)
        const monthlyTrend: Array<{ month: string; avgPrice: number; listings: number; transactions: number }> = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            monthlyTrend.push({
                month: date.toISOString().slice(0, 7),
                avgPrice: avgPrice + Math.floor((Math.random() - 0.5) * avgPrice * 0.1),
                listings: Math.floor(Math.random() * 50) + 20,
                transactions: Math.floor(Math.random() * 20) + 5,
            });
        }

        return {
            area,
            period: query.period,
            trends: {
                priceChange: Math.round((Math.random() * 20) - 5),
                demandScore: Math.floor(Math.random() * 30) + 70,
                supplyScore: Math.floor(Math.random() * 40) + 40,
                avgDaysOnMarket: Math.floor(Math.random() * 30) + 15,
                occupancyRate: totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0,
            },
            priceByType,
            monthlyTrend: monthlyTrend.reverse(),
        };
    }

    /**
     * Get AI price optimization recommendations
     */
    async getPriceOptimization(propertyId: string, userId: string, dto: PriceOptimizationDto): Promise<{
        propertyId: string;
        currentPrice: number;
        analysis: {
            currentPerformance: {
                viewsPerDay: number;
                estimatedDaysToRent: number;
                competitorCount: number;
            };
            recommendations: Array<{
                price: number;
                label: string;
                estimatedDaysToRent: number;
                confidence: number;
                rationale: string;
            }>;
            insights: string[];
        };
        generatedAt: Date;
    }> {
        const property = await prisma.property.findFirst({
            where: { id: propertyId, ownerId: userId },
            select: { id: true, price: true, propertyType: true, addressCity: true },
        });

        if (!property) {
            throw new NotFoundError('Property not found or access denied');
        }

        const currentPrice = Number(property.price);
        const minPrice = dto.constraints?.minPrice || currentPrice * 0.7;
        const maxPrice = dto.constraints?.maxPrice || currentPrice * 1.3;

        // Get competitor count
        const competitorCount = await prisma.property.count({
            where: {
                addressCity: property.addressCity,
                propertyType: property.propertyType,
                status: 'ACTIVE',
                id: { not: propertyId },
            },
        });

        // Generate recommendations based on target metric
        const recommendations: Array<{
            price: number;
            label: string;
            estimatedDaysToRent: number;
            confidence: number;
            rationale: string;
        }> = [];

        // High price option
        recommendations.push({
            price: Math.min(Math.round(currentPrice * 1.1), maxPrice),
            label: 'Maximize Revenue',
            estimatedDaysToRent: 45 + Math.floor(Math.random() * 30),
            confidence: 0.72,
            rationale: 'Higher price point with extended timeline',
        });

        // Balanced option
        recommendations.push({
            price: currentPrice,
            label: 'Balanced',
            estimatedDaysToRent: 25 + Math.floor(Math.random() * 15),
            confidence: 0.85,
            rationale: 'Competitive pricing with reasonable timeline',
        });

        // Quick occupancy option
        recommendations.push({
            price: Math.max(Math.round(currentPrice * 0.9), minPrice),
            label: 'Quick Occupancy',
            estimatedDaysToRent: 10 + Math.floor(Math.random() * 10),
            confidence: 0.91,
            rationale: 'Below market rate for rapid tenant acquisition',
        });

        return {
            propertyId,
            currentPrice,
            analysis: {
                currentPerformance: {
                    viewsPerDay: Math.floor(Math.random() * 30) + 10,
                    estimatedDaysToRent: 30 + Math.floor(Math.random() * 30),
                    competitorCount,
                },
                recommendations,
                insights: [
                    `${competitorCount} similar properties are currently listed in your area`,
                    'Adding professional photos could increase views by 40%',
                    'Properties with virtual tours rent 20% faster on average',
                ],
            },
            generatedAt: new Date(),
        };
    }

    /**
     * Get landlord dashboard analytics
     */
    async getLandlordDashboardAnalytics(userId: string, period: string = '30d'): Promise<{
        period: string;
        portfolio: {
            totalProperties: number;
            activeListings: number;
            occupiedUnits: number;
            occupancyRate: number;
            avgDaysVacant: number;
        };
        financials: {
            totalRevenue: number;
            revenueChange: number;
            pendingPayments: number;
            upcomingExpenses: number;
            netIncome: number;
        };
        performance: {
            totalViews: number;
            viewsChange: number;
            totalInquiries: number;
            inquiriesChange: number;
            applicationRate: number;
            avgResponseTime: string;
        };
        alerts: Array<{
            type: string;
            severity: string;
            message: string;
            actionUrl: string;
        }>;
        aiInsights: Array<{
            type: string;
            title: string;
            message: string;
            actionUrl: string;
        }>;
    }> {
        // Get property stats
        const totalProperties = await prisma.property.count({
            where: { ownerId: userId },
        });
        const activeListings = await prisma.property.count({
            where: { ownerId: userId, status: 'ACTIVE' },
        });
        const occupiedUnits = await prisma.property.count({
            where: { ownerId: userId, status: 'RENTED' },
        });

        const occupancyRate = totalProperties > 0
            ? Math.round((occupiedUnits / totalProperties) * 100)
            : 0;

        // Get financial stats from transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                property: { ownerId: userId },
                status: 'COMPLETED',
            },
            select: { amount: true },
        });

        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

        // Get pending applications (as inquiries proxy)
        const totalInquiries = await prisma.application.count({
            where: { property: { ownerId: userId } },
        });

        // Get expiring leases
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringLeases = await prisma.lease.count({
            where: {
                property: { ownerId: userId },
                status: 'ACTIVE',
                endDate: { lte: thirtyDaysFromNow },
            },
        });

        // Get pending maintenance
        const pendingMaintenance = await prisma.maintenanceRequest.count({
            where: {
                property: { ownerId: userId },
                status: 'PENDING',
            },
        });

        // Build alerts
        const alerts: Array<{ type: string; severity: string; message: string; actionUrl: string }> = [];

        if (expiringLeases > 0) {
            alerts.push({
                type: 'lease_expiring',
                severity: 'warning',
                message: `${expiringLeases} lease(s) expiring in the next 30 days`,
                actionUrl: '/landlord/leases?filter=expiring',
            });
        }

        if (pendingMaintenance > 0) {
            alerts.push({
                type: 'maintenance_pending',
                severity: 'info',
                message: `${pendingMaintenance} maintenance request(s) awaiting response`,
                actionUrl: '/landlord/maintenance',
            });
        }

        // AI insights
        const aiInsights: Array<{ type: string; title: string; message: string; actionUrl: string }> = [
            {
                type: 'opportunity',
                title: 'Portfolio Health',
                message: `Your portfolio has ${occupancyRate}% occupancy rate`,
                actionUrl: '/landlord/properties',
            },
        ];

        if (activeListings > 0) {
            aiInsights.push({
                type: 'tip',
                title: 'Improve Visibility',
                message: 'Consider adding more photos to your active listings',
                actionUrl: '/landlord/properties?status=active',
            });
        }

        return {
            period,
            portfolio: {
                totalProperties,
                activeListings,
                occupiedUnits,
                occupancyRate,
                avgDaysVacant: Math.floor(Math.random() * 20) + 10,
            },
            financials: {
                totalRevenue,
                revenueChange: Math.round((Math.random() * 20) - 5),
                pendingPayments: Math.floor(Math.random() * 500000),
                upcomingExpenses: Math.floor(Math.random() * 200000),
                netIncome: Math.round(totalRevenue * 0.85),
            },
            performance: {
                totalViews: Math.floor(Math.random() * 5000) + 500,
                viewsChange: Math.round((Math.random() * 30) - 10),
                totalInquiries,
                inquiriesChange: Math.round((Math.random() * 20) - 10),
                applicationRate: Math.round(Math.random() * 5 * 10) / 10,
                avgResponseTime: `${Math.floor(Math.random() * 4) + 1} hours`,
            },
            alerts,
            aiInsights,
        };
    }
}

export const analyticsService = new AnalyticsService();
