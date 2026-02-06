/**
 * Banking Service
 * API calls for bank utilities and payment methods
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Bank {
    code: string;
    name: string;
}

export interface ResolvedBankAccount {
    accountName: string;
    accountNumber: string;
    bankCode: string;
}

export interface PaymentMethod {
    id: string;
    type: string;
    last4?: string;
    brand?: string;
    isDefault: boolean;
    createdAt: string;
}

export interface AddPaymentMethodRequest {
    type: string;
    token?: string;
}

/**
 * List supported banks
 */
export async function getBanks() {
    return api.get<Bank[]>(API_ENDPOINTS.BANKING.BANKS);
}

/**
 * Resolve/verify a bank account
 */
export async function resolveBankAccount(data: { bankCode: string; accountNumber: string }) {
    return api.post<ResolvedBankAccount>(API_ENDPOINTS.BANKING.RESOLVE, data);
}

/**
 * Get user's payment methods
 */
export async function getPaymentMethods() {
    return api.get<PaymentMethod[]>(API_ENDPOINTS.BANKING.PAYMENT_METHODS);
}

/**
 * Add a payment method
 */
export async function addPaymentMethod(data: AddPaymentMethodRequest) {
    return api.post<PaymentMethod>(API_ENDPOINTS.BANKING.PAYMENT_METHODS, data);
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(id: string) {
    return api.put<{ message: string }>(API_ENDPOINTS.BANKING.PAYMENT_METHOD_DEFAULT(id));
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.BANKING.PAYMENT_METHOD(id));
}

// Export all functions as named exports and as default object
export const bankingService = {
    getBanks,
    resolveBankAccount,
    getPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
};

export default bankingService;
