import { z } from 'zod';
import { OpenAPIRegistry, requireBearerAuth, STANDARD_ERROR_RESPONSES, successResponse } from './openapi';

export const availabilitySchema = z.object({
    date: z.coerce.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    recurring: z.boolean().default(false),
    recurringDays: z.array(z.enum(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])).default([]),
}).refine(value => value.endTime > value.startTime, { message: 'End time must be after start time', path: ['endTime'] });
export const applicantInvitationSchema = z.object({ propertyId: z.string().uuid(), email: z.string().email(), personalInfo: z.record(z.unknown()).optional(), employmentInfo: z.record(z.unknown()).optional() });
export const reviewSchema = z.object({ subjectId: z.string().uuid(), contextType: z.enum(['LEASE', 'JOB']), contextId: z.string().uuid(), rating: z.number().int().min(1).max(5), body: z.string().max(2000).optional() });
export const exportSchema = z.object({ dataset: z.enum(['transactions', 'applications', 'jobs']), format: z.enum(['csv', 'pdf', 'xlsx']), start: z.coerce.date().optional(), end: z.coerce.date().optional() });

export const registerIntegrationPaths = (registry: OpenAPIRegistry): void => {
    const ok = successResponse('Success', z.unknown());
    const paths: Array<[string, 'get' | 'post' | 'put' | 'delete']> = [
        ['/landlord/applicant-invitations', 'get'], ['/landlord/applicant-invitations', 'post'], ['/landlord/applicant-invitations/{id}', 'delete'],
        ['/tenant/applicant-invitations/{token}', 'get'], ['/tenant/applicant-invitations/{token}', 'post'],
        ['/agent/availability', 'get'], ['/agent/availability', 'post'], ['/agent/availability/{id}', 'put'], ['/agent/availability/{id}', 'delete'],
        ['/reviews', 'post'], ['/users/{id}/reviews', 'get'], ['/users/me/billing-statements', 'get'], ['/exports', 'post'],
    ];
    paths.forEach(([path, method]) => registry.registerPath({ method, path, tags: ['Integration'], security: requireBearerAuth, responses: { 200: ok, ...STANDARD_ERROR_RESPONSES } }));
};
