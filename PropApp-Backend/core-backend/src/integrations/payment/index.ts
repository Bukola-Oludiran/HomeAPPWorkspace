/**
 * Payment Provider Factory
 * Returns the appropriate payment provider based on region configuration
 */

import { PaymentProvider } from './payment.interface';
import { MockPaymentProvider } from './mock.provider';
import { PaystackProvider } from './paystack.provider';
import { StripeProvider } from './stripe.provider';
import { regionConfigService } from '../../config/regions';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';

class PaymentProviderFactory {
    private providers: Map<string, PaymentProvider> = new Map();

    constructor() {
        // Register available providers
        this.registerProvider(new MockPaymentProvider());

        // Register Paystack if configured (Nigeria)
        if (env.PAYSTACK_SECRET_KEY) {
            this.registerProvider(new PaystackProvider(env.PAYSTACK_SECRET_KEY));
        }

        // Register Stripe if configured (Canada, US, Europe)
        if (env.STRIPE_SECRET_KEY) {
            this.registerProvider(new StripeProvider(env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET));
        }
    }

    /**
     * Register a payment provider
     */
    registerProvider(provider: PaymentProvider): void {
        this.providers.set(provider.providerId, provider);
        logger.info(`Payment provider registered: ${provider.providerId}`);
    }

    /**
     * Get the primary payment provider for a region
     */
    getProvider(regionCode: string): PaymentProvider {
        const config = regionConfigService.getProviderConfig(regionCode, 'payment');
        const primaryId = config.primary;

        // In development, always use mock if real provider isn't available
        if (env.NODE_ENV === 'development' && !this.providers.has(primaryId)) {
            logger.warn(`Using mock payment provider for region ${regionCode} (${primaryId} not configured)`);
            return this.providers.get('mock')!;
        }

        const provider = this.providers.get(primaryId);
        if (provider) {
            return provider;
        }

        // Try fallback providers
        for (const fallbackId of config.fallback) {
            const fallbackProvider = this.providers.get(fallbackId);
            if (fallbackProvider) {
                logger.warn(`Using fallback payment provider ${fallbackId} for region ${regionCode}`);
                return fallbackProvider;
            }
        }

        // Last resort: mock provider
        logger.warn(`No payment provider configured for region ${regionCode}, using mock`);
        return this.providers.get('mock')!;
    }

    /**
     * Get a specific provider by ID
     */
    getProviderById(providerId: string): PaymentProvider | undefined {
        return this.providers.get(providerId);
    }

    /**
     * Get all registered providers
     */
    getRegisteredProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}

// Export singleton
export const paymentProviderFactory = new PaymentProviderFactory();
