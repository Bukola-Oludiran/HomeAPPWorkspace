import { availabilitySchema, applicantInvitationSchema, exportSchema, reviewSchema } from '@homeai/contracts/integration.contract';
import { buildOpenApiDocument } from '../../src/config/swagger';
import { CANONICAL_OPENAPI_PATHS } from '@homeai/contracts/routes';

describe('integration API contracts', () => {
    it('accepts supported integration request shapes', () => {
        expect(applicantInvitationSchema.safeParse({ propertyId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'tenant@example.com' }).success).toBe(true);
        expect(availabilitySchema.safeParse({ date: '2026-08-21', startTime: '09:00', endTime: '17:00', recurring: false }).success).toBe(true);
        expect(reviewSchema.safeParse({ subjectId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', contextType: 'JOB', contextId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', rating: 5 }).success).toBe(true);
        expect(exportSchema.safeParse({ dataset: 'transactions', format: 'xlsx' }).success).toBe(true);
    });

    it('keeps canonical frontend routes in the generated document', () => {
        const paths = buildOpenApiDocument().paths ?? {};
        CANONICAL_OPENAPI_PATHS.forEach(path => expect(paths[path]).toBeDefined());
    });
});
