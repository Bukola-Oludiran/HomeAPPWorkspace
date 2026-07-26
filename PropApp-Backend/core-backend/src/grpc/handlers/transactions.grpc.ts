/**
 * Transactions gRPC handlers — InitiatePayment wraps
 * transactionService.initiatePayment. This is the most security-sensitive
 * surface on the AI write path: amounts are server-validated by the
 * service, payment-provider integration happens server-side, and the
 * client receives a payment URL to complete the flow externally.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { transactionService } from '../../modules/transactions/transactions.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface InitiatePaymentRequest {
    type: string;
    amount: number;
    currency: string;
    lease_id?: string;
    property_id?: string;
    payment_method?: string;
    description?: string;
    request_id?: string;
}

interface PaymentInitResultPb {
    transaction_id: string;
    payment_url?: string;
    reference?: string;
    status: string;
}

export const initiatePayment: handleUnaryCall<InitiatePaymentRequest, PaymentInitResultPb> =
    async (
        call: ServerUnaryCall<InitiatePaymentRequest, PaymentInitResultPb>,
        callback: sendUnaryData<PaymentInitResultPb>
    ) => {
        try {
            const ctx = await authenticateGrpc(call.metadata);
            const r = call.request;
            const result = await transactionService.initiatePayment(ctx.userId, {
                type: r.type,
                amount: r.amount,
                currency: r.currency,
                leaseId: r.lease_id,
                propertyId: r.property_id,
                paymentMethod: r.payment_method,
                description: r.description,
            } as never);
            callback(null, {
                transaction_id: (result as any).transactionId ?? (result as any).id,
                payment_url: (result as any).paymentUrl ?? undefined,
                reference: (result as any).reference ?? undefined,
                status: (result as any).status ?? 'PENDING',
            });
        } catch (err) {
            callback(toGrpcError(err) as never, null);
        }
    };

export const transactionsHandlers = {
    InitiatePayment: initiatePayment,
};
