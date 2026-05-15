/**
 * Twilio Communication Provider
 * Implements SMSProvider interface for Canada
 * Per HomeAI-Canada-Integrations.md Section 6
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../common/utils/logger';
import {
    SMSProvider,
    SendSMSParams,
    SendSMSResult,
} from './communication.interface';

export class TwilioProvider implements SMSProvider {
    readonly providerId = 'twilio';

    private accountSid: string;
    private authToken: string;
    private fromNumber: string;

    constructor(accountSid: string, authToken: string, fromNumber: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;

        logger.info('Twilio provider initialized');
    }

    private getHeaders() {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        return {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
    }

    async sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
        try {
            const recipients = Array.isArray(params.to) ? params.to : [params.to];
            const results: SendSMSResult[] = [];

            for (const recipient of recipients) {
                const formData = new URLSearchParams();
                formData.append('To', recipient);
                formData.append('From', params.from || this.fromNumber);
                formData.append('Body', params.message);

                const response = await axios.post(
                    `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
                    formData.toString(),
                    { headers: this.getHeaders() }
                );

                results.push({
                    success: response.data.status !== 'failed',
                    messageId: response.data.sid,
                });
            }

            const successCount = results.filter(r => r.success).length;
            const firstMessageId = results[0]?.messageId;

            logger.info(`Twilio SMS sent: ${successCount}/${recipients.length} successful`);

            return {
                success: successCount > 0,
                messageId: firstMessageId,
                error: successCount === 0 ? 'All messages failed' : undefined,
            };
        } catch (error: any) {
            logger.error('Twilio error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }
}
