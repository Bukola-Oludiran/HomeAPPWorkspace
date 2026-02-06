/**
 * Property Service
 * API calls for property-related operations
 */

import axios from 'axios';
import { api } from '../client';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { transformProperty, transformProperties, type ApiPropertyResponse } from '../transforms';
import type { PaginatedResponse } from '../../../types/api';
import type {
    Property,
    PropertySummary,
    PropertySearchFilters,
    CreatePropertyRequest,
    UpdatePropertyRequest,
    PropertyDraft,
    UploadMediaRequest,
    PropertyMedia,
    PropertyViewAnalytics,
    PropertyMarketComparison,
    PropertyPriceOptimization,
    FavoriteProperty,
} from '../../../types/property';
import { tokenManager } from '../client';

/**
 * Search properties with filters
 * Returns paginated response directly
 */
export async function searchProperties(filters?: PropertySearchFilters): Promise<PaginatedResponse<PropertySummary>> {
    const token = tokenManager.getAccessToken();
    const response = await axios.get<PaginatedResponse<ApiPropertyResponse>>(
        `${API_BASE_URL}${API_ENDPOINTS.PROPERTIES.SEARCH}`,
        {
            params: filters as Record<string, unknown>,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    );

    // Transform flat address fields to nested structure
    return {
        ...response.data,
        data: transformProperties(response.data.data || []) as unknown as PropertySummary[],
    };
}

/**
 * List all properties (for landlord)
 */
export async function listProperties(filters?: PropertySearchFilters) {
    const response = await api.get<ApiPropertyResponse[]>(API_ENDPOINTS.PROPERTIES.LIST, filters as Record<string, unknown>);
    return {
        ...response,
        data: transformProperties(response.data || []) as unknown as PropertySummary[],
    };
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit?: number) {
    const response = await api.get<ApiPropertyResponse[]>(API_ENDPOINTS.PROPERTIES.FEATURED, { limit });
    return {
        ...response,
        data: transformProperties(response.data || []) as unknown as PropertySummary[],
    };
}

/**
 * Get nearby properties
 */
export async function getNearbyProperties(latitude: number, longitude: number, radius?: number) {
    const response = await api.get<ApiPropertyResponse[]>(API_ENDPOINTS.PROPERTIES.NEARBY, { latitude, longitude, radius });
    return {
        ...response,
        data: transformProperties(response.data || []) as unknown as PropertySummary[],
    };
}

/**
 * Get property details by ID
 */
export async function getPropertyById(id: string) {
    const response = await api.get<ApiPropertyResponse>(API_ENDPOINTS.PROPERTIES.DETAIL(id));
    return {
        ...response,
        data: transformProperty(response.data) as unknown as Property,
    };
}

/**
 * Create a new property
 */
export async function createProperty(data: CreatePropertyRequest) {
    return api.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, data);
}

/**
 * Update a property
 */
export async function updateProperty(id: string, data: UpdatePropertyRequest) {
    return api.put<Property>(API_ENDPOINTS.PROPERTIES.UPDATE(id), data);
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.PROPERTIES.DELETE(id));
}

/**
 * Update property status
 */
export async function updatePropertyStatus(id: string, status: string) {
    return api.patch<Property>(API_ENDPOINTS.PROPERTIES.STATUS(id), { status });
}

/**
 * Upload property media
 */
export async function uploadPropertyMedia(id: string, file: File, options: UploadMediaRequest) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', options.type);
    if (options.caption) formData.append('caption', options.caption);
    if (options.isPrimary !== undefined) formData.append('isPrimary', String(options.isPrimary));

    return api.upload<PropertyMedia>(API_ENDPOINTS.PROPERTIES.MEDIA(id), formData);
}

/**
 * Delete property media
 */
export async function deletePropertyMedia(propertyId: string, mediaId: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.PROPERTIES.MEDIA_DELETE(propertyId, mediaId));
}

/**
 * Create a property draft
 */
export async function createPropertyDraft(data: Partial<CreatePropertyRequest>) {
    return api.post<PropertyDraft>(API_ENDPOINTS.PROPERTIES.DRAFT, data);
}

/**
 * Update a property draft
 */
export async function updatePropertyDraft(id: string, data: Partial<CreatePropertyRequest>) {
    return api.put<PropertyDraft>(API_ENDPOINTS.PROPERTIES.DRAFT_UPDATE(id), data);
}

/**
 * Publish a property draft
 */
export async function publishPropertyDraft(id: string) {
    return api.post<Property>(API_ENDPOINTS.PROPERTIES.DRAFT_PUBLISH(id));
}

/**
 * Get property view analytics
 */
export async function getPropertyViewAnalytics(id: string) {
    return api.get<PropertyViewAnalytics>(API_ENDPOINTS.PROPERTIES.ANALYTICS_VIEWS(id));
}

/**
 * Get property market comparison
 */
export async function getPropertyMarketComparison(id: string) {
    return api.get<PropertyMarketComparison>(API_ENDPOINTS.PROPERTIES.ANALYTICS_MARKET(id));
}

/**
 * Get AI price optimization suggestions
 */
export async function getPropertyPriceOptimization(
    id: string,
    options?: { targetMetric?: string; constraints?: { minPrice?: number; maxPrice?: number } }
) {
    return api.post<PropertyPriceOptimization>(API_ENDPOINTS.PROPERTIES.ANALYTICS_PRICE(id), options);
}

/**
 * Get user's favorite properties
 */
export async function getFavorites() {
    return api.get<FavoriteProperty[]>(API_ENDPOINTS.USERS.FAVORITES);
}

/**
 * Save a property to favorites
 */
export async function saveToFavorites(propertyId: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.USERS.FAVORITE(propertyId));
}

/**
 * Remove a property from favorites
 */
export async function removeFromFavorites(propertyId: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.USERS.FAVORITE(propertyId));
}

// Export all functions as named exports and as default object
export const propertyService = {
    searchProperties,
    listProperties,
    getFeaturedProperties,
    getNearbyProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    uploadPropertyMedia,
    deletePropertyMedia,
    createPropertyDraft,
    updatePropertyDraft,
    publishPropertyDraft,
    getPropertyViewAnalytics,
    getPropertyMarketComparison,
    getPropertyPriceOptimization,
    getFavorites,
    saveToFavorites,
    removeFromFavorites,
};

export default propertyService;
