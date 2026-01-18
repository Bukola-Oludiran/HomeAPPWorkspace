/**
 * Input Sanitization Middleware
 * Automatically sanitizes all string inputs in request body
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeText } from '../utils/sanitize.util';
import { logger } from '../utils/logger';

/**
 * Middleware that sanitizes all string values in request body
 * Apply globally or to specific routes
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
        try {
            req.body = sanitizeObject(req.body);
        } catch (error) {
            logger.warn('Failed to sanitize request body', { error });
            // Continue with original body if sanitization fails
        }
    }
    next();
}

/**
 * Middleware that sanitizes query parameters
 */
export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
    if (req.query && typeof req.query === 'object') {
        try {
            const sanitizedQuery: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (typeof value === 'string') {
                    sanitizedQuery[key] = sanitizeText(value);
                } else if (Array.isArray(value)) {
                    sanitizedQuery[key] = value.map(v =>
                        typeof v === 'string' ? sanitizeText(v) : v
                    );
                } else {
                    sanitizedQuery[key] = value;
                }
            }
            req.query = sanitizedQuery as typeof req.query;
        } catch (error) {
            logger.warn('Failed to sanitize query params', { error });
        }
    }
    next();
}

/**
 * Combined middleware for full sanitization
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    sanitizeBody(req, res, () => {
        sanitizeQuery(req, res, next);
    });
}
