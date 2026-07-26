import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.verification', action: 'read', dataClassification: 'PII', reason: 'verification gRPC default' },
    'SubmitAddressVerification': { resource: 'homeai:grpc.verification.address', action: 'write', dataClassification: 'PII', reason: 'address verification submitted' },
    'RequestPropertyVerificationAudit': { resource: 'homeai:grpc.verification.audit', action: 'write', dataClassification: 'PII', reason: 'verification audit requested' },
};

export default registry;
