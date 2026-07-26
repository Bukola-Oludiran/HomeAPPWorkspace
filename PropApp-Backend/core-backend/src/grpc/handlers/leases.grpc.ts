/**
 * Leases gRPC handlers — wrap leaseService.* methods.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { leaseService } from '../../modules/leases/leases.service';
import { authenticateGrpc, requireRole } from '../auth';
import { toGrpcError } from '../errors';

interface CreateLeaseRequest {
    property_id: string;
    tenant_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    security_deposit?: number;
    request_id?: string;
}
interface UpdateLeaseRequest {
    id: string;
    monthly_rent?: number;
    end_date?: string;
    request_id?: string;
}
interface SendRenewalOfferRequest {
    id: string;
    new_end_date: string;
    new_monthly_rent?: number;
    request_id?: string;
}
interface RespondToRenewalRequest {
    id: string;
    response: string;
    request_id?: string;
}
interface SignLeaseRequest {
    id: string;
    signature: string;
    request_id?: string;
}
interface LeaseRef {
    id: string;
    status: string;
}
interface BatchResult {
    message: string;
}

export const createLease: handleUnaryCall<CreateLeaseRequest, LeaseRef> = async (
    call: ServerUnaryCall<CreateLeaseRequest, LeaseRef>,
    callback: sendUnaryData<LeaseRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await leaseService.createLease(ctx.userId, {
            propertyId: r.property_id,
            tenantId: r.tenant_id,
            startDate: r.start_date,
            endDate: r.end_date,
            monthlyRent: r.monthly_rent,
            securityDeposit: r.security_deposit,
        } as never);
        callback(null, {
            id: (result as any).id,
            status: (result as any).status ?? 'DRAFT',
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const updateLease: handleUnaryCall<UpdateLeaseRequest, LeaseRef> = async (
    call: ServerUnaryCall<UpdateLeaseRequest, LeaseRef>,
    callback: sendUnaryData<LeaseRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await leaseService.updateLease(r.id, ctx.userId, {
            monthlyRent: r.monthly_rent,
            endDate: r.end_date,
        } as never);
        callback(null, {
            id: (result as any).id,
            status: (result as any).status,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const sendRenewalOffer: handleUnaryCall<SendRenewalOfferRequest, BatchResult> = async (
    call: ServerUnaryCall<SendRenewalOfferRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'LANDLORD', 'ADMIN');
        const r = call.request;
        const result = await leaseService.sendRenewalOffer(r.id, ctx.userId, {
            newEndDate: r.new_end_date,
            newMonthlyRent: r.new_monthly_rent,
        } as never);
        callback(null, { message: (result as any).message ?? 'Renewal offer sent' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const respondToRenewal: handleUnaryCall<RespondToRenewalRequest, BatchResult> = async (
    call: ServerUnaryCall<RespondToRenewalRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        requireRole(ctx, 'TENANT', 'ADMIN');
        const r = call.request;
        const result = await leaseService.respondToRenewal(r.id, ctx.userId, {
            response: r.response,
        } as never);
        callback(null, { message: (result as any).message ?? 'Response recorded' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const signLease: handleUnaryCall<SignLeaseRequest, BatchResult> = async (
    call: ServerUnaryCall<SignLeaseRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        if (ctx.role !== 'TENANT' && ctx.role !== 'LANDLORD' && ctx.role !== 'ADMIN') {
            throw new Error('Only tenants and landlords can sign leases');
        }
        const r = call.request;
        const role = ctx.role as 'TENANT' | 'LANDLORD';
        const result = await leaseService.signLease(r.id, ctx.userId, role, {
            signature: r.signature,
        } as never);
        callback(null, { message: (result as any).message ?? 'Lease signed' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const leasesHandlers = {
    CreateLease: createLease,
    UpdateLease: updateLease,
    SendRenewalOffer: sendRenewalOffer,
    RespondToRenewal: respondToRenewal,
    SignLease: signLease,
};
