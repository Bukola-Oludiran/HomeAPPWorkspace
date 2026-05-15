/**
 * OpenAPI registry — shared helpers for describing every API endpoint
 * via the existing Zod schemas. Each domain contract exports a
 * `register<Domain>Paths(registry)` function that the backend's
 * `src/config/openapi.ts` calls at boot to assemble the full spec.
 *
 * The contracts package owns:
 *   - `.openapi({ ref: 'X' })` metadata on shared schemas.
 *   - `registerXxxPaths` per domain (paths, request bodies, response
 *     envelopes, security requirements).
 *
 * The backend owns:
 *   - The generator instance (`OpenApiGeneratorV31`) + the final
 *     document assembly (info, servers, tags, security scheme).
 *
 * Splitting it this way keeps the wire spec next to the schema source
 * of truth while letting deploy-time concerns (server URL, version,
 * etc.) live in the backend.
 */

import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
    apiResponseErrorSchema,
    apiResponseSuccessSchema,
    paginatedResponseSchema,
} from './envelope';

// Mutate the global `z` so every schema across every contract module
// gains the `.openapi()` method. Side-effect, but ergonomic — callers
// just `import { z } from 'zod'` as usual.
extendZodWithOpenApi(z);

// ============================================
// SECURITY SCHEME REFERENCE
// ============================================

/** Reference name the backend wires into the `securitySchemes` block. */
export const BEARER_AUTH_SCHEME = 'bearerAuth';

/** Apply to paths that require a Bearer JWT. */
export const requireBearerAuth = [{ [BEARER_AUTH_SCHEME]: [] }];

// ============================================
// SHARED ENVELOPE REGISTRATION
// ============================================

/**
 * Registers the shared envelope schemas so all generated path responses
 * can `$ref` them instead of inlining the same shape every time. Call
 * once during registry setup.
 */
export const registerEnvelopeSchemas = (registry: OpenAPIRegistry): void => {
    registry.register('PaginationMeta', apiResponseSuccessSchema(z.unknown()).shape.meta.unwrap());
    registry.register('ApiError', apiResponseErrorSchema.shape.error);
    registry.register('ApiResponseError', apiResponseErrorSchema);
};

// ============================================
// PATH HELPERS
// ============================================

/**
 * Standard error responses every protected/validated endpoint may emit.
 * Composed from the `apiResponseErrorSchema` so the rendered doc shows
 * the actual envelope shape, not a hand-rolled approximation.
 */
const errorResponse = (description: string) => ({
    description,
    content: {
        'application/json': { schema: apiResponseErrorSchema },
    },
});

export const STANDARD_ERROR_RESPONSES = {
    400: errorResponse('Validation failed — request body or query did not match the schema'),
    401: errorResponse('Authentication missing or invalid'),
    403: errorResponse('Authenticated user lacks permission for this resource'),
    404: errorResponse('Requested resource was not found'),
    500: errorResponse('Unhandled server error'),
} as const;

/**
 * Build a 2xx response that wraps `dataSchema` in the success envelope.
 */
export const successResponse = (
    description: string,
    dataSchema: z.ZodTypeAny
) => ({
    description,
    content: {
        'application/json': { schema: apiResponseSuccessSchema(dataSchema) },
    },
});

/**
 * Build a 2xx paginated response that wraps `itemSchema` in the
 * paginated envelope (data: T[], meta: required).
 */
export const paginatedResponse = (
    description: string,
    itemSchema: z.ZodTypeAny
) => ({
    description,
    content: {
        'application/json': { schema: paginatedResponseSchema(itemSchema) },
    },
});

// Re-export the registry class so domain contracts can take it as a
// parameter without each one importing the package directly.
export { OpenAPIRegistry };
