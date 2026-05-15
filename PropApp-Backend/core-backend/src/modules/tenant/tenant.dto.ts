/**
 * Tenant Dashboard Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/tenant.contract`.
 */

export {
    dashboardQuerySchema,
    submitApplicationSchema,
    applicationQuerySchema,
    makePaymentSchema,
    paymentQuerySchema,
    type DashboardQueryDto,
    type SubmitApplicationDto,
    type ApplicationQueryDto,
    type MakePaymentDto,
    type PaymentQueryDto,
} from '@homeai/contracts/tenant.contract';
