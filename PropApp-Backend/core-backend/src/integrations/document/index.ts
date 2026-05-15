/**
 * Document Provider Factory
 * Region-aware provider selection for property document verification
 */

import { DocumentProvider, PropertyDocumentType } from './document.interface';
import { MockDocumentProvider } from './mock.provider';
import { LasreraProvider } from './lasrera.provider';
import { regionConfigService } from '../../config/regions';
import { logger } from '../../common/utils/logger';

// ============================================
// PROVIDER INSTANCES
// ============================================

const mockProvider = new MockDocumentProvider();
const lasreraProvider = new LasreraProvider();

const providers = new Map<string, DocumentProvider>();
providers.set('mock', mockProvider);
providers.set('lasrera', lasreraProvider);

// ============================================
// FACTORY
// ============================================

class DocumentProviderFactory {
    /**
     * Get document provider for a region
     */
    getProvider(regionCode: string = 'NG'): DocumentProvider {
        const config = regionConfigService.getConfig(regionCode);

        if (!config) {
            logger.warn(`No config for region ${regionCode}, using mock provider`);
            return mockProvider;
        }

        // Get document provider from region config if available
        const documentConfig = config.providers?.document;
        const primaryProviderId = documentConfig?.primary || 'mock';

        const provider = providers.get(primaryProviderId);

        if (provider) {
            return provider;
        }

        // Fallback logic
        if (documentConfig?.fallback) {
            for (const fallbackId of documentConfig.fallback) {
                const fallbackProvider = providers.get(fallbackId);
                if (fallbackProvider) {
                    logger.info(`Using fallback document provider: ${fallbackId}`);
                    return fallbackProvider;
                }
            }
        }

        logger.warn(`No document provider found for ${regionCode}, using mock`);
        return mockProvider;
    }

    /**
     * Get provider by ID directly
     */
    getProviderById(providerId: string): DocumentProvider | undefined {
        return providers.get(providerId);
    }

    /**
     * Get provider that supports a specific document type
     */
    getProviderForDocumentType(
        regionCode: string,
        documentType: PropertyDocumentType
    ): DocumentProvider {
        const regionProvider = this.getProvider(regionCode);

        if (regionProvider.supportedDocumentTypes.includes(documentType)) {
            return regionProvider;
        }

        // Find any provider that supports the document type
        for (const [, provider] of providers) {
            if (provider.supportedDocumentTypes.includes(documentType)) {
                return provider;
            }
        }

        // Default to mock which accepts all types
        return mockProvider;
    }

    /**
     * Register a new provider
     */
    registerProvider(provider: DocumentProvider): void {
        providers.set(provider.providerId, provider);
        logger.info(`Registered document provider: ${provider.providerId}`);
    }

    /**
     * Get all available providers
     */
    getAvailableProviders(): string[] {
        return Array.from(providers.keys());
    }
}

export const documentProviderFactory = new DocumentProviderFactory();

// Re-export types
export * from './document.interface';
