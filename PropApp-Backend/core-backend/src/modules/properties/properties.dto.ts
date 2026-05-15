/**
 * Property Module - DTO Validation Schemas
 * Per PRD Section 8.1
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const PropertyTypeEnum = z.enum([
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
]);

export const ListingTypeEnum = z.enum(['RENT', 'SALE', 'SHORT_LET']);

export const PriceUnitEnum = z.enum(['PER_MONTH', 'PER_YEAR', 'TOTAL', 'PER_NIGHT']);

export const PropertyStatusEnum = z.enum([
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'RENTED',
    'SOLD',
    'INACTIVE',
    'DELISTED',
]);

// ============================================
// CREATE/UPDATE PROPERTY
// ============================================

export const createPropertySchema = z.object({
    name: z.string().min(5, 'Name must be at least 5 characters').max(255),
    description: z.string().optional(),
    propertyType: PropertyTypeEnum,
    listingType: ListingTypeEnum,
    price: z.number().positive('Price must be positive'),
    priceUnit: PriceUnitEnum,
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    squareFeet: z.number().positive().optional(),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),

    // Address
    addressStreet: z.string().max(255).optional(),
    addressCity: z.string().max(100).optional(),
    addressState: z.string().max(100).optional(),
    addressZip: z.string().max(20).optional(),
    addressLga: z.string().max(100).optional(),
    addressNeighborhood: z.string().max(100).optional(),

    // Location
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // Features
    amenities: z.array(z.string()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const updatePropertyStatusSchema = z.object({
    status: PropertyStatusEnum,
});

// ============================================
// DRAFT PROPERTY (Wizard)
// ============================================

export const createDraftSchema = z.object({
    // Minimal required fields for draft
    name: z.string().min(1).max(255).optional(),
    propertyType: PropertyTypeEnum.optional(),
    listingType: ListingTypeEnum.optional(),

    // All other fields optional for draft
    description: z.string().optional(),
    price: z.number().positive().optional(),
    priceUnit: PriceUnitEnum.optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    squareFeet: z.number().positive().optional(),
    yearBuilt: z.number().int().optional(),
    addressStreet: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    addressZip: z.string().optional(),
    addressLga: z.string().optional(),
    addressNeighborhood: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    amenities: z.array(z.string()).optional(),

    // Wizard step tracking
    currentStep: z.number().int().min(1).max(5).optional(),
});

export const updateDraftSchema = createDraftSchema;

// ============================================
// SEARCH & FILTER
// ============================================

export const searchPropertiesSchema = z.object({
    // Text search
    q: z.string().optional(),

    // Filters
    propertyType: PropertyTypeEnum.optional(),
    listingType: ListingTypeEnum.optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    minSquareFeet: z.coerce.number().positive().optional(),
    maxSquareFeet: z.coerce.number().positive().optional(),

    // Location
    city: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    neighborhood: z.string().optional(),

    // Geo search
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    radius: z.coerce.number().positive().optional(), // in km

    // Verification
    verificationTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),

    // Amenities
    amenities: z.array(z.string()).optional(),

    // Pagination
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    // Sorting
    sortBy: z.enum(['price', 'createdAt', 'bedrooms', 'squareFeet']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const nearbyPropertiesSchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().positive().default(5), // 5km default
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// IMAGES
// ============================================

export const reorderImagesSchema = z.object({
    imageIds: z.array(z.string().uuid()),
});

// ============================================
// TYPES
// ============================================

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
export type UpdatePropertyStatusDto = z.infer<typeof updatePropertyStatusSchema>;
export type CreateDraftDto = z.infer<typeof createDraftSchema>;
export type UpdateDraftDto = z.infer<typeof updateDraftSchema>;
export type SearchPropertiesDto = z.infer<typeof searchPropertiesSchema>;
export type NearbyPropertiesDto = z.infer<typeof nearbyPropertiesSchema>;
