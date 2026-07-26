/**
 * Structured audit logger for tool calls.
 *
 * Writes JSONL events. By default writes to stdout (via winston-like
 * format); if `AUDIT_LOG_PATH` is set, appends to that file. v2 will
 * pipe to a SIEM / Loki sink.
 *
 * Schema:
 *   { timestamp, type, sessionId, userId, tool, ok, durationMs, summary }
 */

import fs from 'fs';
import { env } from '../config/env';
import { logger } from '../logger';

export interface AuditEvent {
    type: 'tool_call' | 'chat_turn' | 'rate_limited' | 'auth_failure';
    sessionId?: string;
    userId?: string;
    tool?: string;
    ok?: boolean;
    durationMs?: number;
    summary?: string;
    meta?: Record<string, unknown>;
}

class AuditLogger {
    private fileStream: fs.WriteStream | null = null;

    constructor() {
        if (env.AUDIT_LOG_PATH) {
            try {
                this.fileStream = fs.createWriteStream(env.AUDIT_LOG_PATH, { flags: 'a' });
            } catch (e) {
                logger.warn(
                    `Audit logger could not open ${env.AUDIT_LOG_PATH}; falling back to stdout: ${(e as Error).message}`
                );
            }
        }
    }

    write(event: AuditEvent): void {
        const line = JSON.stringify({ timestamp: new Date().toISOString(), ...event });
        if (this.fileStream) {
            this.fileStream.write(line + '\n');
        } else {
            logger.info(`[audit] ${line}`);
        }
    }
}

export const auditLogger = new AuditLogger();
