/**
 * Verification contract — Zod request schemas + inferred request types
 * for the verification module (identity KYC, document upload, property
 * verification, query).
 */

import { z } from 'zod';
import {
    OpenAPIRegistry,
    paginatedResponse,
    requireBearerAuth,
    STANDARD_ERROR_RESPONSES,
    successResponse,
} from './openapi';

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

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Verification';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerVerificationPaths = (registry: OpenAPIRegistry): void => {
    const idParam = z.object({ id: z.string().uuid() });
    const propertyIdParam = z.object({ propertyId: z.string().uuid() });

    registry.registerPath({
        method: 'get',
        path: '/verification/status',
        tags: [TAG],
        summary: 'Aggregate verification status for the current user.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Status snapshot', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/identity',
        tags: [TAG],
        summary: 'Submit a KYC identity document for review.',
        security: requireBearerAuth,
        request: JSON_BODY(submitIdentityVerificationSchema),
        responses: {
            201: successResponse('Submission accepted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/address',
        tags: [TAG],
        summary: 'Submit address-proof document.',
        security: requireBearerAuth,
        request: JSON_BODY(submitDocumentSchema),
        responses: {
            201: successResponse('Submission accepted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/verification/properties',
        tags: [TAG],
        summary: 'Landlord lists their properties\' verification states.',
        security: requireBearerAuth,
        request: { query: verificationQuerySchema },
        responses: {
            200: paginatedResponse('Verification records', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/verification/properties/{propertyId}',
        tags: [TAG],
        summary: 'Property-level verification snapshot.',
        security: requireBearerAuth,
        request: { params: propertyIdParam },
        responses: {
            200: successResponse('Property verification snapshot', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/properties/{propertyId}/cofo',
        tags: [TAG],
        summary: 'Landlord submits a Certificate-of-Occupancy document.',
        security: requireBearerAuth,
        request: { params: propertyIdParam, ...JSON_BODY(submitDocumentSchema) },
        responses: {
            201: successResponse('Document submitted', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/properties/{propertyId}/audit/request',
        tags: [TAG],
        summary: 'Landlord requests an on-site audit at a given tier.',
        security: requireBearerAuth,
        request: { params: propertyIdParam, ...JSON_BODY(requestPropertyVerificationSchema) },
        responses: {
            201: successResponse('Audit requested', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/verification/admin/pending',
        tags: [TAG],
        summary: 'Admin list of pending verifications.',
        security: requireBearerAuth,
        request: { query: verificationQuerySchema },
        responses: {
            200: paginatedResponse('Pending verifications', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/admin/{id}/approve',
        tags: [TAG],
        summary: 'Admin approves a property verification audit.',
        security: requireBearerAuth,
        request: { params: idParam, ...JSON_BODY(submitPropertyVerificationResultSchema) },
        responses: {
            200: successResponse('Approved', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/verification/admin/{id}/reject',
        tags: [TAG],
        summary: 'Admin rejects a property verification audit.',
        security: requireBearerAuth,
        request: {
            params: idParam,
            ...JSON_BODY(z.object({ reason: z.string().max(500) })),
        },
        responses: {
            200: successResponse('Rejected', z.unknown()),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};

export type SubmitIdentityVerificationDto = z.infer<typeof submitIdentityVerificationSchema>;
export type SubmitDocumentDto = z.infer<typeof submitDocumentSchema>;
export type RequestPropertyVerificationDto = z.infer<typeof requestPropertyVerificationSchema>;
export type SubmitPropertyVerificationResultDto = z.infer<typeof submitPropertyVerificationResultSchema>;
export type VerificationQueryDto = z.infer<typeof verificationQuerySchema>;
