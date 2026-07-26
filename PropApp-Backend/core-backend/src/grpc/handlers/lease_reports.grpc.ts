/**
 * Lease document / financial report generation gRPC handlers.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { leaseReportsService } from '../../modules/documents/lease-reports.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface GenerateLeaseRequest { lease_id: string; template?: string; request_id?: string }
interface GenerateReportRequest {
    report_type: string;
    start_date: string;
    end_date: string;
    property_id?: string;
    request_id?: string;
}
interface ReportRef { id: string; status: string; download_url?: string }

export const generateLeaseDocument: handleUnaryCall<GenerateLeaseRequest, ReportRef> = async (
    call: ServerUnaryCall<GenerateLeaseRequest, ReportRef>,
    callback: sendUnaryData<ReportRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const result = await leaseReportsService.generateLeaseDocument(
            ctx.userId,
            call.request.lease_id,
            { template: call.request.template } as never
        );
        callback(null, {
            id: (result as any).id ?? '',
            status: (result as any).status ?? 'GENERATING',
            download_url: (result as any).downloadUrl,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const generateFinancialReport: handleUnaryCall<GenerateReportRequest, ReportRef> = async (
    call: ServerUnaryCall<GenerateReportRequest, ReportRef>,
    callback: sendUnaryData<ReportRef>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const result = await leaseReportsService.generateFinancialReport(ctx.userId, {
            reportType: r.report_type,
            startDate: r.start_date,
            endDate: r.end_date,
            propertyId: r.property_id,
        } as never);
        callback(null, {
            id: (result as any).id ?? '',
            status: (result as any).status ?? 'GENERATING',
            download_url: (result as any).downloadUrl,
        });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const leaseReportsHandlers = {
    GenerateLeaseDocument: generateLeaseDocument,
    GenerateFinancialReport: generateFinancialReport,
};
