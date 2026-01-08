/**
 * Swagger/OpenAPI Configuration
 * API Documentation for HomeAI Nigeria Backend
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HomeAI Nigeria API',
            version: '1.0.0',
            description: `
## Overview
HomeAI Nigeria is a comprehensive property rental and management platform designed for the Nigerian and Canadian markets.

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Rate Limiting
- Public endpoints: 100 requests/15 minutes per IP
- Authenticated endpoints: 500 requests/15 minutes per user

## Regions
The platform supports multiple regions with different providers:
- **NG (Nigeria)**: Paystack, Africa's Talking, Smile Identity
- **CA (Canada)**: Stripe, Twilio, Onfido
      `,
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
                url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
                description: 'Development server',
            },
            {
                url: `https://api.homeai.ng/api/${env.API_VERSION}`,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from /auth/login',
                },
            },
            schemas: {
                // Common schemas
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'VALIDATION_ERROR' },
                                message: { type: 'string', example: 'Invalid input data' },
                                details: { type: 'object' },
                            },
                        },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 20 },
                        total: { type: 'integer', example: 100 },
                        totalPages: { type: 'integer', example: 5 },
                    },
                },
                // User schemas
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'] },
                        verificationStatus: { type: 'string', enum: ['UNVERIFIED', 'PENDING', 'VERIFIED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                // Auth schemas
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 8, example: 'SecureP@ss123' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' },
                                expiresIn: { type: 'integer', example: 900 },
                                user: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
                // Property schemas
                Property: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        propertyType: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'] },
                        listingType: { type: 'string', enum: ['RENT', 'SALE', 'SHORT_LET'] },
                        price: { type: 'number' },
                        currency: { type: 'string', example: 'NGN' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        bedrooms: { type: 'integer' },
                        bathrooms: { type: 'integer' },
                        amenities: { type: 'array', items: { type: 'string' } },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        verified: { type: 'boolean' },
                        ownerId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreatePropertyRequest: {
                    type: 'object',
                    required: ['title', 'propertyType', 'listingType', 'price', 'address', 'city', 'state'],
                    properties: {
                        title: { type: 'string', minLength: 5, maxLength: 100 },
                        description: { type: 'string', maxLength: 2000 },
                        propertyType: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'LAND', 'COMMERCIAL'] },
                        listingType: { type: 'string', enum: ['RENT', 'SALE', 'SHORT_LET'] },
                        price: { type: 'number', minimum: 0 },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        bedrooms: { type: 'integer', minimum: 0 },
                        bathrooms: { type: 'integer', minimum: 0 },
                        amenities: { type: 'array', items: { type: 'string' } },
                    },
                },
                // Lease schemas
                Lease: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        propertyId: { type: 'string', format: 'uuid' },
                        tenantId: { type: 'string', format: 'uuid' },
                        landlordId: { type: 'string', format: 'uuid' },
                        monthlyRent: { type: 'number' },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                        status: { type: 'string', enum: ['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED'] },
                    },
                },
                // Transaction schemas
                Transaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        type: { type: 'string', enum: ['RENT_PAYMENT', 'DEPOSIT', 'FEE', 'REFUND'] },
                        amount: { type: 'number' },
                        currency: { type: 'string' },
                        status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
                        reference: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                InitiatePaymentRequest: {
                    type: 'object',
                    required: ['amount', 'type'],
                    properties: {
                        amount: { type: 'number', minimum: 100 },
                        type: { type: 'string', enum: ['RENT_PAYMENT', 'DEPOSIT'] },
                        leaseId: { type: 'string', format: 'uuid' },
                        metadata: { type: 'object' },
                    },
                },
                // Notification schemas
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        type: { type: 'string', enum: ['SYSTEM', 'PAYMENT', 'LEASE', 'MAINTENANCE', 'MESSAGE'] },
                        read: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                NotFoundError: {
                    description: 'The requested resource was not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation failed for the request body',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' },
                        },
                    },
                },
            },
        },
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
        ],
    },
    apis: ['./src/modules/**/*.routes.ts'], // Path to route files with JSDoc annotations
};

export const swaggerSpec = swaggerJsdoc(options);
