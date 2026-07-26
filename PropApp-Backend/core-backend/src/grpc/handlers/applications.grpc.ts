/**
 * Applications gRPC handlers — wrap tenantService.submitApplication and
 * tenantService.withdrawApplication.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { tenantService } from '../../modules/tenant/tenant.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';

interface SubmitRequest {
    property_id: string;
    move_in_date?: string;
    lease_term_months?: number;
    additional_notes?: string;
    request_id?: string;
}
interface SubmitResponse {
    application_id: string;
    message: string;
}
interface WithdrawRequest {
    application_id: string;
    request_id?: string;
}
interface BatchResult {
    message: string;
}

export const submitApplication: handleUnaryCall<SubmitRequest, SubmitResponse> = async (
    call: ServerUnaryCall<SubmitRequest, SubmitResponse>,
    callback: sendUnaryData<SubmitResponse>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'TENANT', 'ADMIN');
        const r = call.request;
        const result = await tenantService.submitApplication(ctx.userId, {
            propertyId: r.property_id,
            moveInDate: r.move_in_date,
            leaseTerm: r.lease_term_months,
            additionalNotes: r.additional_notes,
        } as never);
        callback(null, {
            application_id: result.applicationId,
            message: result.message,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const withdrawApplication: handleUnaryCall<WithdrawRequest, BatchResult> = async (
    call: ServerUnaryCall<WithdrawRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'TENANT', 'ADMIN');
        const r = await tenantService.withdrawApplication(
            ctx.userId,
            call.request.application_id
        );
        callback(null, { message: r.message });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const applicationsHandlers = {
    SubmitApplication: submitApplication,
    WithdrawApplication: withdrawApplication,
};
