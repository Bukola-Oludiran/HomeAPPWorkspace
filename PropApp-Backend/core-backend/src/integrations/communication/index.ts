/**
 * Communication Provider Factory
 * Returns appropriate communication providers based on region and channel
 */

import {
    EmailProvider,
    SMSProvider,
    PushProvider,
} from './communication.interface';
import {
    MockEmailProvider,
    MockSMSProvider,
    MockPushProvider,
} from './mock.provider';
import { SendGridProvider } from './sendgrid.provider';
import { AfricasTalkingProvider } from './africastalking.provider';
import { TwilioProvider } from './twilio.provider';
import { FCMProvider } from './fcm.provider';
import { regionConfigService } from '../../config/regions';
import { env } from '../../config/env';
import { logger } from '../../common/utils/logger';
import { instrumentProvider } from '../../common/observability/instrument-provider';

const wrapEmail = (id: string, provider: EmailProvider): EmailProvider =>
    instrumentProvider(provider, { to: id, dataClassification: 'PII', encrypted: true });
const wrapSms = (id: string, provider: SMSProvider): SMSProvider =>
    instrumentProvider(provider, { to: id, dataClassification: 'PII', encrypted: true });
const wrapPush = (id: string, provider: PushProvider): PushProvider =>
    instrumentProvider(provider, { to: id, dataClassification: 'PII', encrypted: true });

class CommunicationProviderFactory {
    private emailProviders: Map<string, EmailProvider> = new Map();
    private smsProviders: Map<string, SMSProvider> = new Map();
    private pushProviders: Map<string, PushProvider> = new Map();

    constructor() {
        // Register mock providers
        this.emailProviders.set('mock_email', wrapEmail('mock_email', new MockEmailProvider()));
        this.smsProviders.set('mock_sms', wrapSms('mock_sms', new MockSMSProvider()));
        this.pushProviders.set('mock_push', wrapPush('mock_push', new MockPushProvider()));

        // Register SendGrid if configured
        if (env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL) {
            this.emailProviders.set('sendgrid', wrapEmail('sendgrid', new SendGridProvider(env.SENDGRID_API_KEY, env.SENDGRID_FROM_EMAIL)));
        }

        // Register Africa's Talking if configured (Nigeria)
        if (env.AT_API_KEY && env.AT_USERNAME) {
            this.smsProviders.set('africastalking', wrapSms('africastalking', new AfricasTalkingProvider(env.AT_API_KEY, env.AT_USERNAME, env.AT_SENDER_ID)));
        }

        // Register Twilio if configured (Canada)
        if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER) {
            this.smsProviders.set('twilio', wrapSms('twilio', new TwilioProvider(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN, env.TWILIO_FROM_NUMBER)));
        }

        // Register FCM if configured
        if (env.FCM_PROJECT_ID) {
            const fcmCredentials = env.FCM_PRIVATE_KEY && env.FCM_CLIENT_EMAIL
                ? {
                    projectId: env.FCM_PROJECT_ID,
                    privateKey: env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: env.FCM_CLIENT_EMAIL,
                }
                : undefined;
            this.pushProviders.set('fcm', wrapPush('fcm', new FCMProvider(undefined, fcmCredentials)));
        }

        logger.info('Communication providers initialized');
    }

    /**
     * Get email provider for a region
     */
    getEmailProvider(regionCode: string): EmailProvider {
        try {
            const config = regionConfigService.getProviderConfig(regionCode, 'communication');
            const primaryId = config.email.primary;

            if (this.emailProviders.has(primaryId)) {
                return this.emailProviders.get(primaryId)!;
            }

            // Try fallbacks
            for (const fallbackId of config.email.fallback) {
                if (this.emailProviders.has(fallbackId)) {
                    return this.emailProviders.get(fallbackId)!;
                }
            }
        } catch (error) {
            logger.warn(`Failed to get email provider for region ${regionCode}, using mock`);
        }

        return this.emailProviders.get('mock_email')!;
    }

    /**
     * Get SMS provider for a region
     */
    getSMSProvider(regionCode: string): SMSProvider {
        try {
            const config = regionConfigService.getProviderConfig(regionCode, 'communication');
            const primaryId = config.sms.primary;

            if (this.smsProviders.has(primaryId)) {
                return this.smsProviders.get(primaryId)!;
            }

            for (const fallbackId of config.sms.fallback) {
                if (this.smsProviders.has(fallbackId)) {
                    return this.smsProviders.get(fallbackId)!;
                }
            }
        } catch (error) {
            logger.warn(`Failed to get SMS provider for region ${regionCode}, using mock`);
        }

        return this.smsProviders.get('mock_sms')!;
    }

    /**
     * Get push notification provider for a region
     */
    getPushProvider(regionCode: string): PushProvider {
        try {
            const config = regionConfigService.getProviderConfig(regionCode, 'communication');
            const primaryId = config.push.primary;

            if (this.pushProviders.has(primaryId)) {
                return this.pushProviders.get(primaryId)!;
            }

            for (const fallbackId of config.push.fallback) {
                if (this.pushProviders.has(fallbackId)) {
                    return this.pushProviders.get(fallbackId)!;
                }
            }
        } catch (error) {
            logger.warn(`Failed to get push provider for region ${regionCode}, using mock`);
        }

        return this.pushProviders.get('mock_push')!;
    }
}

// Export singleton
export const communicationProviderFactory = new CommunicationProviderFactory();

// Re-export interfaces
export * from './communication.interface';
