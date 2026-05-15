/**
 * Payment Provider Interface
 * Abstraction layer for multi-region payment support
 */

// ============================================
// TYPES
// ============================================

export type PaymentMethod =
    | 'card'
    | 'bank_transfer'
    | 'ussd'
    | 'mobile_money'
    | 'qr'
    | 'open_banking';

export interface InitializePaymentParams {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    callbackUrl: string;
    metadata?: Record<string, unknown>;
    paymentMethod?: PaymentMethod;
    channels?: string[];
}

export interface PaymentInitResult {
    success: boolean;
    authorizationUrl?: string;
    accessCode?: string;
    reference: string;
    providerReference?: string;
}

export interface PaymentVerifyResult {
    success: boolean;
    status: 'success' | 'failed' | 'pending' | 'abandoned';
    amount: number;
    currency: string;
    reference: string;
    providerReference: string;
    paidAt?: Date;
    channel?: string;
    metadata?: Record<string, unknown>;
}

export interface CreateRecipientParams {
    type: 'nuban' | 'mobile_money' | 'basa';
    name: string;
    accountNumber: string;
    bankCode: string;
    currency: string;
}

export interface RecipientResult {
    success: boolean;
    recipientCode: string;
    name: string;
}

export interface TransferParams {
    amount: number;
    recipientCode: string;
    reason?: string;
    reference?: string;
}

export interface TransferResult {
    success: boolean;
    transferCode: string;
    status: string;
    reference: string;
}

export interface RefundParams {
    transactionReference: string;
    amount?: number; // Partial refund if specified
    reason?: string;
}

export interface RefundResult {
    success: boolean;
    refundReference: string;
    amount: number;
    status: string;
}

export interface WebhookEvent {
    event: string;
    data: Record<string, unknown>;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface PaymentProvider {
    readonly providerId: string;
    readonly supportedRegions: string[];
    readonly supportedMethods: PaymentMethod[];

    // Core Operations
    initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult>;
    verifyPayment(reference: string): Promise<PaymentVerifyResult>;

    // Transfers/Payouts
    createRecipient(params: CreateRecipientParams): Promise<RecipientResult>;
    initiateTransfer(params: TransferParams): Promise<TransferResult>;

    // Refunds
    initiateRefund(params: RefundParams): Promise<RefundResult>;

    // Webhooks
    validateWebhook(payload: unknown, signature: string): boolean;
    parseWebhookEvent(payload: unknown): WebhookEvent;
}
