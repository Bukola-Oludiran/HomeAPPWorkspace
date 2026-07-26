/**
 * Hand-authored TypeScript mirror of proto/maintenance.proto.
 *
 * Until we wire protoc codegen (deferred to P5+), these interfaces give us
 * type-safety in the gRPC handler. They MUST stay in sync with the proto —
 * any field changes there require updating here.
 *
 * Wire shape: @grpc/proto-loader is configured with `enums: String` in
 * server.ts, so enum fields arrive in handlers (and must be set on
 * responses) as STRING enum-token names, not numeric values.
 */

export type MaintenancePriorityWire = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type MaintenanceStatusWire =
    | 'PENDING'
    | 'SUBMITTED'
    | 'ACKNOWLEDGED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'ON_HOLD'
    | 'COMPLETED'
    | 'CANCELLED';
export type PreferredTimeSlotWire = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';

export interface SubmitMaintenanceRequestRequest {
    property_id: string;
    category: string;
    description: string;
    priority: string; // MaintenancePriorityWire or 'MAINTENANCE_PRIORITY_UNSPECIFIED'
    preferred_date?: string;
    preferred_time_slot: string; // PreferredTimeSlotWire or 'PREFERRED_TIME_SLOT_UNSPECIFIED'
    request_id?: string;
}

export interface UpdateMaintenanceRequestRequest {
    id: string;
    status?: string;
    description?: string;
    priority?: string;
    notes?: string;
    resolution?: string;
    cost?: number;
    request_id?: string;
}

export interface AssignMaintenanceAgentRequest {
    id: string;
    agent_id: string;
    scheduled_date: string;
    scheduled_time?: string;
    notes?: string;
    request_id?: string;
}

export interface AssignMaintenanceAgentResponse {
    message: string;
}

export interface PropertyRef {
    id: string;
    name: string;
    address: string;
}

export interface UserRef {
    id: string;
    first_name?: string;
    last_name?: string;
}

export interface MaintenanceRequestPb {
    id: string;
    property_id: string;
    tenant_id: string;
    category?: string;
    description?: string;
    priority: string;
    status: string;
    preferred_date?: string;
    preferred_time_slot?: string;
    photos: string[];
    notes?: string;
    resolution?: string;
    cost?: number;
    property: PropertyRef;
    tenant: UserRef;
    assigned_agent?: UserRef;
    scheduled_date?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// Wire <-> service-layer enum converters
// ============================================
//
// The proto enum tokens (LOW, MEDIUM, ...) happen to match the Prisma enum
// string values 1-for-1, so these helpers are mostly normalizers that
// reject UNSPECIFIED / unknown inputs and downcase the preferred-time-slot
// proto tokens to the lowercase form the service-layer DTO expects.

const PRIORITY_SET = new Set<MaintenancePriorityWire>([
    'LOW',
    'MEDIUM',
    'HIGH',
    'EMERGENCY',
]);
const STATUS_SET = new Set<MaintenanceStatusWire>([
    'PENDING',
    'SUBMITTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
]);
const TIMESLOT_WIRE_TO_DTO: Record<PreferredTimeSlotWire, 'morning' | 'afternoon' | 'evening' | 'any'> = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    ANY: 'any',
};

export function priorityFromWire(v: unknown): MaintenancePriorityWire | undefined {
    return typeof v === 'string' && PRIORITY_SET.has(v as MaintenancePriorityWire)
        ? (v as MaintenancePriorityWire)
        : undefined;
}

export function statusFromWire(v: unknown): MaintenanceStatusWire | undefined {
    return typeof v === 'string' && STATUS_SET.has(v as MaintenanceStatusWire)
        ? (v as MaintenanceStatusWire)
        : undefined;
}

export function timeSlotFromWire(v: unknown): 'morning' | 'afternoon' | 'evening' | 'any' | undefined {
    if (typeof v !== 'string') return undefined;
    return TIMESLOT_WIRE_TO_DTO[v as PreferredTimeSlotWire];
}

export function priorityToWire(p: string): string {
    return PRIORITY_SET.has(p as MaintenancePriorityWire) ? p : 'MAINTENANCE_PRIORITY_UNSPECIFIED';
}

export function statusToWire(s: string): string {
    return STATUS_SET.has(s as MaintenanceStatusWire) ? s : 'MAINTENANCE_STATUS_UNSPECIFIED';
}
