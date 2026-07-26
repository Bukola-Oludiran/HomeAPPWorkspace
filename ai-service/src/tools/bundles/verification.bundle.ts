/**
 * verification bundle — getMyStatus (read) + submit-flow tools (write).
 */

import { z } from 'zod';
import { VerificationTierValues } from '@homeai/contracts/enums';
import type { VerificationStatusCardProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const getMyStatus = defineLocalTool({
    name: 'verification.getMyStatus',
    label: 'My verification status',
    description: 'Get the authenticated user’s current verification tier and outstanding steps.',
    parameters: z.object({}),
    async execute(_params, ctx, sink) {
        const user = await prismaReadonly.user.findUnique({
            where: { id: ctx.user.userId },
            select: { verificationLevel: true },
        });
        const tier = (user?.verificationLevel ?? 'UNVERIFIED') as
            (typeof VerificationTierValues)[number];

        const card: VerificationStatusCardProps = {
            tier,
            stepsComplete:
                tier === 'UNVERIFIED'
                    ? []
                    : ['Identity verified', ...(tier === 'BRONZE' ? [] : ['Address verified'])],
            stepsPending:
                tier === 'PLATINUM'
                    ? []
                    : tier === 'UNVERIFIED'
                      ? ['Submit identity', 'Submit address proof']
                      : ['Add documents'],
            actions: [{ id: 'continue', label: 'Continue verification', kind: 'primary' as const }],
        };
        sink.ui({ type: 'VerificationStatusCard', props: card });
        return {
            text: `Your verification tier is ${tier}.`,
            details: { tier, userId: ctx.user.userId },
        };
    },
});

const submitIdentity = defineLocalTool({
    name: 'verification.submitIdentity',
    label: 'Submit identity verification',
    description: 'Submit an identity document (NIN / passport / driver’s license).',
    parameters: z.object({
        documentType: z.enum(['NIN', 'PASSPORT', 'DRIVERS_LICENSE']),
        documentNumber: z.string().min(3).max(50),
        documentUrl: z.string().url().optional(),
    }),
    confirm: {
        humanSummary: (p) => `Submit ${p.documentType} ${p.documentNumber} for identity verification.`,
        riskLevel: 'low',
    },
    async execute(params, ctx) {
        const r = await grpc.verification.submitIdentity(ctx.jwt, {
            document_type: params.documentType,
            document_number: params.documentNumber,
            document_url: params.documentUrl,
        });
        return { text: `Identity submission ${r.status}. Reference ${r.id}.`, details: { ...r } };
    },
});

const submitAddress = defineLocalTool({
    name: 'verification.submitAddress',
    label: 'Submit address verification',
    description: 'Submit an address proof document URL.',
    parameters: z.object({
        documentUrl: z.string().url(),
        documentType: z.string().optional(),
    }),
    async execute(params, ctx) {
        const r = await grpc.verification.submitAddress(ctx.jwt, {
            document_url: params.documentUrl,
            document_type: params.documentType,
        });
        return { text: `Address submission ${r.status}. Reference ${r.id}.`, details: { ...r } };
    },
});

const submitCofo = defineLocalTool({
    name: 'verification.submitCofo',
    label: 'Submit C of O',
    description: 'Submit a Certificate of Occupancy for a property you own. (Landlord-only.)',
    parameters: z.object({
        propertyId: z.string().uuid(),
        documentUrl: z.string().url(),
    }),
    confirm: {
        humanSummary: (p) => `Submit C of O for property ${p.propertyId.slice(0, 8)}…`,
        riskLevel: 'low',
    },
    async execute(params, ctx) {
        const r = await grpc.verification.submitCofo(ctx.jwt, {
            property_id: params.propertyId,
            document_url: params.documentUrl,
        });
        return { text: `C of O submission ${r.status}. Reference ${r.id}.`, details: { ...r } };
    },
});

const requestAudit = defineLocalTool({
    name: 'verification.requestPropertyAudit',
    label: 'Request property audit',
    description: 'Request an in-person property verification audit. (Landlord-only.)',
    parameters: z.object({
        propertyId: z.string().uuid(),
        preferredDate: z.string().optional(),
        notes: z.string().max(1000).optional(),
    }),
    confirm: {
        humanSummary: (p) =>
            `Request audit for property ${p.propertyId.slice(0, 8)}…${p.preferredDate ? ` on ${p.preferredDate}` : ''}.`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.verification.requestPropertyAudit(ctx.jwt, {
            property_id: params.propertyId,
            preferred_date: params.preferredDate,
            notes: params.notes,
        });
        return { text: `Property audit request ${r.status}. Reference ${r.id}.`, details: { ...r } };
    },
});

export const verificationBundle: ToolBundle = {
    name: 'verification',
    description: 'View and submit identity, address, and property verification.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [getMyStatus],
    writeTools: [submitIdentity, submitAddress, submitCofo, requestAudit],
};
