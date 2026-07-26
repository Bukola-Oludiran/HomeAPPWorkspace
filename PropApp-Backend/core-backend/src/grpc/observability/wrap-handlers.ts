import type { UntypedHandleCall } from '@grpc/grpc-js';
import type { ComplianceActor } from '@complyflow/shared';
import { safeEmit } from '../../common/observability/comply';
import { lookupGrpcCompliance } from './registry';
import { logger } from '../../common/utils/logger';

/**
 * gRPC `call` object enriched with optional compliance actor stashed by
 * authentication helpers (e.g. authenticateGrpc). Keeps actor context
 * available across async hops.
 */
interface CallWithComplyActor {
    _complyActor?: ComplianceActor;
    metadata?: { get: (key: string) => unknown[] };
}

const resolveActor = (call: unknown): ComplianceActor => {
    const c = call as CallWithComplyActor;
    if (c._complyActor) return c._complyActor;

    const meta = c.metadata;
    if (meta) {
        const svc = meta.get('x-service-name')?.[0];
        if (typeof svc === 'string' && svc.length > 0) {
            return { service: svc };
        }
    }
    return { service: 'unknown-grpc-client' };
};

type HandlerMap = Record<string, UntypedHandleCall>;

/**
 * Wrap every handler in a service's map so each successful invocation emits a
 * `dataAccess` event. Wraps the trailing `callback` argument so the emission
 * fires when the response is sent. For server-streaming/bidi handlers (which
 * have no trailing callback) we emit on the next tick after `next()` returns.
 *
 * Never throws — failure to emit must not affect the RPC reply.
 */
export const wrapHandlersForCompliance = (
    serviceFqn: string,
    handlers: HandlerMap,
): HandlerMap => {
    const wrapped: HandlerMap = {};

    for (const [methodName, handler] of Object.entries(handlers)) {
        const meta = lookupGrpcCompliance(serviceFqn, methodName);
        if (!meta) {
            logger.warn('compliance: unmapped gRPC method', { serviceFqn, methodName });
            wrapped[methodName] = handler;
            continue;
        }

        wrapped[methodName] = ((call: unknown, callback: unknown) => {
            const emit = () => {
                try {
                    safeEmit.dataAccess({
                        resource: meta.resource,
                        action: meta.action,
                        dataClassification: meta.dataClassification,
                        actor: resolveActor(call),
                        reason: meta.reason,
                    });
                } catch (err) {
                    logger.debug('gRPC compliance emit failed', { error: err });
                }
            };

            // Unary RPC: wrap the trailing callback.
            if (typeof callback === 'function') {
                const wrappedCallback = (...args: unknown[]) => {
                    emit();
                    (callback as (...a: unknown[]) => unknown)(...args);
                };
                return (handler as (c: unknown, cb: unknown) => unknown)(call, wrappedCallback);
            }

            // Server-streaming/bidi: emit when handler returns control.
            const result = (handler as (c: unknown) => unknown)(call);
            queueMicrotask(emit);
            return result;
        }) as UntypedHandleCall;
    }

    return wrapped;
};
