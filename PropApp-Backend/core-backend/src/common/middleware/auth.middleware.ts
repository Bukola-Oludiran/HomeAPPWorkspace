/**
 * Authentication Middleware
 * JWT verification and user context
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';
import { prisma } from '../../config/database';
import { UserRole } from '@prisma/client';
import { safeEmit } from '../observability/comply';
import type { ComplianceActor, DataClassification } from '@complyflow/shared';

// ============================================
// COMPLIANCE EMISSION HELPERS
// ============================================

const ANONYMOUS_ACTOR: ComplianceActor = { service: 'anonymous' };

const userActor = (req: Request): ComplianceActor => {
    if (req.user) return { userId: req.user.id, role: req.user.role };
    if (req.service?.serviceName) return { service: req.service.serviceName, userId: req.service.userId };
    return ANONYMOUS_ACTOR;
};

const emitAuthDeny = (
    req: Request,
    resource: string,
    reason: string,
    dataClassification: DataClassification = 'PII',
): void => {
    safeEmit.accessControl({
        resource,
        actor: userActor(req),
        granted: false,
        method: 'rbac',
        dataClassification,
    });
};

const emitAuthGrant = (
    req: Request,
    resource: string,
    dataClassification: DataClassification = 'PII',
): void => {
    safeEmit.accessControl({
        resource,
        actor: userActor(req),
        granted: true,
        method: 'rbac',
        dataClassification,
    });
};

// ============================================
// JWT PAYLOAD TYPE
// ============================================

export interface JwtPayload {
    sub: string;        // User ID
    email: string;
    role: UserRole;
    verificationLevel: string;
    regionCode: string;
    iat?: number;
    exp?: number;
    jti?: string;
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            emitAuthDeny(req, 'homeai:auth.session', 'no-token-provided');
            sendUnauthorized(res, 'No token provided', 'AUTH_001');
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Check if user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                verificationLevel: true,
                regionCode: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            emitAuthDeny(req, 'homeai:auth.session', 'user-not-found-or-inactive');
            sendUnauthorized(res, 'User not found or inactive', 'AUTH_001');
            return;
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            verificationLevel: user.verificationLevel,
            regionCode: user.regionCode,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            emitAuthDeny(req, 'homeai:auth.session', 'token-expired');
            sendUnauthorized(res, 'Token has expired', 'AUTH_002');
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            emitAuthDeny(req, 'homeai:auth.session', 'invalid-token');
            sendUnauthorized(res, 'Invalid token', 'AUTH_001');
            return;
        }

        next(error);
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                verificationLevel: true,
                regionCode: true,
                isActive: true,
            },
        });

        if (user && user.isActive) {
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                verificationLevel: user.verificationLevel,
                regionCode: user.regionCode,
            };
        }

        next();
    } catch {
        // Ignore token errors in optional auth
        next();
    }
};

// ============================================
// AUTHORIZATION MIDDLEWARE
// ============================================

/**
 * Require specific roles
 */
export const requireRoles = (...roles: UserRole[]) => {
    const resource = `homeai:auth.role-required[${roles.join(',')}]`;
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            emitAuthDeny(req, resource, 'unauthenticated');
            sendUnauthorized(res, 'Authentication required', 'AUTH_001');
            return;
        }

        if (!roles.includes(req.user.role as UserRole)) {
            emitAuthDeny(req, resource, 'insufficient-role');
            sendForbidden(res, 'Insufficient permissions', 'AUTH_003');
            return;
        }

        emitAuthGrant(req, resource);
        next();
    };
};

/**
 * Require minimum verification level
 */
export const requireVerificationLevel = (minLevel: string) => {
    const levels = ['UNVERIFIED', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const resource = `homeai:auth.verification-level[>=${minLevel}]`;

    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            emitAuthDeny(req, resource, 'unauthenticated');
            sendUnauthorized(res, 'Authentication required', 'AUTH_001');
            return;
        }

        const userLevelIndex = levels.indexOf(req.user.verificationLevel);
        const requiredLevelIndex = levels.indexOf(minLevel);

        if (userLevelIndex < requiredLevelIndex) {
            emitAuthDeny(req, resource, 'verification-level-too-low');
            sendForbidden(
                res,
                `Verification level ${minLevel} required`,
                'AUTH_003'
            );
            return;
        }

        emitAuthGrant(req, resource);
        next();
    };
};

/**
 * Verify ownership of a resource
 */
export const requireOwnership = (getOwnerId: (req: Request) => Promise<string | null>) => {
    const resource = 'homeai:auth.ownership';
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            emitAuthDeny(req, resource, 'unauthenticated');
            sendUnauthorized(res, 'Authentication required', 'AUTH_001');
            return;
        }

        // Admins can access any resource
        if (req.user.role === 'ADMIN') {
            emitAuthGrant(req, resource);
            next();
            return;
        }

        try {
            const ownerId = await getOwnerId(req);

            if (ownerId !== req.user.id) {
                emitAuthDeny(req, resource, 'not-owner');
                sendForbidden(res, 'You do not have access to this resource', 'AUTH_003');
                return;
            }

            emitAuthGrant(req, resource);
            next();
        } catch (error) {
            next(error);
        }
    };
};

// ============================================
// PERMISSION-BASED AUTHORIZATION (PRD Section 6.3)
// ============================================

/**
 * Permission definitions per role (PRD Section 6.3 RBAC Table)
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
    TENANT: [
        'property:read',
        'application:read',
        'application:write',
        'payment:read',
        'payment:write',
        'verification:read',
    ],
    LANDLORD: [
        'property:read',
        'property:write',
        'application:read',
        'payment:read',
        'verification:read',
        'verification:write',
        'job:write',
    ],
    AGENT: [
        'property:read',
        'payment:read',
        'job:read',
        'job:write',
    ],
    ADMIN: [
        'property:read',
        'property:write',
        'application:read',
        'application:write',
        'payment:read',
        'payment:write',
        'verification:read',
        'verification:write',
        'job:read',
        'job:write',
        'admin:*',
    ],
};

/**
 * Check if role has a specific permission
 */
const hasPermission = (role: string, permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Check for exact match
    if (permissions.includes(permission)) {
        return true;
    }

    // Check for wildcard (admin:* covers all admin permissions)
    const [category] = permission.split(':');
    if (permissions.includes(`${category}:*`)) {
        return true;
    }

    // ADMIN has implicit access to everything
    if (role === 'ADMIN') {
        return true;
    }

    return false;
};

/**
 * Require specific permission(s)
 * Per PRD Section 6.3 RBAC Table
 * 
 * @example
 * router.post('/properties', authenticate, requirePermission('property:write'), createProperty);
 * router.get('/jobs', authenticate, requirePermission('job:read'), listJobs);
 */
export const requirePermission = (...requiredPermissions: string[]) => {
    const resource = `homeai:auth.permission[ALL:${requiredPermissions.join(',')}]`;
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            emitAuthDeny(req, resource, 'unauthenticated');
            sendUnauthorized(res, 'Authentication required', 'AUTH_001');
            return;
        }

        const userRole = req.user.role;

        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every(
            permission => hasPermission(userRole, permission)
        );

        if (!hasAllPermissions) {
            emitAuthDeny(req, resource, 'missing-required-permissions');
            sendForbidden(
                res,
                `Missing required permissions: ${requiredPermissions.join(', ')}`,
                'AUTH_003'
            );
            return;
        }

        emitAuthGrant(req, resource);
        next();
    };
};

/**
 * Require ANY of the specified permissions (OR logic)
 */
export const requireAnyPermission = (...permissions: string[]) => {
    const resource = `homeai:auth.permission[ANY:${permissions.join(',')}]`;
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            emitAuthDeny(req, resource, 'unauthenticated');
            sendUnauthorized(res, 'Authentication required', 'AUTH_001');
            return;
        }

        const userRole = req.user.role;

        // Check if user has AT LEAST ONE of the required permissions
        const hasAnyPermission = permissions.some(
            permission => hasPermission(userRole, permission)
        );

        if (!hasAnyPermission) {
            emitAuthDeny(req, resource, 'missing-all-permissions');
            sendForbidden(
                res,
                `Requires one of: ${permissions.join(', ')}`,
                'AUTH_003'
            );
            return;
        }

        emitAuthGrant(req, resource);
        next();
    };
};

/**
 * Get permissions for the current user's role
 */
export const getPermissionsForRole = (role: string): string[] => {
    return ROLE_PERMISSIONS[role] || [];
};

