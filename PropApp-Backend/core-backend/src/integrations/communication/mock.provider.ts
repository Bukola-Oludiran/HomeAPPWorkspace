/**
 * Mock Communication Providers
 * For development and testing without real SendGrid/Africa's Talking
 */

import { v4 as uuidv4 } from 'uuid';
import {
    EmailProvider,
    SMSProvider,
    PushProvider,
    SendEmailParams,
    SendEmailResult,
    SendSMSParams,
    SendSMSResult,
    SendPushParams,
    SendPushResult,
} from './communication.interface';
import { logger } from '../../common/utils/logger';

// ============================================
// MOCK EMAIL PROVIDER
// ============================================

export class MockEmailProvider implements EmailProvider {
    readonly providerId = 'mock_email';

    async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
        const messageId = `mock_email_${uuidv4().split('-')[0]}`;

        const recipients = Array.isArray(params.to) ? params.to : [params.to];

        logger.info(`[MockEmail] Sending email to ${recipients.join(', ')}`);
        logger.info(`[MockEmail] Subject: ${params.subject}`);

        if (params.templateId) {
            logger.info(`[MockEmail] Template: ${params.templateId}`);
            logger.debug(`[MockEmail] Template data:`, params.templateData);
        } else if (params.text) {
            logger.debug(`[MockEmail] Body: ${params.text.substring(0, 100)}...`);
        }

        return {
            success: true,
            messageId,
        };
    }
}

// ============================================
// MOCK SMS PROVIDER
// ============================================

export class MockSMSProvider implements SMSProvider {
    readonly providerId = 'mock_sms';

    async sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
        const messageId = `mock_sms_${uuidv4().split('-')[0]}`;

        const recipients = Array.isArray(params.to) ? params.to : [params.to];

        logger.info(`[MockSMS] Sending SMS to ${recipients.join(', ')}`);
        logger.info(`[MockSMS] Message: ${params.message}`);

        return {
            success: true,
            messageId,
        };
    }
}

// ============================================
// MOCK PUSH PROVIDER
// ============================================

export class MockPushProvider implements PushProvider {
    readonly providerId = 'mock_push';

    async sendPush(params: SendPushParams): Promise<SendPushResult> {
        const tokens = Array.isArray(params.tokens) ? params.tokens : [params.tokens];

        logger.info(`[MockPush] Sending push notification to ${tokens.length} device(s)`);
        logger.info(`[MockPush] Title: ${params.title}`);
        logger.info(`[MockPush] Body: ${params.body}`);

        return {
            success: true,
            successCount: tokens.length,
            failureCount: 0,
        };
    }
}

// Singleton instances
export const mockEmailProvider = new MockEmailProvider();
export const mockSMSProvider = new MockSMSProvider();
export const mockPushProvider = new MockPushProvider();
