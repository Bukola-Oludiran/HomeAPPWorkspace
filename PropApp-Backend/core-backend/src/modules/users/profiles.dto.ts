/**
 * Role-Specific Profiles DTO
 * Per APIRevised.md Section 1.3
 */

import { z } from 'zod';

// ============================================
// TENANT PROFILE
// ============================================

export const tenantProfileSchema = z.object({
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    preferences: z.object({
        desiredBedrooms: z.string().optional(),
        monthlyBudgetMax: z.number().positive().optional(),
        desiredAmenities: z.array(z.string()).optional(),
        moveInTimeline: z.string().optional(),
    }).optional(),
    privacySettings: z.object({
        allowLandlordSearch: z.boolean().optional(),
        showIncomeBadge: z.boolean().optional(),
    }).optional(),
});

export type TenantProfileDto = z.infer<typeof tenantProfileSchema>;

// ============================================
// LANDLORD PROFILE
// ============================================

export const landlordProfileSchema = z.object({
    businessName: z.string().max(200).optional(),
    businessEmail: z.string().email().optional(),
    businessPhone: z.string().optional(),
    businessAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),
    publicVisibility: z.object({
        showContactPhone: z.boolean().optional(),
        showBusinessAddress: z.boolean().optional(),
        showVerificationBadge: z.boolean().optional(),
    }).optional(),
});

export type LandlordProfileDto = z.infer<typeof landlordProfileSchema>;

// ============================================
// AGENT PROFILE
// ============================================

export const agentProfileSchema = z.object({
    professionalName: z.string().max(200).optional(),
    businessEmail: z.string().email().optional(),
    businessPhone: z.string().optional(),
    serviceAreas: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    publicVisibility: z.object({
        showContactEmail: z.boolean().optional(),
        showPhoneNumber: z.boolean().optional(),
        profileSearchable: z.boolean().optional(),
    }).optional(),
});

export type AgentProfileDto = z.infer<typeof agentProfileSchema>;

// ============================================
// AGENT CERTIFICATION
// ============================================

export const addCertificationSchema = z.object({
    name: z.string().min(3).max(200),
    issuer: z.string().min(3).max(200),
    expiryDate: z.string().optional(),
    documentUrl: z.string().url().optional(),
});

export type AddCertificationDto = z.infer<typeof addCertificationSchema>;
