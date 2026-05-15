/**
 * Verification Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/verification.contract`.
 */

export {
    verificationTierSchema,
    submitIdentityVerificationSchema,
    submitDocumentSchema,
    requestPropertyVerificationSchema,
    submitPropertyVerificationResultSchema,
    verificationQuerySchema,
    type VerificationTier,
    type SubmitIdentityVerificationDto,
    type SubmitDocumentDto,
    type RequestPropertyVerificationDto,
    type SubmitPropertyVerificationResultDto,
    type VerificationQueryDto,
} from '@homeai/contracts/verification.contract';
