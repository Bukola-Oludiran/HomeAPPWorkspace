/**
 * OpenAPI Configuration
 *
 * The schema source-of-truth lives in `@homeai/contracts/*` — each
 * domain contract calls `registerXxxPaths()` to push its endpoints
 * into a shared registry. This file owns deploy-time concerns (info,
 * servers, security schemes) and emits the final OpenAPI 3.1 document
 * that Swagger UI consumes.
 *
 * To regenerate `openapi.json` for downstream consumers (mobile app,
 * Postman collection, codegen tools), run `npm run generate:openapi`.
 */

import {
    OpenAPIRegistry,
    OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';

import {
    BEARER_AUTH_SCHEME,
    registerEnvelopeSchemas,
} from '@homeai/contracts/openapi';

import { registerAuthPaths } from '@homeai/contracts/auth.contract';
import { registerPropertyPaths } from '@homeai/contracts/property.contract';
import { registerLeasePaths } from '@homeai/contracts/lease.contract';
import { registerMaintenancePaths } from '@homeai/contracts/maintenance.contract';
import { registerTransactionsPaths } from '@homeai/contracts/transactions.contract';
import { registerVerificationPaths } from '@homeai/contracts/verification.contract';
import { registerBankingPaths } from '@homeai/contracts/banking.contract';
import { registerTenantPaths } from '@homeai/contracts/tenant.contract';
import { registerLandlordPaths } from '@homeai/contracts/landlord.contract';
import { registerAgentPaths } from '@homeai/contracts/agent.contract';
import { registerUsersPaths } from '@homeai/contracts/users.contract';
import { registerIntegrationPaths } from '@homeai/contracts/integration.contract';

const DEFAULT_PORT = process.env.PORT ?? '3000';
const DEFAULT_VERSION = process.env.API_VERSION ?? 'v1';

export const buildOpenApiDocument = (): ReturnType<OpenApiGeneratorV31['generateDocument']> => {
    const registry = new OpenAPIRegistry();

    // Security scheme (referenced by every authenticated endpoint).
    registry.registerComponent('securitySchemes', BEARER_AUTH_SCHEME, {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from /auth/login',
    });

    registerEnvelopeSchemas(registry);
    registerAuthPaths(registry);
    registerPropertyPaths(registry);
    registerLeasePaths(registry);
    registerMaintenancePaths(registry);
    registerTransactionsPaths(registry);
    registerVerificationPaths(registry);
    registerBankingPaths(registry);
    registerTenantPaths(registry);
    registerLandlordPaths(registry);
    registerAgentPaths(registry);
    registerUsersPaths(registry);
    registerIntegrationPaths(registry);

    const generator = new OpenApiGeneratorV31(registry.definitions);
    return generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: 'HomeAI API',
            version: '1.0.0',
            description: [
                'Comprehensive property rental and management platform for Nigerian and Canadian markets.',
                '',
                '## Authentication',
                'Most endpoints require JWT authentication. Include the token in the Authorization header:',
                '```',
                'Authorization: Bearer <your_token>',
                '```',
                '',
                '## Rate Limiting',
                '- Public endpoints: 100 requests / 15 minutes per IP',
                '- Authenticated endpoints: 500 requests / 15 minutes per user',
            ].join('\n'),
            contact: {
                name: 'HomeAI Support',
                url: 'https://homeai.ng',
                email: 'api@homeai.ng',
            },
            license: {
                name: 'Proprietary',
                url: 'https://homeai.ng/terms',
            },
        },
        servers: [
            {
                url: `http://localhost:${DEFAULT_PORT}/api/${DEFAULT_VERSION}`,
                description: 'Development server',
            },
            {
                url: `https://api.homeai.ng/api/${DEFAULT_VERSION}`,
                description: 'Production server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication & Authorization' },
            { name: 'Users', description: 'User management' },
            { name: 'Properties', description: 'Property listings and management' },
            { name: 'Leases', description: 'Lease agreements' },
            { name: 'Transactions', description: 'Payments and financial transactions' },
            { name: 'Maintenance', description: 'Maintenance requests' },
            { name: 'Agents', description: 'Agent marketplace' },
            { name: 'Messaging', description: 'In-app messaging' },
            { name: 'Verification', description: 'Identity and property verification' },
            { name: 'Notifications', description: 'Push notifications and alerts' },
            { name: 'Landlord Dashboard', description: 'Landlord-specific endpoints' },
            { name: 'Tenant Dashboard', description: 'Tenant-specific endpoints' },
            { name: 'Banking', description: 'Bank accounts and payouts' },
        ],
    });
};

/** Eager singleton — built once at module load for Swagger UI. */
export const swaggerSpec = buildOpenApiDocument();
