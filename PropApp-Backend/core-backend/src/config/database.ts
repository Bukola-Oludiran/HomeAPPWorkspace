/**
 * Prisma Database Client
 * Singleton instance for database operations
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prevent multiple instances in development due to hot reloading
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
    log: env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});

if (env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
