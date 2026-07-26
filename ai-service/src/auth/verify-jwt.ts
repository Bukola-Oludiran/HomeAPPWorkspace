/**
 * JWT verification for incoming chat requests.
 *
 * Mirrors the core-backend's authenticate() middleware: same secret, same
 * payload shape, same rejection rules. We don't hit the database here in
 * v1 — we trust the JWT for the duration of its lifetime. (Account
 * deactivation will propagate as soon as the token's 15-min TTL expires;
 * v2 can add a deactivation cache if that latency becomes a problem.)
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface SessionUser {
    userId: string;
    email: string;
    role: 'TENANT' | 'LANDLORD' | 'AGENT' | 'ADMIN';
    verificationLevel: string;
    regionCode: string;
}

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    verificationLevel: string;
    regionCode: string;
    iat?: number;
    exp?: number;
    jti?: string;
}

export class AuthError extends Error {
    constructor(public readonly code: string, message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export function verifyJwt(token: string): SessionUser {
    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            throw new AuthError('AUTH_002', 'Token has expired');
        }
        throw new AuthError('AUTH_001', 'Invalid token');
    }

    const role = payload.role;
    if (role !== 'TENANT' && role !== 'LANDLORD' && role !== 'AGENT' && role !== 'ADMIN') {
        throw new AuthError('AUTH_001', `Unsupported role: ${role}`);
    }

    return {
        userId: payload.sub,
        email: payload.email,
        role,
        verificationLevel: payload.verificationLevel,
        regionCode: payload.regionCode,
    };
}

export function extractBearer(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthError('AUTH_001', 'Missing or malformed Authorization header');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (token.length === 0) {
        throw new AuthError('AUTH_001', 'Empty bearer token');
    }
    return token;
}
