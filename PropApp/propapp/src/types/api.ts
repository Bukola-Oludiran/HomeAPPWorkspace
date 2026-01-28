/**
 * API Types
 * Generic types for API responses, pagination, and errors
 */

// Standard API response wrapper
export interface ApiResponse<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
}

// Pagination info for paginated responses
export interface PaginationInfo {
    total: number;
    page: number;
    totalPages: number;
}

// Paginated response (matches V4 backend format)
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationInfo;
}

// Pagination metadata (legacy, may still be used in meta)
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
}

// Pagination query params
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// API Error response
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Array<{
            field: string;
            message: string;
        }>;
    };
}

// Common error codes from backend
export type AuthErrorCode =
    | 'AUTH_001' // Invalid credentials
    | 'AUTH_002' // Token expired
    | 'AUTH_003' // Invalid token
    | 'AUTH_004' // Insufficient permissions
    | 'AUTH_005' // Email already registered
    | 'AUTH_006' // Invalid verification code
    | 'AUTH_007' // 2FA required
    | 'AUTH_008'; // Too many attempts

export type ValidationErrorCode =
    | 'VAL_001' // Validation failed
    | 'VAL_002' // Invalid request body
    | 'VAL_003'; // Missing required field

export type ResourceErrorCode =
    | 'RES_001' // Resource not found
    | 'RES_002' // Property not found
    | 'RES_003' // User not found
    | 'RES_004' // Lease not found
    | 'RES_005'; // Resource already exists

export type PaymentErrorCode =
    | 'PAY_001' // Payment failed
    | 'PAY_002' // Invalid payment method
    | 'PAY_003' // Insufficient funds
    | 'PAY_004' // Transaction not found
    | 'PAY_005'; // Compliance check failed

export type ErrorCode = AuthErrorCode | ValidationErrorCode | ResourceErrorCode | PaymentErrorCode | string;

// Generic request state for components
export interface RequestState<T> {
    data: T | null;
    isLoading: boolean;
    error: ApiError | null;
}

// Common date range filter
export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}
