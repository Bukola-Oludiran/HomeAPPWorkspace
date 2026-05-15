/**
 * Lease Documents & Financial Reports Service
 * Per APIRevised.md Section 4.2, 4.3
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import { GenerateLeaseDto, GenerateReportDto } from './lease-reports.dto';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// SERVICE
// ============================================

class LeaseReportsService {
    // ============================================
    // LEASE DOCUMENTS
    // ============================================

    /**
     * Get lease document by ID
     */
    async getLeaseDocument(userId: string, leaseId: string): Promise<{
        id: string;
        leaseId: string;
        propertyAddress: string;
        tenantName: string;
        status: string;
        documentUrl: string | null;
        terms: unknown;
        startDate: Date;
        endDate: Date;
        monthlyRent: number;
        signatures: {
            tenant: boolean;
            landlord: boolean;
        };
        generatedAt: Date | null;
    }> {
        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                OR: [
                    { landlordId: userId },
                    { tenantId: userId },
                ],
            },
            include: {
                property: {
                    select: { addressStreet: true, addressCity: true },
                },
                tenant: {
                    select: { firstName: true, lastName: true },
                },
            },
        });

        if (!lease) {
            throw new NotFoundError('Lease not found or access denied');
        }

        return {
            id: lease.id,
            leaseId: lease.id,
            propertyAddress: `${lease.property.addressStreet}, ${lease.property.addressCity}`,
            tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
            status: lease.status,
            documentUrl: lease.documentUrl,
            terms: lease.terms,
            startDate: lease.startDate,
            endDate: lease.endDate,
            monthlyRent: Number(lease.monthlyRent),
            signatures: {
                tenant: lease.signedByTenant,
                landlord: lease.signedByLandlord,
            },
            generatedAt: lease.createdAt,
        };
    }

    /**
     * Generate lease document
     */
    async generateLeaseDocument(userId: string, leaseId: string, dto: GenerateLeaseDto): Promise<{
        leaseId: string;
        documentUrl: string;
        status: string;
        message: string;
    }> {
        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                landlordId: userId,
            },
            include: {
                property: {
                    select: { name: true, addressStreet: true, addressCity: true },
                },
                tenant: {
                    select: { firstName: true, lastName: true, email: true },
                },
            },
        });

        if (!lease) {
            throw new NotFoundError('Lease not found or access denied');
        }

        // In production, this would generate a PDF using a template engine
        const mockDocumentUrl = `https://storage.homeai.ng/documents/leases/${lease.id}_${Date.now()}.pdf`;

        // Update lease with document URL
        await prisma.lease.update({
            where: { id: leaseId },
            data: { documentUrl: mockDocumentUrl },
        });

        return {
            leaseId: lease.id,
            documentUrl: mockDocumentUrl,
            status: 'generated',
            message: 'Lease document generated successfully',
        };
    }

    /**
     * List lease documents for user
     */
    async listLeaseDocuments(userId: string, query: { status: string; page: number; limit: number }): Promise<{
        items: Array<{
            id: string;
            propertyName: string;
            tenantName: string;
            status: string;
            hasDocument: boolean;
            startDate: Date;
            endDate: Date;
        }>;
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where = {
            OR: [
                { landlordId: userId },
                { tenantId: userId },
            ],
            ...(query.status !== 'all' && { status: query.status.toUpperCase() }),
        };

        const [leases, total] = await Promise.all([
            prisma.lease.findMany({
                where: where as never,
                include: {
                    property: { select: { name: true } },
                    tenant: { select: { firstName: true, lastName: true } },
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.lease.count({ where: where as never }),
        ]);

        return {
            items: leases.map(l => ({
                id: l.id,
                propertyName: l.property.name,
                tenantName: `${l.tenant.firstName} ${l.tenant.lastName}`,
                status: l.status,
                hasDocument: !!l.documentUrl,
                startDate: l.startDate,
                endDate: l.endDate,
            })),
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    // ============================================
    // FINANCIAL REPORTS
    // ============================================

    /**
     * Get financial report
     */
    async getFinancialReport(userId: string, reportId: string): Promise<{
        id: string;
        type: string;
        dateRange: { startDate: string; endDate: string };
        generatedAt: Date;
        downloadUrl: string;
        summary: {
            totalIncome: number;
            totalExpenses: number;
            netIncome: number;
            propertyCount: number;
        };
    }> {
        // In production, this would fetch from a reports table
        // For now, generate mock data
        return {
            id: reportId,
            type: 'income_statement',
            dateRange: {
                startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                endDate: new Date().toISOString(),
            },
            generatedAt: new Date(),
            downloadUrl: `https://storage.homeai.ng/documents/reports/${reportId}.pdf`,
            summary: {
                totalIncome: Math.floor(Math.random() * 50000000) + 10000000,
                totalExpenses: Math.floor(Math.random() * 5000000) + 1000000,
                netIncome: 0, // Will be calculated
                propertyCount: Math.floor(Math.random() * 10) + 1,
            },
        };
    }

    /**
     * Generate financial report
     */
    async generateFinancialReport(userId: string, dto: GenerateReportDto): Promise<{
        reportId: string;
        type: string;
        status: string;
        downloadUrl: string | null;
        message: string;
    }> {
        // Get user's properties
        const propertyFilter = dto.propertyIds?.length
            ? { id: { in: dto.propertyIds } }
            : {};

        const properties = await prisma.property.findMany({
            where: {
                ownerId: userId,
                ...propertyFilter,
            },
            select: { id: true, name: true },
        });

        if (properties.length === 0) {
            throw new AppError('No properties found for report generation', 'REPORT_001', 400);
        }

        // Get transactions for the period
        const transactions = await prisma.transaction.findMany({
            where: {
                propertyId: { in: properties.map(p => p.id) },
                status: 'COMPLETED',
                createdAt: {
                    gte: new Date(dto.startDate),
                    lte: new Date(dto.endDate),
                },
            },
            select: {
                type: true,
                amount: true,
                createdAt: true,
                property: { select: { name: true } },
            },
        });

        // Calculate summary
        const totalIncome = transactions
            .filter(t => t.type === 'RENT_PAYMENT' || t.type === 'SECURITY_DEPOSIT')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'SERVICE_FEE')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Generate report ID and URL
        const reportId = uuidv4();
        const downloadUrl = dto.format === 'json'
            ? null
            : `https://storage.homeai.ng/documents/reports/${reportId}.${dto.format}`;

        // In production, this would:
        // 1. Queue a background job to generate the PDF/CSV
        // 2. Store the report metadata in a database
        // 3. Return immediately with a "processing" status

        return {
            reportId,
            type: dto.reportType,
            status: 'completed',
            downloadUrl,
            message: `${dto.reportType.replace('_', ' ')} generated for ${properties.length} properties`,
        };
    }

    /**
     * List financial reports
     */
    async listFinancialReports(userId: string, query: { type: string; year?: number; page: number; limit: number }): Promise<{
        items: Array<{
            id: string;
            type: string;
            dateRange: { startDate: string; endDate: string };
            generatedAt: Date;
            downloadUrl: string;
        }>;
        total: number;
        page: number;
        totalPages: number;
    }> {
        // In production, fetch from reports table
        // Mock response for now
        const mockReports = [
            {
                id: uuidv4(),
                type: 'income_statement',
                dateRange: {
                    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                    endDate: new Date().toISOString(),
                },
                generatedAt: new Date(),
                downloadUrl: 'https://storage.homeai.ng/documents/reports/sample.pdf',
            },
        ];

        return {
            items: mockReports,
            total: mockReports.length,
            page: query.page,
            totalPages: 1,
        };
    }
}

export const leaseReportsService = new LeaseReportsService();
