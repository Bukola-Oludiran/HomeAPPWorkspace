/**
 * Google Maps Provider
 * Implements MapsProvider interface
 * Per PRD Section 14.1
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../common/utils/logger';
import {
    MapsProvider,
    GeocodeParams,
    GeocodeResult,
    ReverseGeocodeParams,
    PlaceSearchParams,
    PlaceSearchResult,
    DistanceParams,
    DistanceResult,
    Coordinates,
} from './maps.interface';

export class GoogleMapsProvider implements MapsProvider {
    readonly providerId = 'google_maps';

    private client: AxiosInstance;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL: 'https://maps.googleapis.com/maps/api',
            timeout: 30000,
        });

        logger.info('Google Maps provider initialized');
    }

    async geocode(params: GeocodeParams): Promise<GeocodeResult> {
        try {
            const response = await this.client.get('/geocode/json', {
                params: {
                    address: params.address,
                    components: params.country ? `country:${params.country}` : undefined,
                    key: this.apiKey,
                },
            });

            const { results, status } = response.data;

            if (status !== 'OK' || !results.length) {
                return { success: false, error: status };
            }

            const result = results[0];
            const location = result.geometry.location;

            return {
                success: true,
                coordinates: { lat: location.lat, lng: location.lng },
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
                components: this.extractAddressComponents(result.address_components),
            };
        } catch (error: any) {
            logger.error('Google Maps geocode error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async reverseGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult> {
        try {
            const response = await this.client.get('/geocode/json', {
                params: {
                    latlng: `${params.coordinates.lat},${params.coordinates.lng}`,
                    key: this.apiKey,
                },
            });

            const { results, status } = response.data;

            if (status !== 'OK' || !results.length) {
                return { success: false, error: status };
            }

            const result = results[0];

            return {
                success: true,
                coordinates: params.coordinates,
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
                components: this.extractAddressComponents(result.address_components),
            };
        } catch (error: any) {
            logger.error('Google Maps reverse geocode error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async searchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResult> {
        try {
            const requestParams: Record<string, unknown> = {
                query: params.query,
                key: this.apiKey,
            };

            if (params.location) {
                requestParams.location = `${params.location.lat},${params.location.lng}`;
                requestParams.radius = params.radius || 5000;
            }

            if (params.type) {
                requestParams.type = params.type;
            }

            const response = await this.client.get('/place/textsearch/json', {
                params: requestParams,
            });

            const { results, status } = response.data;

            if (status !== 'OK') {
                return { success: false, places: [], error: status };
            }

            const places = results.map((place: any) => ({
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                coordinates: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                },
                types: place.types || [],
                rating: place.rating,
                priceLevel: place.price_level,
            }));

            return { success: true, places };
        } catch (error: any) {
            logger.error('Google Maps search places error:', error.message);
            return { success: false, places: [], error: error.message };
        }
    }

    async getDistance(params: DistanceParams): Promise<DistanceResult> {
        try {
            const response = await this.client.get('/distancematrix/json', {
                params: {
                    origins: `${params.origin.lat},${params.origin.lng}`,
                    destinations: `${params.destination.lat},${params.destination.lng}`,
                    mode: params.mode || 'driving',
                    key: this.apiKey,
                },
            });

            const { rows, status } = response.data;

            if (status !== 'OK' || !rows.length || !rows[0].elements.length) {
                return { success: false, error: status };
            }

            const element = rows[0].elements[0];

            if (element.status !== 'OK') {
                return { success: false, error: element.status };
            }

            return {
                success: true,
                distance: {
                    value: element.distance.value,
                    text: element.distance.text,
                },
                duration: {
                    value: element.duration.value,
                    text: element.duration.text,
                },
            };
        } catch (error: any) {
            logger.error('Google Maps distance error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private extractAddressComponents(components: any[]): GeocodeResult['components'] {
        const result: GeocodeResult['components'] = {};

        for (const component of components) {
            const types = component.types || [];

            if (types.includes('street_number') || types.includes('route')) {
                result.street = (result.street || '') + ' ' + component.long_name;
            }
            if (types.includes('locality')) {
                result.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                result.state = component.long_name;
            }
            if (types.includes('country')) {
                result.country = component.long_name;
            }
            if (types.includes('postal_code')) {
                result.postalCode = component.long_name;
            }
        }

        if (result.street) {
            result.street = result.street.trim();
        }

        return result;
    }
}
