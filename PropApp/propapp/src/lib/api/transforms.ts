/**
 * API Response Transformers
 * Transforms flat API responses to nested structures expected by frontend
 */

import type { PropertyAddress } from '../../types/property';

/**
 * API property response with flat address fields
 */
export interface ApiPropertyResponse {
    id: string;
    name: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressLga?: string;
    addressNeighborhood?: string;
    addressZip?: string;
    addressPostalCode?: string;
    latitude?: number;
    longitude?: number;
    // ... other fields passed through
    [key: string]: unknown;
}

/**
 * Transform flat address fields to nested PropertyAddress object
 */
export function transformAddress(data: ApiPropertyResponse): PropertyAddress {
    return {
        street: data.addressStreet || '',
        city: data.addressCity || '',
        state: data.addressState || '',
        lga: data.addressLga || undefined,
        neighborhood: data.addressNeighborhood || undefined,
        postalCode: data.addressZip || data.addressPostalCode || undefined,
        country: 'Nigeria', // Default for this app
        latitude: data.latitude,
        longitude: data.longitude,
    };
}

/**
 * Derive isVerified from verificationTier
 * If verificationTier exists and is not UNVERIFIED, property is verified
 */
function deriveIsVerified(verificationTier?: string, existingIsVerified?: boolean): boolean {
    // If isVerified is explicitly set, use it
    if (typeof existingIsVerified === 'boolean') {
        return existingIsVerified;
    }
    // Derive from verificationTier
    if (!verificationTier || verificationTier === 'UNVERIFIED') {
        return false;
    }
    return true;
}

/**
 * Transform a single property from API response to frontend format
 * Converts flat address fields to nested address object
 * Derives isVerified from verificationTier if not present
 */
export function transformProperty<T extends ApiPropertyResponse>(
    apiProperty: T
): Omit<T, 'addressStreet' | 'addressCity' | 'addressState' | 'addressLga' | 'addressNeighborhood' | 'addressZip' | 'addressPostalCode'> & { address: PropertyAddress; isVerified: boolean } {
    const {
        addressStreet,
        addressCity,
        addressState,
        addressLga,
        addressNeighborhood,
        addressZip,
        addressPostalCode,
        ...rest
    } = apiProperty;

    // Derive isVerified from verificationTier if not present
    const isVerified = deriveIsVerified(
        apiProperty.verificationTier as string | undefined,
        apiProperty.isVerified as boolean | undefined
    );

    return {
        ...rest,
        address: transformAddress(apiProperty),
        isVerified,
    } as Omit<T, 'addressStreet' | 'addressCity' | 'addressState' | 'addressLga' | 'addressNeighborhood' | 'addressZip' | 'addressPostalCode'> & { address: PropertyAddress; isVerified: boolean };
}

/**
 * Transform an array of properties from API response to frontend format
 */
export function transformProperties<T extends ApiPropertyResponse>(
    apiProperties: T[]
): Array<Omit<T, 'addressStreet' | 'addressCity' | 'addressState' | 'addressLga' | 'addressNeighborhood' | 'addressZip' | 'addressPostalCode'> & { address: PropertyAddress }> {
    return apiProperties.map(transformProperty);
}

/**
 * Transform API owner to frontend agent format
 */
export function transformOwnerToAgent(owner?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    verificationLevel?: string;
}) {
    if (!owner) return undefined;

    return {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`,
        avatarUrl: owner.avatarUrl || undefined,
        verificationLevel: owner.verificationLevel,
    };
}

/**
 * Check if property has flat address fields (API response) vs nested (already transformed)
 */
export function hasNestedAddress(data: unknown): boolean {
    return typeof data === 'object' && data !== null && 'address' in data && typeof (data as { address: unknown }).address === 'object';
}

/**
 * Safely transform property - handles both already-transformed and raw API responses
 */
export function safeTransformProperty<T extends Record<string, unknown>>(data: T): T {
    // If already has nested address, return as-is
    if (hasNestedAddress(data)) {
        return data;
    }

    // If has flat address fields, transform
    if ('addressCity' in data || 'addressState' in data) {
        return transformProperty(data as unknown as ApiPropertyResponse) as unknown as T;
    }

    // Return as-is if no address fields
    return data;
}
