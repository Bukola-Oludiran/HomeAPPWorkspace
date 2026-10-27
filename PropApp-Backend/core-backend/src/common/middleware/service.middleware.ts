/**
 * Service-to-Service Authentication Middleware
 * For AI Service → Core Backend communication per PRD Section 6.4
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';
import { prisma } from '../../config/database';
import { logger } from '../utils/logger';
import { safeEmit } from '../observability/comply';
import type { ComplianceActor } from '../observability/compliance.types';

const serviceActor = (req: Request, fallbackName?: string): ComplianceActor => {
    const name = req.service?.serviceName ?? fallbackName ?? 'unknown-service';
    return { service: name, userId: req.service?.userId };
};

// ============================================
// TYPES
// ============================================

export interface ServiceContext {
    serviceName: string;
    requestId: string;
    userId?: string;
    userToken?: string;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            service?: ServiceContext;
        }
    }
}

// ============================================
// SERVICE API KEYS (should be in env/secrets manager)
// ============================================

const SERVICE_API_KEYS: Record<string, string> = {
    'ai-service': process.env.AI_SERVICE_API_KEY || 'dev-ai-service-key',
    'blockchain-service': process.env.BLOCKCHAIN_SERVICE_API_KEY || 'dev-blockchain-key',
    'notification-service': process.env.NOTIFICATION_SERVICE_API_KEY || 'dev-notification-key',
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Authenticate service-to-service requests
 * Headers expected per PRD:
 *   X-Service-Name: ai-service
 *   X-Service-Key: {SERVICE_API_KEY}
 *   X-Request-ID: {unique_request_id}
 *   X-User-Token: {optional_user_jwt}
 */
export const authenticateService = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const serviceName = req.headers['x-service-name'] as string;
        const serviceKey = req.headers['x-service-key'] as string;
        const requestId = req.headers['x-request-id'] as string || req.requestId;
        const userToken = req.headers['x-user-token'] as string;

        // Validate required headers
        if (!serviceName) {
            safeEmit.accessControl({
                resource: 'homeai:service-auth',
                actor: { service: 'unknown-service' },
                granted: false,
                method: 'custom',
                dataClassification: 'internal',
            });
            sendUnauthorized(res, 'Missing X-Service-Name header', 'SERVICE_AUTH_001');
            return;
        }

        if (!serviceKey) {
            safeEmit.accessControl({
                resource: 'homeai:service-auth',
                actor: { service: serviceName },
                granted: false,
                method: 'custom',
                dataClassification: 'internal',
            });
            sendUnauthorized(res, 'Missing X-Service-Key header', 'SERVICE_AUTH_002');
            return;
        }

        // Validate service key
        const expectedKey = SERVICE_API_KEYS[serviceName];
        if (!expectedKey || serviceKey !== expectedKey) {
            logger.warn(`Invalid service key for ${serviceName}`, { requestId });
            safeEmit.accessControl({
                resource: 'homeai:service-auth',
                actor: { service: serviceName },
                granted: false,
                method: 'custom',
                dataClassification: 'internal',
            });
            sendForbidden(res, 'Invalid service credentials', 'SERVICE_AUTH_003');
            return;
        }

        // Attach service context to request
        req.service = {
            serviceName,
            requestId: requestId || '',
        };

        // If user token provided, validate and attach user context
        if (userToken) {
            // Import dynamically to avoid circular dependency
            const jwt = await import('jsonwebtoken');

            try {
                const payload = jwt.default.verify(userToken, env.JWT_SECRET) as {
                    sub: string;
                    email: string;
                    role: string;
                    verificationLevel: string;
                    regionCode: string;
                };

                // Verify user exists
                const user = await prisma.user.findUnique({
                    where: { id: payload.sub },
                    select: { id: true, email: true, role: true, isActive: true },
                });

                if (user && user.isActive) {
                    req.service.userId = user.id;
                    req.user = {
                        id: payload.sub,
                        email: payload.email,
                        role: payload.role,
                        verificationLevel: payload.verificationLevel,
                        regionCode: payload.regionCode,
                    };
                }
            } catch (error) {
                // Invalid user token - continue without user context
                logger.debug(`Invalid X-User-Token from ${serviceName}`, { requestId });
            }
        }

        logger.info(`Service authenticated: ${serviceName}`, {
            requestId,
            hasUserContext: !!req.user,
        });

        safeEmit.accessControl({
            resource: 'homeai:service-auth',
            actor: serviceActor(req, serviceName),
            granted: true,
            method: 'custom',
            dataClassification: 'internal',
        });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Require specific service for an endpoint
 */
export const requireService = (...allowedServices: string[]) => {
    const resource = `homeai:service-allowlist[${allowedServices.join(',')}]`;
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.service) {
            safeEmit.accessControl({
                resource,
                actor: { service: 'unauthenticated' },
                granted: false,
                method: 'custom',
                dataClassification: 'internal',
            });
            sendUnauthorized(res, 'Service authentication required', 'SERVICE_AUTH_001');
            return;
        }

        if (!allowedServices.includes(req.service.serviceName)) {
            safeEmit.accessControl({
                resource,
                actor: serviceActor(req),
                granted: false,
                method: 'custom',
                dataClassification: 'internal',
            });
            sendForbidden(
                res,
                `Service ${req.service.serviceName} not allowed for this endpoint`,
                'SERVICE_AUTH_004'
            );
            return;
        }

        safeEmit.accessControl({
            resource,
            actor: serviceActor(req),
            granted: true,
            method: 'custom',
            dataClassification: 'internal',
        });
        next();
    };
};

/**
 * Allow either user auth OR service auth
 */
export const authenticateUserOrService = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Check for service headers first
    const serviceName = req.headers['x-service-name'] as string;
    const serviceKey = req.headers['x-service-key'] as string;

    if (serviceName && serviceKey) {
        // Try service auth
        return authenticateService(req, res, next);
    }

    // Fall back to user auth
    const { authenticate } = await import('./auth.middleware');
    return authenticate(req, res, next);
};
