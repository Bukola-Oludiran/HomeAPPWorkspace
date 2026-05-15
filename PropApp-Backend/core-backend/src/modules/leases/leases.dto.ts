/**
 * Lease Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/lease.contract`. This file
 * is a back-compat re-export so existing module imports (`./leases.dto`)
 * keep resolving.
 */

export {
    createLeaseSchema,
    updateLeaseSchema,
    updateLeaseStatusSchema,
    sendRenewalOfferSchema,
    respondToRenewalSchema,
    signLeaseSchema,
    type CreateLeaseDto,
    type UpdateLeaseDto,
    type UpdateLeaseStatusDto,
    type SendRenewalOfferDto,
    type RespondToRenewalDto,
    type SignLeaseDto,
} from '@homeai/contracts/lease.contract';
