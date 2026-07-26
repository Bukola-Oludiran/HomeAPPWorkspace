// Test-only stub for @complyflow/shared. The real package re-exports type-only
// declarations plus a few constants — we only need it loadable in CJS Jest.

export const COMPLY_EVENT_TYPE = 'comply.event_type';
export const COMPLY_SERVICE = 'comply.service';
export const COMPLY_RESOURCE = 'comply.resource';
export const COMPLY_ACTION = 'comply.action';
export const COMPLY_ACTOR_USER_ID = 'comply.actor.user_id';
export const COMPLY_ACTOR_ROLE = 'comply.actor.role';
export const COMPLY_ACTOR_SERVICE = 'comply.actor.service';
export const COMPLY_DATA_CLASS = 'comply.data_class';
export const COMPLY_ENCRYPTION_STATE = 'comply.encryption_state';
export const COMPLY_TENANT_ID = 'comply.tenant_id';
export const COMPLY_FLOW_FROM = 'comply.flow.from';
export const COMPLY_FLOW_TO = 'comply.flow.to';
export const COMPLY_FLOW_TRANSFORMED = 'comply.flow.transformed';
export const COMPLY_FLOW_TRANSFORMATION_TYPE = 'comply.flow.transformation_type';
export const COMPLY_ACCESS_GRANTED = 'comply.access.granted';
export const COMPLY_ACCESS_METHOD = 'comply.access.method';
export const COMPLY_ACCESS_MFA_VERIFIED = 'comply.access.mfa_verified';
export const COMPLY_ACCESS_DATA_CLASS = 'comply.access.data_class';
export const COMPLY_ACCESS_RECORD_COUNT = 'comply.access.record_count';
export const COMPLY_ACCESS_BATCH_REASON = 'comply.access.batch_reason';
export const ALL_COMPLY_ATTRIBUTES = [] as const;
