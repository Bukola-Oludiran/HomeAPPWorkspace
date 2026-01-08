/**
 * Blockchain Provider Factory
 * Returns the appropriate blockchain provider based on region configuration
 * Per PRD Section 14 and MultiRegion Abstraction Section 10
 */

import { BlockchainProvider } from './blockchain.interface';
import { MockBlockchainProvider } from './mock.provider';
import { PolygonProvider } from './polygon.provider';
import { env } from '../../config/env';
import { regionConfigService } from '../../config/regions';
import { logger } from '../../common/utils/logger';

// ============================================
// BLOCKCHAIN CONFIGURATION
// ============================================

interface BlockchainNetworkConfig {
    network: string;
    chainId: number;
    rpcUrl: string;
    fallbackRpcUrls: string[];
    isMainnet: boolean;
}

const NETWORK_CONFIGS: Record<string, BlockchainNetworkConfig> = {
    'polygon-mainnet': {
        network: 'polygon',
        chainId: 137,
        rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY || ''}`,
        fallbackRpcUrls: [
            `https://polygon-mainnet.infura.io/v3/${env.INFURA_API_KEY || ''}`,
            'https://rpc.ankr.com/polygon',
        ],
        isMainnet: true,
    },
    'polygon-mumbai': {
        network: 'polygon-mumbai',
        chainId: 80001,
        rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${env.ALCHEMY_API_KEY || ''}`,
        fallbackRpcUrls: [
            `https://polygon-mumbai.infura.io/v3/${env.INFURA_API_KEY || ''}`,
            'https://rpc.ankr.com/polygon_mumbai',
        ],
        isMainnet: false,
    },
    base: {
        network: 'base',
        chainId: 8453,
        rpcUrl: 'https://mainnet.base.org',
        fallbackRpcUrls: ['https://base.blockpi.network/v1/rpc/public'],
        isMainnet: true,
    },
};

// ============================================
// PROVIDER FACTORY
// ============================================

class BlockchainProviderFactory {
    private providers: Map<string, BlockchainProvider> = new Map();
    private defaultProvider: BlockchainProvider;

    constructor() {
        // Always register mock provider
        const mockProvider = new MockBlockchainProvider();
        this.registerProvider(mockProvider);
        this.defaultProvider = mockProvider;

        // Register Polygon provider if configured
        if (this.isPolygonConfigured()) {
            const networkKey = env.NODE_ENV === 'production' ? 'polygon-mainnet' : 'polygon-mumbai';
            const config = NETWORK_CONFIGS[networkKey];

            const polygonProvider = new PolygonProvider(
                config.rpcUrl,
                config.fallbackRpcUrls,
                env.BLOCKCHAIN_PRIVATE_KEY,
                config.isMainnet
            );

            this.registerProvider(polygonProvider);
            this.defaultProvider = polygonProvider;
        }
    }

    private isPolygonConfigured(): boolean {
        const hasRpcAccess = !!(env.ALCHEMY_API_KEY || env.INFURA_API_KEY);
        const hasPrivateKey = !!env.BLOCKCHAIN_PRIVATE_KEY;

        if (hasRpcAccess && !hasPrivateKey) {
            logger.warn('Blockchain RPC configured but no private key - read-only mode');
        }

        return hasRpcAccess;
    }

    registerProvider(provider: BlockchainProvider): void {
        this.providers.set(provider.providerId, provider);
        logger.info(`Blockchain provider registered: ${provider.providerId} (${provider.network})`);
    }

    /**
     * Get provider based on region configuration
     */
    getProvider(regionCode?: string): BlockchainProvider {
        // Check if blockchain is enabled for the region
        if (regionCode) {
            try {
                const regionConfig = regionConfigService.getConfig(regionCode);
                if (!regionConfig.features.blockchainEnabled) {
                    logger.debug(`Blockchain disabled for region ${regionCode}, using mock`);
                    return this.providers.get('mock')!;
                }

                // Get region-specific provider preference
                const blockchainConfig = regionConfig.providers.blockchain;
                if (blockchainConfig?.network) {
                    const providerId = blockchainConfig.network;
                    if (this.providers.has(providerId)) {
                        return this.providers.get(providerId)!;
                    }
                }
            } catch (error) {
                logger.warn(`Region ${regionCode} not configured, using default provider`);
            }
        }

        // Return default provider
        return this.defaultProvider;
    }

    /**
     * Get provider by specific ID
     */
    getProviderById(providerId: string): BlockchainProvider | undefined {
        return this.providers.get(providerId);
    }

    /**
     * Get all registered providers
     */
    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Check if blockchain features are available
     */
    isBlockchainAvailable(): boolean {
        return this.defaultProvider.providerId !== 'mock';
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const blockchainProviderFactory = new BlockchainProviderFactory();

// Re-export types
export * from './blockchain.interface';
