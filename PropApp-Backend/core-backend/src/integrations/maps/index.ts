/**
 * Maps Provider Factory
 * Returns the appropriate maps provider based on configuration
 */

import { MapsProvider } from './maps.interface';
import { MockMapsProvider } from './mock.provider';
import { GoogleMapsProvider } from './google-maps.provider';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';

class MapsProviderFactory {
    private providers: Map<string, MapsProvider> = new Map();

    constructor() {
        // Register available providers
        this.registerProvider(new MockMapsProvider());

        // Register Google Maps if configured
        if (env.GOOGLE_MAPS_API_KEY) {
            this.registerProvider(new GoogleMapsProvider(env.GOOGLE_MAPS_API_KEY));
        }
    }

    registerProvider(provider: MapsProvider): void {
        this.providers.set(provider.providerId, provider);
        logger.info(`Maps provider registered: ${provider.providerId}`);
    }

    getProvider(): MapsProvider {
        // Use Google Maps if available, otherwise mock
        if (this.providers.has('google_maps')) {
            return this.providers.get('google_maps')!;
        }

        if (env.NODE_ENV === 'development') {
            logger.warn('Using mock maps provider');
        }

        return this.providers.get('mock')!;
    }

    getProviderById(providerId: string): MapsProvider | undefined {
        return this.providers.get(providerId);
    }

    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}

export const mapsProviderFactory = new MapsProviderFactory();

// Re-export interface
export * from './maps.interface';
