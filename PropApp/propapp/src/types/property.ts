/**
 * Property Types
 * Types for properties, media, search, and favorites
 */

import type { PaginationParams } from './api';

// Property types
export type PropertyType =
    | 'APARTMENT'
    | 'HOUSE'
    | 'DUPLEX'
    | 'BUNGALOW'
    | 'PENTHOUSE'
    | 'STUDIO'
    | 'MAISONETTE'
    | 'TERRACE'
    | 'COMMERCIAL'
    | 'LAND';

// Listing types
export type ListingType = 'RENT' | 'SALE' | 'SHORT_LET';

// Property status
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'RENTED' | 'SOLD' | 'INACTIVE';

// Price units
export type PriceUnit = 'PER_MONTH' | 'PER_YEAR' | 'TOTAL';

// Verification tiers
export type VerificationTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

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
    squareMeters?: number;
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
    squareMeters?: number;
    address: Pick<PropertyAddress, 'street' | 'city' | 'state' | 'neighborhood'>;
    primaryImage?: string;
    verificationTier?: VerificationTier;
    isVerified: boolean;
    isFeatured: boolean;
    viewCount?: number;
    createdAt: string;
}

// Property search filters
export interface PropertySearchFilters extends PaginationParams {
    propertyType?: PropertyType | PropertyType[];
    listingType?: ListingType;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    minSquareMeters?: number;
    maxSquareMeters?: number;
    city?: string;
    state?: string;
    lga?: string;
    neighborhood?: string;
    amenities?: Amenity[];
    verificationTier?: VerificationTier;
    isFeatured?: boolean;
    isVerified?: boolean;
    query?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
}

// Property creation/update
export interface CreatePropertyRequest {
    name: string;
    description?: string;
    propertyType: PropertyType;
    listingType: ListingType;
    price: number;
    priceUnit: PriceUnit;
    bedrooms: number;
    bathrooms: number;
    toilets?: number;
    parkingSpaces?: number;
    squareMeters?: number;
    yearBuilt?: number;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressLga?: string;
    addressNeighborhood?: string;
    addressZip?: string;
    latitude?: number;
    longitude?: number;
    amenities?: Amenity[];
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
    status?: PropertyStatus;
}

// Property draft
export interface PropertyDraft {
    id: string;
    data: Partial<CreatePropertyRequest>;
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
