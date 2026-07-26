/**
 * Read-write Prisma client for ai-service-owned tables.
 *
 * The AI service owns the `ai_sessions` and `ai_session_messages` tables.
 * Everything else stays read-only via [client.ts](./client.ts).
 *
 * This client uses the regular `DATABASE_URL` (or a dedicated
 * `AISERVICE_DATABASE_URL` if you've provisioned a Postgres role with
 * write grants only on `ai_sessions*` — recommended for production).
 * Prisma can't enforce table-level scoping at the ORM layer, so the
 * enforcement layer is the DB role itself. The application-layer
 * convention here is: never import this client outside `src/sessions/`.
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../logger';

const datasourceUrl = process.env.AISERVICE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
    throw new Error(
        'No write DB URL configured. Set AISERVICE_DATABASE_URL (preferred) or DATABASE_URL for ai-service session persistence.'
    );
}

if (!process.env.AISERVICE_DATABASE_URL) {
    logger.warn(
        'AISERVICE_DATABASE_URL not set — sessions writes use DATABASE_URL. Provision a scoped Postgres role with INSERT/UPDATE/DELETE only on ai_sessions / ai_session_messages before production.'
    );
}

export const prismaRw = new PrismaClient({
    datasourceUrl,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
