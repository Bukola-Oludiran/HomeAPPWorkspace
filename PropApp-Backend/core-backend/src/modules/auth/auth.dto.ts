/**
 * Auth Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/auth.contract`. This file is a
 * back-compat re-export so existing module imports (`./auth.dto`) keep
 * resolving while we migrate to direct `@homeai/contracts/auth.contract`
 * imports across the codebase.
 */

export {
    initiateRegistrationSchema,
    verifyEmailSchema,
    completeRegistrationSchema,
    loginSchema,
    refreshTokenSchema,
    oauthLoginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verify2FASchema,
    disable2FASchema,
    type InitiateRegistrationDto,
    type VerifyEmailDto,
    type CompleteRegistrationDto,
    type LoginDto,
    type RefreshTokenDto,
    type OAuthLoginDto,
    type ForgotPasswordDto,
    type ResetPasswordDto,
    type Verify2FADto,
    type Disable2FADto,
} from '@homeai/contracts/auth.contract';
