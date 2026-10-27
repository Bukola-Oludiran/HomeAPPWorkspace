/**
 * Request ID Middleware
 * Adds unique request ID for tracing
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = req.headers['x-request-id'] as string || `req_${uuidv4().split('-')[0]}`;

    // Attach to request object for easy access
    req.requestId = requestId;

    // Set response header
    res.setHeader('X-Request-Id', requestId);

    next();
};

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            user?: {
                id: string;
                email: string;
                role: string;
                verificationLevel: string;
                regionCode: string;
                sessionId?: string;
            };
        }
    }
}
