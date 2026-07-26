/**
 * AI service env config.
 *
 * Mirrors the core-backend pattern: dotenv + zod validation, fail-fast on
 * missing required vars. JWT_SECRET must match the core-backend's secret so
 * tokens minted by login flows over there validate here.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000').transform(Number),

    JWT_SECRET: z.string().min(32),

    READONLY_DATABASE_URL: z.string().url().optional(),

    CORE_BACKEND_GRPC_HOST: z.string().default('localhost'),
    CORE_BACKEND_GRPC_PORT: z.string().default('50051').transform(Number),

    SESSION_TTL_MINUTES: z.string().default('30').transform(Number),

    LLM_PROVIDER: z.string().default('anthropic'),
    LLM_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
    ANTHROPIC_API_KEY: z.string().optional(),

    CHAT_RATE_LIMIT_PER_MIN: z.string().default('30').transform(Number),
    AUDIT_LOG_PATH: z.string().optional(),
});

const parse = () => {
    try {
        return envSchema.parse(process.env);
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('❌ AI service invalid environment variables:');
            for (const e of err.errors) {
                console.error(`   - ${e.path.join('.')}: ${e.message}`);
            }
            process.exit(1);
        }
        throw err;
    }
};

export const env = parse();
export type AiServiceEnv = z.infer<typeof envSchema>;
