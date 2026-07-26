/**
 * Per-userId fixed-window rate limiter for /v1/chat.
 *
 * Simple in-memory counter. Default 30 req/min per user (configurable via
 * env.CHAT_RATE_LIMIT_PER_MIN). v2 swaps to Redis if multi-instance.
 */

import { env } from '../config/env';

interface Window {
    count: number;
    resetAt: number; // epoch ms
}

class RateLimiter {
    private buckets = new Map<string, Window>();
    private readonly windowMs = 60_000;
    private readonly limit = env.CHAT_RATE_LIMIT_PER_MIN;

    constructor() {
        setInterval(() => this.sweep(), 60_000).unref();
    }

    check(userId: string): { ok: boolean; retryAfterMs?: number; remaining: number } {
        const now = Date.now();
        const w = this.buckets.get(userId);
        if (!w || w.resetAt <= now) {
            this.buckets.set(userId, { count: 1, resetAt: now + this.windowMs });
            return { ok: true, remaining: this.limit - 1 };
        }
        if (w.count >= this.limit) {
            return { ok: false, retryAfterMs: w.resetAt - now, remaining: 0 };
        }
        w.count += 1;
        return { ok: true, remaining: this.limit - w.count };
    }

    private sweep(): void {
        const now = Date.now();
        for (const [k, w] of this.buckets) {
            if (w.resetAt <= now) this.buckets.delete(k);
        }
    }
}

export const chatRateLimiter = new RateLimiter();
