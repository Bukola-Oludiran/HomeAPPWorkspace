/**
 * Lease Module - DTO Validation Schemas
 * Per Backend Requirements.md Lease & Agreements section
 */

import { z } from 'zod';

// ============================================
// CREATE LEASE
// ============================================

export const createLeaseSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.string(), // ISO date
    endDate: z.string(), // ISO date
    monthlyRent: z.number().positive(),
    securityDeposit: z.number().min(0).optional(),

    // Terms
    terms: z.object({
        paymentDueDay: z.number().int().min(1).max(28).default(1),
        lateFeePercentage: z.number().min(0).max(100).optional(),
        gracePeriodDays: z.number().int().min(0).max(30).default(5),
        utilities: z.array(z.string()).optional(), // Included utilities
        maintenanceResponsibility: z.enum(['landlord', 'tenant', 'shared']).optional(),
        petsAllowed: z.boolean().optional(),
        sublettingAllowed: z.boolean().optional(),
        noticePeriodDays: z.number().int().min(0).default(30),
        additionalTerms: z.string().max(5000).optional(),
    }).optional(),
});

// ============================================
// UPDATE LEASE
// ============================================

export const updateLeaseSchema = z.object({
    monthlyRent: z.number().positive().optional(),
    endDate: z.string().optional(),
    terms: z.object({
        paymentDueDay: z.number().int().min(1).max(28).optional(),
        lateFeePercentage: z.number().min(0).max(100).optional(),
        gracePeriodDays: z.number().int().min(0).max(30).optional(),
        utilities: z.array(z.string()).optional(),
        maintenanceResponsibility: z.enum(['landlord', 'tenant', 'shared']).optional(),
        petsAllowed: z.boolean().optional(),
        sublettingAllowed: z.boolean().optional(),
        noticePeriodDays: z.number().int().min(0).optional(),
        additionalTerms: z.string().max(5000).optional(),
    }).optional(),
});

// ============================================
// LEASE STATUS
// ============================================

export const updateLeaseStatusSchema = z.object({
    status: z.enum(['DRAFT', 'PENDING_SIGNATURES', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']),
    notes: z.string().max(500).optional(),
});

// ============================================
// RENEWAL
// ============================================

export const sendRenewalOfferSchema = z.object({
    newEndDate: z.string(), // ISO date
    newMonthlyRent: z.number().positive(),
    terms: z.object({
        changes: z.string().max(2000).optional(), // Description of changes
        additionalTerms: z.string().max(2000).optional(),
    }).optional(),
    expiresAt: z.string().optional(), // When offer expires
    message: z.string().max(2000).optional(), // Message to tenant
});

export const respondToRenewalSchema = z.object({
    accept: z.boolean(),
    counterOffer: z.object({
        newMonthlyRent: z.number().positive().optional(),
        newEndDate: z.string().optional(),
        message: z.string().max(2000).optional(),
    }).optional(),
    message: z.string().max(2000).optional(),
});

// ============================================
// SIGNING
// ============================================

export const signLeaseSchema = z.object({
    signature: z.string().min(1), // Base64 signature image or digital signature
    signedAt: z.string().optional(), // ISO date-time
});

// ============================================
// TYPES
// ============================================

export type CreateLeaseDto = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseDto = z.infer<typeof updateLeaseSchema>;
export type UpdateLeaseStatusDto = z.infer<typeof updateLeaseStatusSchema>;
export type SendRenewalOfferDto = z.infer<typeof sendRenewalOfferSchema>;
export type RespondToRenewalDto = z.infer<typeof respondToRenewalSchema>;
export type SignLeaseDto = z.infer<typeof signLeaseSchema>;
