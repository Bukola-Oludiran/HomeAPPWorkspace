import type { Request, Response, NextFunction } from 'express';
import type { ComplianceActor, DataAccessInput } from './compliance.types';
import { safeEmit } from './comply';
import { lookupRouteCompliance } from './registry';
import type { RouteComplianceEntry } from './registry.types';
import { logger } from '../utils/logger';

// Surface the request augmentations the rest of the codebase implicitly relies
// on. auth.middleware.ts attaches `user`, service.middleware.ts attaches
// `service`, requestId.middleware.ts attaches `requestId`. Declaring them here
// keeps this module self-typed even when checked in isolation.
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                verificationLevel: string;
                regionCode: string;
                sessionId?: string;
            };
            service?: {
                serviceName: string;
                requestId: string;
                userId?: string;
                userToken?: string;
            };
            requestId?: string;
        }
    }
}

/**
 * Build the ComplianceActor for the current request. Defers to actorOverride
 * (used by webhooks or service-auth-only routes) if supplied.
 */
const resolveActor = (req: Request, override?: ComplianceActor): ComplianceActor => {
    if (override) return override;
    if (req.user) {
        return {
            userId: req.user.id,
            role: req.user.role,
        };
    }
    if (req.service?.serviceName) {
        return { service: req.service.serviceName, userId: req.service.userId };
    }
    return { service: 'unauthenticated' };
};

/**
 * Global middleware: emits a `dataAccess` event for every matched route that has
 * a registry entry. Fires on `res.on('finish')` so status code, matched route
 * pattern, and req.user are all populated. Never blocks the request.
 *
 * Routes without a registry entry log one `warn` line ("compliance: unmapped
 * route ...") and skip emission. We deliberately do NOT default-emit — the
 * warning is the integrator's coverage checklist.
 */
export const complianceHttpMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    res.on('finish', () => {
        try {
            // req.route is populated by Express after the route matches.
            // For 404s or pre-route errors it will be undefined.
            const routePath = req.route?.path;
            if (!routePath) return;

            const fullPath =
                typeof routePath === 'string'
                    ? `${req.baseUrl}${routePath}`
                    : `${req.baseUrl}${String(routePath)}`;

            const meta = lookupRouteCompliance(req.method, fullPath);
            if (!meta) {
                logger.warn('compliance: unmapped route', {
                    method: req.method,
                    path: fullPath,
                    requestId: req.requestId,
                });
                return;
            }

            // Resolve metadata (function-form vs static-form).
            const resolved =
                typeof meta === 'function'
                    ? meta(req, res)
                    : (meta as RouteComplianceEntry);

            // Suppress on error if the entry opts in.
            if (resolved.skipOnError && (res.statusCode < 200 || res.statusCode >= 400)) {
                return;
            }

            const input: DataAccessInput = {
                resource: resolved.resource,
                action: resolved.action,
                dataClassification: resolved.dataClassification,
                actor: resolveActor(req, resolved.actorOverride),
                reason: resolved.reason,
            };

            if ('recordCount' in resolved && typeof (resolved as { recordCount?: number }).recordCount === 'number') {
                input.recordCount = (resolved as { recordCount?: number }).recordCount;
            }
            if ('batchReason' in resolved && (resolved as { batchReason?: string }).batchReason) {
                input.batchReason = (resolved as { batchReason?: string }).batchReason;
            }

            safeEmit.dataAccess(input);
        } catch (err) {
            // Never let instrumentation crash the response cycle.
            logger.debug('complianceHttpMiddleware emission failed', { error: err });
        }
    });
    next();
};
