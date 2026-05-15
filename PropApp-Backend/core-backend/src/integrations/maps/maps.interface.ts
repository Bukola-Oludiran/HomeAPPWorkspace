/**
 * Maps Provider Interface
 * Abstraction for mapping and geocoding services
 */

// ============================================
// TYPES
// ============================================

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface GeocodeParams {
    address: string;
    country?: string;
}

export interface GeocodeResult {
    success: boolean;
    coordinates?: Coordinates;
    formattedAddress?: string;
    placeId?: string;
    components?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    error?: string;
}

export interface ReverseGeocodeParams {
    coordinates: Coordinates;
}

export interface PlaceSearchParams {
    query: string;
    location?: Coordinates;
    radius?: number; // meters
    type?: string;
}

export interface PlaceResult {
    placeId: string;
    name: string;
    address: string;
    coordinates: Coordinates;
    types: string[];
    rating?: number;
    priceLevel?: number;
}

export interface PlaceSearchResult {
    success: boolean;
    places: PlaceResult[];
    error?: string;
}

export interface DistanceParams {
    origin: Coordinates;
    destination: Coordinates;
    mode?: 'driving' | 'walking' | 'transit';
}

export interface DistanceResult {
    success: boolean;
    distance?: {
        value: number; // meters
        text: string;
    };
    duration?: {
        value: number; // seconds
        text: string;
    };
    error?: string;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface MapsProvider {
    readonly providerId: string;

    geocode(params: GeocodeParams): Promise<GeocodeResult>;
    reverseGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult>;
    searchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResult>;
    getDistance(params: DistanceParams): Promise<DistanceResult>;
}
