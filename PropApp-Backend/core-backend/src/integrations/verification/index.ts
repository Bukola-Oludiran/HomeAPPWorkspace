/**
 * Verification Provider Factory
 * Returns the appropriate verification provider based on region configuration
 */

import { IdentityVerificationProvider } from './verification.interface';
import { MockVerificationProvider } from './mock.provider';
import { SmileIdentityProvider } from './smile-identity.provider';
import { OnfidoProvider } from './onfido.provider';
import { regionConfigService } from '../../config/regions';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';

class VerificationProviderFactory {
    private providers: Map<string, IdentityVerificationProvider> = new Map();

    constructor() {
        // Register available providers
        this.registerProvider(new MockVerificationProvider());

        // Register Smile Identity if configured (Nigeria)
        if (env.SMILE_IDENTITY_PARTNER_ID && env.SMILE_IDENTITY_API_KEY) {
            this.registerProvider(
                new SmileIdentityProvider(
                    env.SMILE_IDENTITY_PARTNER_ID,
                    env.SMILE_IDENTITY_API_KEY,
                    env.NODE_ENV !== 'production'
                )
            );
        }

        // Register Onfido if configured (Canada)
        if (env.ONFIDO_API_TOKEN) {
            this.registerProvider(
                new OnfidoProvider(
                    env.ONFIDO_API_TOKEN,
                    env.ONFIDO_SANDBOX === 'true' || env.NODE_ENV !== 'production'
                )
            );
        }
    }

    registerProvider(provider: IdentityVerificationProvider): void {
        this.providers.set(provider.providerId, provider);
        logger.info(`Verification provider registered: ${provider.providerId}`);
    }

    getProvider(regionCode: string): IdentityVerificationProvider {
        // Smile Identity for Nigeria
        if (regionCode === 'NG' && this.providers.has('smile_identity')) {
            return this.providers.get('smile_identity')!;
        }

        // Onfido for Canada
        if (regionCode === 'CA' && this.providers.has('onfido')) {
            return this.providers.get('onfido')!;
        }

        // Fallback to mock in development
        if (env.NODE_ENV === 'development') {
            logger.warn(`Using mock verification provider for region ${regionCode}`);
            return this.providers.get('mock')!;
        }

        return this.providers.get('mock')!;
    }

    getProviderById(providerId: string): IdentityVerificationProvider | undefined {
        return this.providers.get(providerId);
    }

    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}

export const verificationProviderFactory = new VerificationProviderFactory();
