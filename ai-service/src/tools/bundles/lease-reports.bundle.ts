/**
 * lease-reports bundle — document/report generation. Output is async
 * (server-side PDF rendering); the tool returns a reference + status.
 */

import { z } from 'zod';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const generateLeaseDocument = defineLocalTool({
    name: 'leaseReports.generateLeaseDocument',
    label: 'Generate lease document',
    description: 'Generate the signed PDF for a lease.',
    parameters: z.object({
        leaseId: z.string().uuid(),
        template: z.string().optional(),
    }),
    async execute(params, ctx) {
        const r = await grpc.leaseReports.generateLeaseDocument(ctx.jwt, {
            lease_id: params.leaseId,
            template: params.template,
        });
        return {
            text: `Lease document ${r.status}${r.download_url ? `. Download: ${r.download_url}` : '.'}`,
            details: { ...r, leaseId: params.leaseId },
        };
    },
});

const generateFinancialReport = defineLocalTool({
    name: 'leaseReports.generateFinancialReport',
    label: 'Generate financial report',
    description:
        'Generate a financial report (tenant spend, landlord income, or occupancy) over a date range.',
    parameters: z.object({
        reportType: z.enum(['TENANT_SPEND', 'LANDLORD_INCOME', 'OCCUPANCY']),
        startDate: z.string(),
        endDate: z.string(),
        propertyId: z.string().uuid().optional(),
    }),
    async execute(params, ctx) {
        const r = await grpc.leaseReports.generateFinancialReport(ctx.jwt, {
            report_type: params.reportType,
            start_date: params.startDate,
            end_date: params.endDate,
            property_id: params.propertyId,
        });
        return {
            text: `Financial report ${r.status}${r.download_url ? `. Download: ${r.download_url}` : '.'}`,
            details: { ...r, type: params.reportType },
        };
    },
});

export const leaseReportsBundle: ToolBundle = {
    name: 'lease-reports',
    description: 'Generate lease PDFs and financial reports.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [],
    writeTools: [generateLeaseDocument, generateFinancialReport],
};
