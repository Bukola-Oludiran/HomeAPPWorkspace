/**
 * SendGrid Email Provider
 * Implements EmailProvider interface
 * Per PRD Section 14.1
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../common/utils/logger';
import {
    EmailProvider,
    SendEmailParams,
    SendEmailResult,
} from './communication.interface';

export class SendGridProvider implements EmailProvider {
    readonly providerId = 'sendgrid';

    private client: AxiosInstance;
    private defaultFrom: string;

    constructor(apiKey: string, defaultFrom: string) {
        this.defaultFrom = defaultFrom;
        this.client = axios.create({
            baseURL: 'https://api.sendgrid.com/v3',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        logger.info('SendGrid provider initialized');
    }

    async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
        try {
            const recipients = Array.isArray(params.to) ? params.to : [params.to];

            // Build personalizations
            const personalizations = recipients.map(email => ({
                to: [{ email }],
                ...(params.templateData && { dynamic_template_data: params.templateData }),
            }));

            // Build request body
            const body: Record<string, unknown> = {
                personalizations,
                from: { email: params.from || this.defaultFrom },
                subject: params.subject,
            };

            // Use template or content
            if (params.templateId) {
                body.template_id = params.templateId;
            } else {
                body.content = [];
                if (params.text) {
                    (body.content as unknown[]).push({ type: 'text/plain', value: params.text });
                }
                if (params.html) {
                    (body.content as unknown[]).push({ type: 'text/html', value: params.html });
                }
            }

            if (params.replyTo) {
                body.reply_to = { email: params.replyTo };
            }

            // Handle attachments
            if (params.attachments && params.attachments.length > 0) {
                body.attachments = params.attachments.map(att => ({
                    filename: att.filename,
                    content: typeof att.content === 'string'
                        ? att.content
                        : att.content.toString('base64'),
                    type: att.contentType || 'application/octet-stream',
                }));
            }

            const response = await this.client.post('/mail/send', body);

            // SendGrid returns 202 for success
            const messageId = response.headers['x-message-id'];

            logger.info(`SendGrid email sent: ${messageId || 'success'}`);

            return {
                success: true,
                messageId,
            };
        } catch (error: any) {
            logger.error('SendGrid error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.errors?.[0]?.message || error.message,
            };
        }
    }
}
