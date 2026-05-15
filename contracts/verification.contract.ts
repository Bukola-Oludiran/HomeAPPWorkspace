/**
 * Verification contract — Zod request schemas + inferred request types
 * for the verification module (identity KYC, document upload, property
 * verification, query).
 */

import { z } from 'zod';

// ============================================
// VERIFICATION TIERS
// ============================================

export const verificationTierSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

export type VerificationTier = z.infer<typeof verificationTierSchema>;

// ============================================
// IDENTITY VERIFICATION (KYC)
// ============================================

export const submitIdentityVerificationSchema = z.object({
    type: z.enum(['NIN', 'BVN', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'VOTERS_CARD']),
    documentNumber: z.string().min(5).max(50),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.string(),
    selfieBase64: z.string().optional(),
});

// ============================================
// DOCUMENT VERIFICATION
// ============================================

export const submitDocumentSchema = z.object({
    type: z.enum([
        'PROOF_OF_INCOME',
        'EMPLOYMENT_LETTER',
        'BANK_STATEMENT',
        'UTILITY_BILL',
        'PROPERTY_OWNERSHIP',
        'CAC_CERTIFICATE',
        'TAX_CLEARANCE',
        'OTHER',
    ]),
    documentUrl: z.string().url(),
    notes: z.string().max(500).optional(),
});

// ============================================
// PROPERTY VERIFICATION
// ============================================

export const requestPropertyVerificationSchema = z.object({
    propertyId: z.string().uuid(),
    tier: verificationTierSchema,
    preferredDate: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

export const submitPropertyVerificationResultSchema = z.object({
    passed: z.boolean(),
    findings: z.string().max(2000),
    photos: z.array(z.string().url()).optional(),
    tier: verificationTierSchema,
    score: z.number().int().min(0).max(100),
});

// ============================================
// QUERY
// ============================================

export const verificationQuerySchema = z.object({
    status: z.enum(['pending', 'in_progress', 'approved', 'rejected', 'all']).optional(),
    type: z.enum(['identity', 'document', 'property', 'all']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// REQUEST TYPES
// ============================================

export type SubmitIdentityVerificationRequest = z.input<typeof submitIdentityVerificationSchema>;
export type SubmitDocumentRequest = z.input<typeof submitDocumentSchema>;
export type RequestPropertyVerificationRequest = z.input<typeof requestPropertyVerificationSchema>;
export type SubmitPropertyVerificationResultRequest = z.input<typeof submitPropertyVerificationResultSchema>;
export type VerificationQueryRequest = z.input<typeof verificationQuerySchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES
// ============================================

export type SubmitIdentityVerificationDto = z.infer<typeof submitIdentityVerificationSchema>;
export type SubmitDocumentDto = z.infer<typeof submitDocumentSchema>;
export type RequestPropertyVerificationDto = z.infer<typeof requestPropertyVerificationSchema>;
export type SubmitPropertyVerificationResultDto = z.infer<typeof submitPropertyVerificationResultSchema>;
export type VerificationQueryDto = z.infer<typeof verificationQuerySchema>;
