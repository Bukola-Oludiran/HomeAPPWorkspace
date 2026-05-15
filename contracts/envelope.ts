/**
 * Response envelope shapes shared between backend (sends) and frontend
 * (consumes). Backend implementation lives in
 * `PropApp-Backend/core-backend/src/common/utils/response.util.ts`.
 *
 * Wire shape contract:
 *   success: { success: true,  data: T, meta?: PaginationMeta }
 *   error:   { success: false, error: ApiError }
 */

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    /** Used by notifications endpoints to report total unread count. */
    unreadCount?: number;
    /** Cursor-style fallback; defaults to (page < totalPages). */
    hasMore?: boolean;
}

export interface ErrorDetail {
    field: string;
    message: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
}

export interface ApiResponseSuccess<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiResponseError {
    success: false;
    error: ApiError;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
