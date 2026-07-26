/**
 * HomeAI Core Backend
 * Main Express Application Entry Point
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './common/utils/logger';
import { swaggerSpec } from './config/swagger';
import { requestIdMiddleware } from './common/middleware/requestId.middleware';
import { errorHandler, notFoundHandler } from './common/middleware/error.middleware';
import { sendSuccess } from './common/utils/response.util';
import { initComply, shutdownComply } from './common/observability/comply.bootstrap';
import { complianceHttpMiddleware } from './common/observability/http.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import propertyRoutes from './modules/properties/properties.routes';
import landlordRoutes from './modules/landlord/landlord.routes';
import tenantRoutes from './modules/tenant/tenant.routes';
import leaseRoutes from './modules/leases/leases.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import agentRoutes from './modules/agent/agent.routes';
import messagingRoutes from './modules/messaging/messaging.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import verificationRoutes from './modules/verification/verification.routes';
import notificationRoutes from './modules/notifications/notifications.routes';

// ============================================
// CREATE EXPRESS APP
// ============================================

const app: Application = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS — allow the configured frontend origin plus every Cloudflare Pages
// deployment URL for this project: the production apex (homeai-app.pages.dev)
// and per-deploy / per-branch preview subdomains (<hash>.homeai-app.pages.dev).
// Exact-string match alone breaks on preview URLs, which is why those origins
// were being rejected by the browser.
const corsAllowList: Array<string | RegExp> = [
    env.FRONTEND_URL,
    /^https:\/\/([a-z0-9-]+\.)?homeai-app\.pages\.dev$/,
];
app.use(cors({
    origin(origin, callback) {
        // Non-browser clients (curl, server-to-server, same-origin) send no Origin.
        if (!origin) return callback(null, true);
        const allowed = corsAllowList.some((rule) =>
            rule instanceof RegExp ? rule.test(origin) : rule === origin,
        );
        callback(allowed ? null : new Error(`CORS: origin ${origin} not allowed`), allowed);
    },
    credentials: true,
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests, please try again later',
        },
    },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input sanitization (XSS protection)
import { sanitizeInput } from './common/middleware/sanitize.middleware';
app.use(sanitizeInput);

// Request ID
app.use(requestIdMiddleware);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { requestId: req.requestId });
    next();
});

// ComplyFlow telemetry (emits dataAccess on res.finish; no-op if SDK disabled)
app.use(complianceHttpMiddleware);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: env.API_VERSION,
        region: env.DEFAULT_REGION,
    });
});

// Database health check
app.get('/health/db', async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        sendSuccess(res, { database: 'connected' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// API DOCUMENTATION
// ============================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HomeAI API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ============================================
// API ROUTES
// ============================================

const API_PREFIX = `/api/${env.API_VERSION}`;

// Auth routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// User routes
app.use(`${API_PREFIX}/users`, userRoutes);

// Property routes
app.use(`${API_PREFIX}/properties`, propertyRoutes);

// Landlord dashboard routes
app.use(`${API_PREFIX}/landlord`, landlordRoutes);

// Tenant dashboard routes
app.use(`${API_PREFIX}/tenant`, tenantRoutes);

// Lease routes
app.use(`${API_PREFIX}/leases`, leaseRoutes);

// Maintenance routes
app.use(`${API_PREFIX}/maintenance`, maintenanceRoutes);

// Agent routes
app.use(`${API_PREFIX}/agent`, agentRoutes);

// Messaging routes
app.use(`${API_PREFIX}/messages`, messagingRoutes);

// Transaction routes
app.use(`${API_PREFIX}/transactions`, transactionRoutes);

// Verification routes
app.use(`${API_PREFIX}/verification`, verificationRoutes);

// Notification routes
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

import { createServer } from 'http';
import { webSocketService } from './services/websocket.service';
import { startGrpcServer } from './grpc/server';

const startServer = async () => {
    try {
        // Initialize ComplyFlow telemetry (no-op if not configured)
        initComply();

        // Test database connection
        await prisma.$connect();
        logger.info('✅ Database connected');

        // Create HTTP server for WebSocket support
        const httpServer = createServer(app);

        // Initialize WebSocket
        webSocketService.initialize(httpServer);
        logger.info('✅ WebSocket initialized');

        // Start gRPC server (AI service mutation surface)
        await startGrpcServer(env.GRPC_PORT);
        logger.info(`✅ gRPC server initialized on port ${env.GRPC_PORT}`);

        // Start server
        httpServer.listen(env.PORT, () => {
            logger.info(`🚀 HomeAI Core Backend running on port ${env.PORT}`);
            logger.info(`📍 Environment: ${env.NODE_ENV}`);
            logger.info(`🌍 Default Region: ${env.DEFAULT_REGION}`);
            logger.info(`📚 API Docs: http://localhost:${env.PORT}/api-docs`);
            logger.info(`🔌 WebSocket: ws://localhost:${env.PORT}`);
            logger.info(`🛰️  gRPC: 0.0.0.0:${env.GRPC_PORT}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await shutdownComply();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export default app;
