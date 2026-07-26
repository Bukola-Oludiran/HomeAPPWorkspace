/**
 * AI service entry point.
 */

import { env } from './config/env';
import { logger } from './logger';
import { createApp } from './server';

function main(): void {
    const app = createApp();
    app.listen(env.PORT, () => {
        logger.info(`🤖 HomeAI AI service listening on port ${env.PORT}`);
        logger.info(`📍 Env: ${env.NODE_ENV}`);
        logger.info(`🔗 Core gRPC: ${env.CORE_BACKEND_GRPC_HOST}:${env.CORE_BACKEND_GRPC_PORT}`);
        logger.info(`🧠 Model: ${env.LLM_PROVIDER}/${env.LLM_MODEL}`);
    });
}

main();
