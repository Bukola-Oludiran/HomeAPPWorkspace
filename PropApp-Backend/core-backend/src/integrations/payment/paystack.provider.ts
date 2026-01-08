/**
 * Paystack Payment Provider
 * Implements PaymentProvider interface for Nigeria (NGN)
 * Per PRD Section 14.2
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../../common/utils/logger';
import {
    PaymentProvider,
    PaymentMethod,
    InitializePaymentParams,
    PaymentInitResult,
    PaymentVerifyResult,
    CreateRecipientParams,
    RecipientResult,
    TransferParams,
    TransferResult,
    RefundParams,
    RefundResult,
    WebhookEvent,
} from './payment.interface';

export class PaystackProvider implements PaymentProvider {
    readonly providerId = 'paystack';
    readonly supportedRegions = ['NG', 'GH', 'ZA', 'KE'];
    readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money'];

    private client: AxiosInstance;
    private secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
        this.client = axios.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        logger.info('Paystack provider initialized');
    }

    async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
        try {
            const response = await this.client.post('/transaction/initialize', {
                email: params.email,
                amount: Math.round(params.amount * 100), // Convert to kobo
                reference: params.reference,
                callback_url: params.callbackUrl,
                currency: params.currency || 'NGN',
                channels: params.channels || this.mapPaymentMethod(params.paymentMethod),
                metadata: params.metadata,
            });

            const { data } = response.data;

            logger.info(`Paystack payment initialized: ${params.reference}`);

            return {
                success: true,
                authorizationUrl: data.authorization_url,
                accessCode: data.access_code,
                reference: data.reference,
            };
        } catch (error: any) {
            logger.error('Paystack initialize error:', error.response?.data || error.message);
            return {
                success: false,
                reference: params.reference,
            };
        }
    }

    async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
        try {
            const response = await this.client.get(`/transaction/verify/${reference}`);
            const { data } = response.data;

            const status = this.mapStatus(data.status);

            logger.info(`Paystack payment verified: ${reference} - ${status}`);

            return {
                success: status === 'success',
                status,
                amount: data.amount / 100, // Convert from kobo
                currency: data.currency,
                reference: data.reference,
                providerReference: data.id.toString(),
                paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
                channel: data.channel,
                metadata: data.metadata,
            };
        } catch (error: any) {
            logger.error('Paystack verify error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'failed',
                amount: 0,
                currency: 'NGN',
                reference,
                providerReference: '',
            };
        }
    }

    async createRecipient(params: CreateRecipientParams): Promise<RecipientResult> {
        try {
            const response = await this.client.post('/transferrecipient', {
                type: params.type,
                name: params.name,
                account_number: params.accountNumber,
                bank_code: params.bankCode,
                currency: params.currency || 'NGN',
            });

            const { data } = response.data;

            logger.info(`Paystack recipient created: ${data.recipient_code}`);

            return {
                success: true,
                recipientCode: data.recipient_code,
                name: data.name,
            };
        } catch (error: any) {
            logger.error('Paystack create recipient error:', error.response?.data || error.message);
            return {
                success: false,
                recipientCode: '',
                name: params.name,
            };
        }
    }

    async initiateTransfer(params: TransferParams): Promise<TransferResult> {
        try {
            const response = await this.client.post('/transfer', {
                source: 'balance',
                amount: Math.round(params.amount * 100), // Convert to kobo
                recipient: params.recipientCode,
                reason: params.reason || 'Payout',
                reference: params.reference,
            });

            const { data } = response.data;

            logger.info(`Paystack transfer initiated: ${data.transfer_code}`);

            return {
                success: true,
                transferCode: data.transfer_code,
                status: data.status,
                reference: data.reference,
            };
        } catch (error: any) {
            logger.error('Paystack transfer error:', error.response?.data || error.message);
            return {
                success: false,
                transferCode: '',
                status: 'failed',
                reference: params.reference || '',
            };
        }
    }

    async initiateRefund(params: RefundParams): Promise<RefundResult> {
        try {
            const response = await this.client.post('/refund', {
                transaction: params.transactionReference,
                amount: params.amount ? Math.round(params.amount * 100) : undefined,
                merchant_note: params.reason,
            });

            const { data } = response.data;

            logger.info(`Paystack refund initiated: ${data.id}`);

            return {
                success: true,
                refundReference: data.id.toString(),
                amount: data.amount / 100,
                status: data.status,
            };
        } catch (error: any) {
            logger.error('Paystack refund error:', error.response?.data || error.message);
            return {
                success: false,
                refundReference: '',
                amount: 0,
                status: 'failed',
            };
        }
    }

    validateWebhook(payload: unknown, signature: string): boolean {
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        return hash === signature;
    }

    parseWebhookEvent(payload: unknown): WebhookEvent {
        const data = payload as Record<string, unknown>;
        return {
            event: data.event as string,
            data: data.data as Record<string, unknown>,
        };
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private mapPaymentMethod(method?: PaymentMethod): string[] | undefined {
        if (!method) return undefined;

        const mapping: Record<PaymentMethod, string[]> = {
            card: ['card'],
            bank_transfer: ['bank_transfer'],
            ussd: ['ussd'],
            mobile_money: ['mobile_money'],
            qr: ['qr'],
            open_banking: ['bank'],
        };

        return mapping[method];
    }

    private mapStatus(status: string): 'success' | 'failed' | 'pending' | 'abandoned' {
        switch (status.toLowerCase()) {
            case 'success':
                return 'success';
            case 'failed':
                return 'failed';
            case 'pending':
                return 'pending';
            case 'abandoned':
                return 'abandoned';
            default:
                return 'pending';
        }
    }
}
