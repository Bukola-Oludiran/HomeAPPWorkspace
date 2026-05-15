/**
 * Mock Maps Provider
 * For development and testing
 */

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
} from './maps.interface';

export class MockMapsProvider implements MapsProvider {
    readonly providerId = 'mock';

    async geocode(params: GeocodeParams): Promise<GeocodeResult> {
        logger.info(`[MOCK] Geocode: ${params.address}`);

        // Return mock Lagos coordinates
        return {
            success: true,
            coordinates: { lat: 6.5244, lng: 3.3792 },
            formattedAddress: params.address,
            placeId: `mock_place_${Date.now()}`,
            components: {
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria',
            },
        };
    }

    async reverseGeocode(params: ReverseGeocodeParams): Promise<GeocodeResult> {
        logger.info(`[MOCK] Reverse geocode: ${params.coordinates.lat}, ${params.coordinates.lng}`);

        return {
            success: true,
            coordinates: params.coordinates,
            formattedAddress: 'Mock Address, Lagos, Nigeria',
            placeId: `mock_place_${Date.now()}`,
            components: {
                street: 'Mock Street',
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria',
            },
        };
    }

    async searchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResult> {
        logger.info(`[MOCK] Search places: ${params.query}`);

        return {
            success: true,
            places: [
                {
                    placeId: 'mock_1',
                    name: 'Mock Place 1',
                    address: 'Victoria Island, Lagos',
                    coordinates: { lat: 6.4281, lng: 3.4219 },
                    types: ['establishment'],
                    rating: 4.5,
                },
                {
                    placeId: 'mock_2',
                    name: 'Mock Place 2',
                    address: 'Ikoyi, Lagos',
                    coordinates: { lat: 6.4502, lng: 3.4389 },
                    types: ['establishment'],
                    rating: 4.2,
                },
            ],
        };
    }

    async getDistance(params: DistanceParams): Promise<DistanceResult> {
        logger.info(`[MOCK] Get distance: ${params.mode || 'driving'}`);

        // Calculate mock distance using Haversine formula
        const R = 6371000; // Earth's radius in meters
        const dLat = (params.destination.lat - params.origin.lat) * Math.PI / 180;
        const dLng = (params.destination.lng - params.origin.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(params.origin.lat * Math.PI / 180) *
            Math.cos(params.destination.lat * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return {
            success: true,
            distance: {
                value: Math.round(distance),
                text: `${(distance / 1000).toFixed(1)} km`,
            },
            duration: {
                value: Math.round(distance / 10), // ~36 km/h average
                text: `${Math.round(distance / 600)} mins`,
            },
        };
    }
}
