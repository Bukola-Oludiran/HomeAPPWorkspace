import type { GrpcServiceRegistry } from '../../common/observability/registry.types';

const registry: GrpcServiceRegistry = {
    '*': { resource: 'homeai:grpc.landlord', action: 'read', dataClassification: 'internal', reason: 'landlord gRPC default' },
    'RejectApplicant': { resource: 'homeai:grpc.landlord.applicants', action: 'write', dataClassification: 'PII', reason: 'applicant rejected' },
    'CreateLandlordJob': { resource: 'homeai:grpc.landlord.jobs', action: 'write', dataClassification: 'internal', reason: 'landlord job created' },
};

export default registry;
