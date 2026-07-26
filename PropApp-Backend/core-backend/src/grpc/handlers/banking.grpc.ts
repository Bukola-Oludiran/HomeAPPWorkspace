/**
 * Banking gRPC handlers.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { bankingService } from '../../modules/banking/banking.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface ResolveRequest { bank_code: string; account_number: string }
interface ResolveResult { account_name: string; bank_code: string; account_number: string }
interface AddRequest { bank_code: string; account_number: string; make_default?: boolean; request_id?: string }
interface BankAccountRef {
    id: string;
    bank_name: string;
    masked_account_number: string;
    account_name: string;
    is_default: boolean;
}
interface IdRequest { id: string; request_id?: string }
interface BatchResult { message: string }
interface RequestPayout { amount: number; bank_account_id?: string; request_id?: string }
interface PayoutRef { payout_id: string; status: string }

export const resolveBankAccount: handleUnaryCall<ResolveRequest, ResolveResult> = async (
    call: ServerUnaryCall<ResolveRequest, ResolveResult>,
    callback: sendUnaryData<ResolveResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await bankingService.resolveBankAccount(
            r.bank_code,
            r.account_number,
            ctx.regionCode
        );
        callback(null, {
            account_name: (result as any).accountName ?? '',
            bank_code: (result as any).bankCode ?? r.bank_code,
            account_number: (result as any).accountNumber ?? r.account_number,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const addBankAccount: handleUnaryCall<AddRequest, BankAccountRef> = async (
    call: ServerUnaryCall<AddRequest, BankAccountRef>,
    callback: sendUnaryData<BankAccountRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await bankingService.addBankAccount(
            ctx.userId,
            {
                bankCode: r.bank_code,
                accountNumber: r.account_number,
                makeDefault: r.make_default,
            } as never,
            ctx.regionCode
        );
        callback(null, {
            id: (result as any).id,
            bank_name: (result as any).bankName ?? '',
            masked_account_number: (result as any).maskedAccountNumber ?? '',
            account_name: (result as any).accountName ?? '',
            is_default: (result as any).isDefault ?? false,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const setDefaultBankAccount: handleUnaryCall<IdRequest, BatchResult> = async (
    call: ServerUnaryCall<IdRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        await bankingService.setDefaultBankAccount(ctx.userId, call.request.id);
        callback(null, { message: 'Bank account set as default' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const deleteBankAccount: handleUnaryCall<IdRequest, BatchResult> = async (
    call: ServerUnaryCall<IdRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        await bankingService.deleteBankAccount(ctx.userId, call.request.id);
        callback(null, { message: 'Bank account removed' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const requestBankingPayout: handleUnaryCall<RequestPayout, PayoutRef> = async (
    call: ServerUnaryCall<RequestPayout, PayoutRef>,
    callback: sendUnaryData<PayoutRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await bankingService.requestPayout(ctx.userId, {
            amount: r.amount,
            bankAccountId: r.bank_account_id,
        } as never);
        callback(null, {
            payout_id: (result as any).payoutId ?? (result as any).id ?? '',
            status: (result as any).status ?? 'PENDING',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const bankingHandlers = {
    ResolveBankAccount: resolveBankAccount,
    AddBankAccount: addBankAccount,
    SetDefaultBankAccount: setDefaultBankAccount,
    DeleteBankAccount: deleteBankAccount,
    RequestBankingPayout: requestBankingPayout,
};
