/**
 * Global Error Handler Middleware
 * Catches all errors and sends consistent responses
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError, formatValidationErrors } from '../utils/response.util';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    // Log error
    logger.error('Error caught by global handler:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId: res.getHeader('X-Request-Id'),
    });

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        sendError(
            res,
            'VALIDATION_ERROR',
            'Validation failed',
            400,
            formatValidationErrors(err.errors)
        );
        return;
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        sendError(res, err.code, err.message, err.statusCode, err.details);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as { code?: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            // Unique constraint violation
            const field = prismaError.meta?.target?.[0] || 'field';
            sendError(res, 'CONFLICT', `${field} already exists`, 409);
            return;
        }

        if (prismaError.code === 'P2025') {
            // Record not found
            sendError(res, 'NOT_FOUND', 'Resource not found', 404);
            return;
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        sendError(res, 'AUTH_001', 'Invalid token', 401);
        return;
    }

    if (err.name === 'TokenExpiredError') {
        sendError(res, 'AUTH_002', 'Token has expired', 401);
        return;
    }

    // Default to 500 Internal Server Error
    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    sendError(res, 'SERVER_ERROR', message, statusCode);
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
};
