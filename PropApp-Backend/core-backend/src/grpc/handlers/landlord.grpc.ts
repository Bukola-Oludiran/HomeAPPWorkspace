/**
 * Landlord gRPC handlers — approve/reject applicants, request payout, create job.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { landlordService } from '../../modules/landlord/landlord.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';

interface ApplicantRequest { application_id: string; request_id?: string }
interface RejectApplicantRequest { application_id: string; reason?: string; request_id?: string }
interface RequestPayoutRequest { amount: number; bank_account_id?: string; request_id?: string }
interface PayoutRef { payout_id: string; status: string }
interface CreateJobRequest {
    job_type: string;
    property_id: string;
    scheduled_date?: string;
    payout_amount?: number;
    notes?: string;
    request_id?: string;
}
interface JobRef { job_id: string }
interface BatchResult { message: string }

export const approveApplicant: handleUnaryCall<ApplicantRequest, BatchResult> = async (
    call: ServerUnaryCall<ApplicantRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = await landlordService.approveApplicant(ctx.userId, call.request.application_id);
        callback(null, { message: r.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const rejectApplicant: handleUnaryCall<RejectApplicantRequest, BatchResult> = async (
    call: ServerUnaryCall<RejectApplicantRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await landlordService.rejectApplicant(
            ctx.userId,
            r.application_id,
            { reason: r.reason } as never
        );
        callback(null, { message: result.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const requestLandlordPayout: handleUnaryCall<RequestPayoutRequest, PayoutRef> = async (
    call: ServerUnaryCall<RequestPayoutRequest, PayoutRef>,
    callback: sendUnaryData<PayoutRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await landlordService.requestPayout(ctx.userId, {
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

export const createLandlordJob: handleUnaryCall<CreateJobRequest, JobRef> = async (
    call: ServerUnaryCall<CreateJobRequest, JobRef>,
    callback: sendUnaryData<JobRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await landlordService.createJob(ctx.userId, {
            jobType: r.job_type,
            propertyId: r.property_id,
            scheduledDate: r.scheduled_date,
            payoutAmount: r.payout_amount,
            notes: r.notes,
        } as never);
        callback(null, { job_id: result.jobId });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const landlordHandlers = {
    ApproveApplicant: approveApplicant,
    RejectApplicant: rejectApplicant,
    RequestLandlordPayout: requestLandlordPayout,
    CreateLandlordJob: createLandlordJob,
};
