/**
 * Transaction Service
 * API calls for payment transactions, escrow, and refunds
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    paymentMethod?: string;
    reference?: string;
    leaseId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InitiatePaymentRequest {
    amount: number;
    currency?: string;
    type: string;
    paymentMethod: string;
    leaseId?: string;
}

export interface InitiatePaymentResponse {
    transactionId: string;
    paymentUrl: string;
    reference: string;
    provider: string;
}

export interface VerifyPaymentRequest {
    reference: string;
    provider: string;
}

export interface CreateEscrowRequest {
    amount: number;
    currency?: string;
    leaseId: string;
    description?: string;
}

export interface ReleaseEscrowRequest {
    amount: number;
    releaseReason?: string;
}

export interface RefundRequest {
    amount: number;
    reason?: string;
}

/**
 * Get transaction history
 */
export async function getTransactions(params?: { type?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    return api.get<Transaction[]>(API_ENDPOINTS.TRANSACTIONS.LIST, params as Record<string, unknown>);
}

/**
 * Get transaction details
 */
export async function getTransactionById(id: string) {
    return api.get<Transaction>(API_ENDPOINTS.TRANSACTIONS.DETAIL(id));
}

/**
 * Initiate a payment
 */
export async function initiatePayment(data: InitiatePaymentRequest) {
    return api.post<InitiatePaymentResponse>(API_ENDPOINTS.TRANSACTIONS.PAY, data);
}

/**
 * Verify a payment
 */
export async function verifyPayment(data: VerifyPaymentRequest) {
    return api.post<{ success: boolean; transaction: Transaction }>(API_ENDPOINTS.TRANSACTIONS.VERIFY, data);
}

/**
 * Create an escrow
 */
export async function createEscrow(data: CreateEscrowRequest) {
    return api.post<{ escrowId: string; message: string }>(API_ENDPOINTS.TRANSACTIONS.ESCROW, data);
}

/**
 * Release escrow funds
 */
export async function releaseEscrow(id: string, data: ReleaseEscrowRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.TRANSACTIONS.ESCROW_RELEASE(id), data);
}

/**
 * Request a refund
 */
export async function requestRefund(id: string, data: RefundRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.TRANSACTIONS.REFUND(id), data);
}

// Export all functions as named exports and as default object
export const transactionService = {
    getTransactions,
    getTransactionById,
    initiatePayment,
    verifyPayment,
    createEscrow,
    releaseEscrow,
    requestRefund,
};

export default transactionService;
