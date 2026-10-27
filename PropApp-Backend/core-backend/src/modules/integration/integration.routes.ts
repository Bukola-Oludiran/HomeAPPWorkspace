/**
 * Integration Routes
 * Applicant invitations, agent availability, reviews, billing statements and exports.
 *
 * Reconstructed 2026-10-26 from the compiled dist/modules/integration/integration.routes.js
 * after the original source was lost (it was never committed). Behaviour matches the
 * compiled build; types are restored from @homeai/contracts/integration.contract and Prisma.
 */

import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Prisma, ReviewType } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { authenticate, requireRoles } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import { AppError, NotFoundError } from '../../common/utils/errors';
import { communicationProviderFactory } from '../../integrations/communication';
import {
    applicantInvitationSchema,
    availabilitySchema,
    reviewSchema,
    exportSchema,
} from '@homeai/contracts/integration.contract';

type ApplicantInvitationBody = z.infer<typeof applicantInvitationSchema>;
type AvailabilityBody = z.infer<typeof availabilitySchema>;
type ReviewBody = z.infer<typeof reviewSchema>;
type ExportBody = z.infer<typeof exportSchema>;

const router = Router();

// Invitation tokens are emailed in plain form; only their SHA-256 hash is stored.
const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

// ============================================
// APPLICANT INVITATIONS (landlord)
// ============================================

router.post(
    '/landlord/applicant-invitations',
    authenticate,
    requireRoles('LANDLORD', 'ADMIN'),
    validate(applicantInvitationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as ApplicantInvitationBody;
            const property = await prisma.property.findFirst({ where: { id: body.propertyId, ownerId: req.user!.id } });
            if (!property) throw new NotFoundError('Property not found');

            const token = crypto.randomBytes(32).toString('hex');
            const invitation = await prisma.applicantInvitation.create({
                data: {
                    tokenHash: hashToken(token),
                    landlordId: req.user!.id,
                    propertyId: property.id,
                    email: body.email.toLowerCase(),
                    personalInfo: body.personalInfo as Prisma.InputJsonValue | undefined,
                    employmentInfo: body.employmentInfo as Prisma.InputJsonValue | undefined,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                include: { property: true },
            });

            const invitationUrl = `${env.FRONTEND_URL}/applicant-invitations/${token}`;
            const provider = communicationProviderFactory.getEmailProvider(req.user!.regionCode);
            void provider.sendEmail({
                to: invitation.email,
                subject: `Invitation to apply for ${property.name}`,
                html: `<p>You have been invited to apply for ${property.name}.</p><p><a href="${invitationUrl}">Review invitation</a></p>`,
            });

            sendCreated(res, {
                ...invitation,
                // Expose the link outside production so invitations can be tested without email
                invitationUrl: env.NODE_ENV === 'production' ? undefined : invitationUrl,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/landlord/applicant-invitations',
    authenticate,
    requireRoles('LANDLORD', 'ADMIN'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const invitations = await prisma.applicantInvitation.findMany({
                where: { landlordId: req.user!.id },
                include: { property: true },
                orderBy: { createdAt: 'desc' },
            });
            sendSuccess(res, invitations);
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/landlord/applicant-invitations/:id',
    authenticate,
    requireRoles('LANDLORD', 'ADMIN'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await prisma.applicantInvitation.updateMany({
                where: { id: req.params.id, landlordId: req.user!.id, acceptedAt: null, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            if (!result.count) throw new NotFoundError('Active invitation not found');
            sendSuccess(res, { message: 'Invitation revoked' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// APPLICANT INVITATIONS (tenant)
// ============================================

const findInvitation = async (token: string) =>
    prisma.applicantInvitation.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { property: true, landlord: { select: { firstName: true, lastName: true } } },
    });

// Public: the invitation link is the credential
router.get('/tenant/applicant-invitations/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invitation = await findInvitation(req.params.token);
        if (!invitation || invitation.revokedAt || invitation.expiresAt <= new Date()) {
            throw new NotFoundError('Invitation not found or expired');
        }
        sendSuccess(res, {
            id: invitation.id,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            acceptedAt: invitation.acceptedAt,
            property: invitation.property,
            landlord: invitation.landlord,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/tenant/applicant-invitations/:token',
    authenticate,
    requireRoles('TENANT'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const invitation = await findInvitation(req.params.token);
            if (!invitation || invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
                throw new NotFoundError('Invitation not found or expired');
            }
            if (invitation.email !== req.user!.email.toLowerCase()) {
                throw new AppError('Invitation belongs to another email', 'AUTH_003', 403);
            }

            const application = await prisma.$transaction(async (tx) => {
                const created = await tx.application.create({
                    data: {
                        propertyId: invitation.propertyId,
                        tenantId: req.user!.id,
                        personalInfo: (invitation.personalInfo ?? undefined) as Prisma.InputJsonValue | undefined,
                        employmentInfo: (invitation.employmentInfo ?? undefined) as Prisma.InputJsonValue | undefined,
                    },
                });
                await tx.applicantInvitation.update({
                    where: { id: invitation.id },
                    data: { acceptedAt: new Date(), acceptedById: req.user!.id, applicationId: created.id },
                });
                return created;
            });

            sendCreated(res, application);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// AGENT AVAILABILITY
// ============================================

router.get(
    '/agent/availability',
    authenticate,
    requireRoles('AGENT', 'ADMIN'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            sendSuccess(
                res,
                await prisma.agentAvailability.findMany({
                    where: { agentId: req.user!.id },
                    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
                })
            );
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/agent/availability',
    authenticate,
    requireRoles('AGENT', 'ADMIN'),
    validate(availabilitySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as AvailabilityBody;
            sendCreated(res, await prisma.agentAvailability.create({ data: { ...body, agentId: req.user!.id } }));
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/agent/availability/:id',
    authenticate,
    requireRoles('AGENT', 'ADMIN'),
    validate(availabilitySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const found = await prisma.agentAvailability.findFirst({ where: { id: req.params.id, agentId: req.user!.id } });
            if (!found) throw new NotFoundError('Availability not found');
            sendSuccess(
                res,
                await prisma.agentAvailability.update({ where: { id: found.id }, data: req.body as AvailabilityBody })
            );
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/agent/availability/:id',
    authenticate,
    requireRoles('AGENT', 'ADMIN'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await prisma.agentAvailability.deleteMany({ where: { id: req.params.id, agentId: req.user!.id } });
            if (!result.count) throw new NotFoundError('Availability not found');
            sendSuccess(res, { message: 'Availability removed' });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// REVIEWS
// ============================================

router.post('/reviews', authenticate, validate(reviewSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subjectId, contextType, contextId, rating, body } = req.body as ReviewBody;
        let eligible = false;
        let type: ReviewType = 'AGENT_REVIEW';

        // Only parties to a finished lease or completed job may review each other
        if (contextType === 'LEASE') {
            const lease = await prisma.lease.findUnique({ where: { id: contextId } });
            eligible =
                !!lease &&
                ['ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'].includes(lease.status) &&
                ((lease.tenantId === req.user!.id && lease.landlordId === subjectId) ||
                    (lease.landlordId === req.user!.id && lease.tenantId === subjectId));
            if (lease) type = lease.landlordId === subjectId ? 'LANDLORD_REVIEW' : 'TENANT_REVIEW';
        } else {
            const job = await prisma.agentJob.findUnique({ where: { id: contextId } });
            eligible =
                !!job &&
                job.status === 'COMPLETED' &&
                ((job.requesterId === req.user!.id && job.assignedAgentId === subjectId) ||
                    (job.assignedAgentId === req.user!.id && job.requesterId === subjectId));
        }
        if (!eligible) throw new AppError('Review is not allowed for this context', 'REVIEW_001', 403);

        const contextLink = contextType === 'LEASE' ? { leaseId: contextId } : { agentJobId: contextId };
        const duplicate = await prisma.review.findFirst({
            where: { authorId: req.user!.id, subjectId, deletedAt: null, ...contextLink },
        });
        if (duplicate) throw new AppError('This interaction has already been reviewed', 'REVIEW_002', 409);

        sendCreated(
            res,
            await prisma.review.create({
                data: {
                    authorId: req.user!.id,
                    subjectId,
                    type,
                    rating,
                    body,
                    isVerified: true,
                    ...contextLink,
                },
            })
        );
    } catch (error) {
        next(error);
    }
});

const pageSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get('/users/:id/reviews', validateQuery(pageSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as z.infer<typeof pageSchema>;
        const where: Prisma.ReviewWhereInput = { subjectId: req.params.id, isPublic: true, isHidden: false, deletedAt: null };
        const [reviews, total, aggregate] = await Promise.all([
            prisma.review.findMany({
                where,
                include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.review.count({ where }),
            prisma.review.aggregate({ where, _avg: { rating: true } }),
        ]);
        sendSuccess(
            res,
            { reviews, averageRating: aggregate._avg.rating ?? 0 },
            { page, limit, total, totalPages: Math.ceil(total / limit) }
        );
    } catch (error) {
        next(error);
    }
});

// ============================================
// BILLING STATEMENTS
// ============================================

router.get('/users/me/billing-statements', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { OR: [{ payerId: req.user!.id }, { payeeId: req.user!.id }] },
            orderBy: { createdAt: 'desc' },
        });

        // One statement per calendar month (YYYY-MM)
        const groups = new Map<string, typeof transactions>();
        for (const transaction of transactions) {
            const key = transaction.createdAt.toISOString().slice(0, 7);
            groups.set(key, [...(groups.get(key) ?? []), transaction]);
        }

        sendSuccess(
            res,
            Array.from(groups, ([period, items]) => ({
                id: period,
                period,
                transactionCount: items.length,
                total: items.reduce((sum, item) => sum + Number(item.amount), 0),
                currency: items[0]?.currency ?? 'NGN',
            }))
        );
    } catch (error) {
        next(error);
    }
});

// ============================================
// EXPORTS (CSV / XLSX / PDF)
// ============================================

const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

router.post('/exports', authenticate, validate(exportSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dataset, format, start, end } = req.body as ExportBody;
        const date = start || end ? { gte: start, lte: end } : undefined;
        let rows: Array<Record<string, unknown>> = [];

        if (dataset === 'transactions') {
            rows = (
                await prisma.transaction.findMany({
                    where: { OR: [{ payerId: req.user!.id }, { payeeId: req.user!.id }], createdAt: date },
                })
            ).map((item) => ({
                id: item.id,
                type: item.type,
                amount: Number(item.amount),
                currency: item.currency,
                status: item.status,
                createdAt: item.createdAt.toISOString(),
            }));
        }
        if (dataset === 'applications') {
            rows = (
                await prisma.application.findMany({
                    where:
                        req.user!.role === 'TENANT'
                            ? { tenantId: req.user!.id, submittedAt: date }
                            : { property: { ownerId: req.user!.id }, submittedAt: date },
                    include: { property: { select: { name: true } } },
                })
            ).map((item) => ({
                id: item.id,
                property: item.property.name,
                status: item.status,
                submittedAt: item.submittedAt.toISOString(),
            }));
        }
        if (dataset === 'jobs') {
            rows = (
                await prisma.agentJob.findMany({
                    where: { OR: [{ requesterId: req.user!.id }, { assignedAgentId: req.user!.id }], createdAt: date },
                })
            ).map((item) => ({
                id: item.id,
                type: item.type,
                status: item.status,
                scheduledDate: item.scheduledDate?.toISOString() ?? null,
                createdAt: item.createdAt.toISOString(),
            }));
        }

        const columns = rows.length ? Object.keys(rows[0]) : ['id'];
        const filename = `${dataset}-${new Date().toISOString().slice(0, 10)}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        if (format === 'csv') {
            res.type('text/csv').send(
                [columns.map(csvCell).join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n')
            );
            return;
        }

        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet(dataset);
            sheet.columns = columns.map((key) => ({ header: key, key }));
            rows.forEach((row) => sheet.addRow(row));
            res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const buffer = await workbook.xlsx.writeBuffer();
            res.send(Buffer.from(buffer));
            return;
        }

        res.type('application/pdf');
        const doc = new PDFDocument({ margin: 36 });
        doc.pipe(res);
        doc.fontSize(18).text(`${dataset[0].toUpperCase()}${dataset.slice(1)} export`);
        doc.moveDown();
        rows.forEach((row) => {
            doc.fontSize(9).text(columns.map((column) => `${column}: ${row[column] ?? ''}`).join(' | '));
            doc.moveDown(0.4);
        });
        doc.end();
    } catch (error) {
        next(error);
    }
});

export default router;
