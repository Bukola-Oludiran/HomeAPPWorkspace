/**
 * Read-only Prisma client for the AI service.
 *
 * Wired against `READONLY_DATABASE_URL` when set, falling back to
 * `DATABASE_URL` if not (dev convenience — see the README for how to
 * provision the dedicated `homeai_readonly` Neon role for staging /
 * production). Falling back to the read-write URL still works for read
 * tools because they only call `findMany` / `findUnique` etc., but it
 * means the database-level guardrail isn't yet in place.
 *
 * The client uses Prisma's `datasourceUrl` constructor option to point
 * at the read-only URL without modifying the shared schema.prisma.
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../logger';

const datasourceUrl = env.READONLY_DATABASE_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
    throw new Error(
        'No database URL configured. Set READONLY_DATABASE_URL (preferred) or DATABASE_URL in .env'
    );
}

if (!env.READONLY_DATABASE_URL) {
    logger.warn(
        'READONLY_DATABASE_URL not set — falling back to DATABASE_URL. Provision a SELECT-only Postgres role before production.'
    );
}

export const prismaReadonly = new PrismaClient({
    datasourceUrl,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Note: not awaiting $connect() — Prisma lazy-connects on first query.
