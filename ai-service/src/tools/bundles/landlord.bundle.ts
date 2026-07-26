/**
 * landlord bundle — landlord-side writes that don't belong to other
 * domain bundles: applicant approve/reject, payout request, job creation.
 *
 * Reads in this domain are exposed via the existing applications bundle
 * (listMine — landlord branch).
 */

import { z } from 'zod';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const approveApplicant = defineLocalTool({
    name: 'landlord.approveApplicant',
    label: 'Approve applicant',
    description:
        'Approve a tenant application for one of your properties. Triggers lease draft creation.',
    parameters: z.object({ applicationId: z.string().uuid() }),
    confirm: {
        humanSummary: (p) => `Approve application ${p.applicationId.slice(0, 8)}…`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.landlord.approveApplicant(ctx.jwt, params.applicationId);
        return { text: r.message, details: { applicationId: params.applicationId } };
    },
});

const rejectApplicant = defineLocalTool({
    name: 'landlord.rejectApplicant',
    label: 'Reject applicant',
    description: 'Reject a tenant application.',
    parameters: z.object({
        applicationId: z.string().uuid(),
        reason: z.string().max(500).optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Reject application ${p.applicationId.slice(0, 8)}…${p.reason ? `: "${p.reason.slice(0, 80)}"` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.landlord.rejectApplicant(
            ctx.jwt,
            params.applicationId,
            params.reason
        );
        return { text: r.message, details: { applicationId: params.applicationId } };
    },
});

const requestPayout = defineLocalTool({
    name: 'landlord.requestPayout',
    label: 'Request payout',
    description: 'Request a payout of rent income to your default bank account.',
    parameters: z.object({
        amount: z.number().positive().max(50_000_000),
        bankAccountId: z.string().uuid().optional(),
    }),
    confirm: {
        humanSummary: (p) => `Request payout of ₦${p.amount.toLocaleString()}.`,
        riskLevel: 'high',
    },
    async execute(params, ctx) {
        const r = await grpc.landlord.requestLandlordPayout(ctx.jwt, {
            amount: params.amount,
            bank_account_id: params.bankAccountId,
        });
        return { text: `Payout ${r.payout_id} ${r.status}.`, details: { ...r } };
    },
});

const createJob = defineLocalTool({
    name: 'landlord.createJob',
    label: 'Create agent job',
    description:
        'Create a job for agents (property viewing, audit, maintenance assist) and set a payout.',
    parameters: z.object({
        jobType: z.enum(['PROPERTY_VIEWING', 'PROPERTY_AUDIT', 'MAINTENANCE']),
        propertyId: z.string().uuid(),
        scheduledDate: z.string().optional(),
        payoutAmount: z.number().nonnegative().max(5_000_000).optional(),
        notes: z.string().max(2000).optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Create ${p.jobType} job for property ${p.propertyId.slice(0, 8)}…${p.payoutAmount ? `, payout ₦${p.payoutAmount.toLocaleString()}` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.landlord.createLandlordJob(ctx.jwt, {
            job_type: params.jobType,
            property_id: params.propertyId,
            scheduled_date: params.scheduledDate,
            payout_amount: params.payoutAmount,
            notes: params.notes,
        });
        return { text: `Job ${r.job_id} created.`, details: { jobId: r.job_id } };
    },
});

export const landlordBundle: ToolBundle = {
    name: 'landlord',
    description: 'Landlord-side actions: approve/reject applicants, request payouts, create agent jobs.',
    eligibleRoles: ['LANDLORD', 'ADMIN'],
    readTools: [],
    writeTools: [approveApplicant, rejectApplicant, requestPayout, createJob],
};
