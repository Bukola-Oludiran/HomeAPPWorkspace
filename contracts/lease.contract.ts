/**
 * Lease contract — Zod request schemas + inferred request types for the
 * lease module. Both backend (`leases.dto.ts`) and frontend
 * (`types/lease.ts`) re-export from this file so a lease-field change
 * fails type-check on both sides.
 *
 * Response shapes (Lease, RenewalOffer, etc.) remain frontend-owned for
 * now; they migrate when response-shape contracts land alongside the
 * `serializeLease` adapter (deferred follow-up similar to S2.3 for
 * properties).
 */

import { z } from 'zod';
import { LeaseStatusValues } from './enums';

// ============================================
// SHARED SUB-SCHEMAS
// ============================================

const maintenanceResponsibilityEnum = z.enum(['landlord', 'tenant', 'shared']);

/**
 * Lease terms carried in the `terms` field on create/update/renewal
 * payloads. The backend stores these on the lease record; the frontend
 * surfaces individual fields in dedicated form controls.
 *
 * Defaults match the prior backend dto (paymentDueDay=1,
 * gracePeriodDays=5, noticePeriodDays=30).
 */
export const createLeaseTermsSchema = z.object({
    paymentDueDay: z.number().int().min(1).max(28).default(1),
    lateFeePercentage: z.number().min(0).max(100).optional(),
    gracePeriodDays: z.number().int().min(0).max(30).default(5),
    utilities: z.array(z.string()).optional(),
    maintenanceResponsibility: maintenanceResponsibilityEnum.optional(),
    petsAllowed: z.boolean().optional(),
    sublettingAllowed: z.boolean().optional(),
    noticePeriodDays: z.number().int().min(0).default(30),
    additionalTerms: z.string().max(5000).optional(),
});

export const updateLeaseTermsSchema = createLeaseTermsSchema.partial();

// ============================================
// CREATE LEASE
// ============================================

export const createLeaseSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
    monthlyRent: z.number().positive(),
    securityDeposit: z.number().min(0).optional(),
    terms: createLeaseTermsSchema.optional(),
});

// ============================================
// UPDATE LEASE
// ============================================

export const updateLeaseSchema = z.object({
    monthlyRent: z.number().positive().optional(),
    endDate: z.string().optional(),
    terms: updateLeaseTermsSchema.optional(),
});

// ============================================
// LEASE STATUS
// ============================================

export const updateLeaseStatusSchema = z.object({
    status: z.enum(LeaseStatusValues),
    notes: z.string().max(500).optional(),
});

// ============================================
// RENEWAL
// ============================================

const renewalTermsSchema = z.object({
    changes: z.string().max(2000).optional(),
    additionalTerms: z.string().max(2000).optional(),
});

export const sendRenewalOfferSchema = z.object({
    newEndDate: z.string(),
    newMonthlyRent: z.number().positive(),
    terms: renewalTermsSchema.optional(),
    expiresAt: z.string().optional(),
    message: z.string().max(2000).optional(),
});

const respondToRenewalCounterSchema = z.object({
    newMonthlyRent: z.number().positive().optional(),
    newEndDate: z.string().optional(),
    message: z.string().max(2000).optional(),
});

export const respondToRenewalSchema = z.object({
    accept: z.boolean(),
    counterOffer: respondToRenewalCounterSchema.optional(),
    message: z.string().max(2000).optional(),
});

// ============================================
// SIGNING
// ============================================

export const signLeaseSchema = z.object({
    signature: z.string().min(1),
    signedAt: z.string().optional(),
});

// ============================================
// REQUEST TYPES (client-side wire-input shape)
// ============================================

export type CreateLeaseRequest = z.input<typeof createLeaseSchema>;
export type UpdateLeaseRequest = z.input<typeof updateLeaseSchema>;
export type UpdateLeaseStatusRequest = z.input<typeof updateLeaseStatusSchema>;
export type SendRenewalOfferRequest = z.input<typeof sendRenewalOfferSchema>;
export type RespondToRenewalRequest = z.input<typeof respondToRenewalSchema>;
export type SignLeaseRequest = z.input<typeof signLeaseSchema>;
export type CreateLeaseTermsInput = z.input<typeof createLeaseTermsSchema>;
export type UpdateLeaseTermsInput = z.input<typeof updateLeaseTermsSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES — z.infer (= output)
// ============================================

export type CreateLeaseDto = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseDto = z.infer<typeof updateLeaseSchema>;
export type UpdateLeaseStatusDto = z.infer<typeof updateLeaseStatusSchema>;
export type SendRenewalOfferDto = z.infer<typeof sendRenewalOfferSchema>;
export type RespondToRenewalDto = z.infer<typeof respondToRenewalSchema>;
export type SignLeaseDto = z.infer<typeof signLeaseSchema>;
