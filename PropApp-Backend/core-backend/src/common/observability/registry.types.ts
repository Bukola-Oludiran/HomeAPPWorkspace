import type { DataClassification, ComplianceActor } from './compliance.types';
import type { Request, Response } from 'express';

export type ComplianceAction = 'read' | 'write' | 'delete' | 'list';

/**
 * Static metadata declaring how a single HTTP route maps to ComplyFlow event fields.
 * Modules export one of these per route in <module>.compliance.ts.
 */
export interface RouteComplianceEntry {
    resource: string;
    action: ComplianceAction;
    dataClassification: DataClassification;
    reason?: string;
    /** Override the default actor (used by webhooks, service-auth routes). */
    actorOverride?: ComplianceActor;
    /** If true, emissions are suppressed on 4xx/5xx responses. Defaults to false. */
    skipOnError?: boolean;
}

/**
 * Function-form entry for routes whose record_count / reason / classification depends on
 * runtime data (e.g. paginated lists, bulk operations).
 */
export type RouteComplianceFn = (
    req: Request,
    res: Response,
) => RouteComplianceEntry & { recordCount?: number; batchReason?: string };

export type RouteComplianceMetadata = RouteComplianceEntry | RouteComplianceFn;

/**
 * Module-scoped registry keyed by `'<METHOD> <relative-path>'`, e.g. `'GET /me'`.
 * Path is relative to the module's mount in src/index.ts; the aggregator prefixes
 * `/api/v1/<module>` at lookup time.
 */
export type ModuleComplianceRegistry = Record<string, RouteComplianceMetadata>;

export type GrpcMethodComplianceEntry = RouteComplianceEntry;
export type GrpcServiceRegistry = Record<string, GrpcMethodComplianceEntry>;
