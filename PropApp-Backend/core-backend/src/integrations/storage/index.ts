/**
 * Storage Provider Factory
 * Returns the appropriate storage provider based on configuration
 */

import { StorageProvider } from './storage.interface';
import { MockStorageProvider } from './mock.provider';
import { S3Provider } from './s3.provider';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';
import { instrumentProvider } from '../../common/observability/instrument-provider';

class StorageProviderFactory {
    private providers: Map<string, StorageProvider> = new Map();

    constructor() {
        // Register available providers
        this.registerProvider(new MockStorageProvider());

        // Register S3 if configured
        if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET) {
            this.registerProvider(
                new S3Provider(
                    env.AWS_REGION || 'us-east-1',
                    env.AWS_ACCESS_KEY_ID,
                    env.AWS_SECRET_ACCESS_KEY,
                    env.AWS_S3_BUCKET,
                    env.AWS_CLOUDFRONT_DOMAIN
                )
            );
        }
    }

    registerProvider(provider: StorageProvider): void {
        const instrumented = instrumentProvider(provider, {
            to: provider.providerId,
            dataClassification: 'PII',
            encrypted: true,
        });
        this.providers.set(provider.providerId, instrumented);
        logger.info(`Storage provider registered: ${provider.providerId}`);
    }

    getProvider(): StorageProvider {
        // Use S3 if available, otherwise mock
        if (this.providers.has('s3')) {
            return this.providers.get('s3')!;
        }

        if (env.NODE_ENV === 'development') {
            logger.warn('Using mock storage provider');
        }

        return this.providers.get('mock')!;
    }

    getProviderById(providerId: string): StorageProvider | undefined {
        return this.providers.get(providerId);
    }

    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}

export const storageProviderFactory = new StorageProviderFactory();

// Re-export interface
export * from './storage.interface';
