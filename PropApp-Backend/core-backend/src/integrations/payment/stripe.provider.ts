/**
 * Stripe Payment Provider
 * Implements PaymentProvider interface for Canada (CAD/USD)
 * Per HomeAI-Canada-Integrations.md Section 2
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

export class StripeProvider implements PaymentProvider {
    readonly providerId = 'stripe';
    readonly supportedRegions = ['CA', 'US', 'GB', 'EU'];
    readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'open_banking'];

    private secretKey: string;
    private webhookSecret?: string;

    constructor(secretKey: string, webhookSecret?: string) {
        this.secretKey = secretKey;
        this.webhookSecret = webhookSecret;

        logger.info('Stripe provider initialized');
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
    }

    private async request(method: 'GET' | 'POST', endpoint: string, data?: Record<string, unknown>) {
        const url = `https://api.stripe.com/v1${endpoint}`;

        if (method === 'GET') {
            const response = await axios.get(url, { headers: this.getHeaders() });
            return response.data;
        }

        // Convert object to URL-encoded form data
        const formData = new URLSearchParams();
        if (data) {
            this.flattenObject(data, formData);
        }

        const response = await axios.post(url, formData.toString(), { headers: this.getHeaders() });
        return response.data;
    }

    private flattenObject(obj: Record<string, unknown>, formData: URLSearchParams, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}[${key}]` : key;

            if (value !== undefined && value !== null) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    this.flattenObject(value as Record<string, unknown>, formData, fullKey);
                } else {
                    formData.append(fullKey, String(value));
                }
            }
        }
    }

    async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
        try {
            // Create a Checkout Session
            const session = await this.request('POST', '/checkout/sessions', {
                mode: 'payment',
                success_url: params.callbackUrl + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: params.callbackUrl + '?cancelled=true',
                customer_email: params.email,
                client_reference_id: params.reference,
                currency: (params.currency || 'CAD').toLowerCase(),
                line_items: [
                    {
                        price_data: {
                            currency: (params.currency || 'CAD').toLowerCase(),
                            unit_amount: Math.round(params.amount * 100), // Convert to cents
                            product_data: {
                                name: (params.metadata?.description as string) || 'Payment',
                            },
                        },
                        quantity: 1,
                    },
                ],
                metadata: params.metadata,
                payment_method_types: this.mapPaymentMethods(params.paymentMethod),
            });

            logger.info(`Stripe checkout session created: ${session.id}`);

            return {
                success: true,
                authorizationUrl: session.url,
                accessCode: session.id,
                reference: params.reference,
                providerReference: session.id,
            };
        } catch (error: any) {
            logger.error('Stripe initialize error:', error.response?.data || error.message);
            return {
                success: false,
                reference: params.reference,
            };
        }
    }

    async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
        try {
            // Try to retrieve as checkout session first
            let data: any;

            try {
                data = await this.request('GET', `/checkout/sessions/${reference}`);
            } catch {
                // Try as payment intent
                data = await this.request('GET', `/payment_intents/${reference}`);
            }

            const status = this.mapStatus(data.status || data.payment_status);

            logger.info(`Stripe payment verified: ${reference} - ${status}`);

            return {
                success: status === 'success',
                status,
                amount: (data.amount_total || data.amount) / 100,
                currency: (data.currency || 'cad').toUpperCase(),
                reference: data.client_reference_id || reference,
                providerReference: data.id,
                paidAt: data.created ? new Date(data.created * 1000) : undefined,
                channel: data.payment_method_types?.[0] || 'card',
                metadata: data.metadata,
            };
        } catch (error: any) {
            logger.error('Stripe verify error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'failed',
                amount: 0,
                currency: 'CAD',
                reference,
                providerReference: '',
            };
        }
    }

    async createRecipient(params: CreateRecipientParams): Promise<RecipientResult> {
        try {
            // Create a Connect account for payouts
            const account = await this.request('POST', '/accounts', {
                type: 'custom',
                country: 'CA',
                capabilities: {
                    transfers: { requested: true },
                },
                external_account: {
                    object: 'bank_account',
                    country: 'CA',
                    currency: params.currency || 'cad',
                    account_holder_name: params.name,
                    account_number: params.accountNumber,
                    routing_number: params.bankCode, // Transit + Institution number
                },
            });

            logger.info(`Stripe Connect account created: ${account.id}`);

            return {
                success: true,
                recipientCode: account.id,
                name: params.name,
            };
        } catch (error: any) {
            logger.error('Stripe create recipient error:', error.response?.data || error.message);
            return {
                success: false,
                recipientCode: '',
                name: params.name,
            };
        }
    }

    async initiateTransfer(params: TransferParams): Promise<TransferResult> {
        try {
            const transfer = await this.request('POST', '/transfers', {
                amount: Math.round(params.amount * 100),
                currency: 'cad',
                destination: params.recipientCode,
                description: params.reason || 'Payout',
                metadata: {
                    reference: params.reference,
                },
            });

            logger.info(`Stripe transfer initiated: ${transfer.id}`);

            return {
                success: true,
                transferCode: transfer.id,
                status: transfer.status || 'pending',
                reference: params.reference || transfer.id,
            };
        } catch (error: any) {
            logger.error('Stripe transfer error:', error.response?.data || error.message);
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
            const refund = await this.request('POST', '/refunds', {
                payment_intent: params.transactionReference,
                amount: params.amount ? Math.round(params.amount * 100) : undefined,
                reason: 'requested_by_customer',
                metadata: {
                    note: params.reason,
                },
            });

            logger.info(`Stripe refund initiated: ${refund.id}`);

            return {
                success: true,
                refundReference: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
            };
        } catch (error: any) {
            logger.error('Stripe refund error:', error.response?.data || error.message);
            return {
                success: false,
                refundReference: '',
                amount: 0,
                status: 'failed',
            };
        }
    }

    validateWebhook(payload: unknown, signature: string): boolean {
        if (!this.webhookSecret) {
            logger.warn('Stripe webhook secret not configured');
            return false;
        }

        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

        const elements = signature.split(',');
        const timestamp = elements.find(e => e.startsWith('t='))?.slice(2);
        const sig = elements.find(e => e.startsWith('v1='))?.slice(3);

        if (!timestamp || !sig) {
            return false;
        }

        const expectedSig = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(`${timestamp}.${payloadString}`)
            .digest('hex');

        return sig === expectedSig;
    }

    parseWebhookEvent(payload: unknown): WebhookEvent {
        const data = payload as Record<string, unknown>;
        return {
            event: data.type as string,
            data: data.data as Record<string, unknown>,
        };
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private mapPaymentMethods(method?: PaymentMethod): string[] {
        if (!method) return ['card'];

        const mapping: Record<PaymentMethod, string[]> = {
            card: ['card'],
            bank_transfer: ['acss_debit'], // Canadian pre-authorized debit
            ussd: ['card'],
            mobile_money: ['card'],
            qr: ['card'],
            open_banking: ['link'],
        };

        return mapping[method] || ['card'];
    }

    private mapStatus(status: string): 'success' | 'failed' | 'pending' | 'abandoned' {
        switch (status?.toLowerCase()) {
            case 'complete':
            case 'succeeded':
            case 'paid':
                return 'success';
            case 'canceled':
            case 'failed':
                return 'failed';
            case 'expired':
                return 'abandoned';
            default:
                return 'pending';
        }
    }
}
