import { comply } from '@complyflow/sdk';
import { env } from '../../config/env';
import { logger } from '../utils/logger';

let initialized = false;

export const isComplyEnabled = (): boolean => initialized;

/**
 * Initializes the ComplyFlow SDK if configuration is present. When the API key is
 * absent we log once and return; every downstream emission goes through safeEmit
 * which no-ops while `initialized` is false.
 *
 * Never throws — telemetry must not crash the server.
 */
export const initComply = (): void => {
    if (initialized) return;

    if (!env.COMPLY_FLOW_API_KEY || !env.COMPLY_FLOW_TENANT_ID || !env.COMPLY_FLOW_ENDPOINT) {
        logger.info('ComplyFlow disabled (no API key / tenant / endpoint configured)');
        return;
    }

    try {
        comply.init({
            apiKey: env.COMPLY_FLOW_API_KEY,
            tenantId: env.COMPLY_FLOW_TENANT_ID,
            endpoint: env.COMPLY_FLOW_ENDPOINT,
            serviceName: env.COMPLY_FLOW_SERVICE_NAME,
        });
        initialized = true;
        logger.info('✅ ComplyFlow SDK initialized', {
            serviceName: env.COMPLY_FLOW_SERVICE_NAME,
            tenantId: env.COMPLY_FLOW_TENANT_ID,
        });
    } catch (err) {
        logger.error('ComplyFlow init failed; continuing without telemetry', { error: err });
    }
};

/**
 * Flushes pending spans during shutdown. Bounded so a misbehaving exporter
 * cannot block process exit.
 */
export const shutdownComply = async (timeoutMs = 3000): Promise<void> => {
    if (!initialized) return;
    try {
        await Promise.race([
            comply.shutdown(),
            new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
        ]);
    } catch (err) {
        logger.warn('ComplyFlow shutdown error (suppressed)', { error: err });
    }
};
