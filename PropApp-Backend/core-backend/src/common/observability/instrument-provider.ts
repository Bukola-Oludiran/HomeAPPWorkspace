import type { DataClassification } from './compliance.types';
import { safeEmit } from './comply';

export interface InstrumentationOptions {
    /** Target system identifier for `dataFlow.to` (e.g. 'paystack', 's3'). */
    to: string;
    /** Default classification for outbound flows from this provider. */
    dataClassification: DataClassification;
    /** Whether the underlying transport (TLS to third party) encrypts at rest in transit. */
    encrypted?: boolean;
    /** Method names to skip (e.g. pure config getters). Default: skip nothing. */
    skipMethods?: string[];
    /** Static source name for `dataFlow.from`. Defaults to 'homeai-core'. */
    from?: string;
}

/**
 * Wrap a provider object (payment/storage/verification/communication) so that
 * every method invocation emits a ComplyFlow `dataFlow` event. The wrapper is
 * fire-and-forget: emissions happen in a finally block so failures still
 * produce the flow record.
 *
 * Pass-through for non-function properties (e.g. `providerId`, `supportedRegions`).
 */
export const instrumentProvider = <T extends object>(
    provider: T,
    opts: InstrumentationOptions,
): T => {
    const from = opts.from ?? 'homeai-core';
    const skip = new Set(opts.skipMethods ?? []);

    return new Proxy(provider, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value !== 'function' || typeof prop === 'symbol' || skip.has(prop)) {
                return value;
            }

            const fnName = String(prop);
            return function instrumented(this: unknown, ...args: unknown[]) {
                const emit = () =>
                    safeEmit.dataFlow({
                        from,
                        to: opts.to,
                        dataClassification: opts.dataClassification,
                        encrypted: opts.encrypted ?? true,
                    });

                let result: unknown;
                try {
                    result = (value as (...a: unknown[]) => unknown).apply(target, args);
                } catch (err) {
                    emit();
                    throw err;
                }

                if (result && typeof (result as Promise<unknown>).then === 'function') {
                    return (result as Promise<unknown>).finally(emit);
                }

                emit();
                return result;
            };
        },
    }) as T;
};
