/**
 * Documents Module - DTO Validation Schemas
 * Per APIRevised.md Section 4
 */

import { z } from 'zod';

// ============================================
// DOCUMENT TYPES
// ============================================

export const DocumentTypeEnum = z.enum([
    'IDENTITY',
    'INCOME',
    'ADDRESS_PROOF',
    'LEASE',
    'FINANCIAL_REPORT',
    'CERTIFICATE',
    'OTHER',
]);

export const DocumentStatusEnum = z.enum([
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'EXPIRED',
]);

// ============================================
// UPLOAD DOCUMENT
// ============================================

export const uploadDocumentSchema = z.object({
    type: DocumentTypeEnum,
    subtype: z.string().max(30).optional(),
    name: z.string().min(1).max(255),
    expiryDate: z.string().optional(), // ISO date
});

// ============================================
// QUERY
// ============================================

export const documentQuerySchema = z.object({
    type: DocumentTypeEnum.optional(),
    status: DocumentStatusEnum.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// TYPES
// ============================================

export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;
export type DocumentQueryDto = z.infer<typeof documentQuerySchema>;
