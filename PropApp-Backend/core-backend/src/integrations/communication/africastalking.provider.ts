/**
 * Africa's Talking SMS Provider
 * Implements SMSProvider interface
 * Per PRD Section 14.1
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../common/utils/logger';
import {
    SMSProvider,
    SendSMSParams,
    SendSMSResult,
} from './communication.interface';

export class AfricasTalkingProvider implements SMSProvider {
    readonly providerId = 'africastalking';

    private client: AxiosInstance;
    private username: string;
    private senderId?: string;

    constructor(apiKey: string, username: string, senderId?: string) {
        this.username = username;
        this.senderId = senderId;

        // Use sandbox for development if username is 'sandbox'
        const baseURL = username === 'sandbox'
            ? 'https://api.sandbox.africastalking.com'
            : 'https://api.africastalking.com';

        this.client = axios.create({
            baseURL,
            headers: {
                apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            timeout: 30000,
        });

        logger.info(`Africa's Talking provider initialized (${username === 'sandbox' ? 'sandbox' : 'production'})`);
    }

    async sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
        try {
            const recipients = Array.isArray(params.to) ? params.to.join(',') : params.to;

            const formData = new URLSearchParams();
            formData.append('username', this.username);
            formData.append('to', recipients);
            formData.append('message', params.message);

            if (this.senderId || params.from) {
                formData.append('from', params.from || this.senderId!);
            }

            const response = await this.client.post('/version1/messaging', formData);

            const { SMSMessageData } = response.data;
            const recipient = SMSMessageData.Recipients?.[0];

            if (recipient?.status === 'Success') {
                logger.info(`Africa's Talking SMS sent: ${recipient.messageId}`);
                return {
                    success: true,
                    messageId: recipient.messageId,
                };
            }

            logger.warn(`Africa's Talking SMS failed: ${recipient?.status || 'Unknown'}`);
            return {
                success: false,
                error: recipient?.status || 'Unknown error',
            };
        } catch (error: any) {
            logger.error("Africa's Talking error:", error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.SMSMessageData?.Message || error.message,
            };
        }
    }
}
