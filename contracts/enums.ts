/**
 * Cross-cutting enums shared by backend (Prisma + Zod validation) and
 * frontend (TypeScript types + UI literals). Each enum is exported as
 * both a `*Values` const tuple (for `z.enum(...)` consumption on the
 * backend) and a derived union `*` type (for frontend props/state).
 *
 * Source of truth: `PropApp-Backend/core-backend/prisma/schema.prisma`.
 * If a value is added to Prisma, add it here in the same commit.
 */

// ============================================
// USERS
// ============================================

export const UserRoleValues = ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'] as const;
export type UserRole = (typeof UserRoleValues)[number];

export const VerificationLevelValues = [
    'UNVERIFIED',
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
] as const;
export type VerificationLevel = (typeof VerificationLevelValues)[number];

// ============================================
// PROPERTIES
// ============================================

export const PropertyTypeValues = [
    'APARTMENT',
    'HOUSE',
    'DUPLEX',
    'BUNGALOW',
    'STUDIO',
    'PENTHOUSE',
    'TOWNHOUSE',
    'LAND',
    'COMMERCIAL',
    'OFFICE',
] as const;
export type PropertyType = (typeof PropertyTypeValues)[number];

export const ListingTypeValues = ['RENT', 'SALE', 'SHORT_LET'] as const;
export type ListingType = (typeof ListingTypeValues)[number];

export const PriceUnitValues = ['PER_MONTH', 'PER_YEAR', 'TOTAL', 'PER_NIGHT'] as const;
export type PriceUnit = (typeof PriceUnitValues)[number];

export const PropertyStatusValues = [
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'RENTED',
    'SOLD',
    'INACTIVE',
    'DELISTED',
] as const;
export type PropertyStatus = (typeof PropertyStatusValues)[number];

export const VerificationTierValues = [
    'UNVERIFIED',
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
] as const;
export type VerificationTier = (typeof VerificationTierValues)[number];

export const PropertyMediaTypeValues = [
    'IMAGE',
    'VIDEO',
    'TOUR_3D',
    'FLOOR_PLAN',
    'DOCUMENT',
] as const;
export type PropertyMediaType = (typeof PropertyMediaTypeValues)[number];

// ============================================
// LEASES & APPLICATIONS
// ============================================

export const LeaseStatusValues = [
    'DRAFT',
    'PENDING_SIGNATURES',
    'ACTIVE',
    'RENEWED',
    'EXPIRED',
    'TERMINATED',
] as const;
export type LeaseStatus = (typeof LeaseStatusValues)[number];

export const ApplicationStatusValues = [
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
    'LEASE_OFFERED',
] as const;
export type ApplicationStatus = (typeof ApplicationStatusValues)[number];

// ============================================
// MAINTENANCE
// ============================================

export const MaintenanceCategoryValues = [
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'APPLIANCE',
    'STRUCTURAL',
    'PEST_CONTROL',
    'CLEANING',
    'SECURITY',
    'OTHER',
] as const;
export type MaintenanceCategory = (typeof MaintenanceCategoryValues)[number];

export const MaintenancePriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] as const;
export type MaintenancePriority = (typeof MaintenancePriorityValues)[number];

export const MaintenanceStatusValues = [
    'PENDING',
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
] as const;
export type MaintenanceStatus = (typeof MaintenanceStatusValues)[number];
