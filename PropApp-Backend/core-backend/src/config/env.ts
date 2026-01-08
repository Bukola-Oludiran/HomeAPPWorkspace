/**
 * Environment Configuration
 * Centralized config management with validation
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform(Number),
    API_VERSION: z.string().default('v1'),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().optional(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Region
    DEFAULT_REGION: z.string().default('NG'),

    // Payment Providers
    PAYSTACK_SECRET_KEY: z.string().optional(),
    PAYSTACK_PUBLIC_KEY: z.string().optional(),

    // Payment - Stripe (Canada)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Identity Verification - Smile Identity (Nigeria)
    SMILE_IDENTITY_API_KEY: z.string().optional(),
    SMILE_IDENTITY_PARTNER_ID: z.string().optional(),

    // Identity Verification - Onfido (Canada)
    ONFIDO_API_TOKEN: z.string().optional(),
    ONFIDO_SANDBOX: z.string().optional(),

    // Communication - Email
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_EMAIL: z.string().email().optional(),

    // Communication - SMS - Africa's Talking (Nigeria)
    AT_API_KEY: z.string().optional(),
    AT_USERNAME: z.string().optional(),
    AT_SENDER_ID: z.string().optional(),

    // Communication - SMS - Twilio (Canada)
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM_NUMBER: z.string().optional(),

    // Communication - Push
    FCM_PROJECT_ID: z.string().optional(),
    FCM_PRIVATE_KEY: z.string().optional(),
    FCM_CLIENT_EMAIL: z.string().optional(),

    // Storage
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),
    AWS_CLOUDFRONT_DOMAIN: z.string().optional(),

    // Maps
    GOOGLE_MAPS_API_KEY: z.string().optional(),

    // Blockchain
    POLYGON_RPC_URL: z.string().optional(),
    BLOCKCHAIN_PRIVATE_KEY: z.string().optional(),
    ALCHEMY_API_KEY: z.string().optional(),
    INFURA_API_KEY: z.string().optional(),

    // Document Verification
    LASRERA_API_KEY: z.string().optional(),
    LASRERA_BASE_URL: z.string().optional(),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

// Parse and validate environment variables
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            console.error('❌ Invalid environment variables:');
            missingVars.forEach(v => console.error(`   - ${v}`));
            process.exit(1);
        }
        throw error;
    }
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
