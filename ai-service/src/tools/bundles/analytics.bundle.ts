/**
 * analytics bundle — POST-as-compute. The price-optimization tool is the
 * primary surface; lease-reports / financial-reports are in their own
 * bundle.
 */

import { z } from 'zod';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

const getPriceOptimization = defineLocalTool({
    name: 'analytics.priceOptimization',
    label: 'Price optimization',
    description:
        'Get a recommended listing price for a property, optimized for the chosen objective (occupancy, yield, or time-to-rent). Landlord-side.',
    parameters: z.object({
        propertyId: z.string().uuid(),
        objective: z.enum(['OCCUPANCY', 'YIELD', 'TIME_TO_RENT']),
        currentPrice: z.number().nonnegative().optional(),
    }),
    async execute(params, ctx) {
        const r = await grpc.analytics.getPriceOptimization(ctx.jwt, {
            property_id: params.propertyId,
            objective: params.objective,
            current_price: params.currentPrice,
        });
        return {
            text: `Recommended price: ₦${r.recommended_price.toLocaleString()} (${Math.round(r.confidence * 100)}% confidence). ${r.rationale}`,
            details: { ...r, queriedBy: ctx.user.userId },
        };
    },
});

export const analyticsBundle: ToolBundle = {
    name: 'analytics',
    description: 'Compute price recommendations for property listings.',
    eligibleRoles: ['LANDLORD', 'ADMIN'],
    readTools: [getPriceOptimization],
    writeTools: [],
};
