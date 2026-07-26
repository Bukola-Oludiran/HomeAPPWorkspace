/**
 * gRPC auth helper
 *
 * Mirrors the HTTP authenticate() middleware: extracts a bearer JWT from
 * gRPC metadata, verifies it with the same secret, then confirms the user
 * still exists and is active. Returns the user context that handlers use
 * to call the service-layer functions (which already accept context by
 * parameter — see P0 audit).
 *
 * Throws AppError subclasses (TokenExpiredError / InvalidCredentialsError)
 * which the errors.ts mapper turns into UNAUTHENTICATED on the wire.
 */

import { Metadata } from '@grpc/grpc-js';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/database';
import {
    InsufficientPermissionsError,
    InvalidCredentialsError,
    TokenExpiredError,
} from '../common/utils/errors';
import type { JwtPayload } from '../common/middleware/auth.middleware';

export interface GrpcCallContext {
    userId: string;
    email: string;
    role: UserRole;
    verificationLevel: string;
    regionCode: string;
}

export async function authenticateGrpc(metadata: Metadata): Promise<GrpcCallContext> {
    const raw = metadata.get('authorization');
    if (raw.length === 0 || typeof raw[0] !== 'string') {
        throw new InvalidCredentialsError('No authorization metadata');
    }

    const header = raw[0];
    if (!header.startsWith('Bearer ')) {
        throw new InvalidCredentialsError('Malformed authorization metadata');
    }

    const token = header.slice('Bearer '.length).trim();
    if (token.length === 0) {
        throw new InvalidCredentialsError('Empty bearer token');
    }

    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredError();
        }
        throw new InvalidCredentialsError('Invalid token');
    }

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
        throw new InvalidCredentialsError('User not found or inactive');
    }

    return {
        userId: user.id,
        email: user.email,
        role: user.role,
        verificationLevel: user.verificationLevel,
        regionCode: user.regionCode,
    };
}

export function requireRole(ctx: GrpcCallContext, ...allowed: UserRole[]): void {
    if (!allowed.includes(ctx.role)) {
        throw new InsufficientPermissionsError(
            `Role ${ctx.role} cannot call this method`
        );
    }
}

/**
 * Stash the resolved auth context onto the gRPC call so the compliance
 * wrap-handlers layer can read it during `dataAccess` emission. One-line opt-in
 * for any handler that wants its events labelled with the real user actor
 * rather than the generic 'unknown-grpc-client'.
 *
 * Usage:
 *   const ctx = await authenticateGrpc(call.metadata);
 *   stashGrpcActor(call, ctx);
 */
export function stashGrpcActor(call: unknown, ctx: GrpcCallContext): void {
    (call as { _complyActor?: { userId: string; role: string } })._complyActor = {
        userId: ctx.userId,
        role: ctx.role,
    };
}
