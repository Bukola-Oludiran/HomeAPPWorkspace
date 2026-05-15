/**
 * Mock Payment Provider
 * For development and testing without real Paystack/Flutterwave
 */

import { v4 as uuidv4 } from 'uuid';
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
import { logger } from '../../common/utils/logger';

// In-memory storage for mock payments
const mockPayments = new Map<string, { params: InitializePaymentParams; status: 'pending' | 'success' | 'failed' }>();
const mockRecipients = new Map<string, CreateRecipientParams>();

export class MockPaymentProvider implements PaymentProvider {
    readonly providerId = 'mock';
    readonly supportedRegions = ['NG', 'GH', 'KE', 'ZA', 'GB', 'US'];
    readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'mobile_money'];

    async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
        const reference = params.reference || `mock_${uuidv4().split('-')[0]}`;

        // Store payment for later verification
        mockPayments.set(reference, { params, status: 'pending' });

        logger.info(`[MockPayment] Initialized payment: ${reference} for ${params.currency} ${params.amount}`);

        return {
            success: true,
            authorizationUrl: `http://localhost:3000/mock-payment?ref=${reference}`,
            accessCode: `AC_${uuidv4().split('-')[0]}`,
            reference,
            providerReference: `MOCK_${uuidv4().split('-')[0]}`,
        };
    }

    async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
        const payment = mockPayments.get(reference);

        if (!payment) {
            return {
                success: false,
                status: 'failed',
                amount: 0,
                currency: 'NGN',
                reference,
                providerReference: '',
            };
        }

        // Simulate successful payment after initialization
        payment.status = 'success';

        logger.info(`[MockPayment] Verified payment: ${reference} - SUCCESS`);

        return {
            success: true,
            status: 'success',
            amount: payment.params.amount,
            currency: payment.params.currency,
            reference,
            providerReference: `MOCK_TXN_${uuidv4().split('-')[0]}`,
            paidAt: new Date(),
            channel: 'card',
            metadata: payment.params.metadata,
        };
    }

    async createRecipient(params: CreateRecipientParams): Promise<RecipientResult> {
        const recipientCode = `RCP_${uuidv4().split('-')[0]}`;

        mockRecipients.set(recipientCode, params);

        logger.info(`[MockPayment] Created recipient: ${recipientCode} - ${params.name}`);

        return {
            success: true,
            recipientCode,
            name: params.name,
        };
    }

    async initiateTransfer(params: TransferParams): Promise<TransferResult> {
        const reference = params.reference || `TRF_${uuidv4().split('-')[0]}`;

        logger.info(`[MockPayment] Initiated transfer: ${reference} - ${params.amount} to ${params.recipientCode}`);

        return {
            success: true,
            transferCode: `TRF_${uuidv4().split('-')[0]}`,
            status: 'success',
            reference,
        };
    }

    async initiateRefund(params: RefundParams): Promise<RefundResult> {
        const payment = mockPayments.get(params.transactionReference);
        const amount = params.amount || (payment?.params.amount || 0);

        logger.info(`[MockPayment] Initiated refund: ${params.transactionReference} - ${amount}`);

        return {
            success: true,
            refundReference: `REF_${uuidv4().split('-')[0]}`,
            amount,
            status: 'success',
        };
    }

    validateWebhook(_payload: unknown, _signature: string): boolean {
        // Always valid for mock
        return true;
    }

    parseWebhookEvent(payload: unknown): WebhookEvent {
        const data = payload as Record<string, unknown>;
        return {
            event: (data.event as string) || 'charge.success',
            data: data.data as Record<string, unknown> || {},
        };
    }
}

// Singleton instance
export const mockPaymentProvider = new MockPaymentProvider();
