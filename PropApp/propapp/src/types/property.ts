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

// Property media
export interface PropertyMedia {
    id: string;
    url: string;
    type: PropertyMediaType;
    isPrimary: boolean;
    caption?: string;
    orderIndex: number;
    metadata?: {
        provider?: string;
        embedCode?: string;
        width?: number;
        height?: number;
    };
}

// Amenities
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

// Property address
export interface PropertyAddress {
    street: string;
    city: string;
    state: string;
    lga?: string;
    neighborhood?: string;
    postalCode?: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

// Property owner/agent info
export interface PropertyAgent {
    id: string;
    name: string;
    title?: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
    rating?: number;
    reviewCount?: number;
}

// Property highlights
export interface PropertyHighlight {
    icon: string;
    iconColor: string;
    title: string;
    text: string;
}

// Full property type
export interface Property {
    id: string;
    name: string;
    description?: string;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    price: number;
    priceUnit: PriceUnit;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    toilets?: number;
    parkingSpaces?: number;
    squareFeet?: number;
    yearBuilt?: number;
    address: PropertyAddress;
    amenities: Amenity[];
    media: PropertyMedia[];
    verificationTier?: VerificationTier;
    isVerified: boolean;
    isFeatured: boolean;
    viewCount: number;
    favoriteCount: number;
    agent?: PropertyAgent;
    landlordId: string;
    highlights?: PropertyHighlight[];
    createdAt: string;
    updatedAt: string;
}

// Property summary (for lists)
export interface PropertySummary {
    id: string;
    name: string;
    propertyType: PropertyType;
    listingType: ListingType;
    status: PropertyStatus;
    price: number;
    priceUnit: PriceUnit;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet?: number;
    address: Pick<PropertyAddress, 'street' | 'city' | 'state' | 'neighborhood'>;
    primaryImage?: string;
    verificationTier?: VerificationTier;
    isVerified: boolean;
    isFeatured: boolean;
    viewCount?: number;
    createdAt: string;
}

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
export interface FavoriteProperty {
    id: string;
    property: PropertySummary;
    createdAt: string;
}
