/**
 * documents bundle — lightweight v1. Uploads stay HTTP (multipart);
 * the AI can only delete documents the authenticated user owns.
 */

import { z } from 'zod';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const deleteDocument = defineLocalTool({
    name: 'documents.delete',
    label: 'Delete document',
    description: 'Delete a document by id. Cannot be undone.',
    parameters: z.object({ documentId: z.string().uuid() }),
    confirm: {
        humanSummary: (p) => `Delete document ${p.documentId.slice(0, 8)}…`,
        riskLevel: 'medium',
    },
    async execute(params, ctx) {
        const r = await grpc.documents.deleteDocument(ctx.jwt, params.documentId);
        return { text: r.message, details: { documentId: params.documentId } };
    },
});

export const documentsBundle: ToolBundle = {
    name: 'documents',
    description: 'Manage stored documents.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [],
    writeTools: [deleteDocument],
};
