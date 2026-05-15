/**
 * Property Types
 * Types for properties, media, search, and favorites
 */

// Property types
export type PropertyType =
    | 'APARTMENT'
    | 'HOUSE'
    | 'DUPLEX'
    | 'BUNGALOW'
    | 'PENTHOUSE'
    | 'STUDIO'
    | 'TOWNHOUSE'
    | 'COMMERCIAL'
    | 'OFFICE'
    | 'LAND';

// Listing types
export type ListingType = 'RENT' | 'SALE' | 'SHORT_LET';

// Property status
export type PropertyStatus =
    | 'DRAFT'
    | 'PENDING_REVIEW'
    | 'ACTIVE'
    | 'RENTED'
    | 'SOLD'
    | 'INACTIVE'
    | 'DELISTED';

// Price units
export type PriceUnit = 'PER_MONTH' | 'PER_YEAR' | 'TOTAL' | 'PER_NIGHT';

// Verification tiers
export type VerificationTier = 'UNVERIFIED' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// Media types
export type PropertyMediaType = 'IMAGE' | 'VIDEO' | 'TOUR_3D' | 'FLOOR_PLAN' | 'DOCUMENT';

// Amenities — UI-facing enumeration used by amenity-chip components.
// The wire shape accepts `string[]` so unknown values won't crash; this
// union just drives the icon-and-label map for the well-known set.
export type Amenity =
    | 'SWIMMING_POOL'
    | 'GYM'
    | 'PARKING'
    | 'SECURITY'
    | 'GENERATOR'
    | 'AIR_CONDITIONING'
    | 'BALCONY'
    | 'GARDEN'
    | 'LAUNDRY'
    | 'PET_FRIENDLY'
    | 'FURNISHED'
    | 'ELEVATOR'
    | 'CCTV'
    | 'INTERNET'
    | 'CABLE_TV';

// UI-only helper used by property-detail page hero blocks; not part of
// the wire shape.
export interface PropertyHighlight {
    icon: string;
    iconColor: string;
    title: string;
    text: string;
}

// ============================================
// RESPONSE / WIRE TYPES — re-exported from @homeai/contracts
//
// `Property`, `PropertySummary`, `PropertyAddress`, `PropertyMedia` are
// the exact shape backend `serializeProperty()` / `serializePropertySummary()`
// emit. Renamed locally from `WireProperty` / `WirePropertySummary` /
// `WirePropertyAddress` / `WirePropertyMedia` for ergonomics.
// ============================================
export type {
    WireProperty as Property,
    WirePropertySummary as PropertySummary,
    WirePropertyAddress as PropertyAddress,
    WirePropertyMedia as PropertyMedia,
    WirePropertyOwner as PropertyAgent,
} from '@homeai/contracts/property.contract';

// ============================================
// REQUEST TYPES — re-exported from @homeai/contracts
// (Zod-inferred source-of-truth lives in
// `HomeAPPWorkspace/contracts/property.contract.ts`.)
// ============================================
export type {
    CreatePropertyRequest,
    UpdatePropertyRequest,
    UpdatePropertyStatusRequest,
    CreateDraftRequest,
    UpdateDraftRequest,
    SearchPropertiesRequest,
    NearbyPropertiesRequest,
    ReorderImagesRequest,
} from '@homeai/contracts/property.contract';

// `PropertySearchFilters` is retained as an alias for `SearchPropertiesRequest`
// until callers migrate to the new name.
export type { SearchPropertiesRequest as PropertySearchFilters } from '@homeai/contracts/property.contract';

import type { CreatePropertyRequest as _CreatePropertyRequest } from '@homeai/contracts/property.contract';

// Property draft
export interface PropertyDraft {
    id: string;
    data: Partial<_CreatePropertyRequest>;
    step: number;
    createdAt: string;
    updatedAt: string;
}

// Media upload
export interface UploadMediaRequest {
    type: PropertyMediaType;
    caption?: string;
    isPrimary?: boolean;
}

// Property analytics
export interface PropertyViewAnalytics {
    totalViews: number;
    uniqueViews: number;
    viewsByDay: Array<{ date: string; views: number }>;
    viewsBySource: Array<{ source: string; views: number }>;
}

export interface PropertyMarketComparison {
    propertyId: string;
    propertyPrice: number;
    priceUnit: string;
    marketAnalysis: {
        areaName: string;
        propertyType: string;
        bedrooms: number;
        sampleSize: number;
        averagePrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
        percentile: number;
        competitiveness: string;
    };
    recommendation: {
        action: string;
        suggestedPrice: number;
        potentialImpact: string;
        confidence: number;
    };
}

export interface PropertyPriceOptimization {
    currentPrice: number;
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    confidence: number;
    reasoning: string;
}

// Favorites
import type { WirePropertySummary } from '@homeai/contracts/property.contract';

export interface FavoriteProperty {
    id: string;
    property: WirePropertySummary;
    createdAt: string;
}
