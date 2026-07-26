/**
 * Documents gRPC handlers — only delete; uploads stay HTTP-only.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { documentsService } from '../../modules/documents/documents.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface DeleteRequest { id: string; request_id?: string }
interface BatchResult { message: string }

export const deleteDocument: handleUnaryCall<DeleteRequest, BatchResult> = async (
    call: ServerUnaryCall<DeleteRequest, BatchResult>,
    callback: sendUnaryData<BatchResult>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        await documentsService.deleteDocument(ctx.userId, call.request.id);
        callback(null, { message: 'Document deleted' });
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const documentsHandlers = {
    DeleteDocument: deleteDocument,
};
