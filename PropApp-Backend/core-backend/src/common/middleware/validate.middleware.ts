/**
 * Validation Middleware
 *
 * Centralizes Zod-schema validation for Express routes. Replaces per-module
 * `validate` / `validateQuery` copies that previously lived in every routes file.
 * Errors are forwarded to the global error handler ([error.middleware.ts])
 * which converts ZodError into the standard envelope with code VALIDATION_ERROR.
 */

import { Request, Response, NextFunction } from 'express';

type ParsedSchema<T> = { parse: (data: unknown) => T };

/**
 * Validate `req.body` against a Zod schema and replace it with the parsed value.
 * On failure, forwards the ZodError to the global error handler.
 */
export const validate = <T>(schema: ParsedSchema<T>) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Validate `req.query` against a Zod schema and replace it with the parsed value.
 * Schemas typically use `z.coerce.*` for string-to-number/boolean coercion.
 */
export const validateQuery = <T>(schema: ParsedSchema<T>) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query) as Record<string, string>;
            next();
        } catch (error) {
            next(error);
        }
    };
};
