/**
 * Banking Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/banking.contract`.
 */

export {
    addBankAccountSchema,
    resolveBankAccountSchema,
    bankQuerySchema,
    updatePayoutSettingsSchema,
    requestPayoutSchema,
    payoutQuerySchema,
    type AddBankAccountDto,
    type ResolveBankAccountDto,
    type BankQueryDto,
    type UpdatePayoutSettingsDto,
    type RequestPayoutDto,
    type PayoutQueryDto,
} from '@homeai/contracts/banking.contract';
