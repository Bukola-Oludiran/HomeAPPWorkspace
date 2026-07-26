/**
 * Agent gRPC handlers — accept/decline/complete jobs, withdraw earnings.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { agentService } from '../../modules/agent/agent.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';

interface JobAction { job_id: string; note?: string; request_id?: string }
interface DeclineJob { job_id: string; reason: string; request_id?: string }
interface CompleteJob { job_id: string; completion_notes?: string; request_id?: string }
interface Withdraw { amount: number; bank_account_id: string; request_id?: string }
interface BatchResult { message: string }
interface PayoutRef { payout_id: string; status: string }

export const acceptJob: handleUnaryCall<JobAction, BatchResult> = async (
    call: ServerUnaryCall<JobAction, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'AGENT', 'ADMIN');
        const r = await agentService.acceptJob(ctx.userId, call.request.job_id, {
            note: call.request.note,
        } as never);
        callback(null, { message: r.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const declineJob: handleUnaryCall<DeclineJob, BatchResult> = async (
    call: ServerUnaryCall<DeclineJob, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'AGENT', 'ADMIN');
        const r = await agentService.declineJob(ctx.userId, call.request.job_id, {
            reason: call.request.reason,
        } as never);
        callback(null, { message: r.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const completeJob: handleUnaryCall<CompleteJob, BatchResult> = async (
    call: ServerUnaryCall<CompleteJob, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'AGENT', 'ADMIN');
        const r = await agentService.completeJob(ctx.userId, call.request.job_id, {
            completionNotes: call.request.completion_notes,
        } as never);
        callback(null, { message: r.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const withdrawEarnings: handleUnaryCall<Withdraw, PayoutRef> = async (
    call: ServerUnaryCall<Withdraw, PayoutRef>,
    callback: sendUnaryData<PayoutRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'AGENT', 'ADMIN');
        const result = await agentService.withdrawEarnings(ctx.userId, {
            amount: call.request.amount,
            bankAccountId: call.request.bank_account_id,
        } as never);
        callback(null, {
            payout_id: (result as any).payoutId ?? (result as any).id ?? '',
            status: (result as any).status ?? 'PENDING',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const agentHandlers = {
    AcceptJob: acceptJob,
    DeclineJob: declineJob,
    CompleteJob: completeJob,
    WithdrawEarnings: withdrawEarnings,
};
