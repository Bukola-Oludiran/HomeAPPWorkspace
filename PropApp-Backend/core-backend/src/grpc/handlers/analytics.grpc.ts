/**
 * Analytics gRPC handlers — POST-as-compute (no DB write).
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { analyticsService } from '../../modules/analytics/analytics.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface PriceOptimizationRequest {
    property_id: string;
    objective: string;
    current_price?: number;
    request_id?: string;
}
interface PriceOptimizationResult {
    recommended_price: number;
    rationale: string;
    confidence: number;
}

export const getPriceOptimization: handleUnaryCall<PriceOptimizationRequest, PriceOptimizationResult> =
    async (
        call: ServerUnaryCall<PriceOptimizationRequest, PriceOptimizationResult>,
        callback: sendUnaryData<PriceOptimizationResult>
    ) => {
        try {
            const ctx = await authenticateGrpc(call.metadata);
            const r = call.request;
            const result = await analyticsService.getPriceOptimization(
                r.property_id,
                ctx.userId,
                { objective: r.objective, currentPrice: r.current_price } as never
            );
            callback(null, {
                recommended_price: (result as any).recommendedPrice ?? 0,
                rationale: (result as any).rationale ?? '',
                confidence: (result as any).confidence ?? 0,
            });
        } catch (err) {
            callback(toGrpcError(err) as never, null);
        }
    };

export const analyticsHandlers = {
    GetPriceOptimization: getPriceOptimization,
};
