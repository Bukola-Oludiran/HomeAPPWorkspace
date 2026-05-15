/**
 * Response envelope shapes shared between backend (sends) and frontend
 * (consumes). Backend implementation lives in
 * `PropApp-Backend/core-backend/src/common/utils/response.util.ts`.
 *
 * Wire shape contract:
 *   success: { success: true,  data: T, meta?: PaginationMeta }
 *   error:   { success: false, error: ApiError }
 *
 * Zod schemas are also exported so the OpenAPI generator can describe
 * every response with the envelope wrap.
 */

import { z } from 'zod';

// ============================================
// ZOD SCHEMAS
// ============================================

export const paginationMetaSchema = z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    unreadCount: z.number().int().min(0).optional(),
    hasMore: z.boolean().optional(),
});

export const errorDetailSchema = z.object({
    field: z.string(),
    message: z.string(),
});

export const apiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(errorDetailSchema).optional(),
    requestId: z.string().optional(),
});

export const apiResponseErrorSchema = z.object({
    success: z.literal(false),
    error: apiErrorSchema,
});

/**
 * Wraps a data schema in the standard `{ success: true, data: T, meta? }`
 * envelope. Use this in path registrations to describe a 2xx response.
 */
export const apiResponseSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema,
        meta: paginationMetaSchema.optional(),
    });

/**
 * Wraps an item schema as a paginated list response: data is an array
 * and meta is always present.
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        success: z.literal(true),
        data: z.array(itemSchema),
        meta: paginationMetaSchema,
    });

// ============================================
// INFERRED TYPES (preferred — existing imports
// from this module continue to resolve.)
// ============================================

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ErrorDetail = z.infer<typeof errorDetailSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiResponseError = z.infer<typeof apiResponseErrorSchema>;

export interface ApiResponseSuccess<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
