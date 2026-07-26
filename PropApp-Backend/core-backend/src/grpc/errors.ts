/**
 * gRPC error mapping
 *
 * Translates the backend's AppError taxonomy into gRPC status codes so the
 * AI service (the only gRPC caller) sees the same semantic outcome that an
 * HTTP client would, just expressed in gRPC's wire vocabulary.
 */

import { status as GrpcStatus, ServiceError } from '@grpc/grpc-js';
import { AppError } from '../common/utils/errors';
import { logger } from '../common/utils/logger';

const HTTP_TO_GRPC: Record<number, GrpcStatus> = {
    400: GrpcStatus.INVALID_ARGUMENT,
    401: GrpcStatus.UNAUTHENTICATED,
    402: GrpcStatus.FAILED_PRECONDITION,
    403: GrpcStatus.PERMISSION_DENIED,
    404: GrpcStatus.NOT_FOUND,
    409: GrpcStatus.ALREADY_EXISTS,
    422: GrpcStatus.INVALID_ARGUMENT,
    429: GrpcStatus.RESOURCE_EXHAUSTED,
    500: GrpcStatus.INTERNAL,
    502: GrpcStatus.UNAVAILABLE,
    503: GrpcStatus.UNAVAILABLE,
};

export function toGrpcError(err: unknown): Partial<ServiceError> {
    if (err instanceof AppError) {
        const code = HTTP_TO_GRPC[err.statusCode] ?? GrpcStatus.UNKNOWN;
        const details = err.details
            ? `${err.code}: ${err.message} (${JSON.stringify(err.details)})`
            : `${err.code}: ${err.message}`;
        return {
            code,
            message: details,
            metadata: undefined,
        };
    }

    logger.error('Unmapped error in gRPC handler', err as Error);
    const e = err as Error;
    return {
        code: GrpcStatus.INTERNAL,
        message: e?.message ?? 'Internal server error',
    };
}
