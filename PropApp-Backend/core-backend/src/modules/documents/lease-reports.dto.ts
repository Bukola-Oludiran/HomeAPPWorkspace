/**
 * Lease Documents & Financial Reports DTO
 * Per APIRevised.md Section 4.2, 4.3
 */

import { z } from 'zod';

// ============================================
// LEASE DOCUMENTS
// ============================================

export const generateLeaseSchema = z.object({
    templateId: z.string().optional(),
    includeAddendums: z.boolean().default(true),
    customTerms: z.array(z.string()).optional(),
});

export const leaseDocumentQuerySchema = z.object({
    status: z.enum(['draft', 'pending_signatures', 'signed', 'expired', 'all']).default('all'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// FINANCIAL REPORTS
// ============================================

export const generateReportSchema = z.object({
    reportType: z.enum(['income_statement', 'expense_report', 'tax_summary', 'rent_roll']),
    startDate: z.string(),
    endDate: z.string(),
    propertyIds: z.array(z.string().uuid()).optional(),
    format: z.enum(['pdf', 'csv', 'json']).default('pdf'),
});

export const financialReportQuerySchema = z.object({
    type: z.enum(['income_statement', 'expense_report', 'tax_summary', 'rent_roll', 'all']).default('all'),
    year: z.coerce.number().int().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type GenerateLeaseDto = z.infer<typeof generateLeaseSchema>;
export type LeaseDocumentQuery = z.infer<typeof leaseDocumentQuerySchema>;
export type GenerateReportDto = z.infer<typeof generateReportSchema>;
export type FinancialReportQuery = z.infer<typeof financialReportQuerySchema>;
