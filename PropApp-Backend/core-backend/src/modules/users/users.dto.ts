/**
 * User Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/users.contract`.
 */

export {
    updateProfileSchema,
    updatePasswordSchema,
    updatePreferencesSchema,
    updateNotificationSettingsSchema,
    connectWalletSchema,
    type UpdateProfileDto,
    type UpdatePasswordDto,
    type UpdatePreferencesDto,
    type UpdateNotificationSettingsDto,
    type ConnectWalletDto,
} from '@homeai/contracts/users.contract';
