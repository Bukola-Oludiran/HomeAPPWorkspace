/**
 * Auth contract — Zod request schemas + inferred request types shared
 * between PropApp-Backend (Express validation) and PropApp (Axios request
 * payload typing).
 *
 * Backend re-exports from `src/modules/auth/auth.dto.ts`; frontend
 * re-exports from `src/types/auth.ts`. Change a field here once; both
 * sides type-fail until they update.
 *
 * Response shapes (LoginResponse, AuthTokens, Setup2FAResponse, etc.)
 * are NOT yet contract-owned — they remain in `PropApp/propapp/src/types/auth.ts`
 * pending a follow-up that addresses wire-shape gap (D): the backend
 * returns minimal `{id, email, role}` on login/register/verify-2FA/oauth,
 * while the frontend types the field as the full User profile.
 */

import { z } from 'zod';

// ============================================
// SUB-ENUMS (auth-local subset of UserRole that
// registration / OAuth callers may self-select)
// ============================================

const SELECTABLE_ROLES = ['TENANT', 'LANDLORD', 'AGENT'] as const;

// ============================================
// REGISTRATION REQUEST SCHEMAS
// ============================================

export const initiateRegistrationSchema = z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(SELECTABLE_ROLES).default('TENANT'),
    regionCode: z.string().length(2).default('NG'),
});

export const verifyEmailSchema = z.object({
    email: z.string().email('Invalid email format'),
    code: z.string().length(6, 'Verification code must be 6 characters'),
});

export const completeRegistrationSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().optional(),
    // Forwarded informationally; the service currently keys verification
    // state off the email-scoped store from /register/initiate and ignores
    // role at completion. Accepted so the wire stays forward-compatible
    // with a future backend that honors a final-step role override.
    role: z.enum(SELECTABLE_ROLES).optional(),
    // Opaque token returned by /register/initiate. The service currently
    // re-keys verification state off email rather than validating this
    // token, so it's optional on the wire; clients may still echo it back.
    verificationToken: z.string().optional(),
});

// ============================================
// LOGIN / TOKEN REQUEST SCHEMAS
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    twoFactorCode: z.string().optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const oauthLoginSchema = z.object({
    token: z.string().min(1, 'OAuth token is required'),
    role: z.enum(SELECTABLE_ROLES).optional(),
    regionCode: z.string().length(2).optional(),
});

// ============================================
// PASSWORD RESET REQUEST SCHEMAS
// ============================================

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
});

// ============================================
// TWO-FACTOR AUTHENTICATION REQUEST SCHEMAS
// ============================================

export const verify2FASchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits'),
});

export const disable2FASchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits'),
    password: z.string().min(1, 'Password is required'),
});

// ============================================
// REQUEST TYPES (client-side wire-input shape)
//
// Use z.input so fields-with-Zod-defaults (e.g. `role`, `regionCode` on
// initiate-registration) stay optional from the caller's perspective —
// the backend's validate() middleware fills them in at parse-time.
// ============================================

export type InitiateRegistrationRequest = z.input<typeof initiateRegistrationSchema>;
export type VerifyEmailRequest = z.input<typeof verifyEmailSchema>;
export type CompleteRegistrationRequest = z.input<typeof completeRegistrationSchema>;
export type LoginRequest = z.input<typeof loginSchema>;
export type RefreshTokenRequest = z.input<typeof refreshTokenSchema>;
export type OAuthLoginRequest = z.input<typeof oauthLoginSchema>;
export type ForgotPasswordRequest = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.input<typeof resetPasswordSchema>;
export type Verify2FARequest = z.input<typeof verify2FASchema>;
export type Disable2FARequest = z.input<typeof disable2FASchema>;

// ============================================
// LEGACY BACKEND DTO ALIASES — z.infer (= z.output)
// shape (defaults filled in) for use in backend service signatures
// where req.body has already passed through validate(). Re-exported so
// existing imports (`import { LoginDto } from './auth.dto'`) keep
// compiling. Prefer the *Request names for new code.
// ============================================

export type InitiateRegistrationDto = z.infer<typeof initiateRegistrationSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type CompleteRegistrationDto = z.infer<typeof completeRegistrationSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type OAuthLoginDto = z.infer<typeof oauthLoginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type Verify2FADto = z.infer<typeof verify2FASchema>;
export type Disable2FADto = z.infer<typeof disable2FASchema>;
