/**
 * Property contract — Zod request schemas + inferred request types for the
 * property module. Single source of truth for what the backend accepts on
 * /properties endpoints and for what the frontend may construct as a
 * request body.
 *
 * Backend re-exports from `src/modules/properties/properties.dto.ts`;
 * frontend re-exports from `src/types/property.ts`.
 *
 * Response shapes (Property, PropertySummary, PropertyAddress,
 * PropertyMedia, etc.) remain frontend-owned in
 * `PropApp/propapp/src/types/property.ts` until S2.3 — which lands the
 * backend `serializeProperty(prisma) -> WireProperty` adapter, deletes
 * `transforms.ts`, and brings the nested-address wire shape into the
 * contract.
 */

import { z } from 'zod';
import type { VerificationLevel, VerificationTier } from './enums';
import {
    PropertyTypeValues,
    ListingTypeValues,
    PriceUnitValues,
    PropertyStatusValues,
} from './enums';
import type { PropertyType, ListingType, PriceUnit, PropertyStatus, PropertyMediaType } from './enums';

// ============================================
// ZOD ENUMS (built from contracts/enums.ts so the
// allowed-value list stays in one place.)
// ============================================

export const PropertyTypeEnum = z.enum(PropertyTypeValues);
export const ListingTypeEnum = z.enum(ListingTypeValues);
export const PriceUnitEnum = z.enum(PriceUnitValues);
export const PropertyStatusEnum = z.enum(PropertyStatusValues);

/**
 * Tier filter for search. Excludes `UNVERIFIED` on purpose — the use case
 * is "show me properties verified at this tier or higher", and the
 * unverified bucket isn't a useful filter target.
 */
export const VerificationTierFilterEnum = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

// ============================================
// CREATE / UPDATE PROPERTY
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

    // Flat address (S2.3 will nest these into `address: { ... }` on the
    // response side; request side stays flat to mirror Prisma columns.)
    addressStreet: z.string().max(255).optional(),
    addressCity: z.string().max(100).optional(),
    addressState: z.string().max(100).optional(),
    addressZip: z.string().max(20).optional(),
    addressLga: z.string().max(100).optional(),
    addressNeighborhood: z.string().max(100).optional(),

    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

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
    name: z.string().min(1).max(255).optional(),
    propertyType: PropertyTypeEnum.optional(),
    listingType: ListingTypeEnum.optional(),

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

    currentStep: z.number().int().min(1).max(5).optional(),
});

export const updateDraftSchema = createDraftSchema;

// ============================================
// SEARCH & FILTER
// ============================================

export const searchPropertiesSchema = z.object({
    /**
     * Text-search query. Renamed from `q` (prior wire) to align with the
     * frontend's existing `filters.query` callsite; the prior `q` was
     * unreachable from the frontend.
     */
    query: z.string().optional(),

    /**
     * Property type filter. Accepts either a single value or an array so
     * the UI can offer multi-select (`?propertyType=APARTMENT&propertyType=HOUSE`
     * which Express parses into an array).
     */
    propertyType: z
        .union([PropertyTypeEnum, z.array(PropertyTypeEnum)])
        .optional(),
    listingType: ListingTypeEnum.optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    minSquareFeet: z.coerce.number().positive().optional(),
    maxSquareFeet: z.coerce.number().positive().optional(),

    city: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    neighborhood: z.string().optional(),

    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    radius: z.coerce.number().positive().optional(),

    verificationTier: VerificationTierFilterEnum.optional(),

    /**
     * Forwarded informationally; the listing service currently does not
     * filter on these flags. Accepted on the wire so the frontend UI
     * controls compile cleanly and a future backend can honor them.
     */
    isFeatured: z.coerce.boolean().optional(),
    isVerified: z.coerce.boolean().optional(),

    amenities: z.array(z.string()).optional(),

    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    sortBy: z.enum(['price', 'createdAt', 'bedrooms', 'squareFeet']).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const nearbyPropertiesSchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().positive().default(5),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// IMAGES
// ============================================

export const reorderImagesSchema = z.object({
    imageIds: z.array(z.string().uuid()),
});

// ============================================
// REQUEST TYPES (client-side wire-input shape)
// ============================================

export type CreatePropertyRequest = z.input<typeof createPropertySchema>;
export type UpdatePropertyRequest = z.input<typeof updatePropertySchema>;
export type UpdatePropertyStatusRequest = z.input<typeof updatePropertyStatusSchema>;
export type CreateDraftRequest = z.input<typeof createDraftSchema>;
export type UpdateDraftRequest = z.input<typeof updateDraftSchema>;
export type SearchPropertiesRequest = z.input<typeof searchPropertiesSchema>;
export type NearbyPropertiesRequest = z.input<typeof nearbyPropertiesSchema>;
export type ReorderImagesRequest = z.input<typeof reorderImagesSchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES — z.infer (= output)
// shape (defaults filled in) for backend service signatures that
// consume req.body / req.query after validate() has run.
// ============================================

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
export type UpdatePropertyStatusDto = z.infer<typeof updatePropertyStatusSchema>;
export type CreateDraftDto = z.infer<typeof createDraftSchema>;
export type UpdateDraftDto = z.infer<typeof updateDraftSchema>;
export type SearchPropertiesDto = z.infer<typeof searchPropertiesSchema>;
export type NearbyPropertiesDto = z.infer<typeof nearbyPropertiesSchema>;
export type ReorderImagesDto = z.infer<typeof reorderImagesSchema>;

// ============================================
// RESPONSE / WIRE TYPES (S2.3)
//
// What every property-returning endpoint actually carries on the wire
// after the backend runs `serializeProperty()` / `serializePropertySummary()`.
// These replace the older flat-address shape that lived in the frontend
// `types/property.ts` `Property` / `PropertySummary` interfaces and
// were bridged by the now-deleted `transforms.ts`.
// ============================================

export interface WirePropertyAddress {
    street: string | null;
    city: string | null;
    state: string | null;
    /** Nigeria-specific local government area. Nullable. */
    lga: string | null;
    neighborhood: string | null;
    /** Postal / ZIP code. Property-record column is `addressZip`. */
    postalCode: string | null;
    /** ISO 3166-1 alpha-2 country code (e.g. `NG`). */
    country: string;
    latitude: number | null;
    longitude: number | null;
}

export interface WirePropertyMedia {
    id: string;
    url: string;
    type: PropertyMediaType;
    isPrimary: boolean;
    caption: string | null;
    orderIndex: number;
    metadata: unknown;
}

export interface WirePropertyOwner {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    verificationLevel: VerificationLevel;
}

/**
 * Full property wire shape — used by detail / create / update / draft
 * / publish endpoints.
 *
 * Phantom fields previously declared on the frontend `Property` type
 * (`toilets`, `parkingSpaces`, `currency`, `viewCount`, `favoriteCount`,
 * `isFeatured`) are intentionally NOT included; none exist in Prisma
 * and none were ever populated by the backend. `isVerified` IS included
 * — it's derived in the serializer from `verificationTier !== 'UNVERIFIED'`
 * so the frontend doesn't have to compute it.
 */
export interface WireProperty {
    id: string;
    name: string;
    description: string | null;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    price: number;
    priceUnit: PriceUnit;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    yearBuilt: number | null;
    amenities: string[];
    verificationTier: VerificationTier;
    /** Derived: `verificationTier !== 'UNVERIFIED'`. */
    isVerified: boolean;
    address: WirePropertyAddress;
    media: WirePropertyMedia[];
    owner: WirePropertyOwner;
    createdAt: string;
    updatedAt: string;
}

/**
 * Compact list-shape used by list / search / featured / nearby /
 * my-properties endpoints. Address is nested but only the subset
 * needed for card display is populated.
 */
export interface WirePropertySummary {
    id: string;
    name: string;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    price: number;
    priceUnit: PriceUnit;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    address: Pick<WirePropertyAddress, 'street' | 'city' | 'state' | 'neighborhood' | 'country'>;
    primaryImage: string | null;
    verificationTier: VerificationTier;
    isVerified: boolean;
    createdAt: string;
}
