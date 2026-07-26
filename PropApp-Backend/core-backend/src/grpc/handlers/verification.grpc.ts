/**
 * Verification gRPC handlers.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { verificationService } from '../../modules/verification/verification.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';

interface SubmitIdentity { document_type: string; document_number: string; document_url?: string; request_id?: string }
interface SubmitDocument { document_url: string; document_type?: string; request_id?: string }
interface SubmitPropertyDocument { property_id: string; document_url: string; request_id?: string }
interface RequestPropertyAudit { property_id: string; preferred_date?: string; notes?: string; request_id?: string }
interface VerificationRef { id: string; status: string }

export const submitIdentity: handleUnaryCall<SubmitIdentity, VerificationRef> = async (
    call: ServerUnaryCall<SubmitIdentity, VerificationRef>,
    callback: sendUnaryData<VerificationRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await verificationService.submitIdentityVerification(ctx.userId, {
            documentType: r.document_type,
            documentNumber: r.document_number,
            documentUrl: r.document_url,
        } as never);
        callback(null, {
            id: (result as any).id ?? '',
            status: (result as any).status ?? 'PENDING',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const submitAddress: handleUnaryCall<SubmitDocument, VerificationRef> = async (
    call: ServerUnaryCall<SubmitDocument, VerificationRef>,
    callback: sendUnaryData<VerificationRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await verificationService.submitAddressVerification(ctx.userId, {
            documentUrl: r.document_url,
            documentType: r.document_type,
        } as never);
        callback(null, {
            id: (result as any).id ?? '',
            status: (result as any).status ?? 'PENDING',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const submitCofo: handleUnaryCall<SubmitPropertyDocument, VerificationRef> = async (
    call: ServerUnaryCall<SubmitPropertyDocument, VerificationRef>,
    callback: sendUnaryData<VerificationRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await verificationService.submitCofoVerification(
            r.property_id,
            ctx.userId,
            { documentUrl: r.document_url } as never
        );
        callback(null, {
            id: (result as any).id ?? '',
            status: (result as any).status ?? 'PENDING',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const requestPropertyVerificationAudit: handleUnaryCall<RequestPropertyAudit, VerificationRef> =
    async (
        call: ServerUnaryCall<RequestPropertyAudit, VerificationRef>,
        callback: sendUnaryData<VerificationRef>
    ) => {
        try {
            const ctx = await authenticateGrpc(call.metadata);
            requireRole(ctx, 'LANDLORD', 'ADMIN');
            const r = call.request;
            const result = await verificationService.requestPropertyVerification(
                r.property_id,
                ctx.userId,
                {
                    preferredDate: r.preferred_date,
                    notes: r.notes,
                } as never
            );
            callback(null, {
                id: (result as any).id ?? '',
                status: (result as any).status ?? 'PENDING',
            });
        } catch (err) {
            callback(toGrpcError(err) as never, null);
        }
    };

export const verificationHandlers = {
    SubmitIdentityVerification: submitIdentity,
    SubmitAddressVerification: submitAddress,
    SubmitCofoVerification: submitCofo,
    RequestPropertyVerificationAudit: requestPropertyVerificationAudit,
};
