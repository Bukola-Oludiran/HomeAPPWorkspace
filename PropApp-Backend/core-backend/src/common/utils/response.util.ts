/**
 * Standard API Response Utilities
 * Implements PRD Section 3.3 response format
 */

import { Response } from 'express';

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    meta?: PaginationMeta;
    error?: ApiError;
}

export interface PaginationMeta {
    page: number;
    limit?: number;
    total: number;
    totalPages: number;
    unreadCount?: number;
    hasMore?: boolean;
}

export interface ApiError {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
}

export interface ErrorDetail {
    field: string;
    message: string;
}

// ============================================
// SUCCESS RESPONSES
// ============================================

/**
 * Send a successful response with data
 * Supports two signatures:
 * - sendSuccess(res, data, statusCode?, meta?)
 * - sendSuccess(res, data, meta?) - when meta is an object
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    statusCodeOrMeta?: number | PaginationMeta,
    meta?: PaginationMeta
): Response {
    let statusCode = 200;
    let pagination: PaginationMeta | undefined;

    if (typeof statusCodeOrMeta === 'number') {
        statusCode = statusCodeOrMeta;
        pagination = meta;
    } else if (typeof statusCodeOrMeta === 'object') {
        pagination = statusCodeOrMeta;
    }

    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (pagination) {
        response.meta = pagination;
    }

    return res.status(statusCode).json(response);
}

/**
 * Send a successful response with pagination
 */
export function sendPaginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
): Response {
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, data, 200, {
        page,
        limit,
        total,
        totalPages,
    });
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(res: Response, data: T): Response {
    return sendSuccess(res, data, 201);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: Response): Response {
    return res.status(204).send();
}

// ============================================
// ERROR RESPONSES
// ============================================

/**
 * Send an error response
 */
export function sendError(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: ErrorDetail[]
): Response {
    const requestId = res.getHeader('X-Request-Id') as string | undefined;

    const response: ApiResponse = {
        success: false,
        error: {
            code,
            message,
            details,
            requestId,
        },
    };

    return res.status(statusCode).json(response);
}

/**
 * Send a 400 Bad Request error
 */
export function sendBadRequest(
    res: Response,
    message: string = 'Bad request',
    code: string = 'BAD_REQUEST',
    details?: ErrorDetail[]
): Response {
    return sendError(res, code, message, 400, details);
}

/**
 * Send a 401 Unauthorized error
 */
export function sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized',
    code: string = 'AUTH_001'
): Response {
    return sendError(res, code, message, 401);
}

/**
 * Send a 403 Forbidden error
 */
export function sendForbidden(
    res: Response,
    message: string = 'Access denied',
    code: string = 'AUTH_003'
): Response {
    return sendError(res, code, message, 403);
}

/**
 * Send a 404 Not Found error
 */
export function sendNotFound(
    res: Response,
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND'
): Response {
    return sendError(res, code, message, 404);
}

/**
 * Send a 409 Conflict error
 */
export function sendConflict(
    res: Response,
    message: string = 'Resource already exists',
    code: string = 'CONFLICT'
): Response {
    return sendError(res, code, message, 409);
}

/**
 * Send a 500 Internal Server Error
 */
export function sendServerError(
    res: Response,
    message: string = 'Internal server error',
    code: string = 'SERVER_ERROR'
): Response {
    return sendError(res, code, message, 500);
}

// ============================================
// VALIDATION ERROR HELPER
// ============================================

/**
 * Convert Zod errors to API error details
 */
export function formatValidationErrors(
    errors: { path: (string | number)[]; message: string }[]
): ErrorDetail[] {
    return errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
    }));
}
