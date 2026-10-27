/**
 * Auth contract — Zod request schemas + inferred request types shared
 * between PropApp-Backend (Express validation) and PropApp (Axios request
 * payload typing). Also registers paths with the OpenAPI registry so the
 * Swagger UI at `/api-docs` renders every endpoint from this single
 * source of truth.
 */

import { z } from 'zod';
import { UserRoleValues, VerificationLevelValues } from './enums';
import {
    OpenAPIRegistry,
    paginatedResponse,
    requireBearerAuth,
    STANDARD_ERROR_RESPONSES,
    successResponse,
} from './openapi';

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

export const verify2FAChallengeSchema = z.object({
    challengeToken: z.string().min(1),
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
export type Verify2FAChallengeRequest = z.input<typeof verify2FAChallengeSchema>;
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
export type Verify2FAChallengeDto = z.infer<typeof verify2FAChallengeSchema>;
export type Disable2FADto = z.infer<typeof disable2FASchema>;

// ============================================
// RESPONSE / WIRE SCHEMAS
//
// What every auth-returning endpoint actually carries on the wire after
// the backend runs `serializeAuthUser()`. The frontend `User` interface
// re-exports `WireAuthUser` so a single shape drives both sides — the
// plan section (D) gap is closed.
// ============================================

export const authTokensSchema = z
    .object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number().int().positive(),
    })
    .openapi('AuthTokens');

/**
 * Full user wire shape — sent back on `login`, `register/complete`,
 * `login/oauth/:provider`, and `users/me`. Nullables mirror the Prisma
 * row; the frontend handles them with `|| ''` fallbacks at render time.
 */
export const wireAuthUserSchema = z
    .object({
        id: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(UserRoleValues),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        phone: z.string().nullable(),
        avatarUrl: z.string().nullable(),
        verificationLevel: z.enum(VerificationLevelValues),
        isEmailVerified: z.boolean(),
        is2FAEnabled: z.boolean(),
        regionCode: z.string().length(2),
        walletAddress: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })
    .openapi('WireAuthUser');

export const authenticatedLoginResponseSchema = z
    .object({
        user: wireAuthUserSchema,
        tokens: authTokensSchema,
        requires2FA: z.literal(false),
    })
    .openapi('AuthenticatedLoginResponse');

export const twoFactorChallengeResponseSchema = z.object({
    requires2FA: z.literal(true),
    challengeToken: z.string(),
    expiresIn: z.number().int().positive(),
}).openapi('TwoFactorChallengeResponse');

export const loginResponseSchema = z.union([
    authenticatedLoginResponseSchema,
    twoFactorChallengeResponseSchema,
]).openapi('LoginResponse');

export type AuthTokens = z.infer<typeof authTokensSchema>;
export type WireAuthUser = z.infer<typeof wireAuthUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

// ============================================
// SECONDARY RESPONSE SCHEMAS
// ============================================

const messageOnlyResponseSchema = z.object({ message: z.string() });
const messageWithVerificationSchema = z.object({
    message: z.string(),
    verificationToken: z.string(),
    expiresAt: z.string(),
});
const verifyEmailResponseSchema = z.object({
    verified: z.boolean(),
    message: z.string(),
});
const setup2faResponseSchema = z.object({
    secret: z.string(),
    qrCodeUrl: z.string(),
    recoveryCodes: z.array(z.string()),
});
const verify2faResponseSchema = z.object({ enabled: z.boolean() });
const disable2faResponseSchema = z.object({ disabled: z.boolean() });
const recoveryCodesResponseSchema = z.object({
    recoveryCodes: z.array(z.string()),
});

// ============================================
// OPENAPI PATH REGISTRATION
// ============================================

const TAG = 'Auth';
const JSON_BODY = (schema: z.ZodTypeAny) => ({
    body: { content: { 'application/json': { schema } } },
});

export const registerAuthPaths = (registry: OpenAPIRegistry): void => {
    registry.registerPath({
        method: 'post',
        path: '/auth/2fa/challenge/verify',
        tags: [TAG],
        summary: 'Complete a pending login challenge with a TOTP code.',
        request: JSON_BODY(verify2FAChallengeSchema),
        responses: {
            200: successResponse('Login successful', authenticatedLoginResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/register/initiate',
        tags: [TAG],
        summary: 'Start registration — sends a verification email.',
        request: JSON_BODY(initiateRegistrationSchema),
        responses: {
            200: successResponse('Verification code dispatched', messageWithVerificationSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/register/verify-email',
        tags: [TAG],
        summary: 'Confirm the 6-digit code emailed to the user.',
        request: JSON_BODY(verifyEmailSchema),
        responses: {
            200: successResponse('Email verified', verifyEmailResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/register/complete',
        tags: [TAG],
        summary: 'Finalize registration and receive a token pair.',
        request: JSON_BODY(completeRegistrationSchema),
        responses: {
            201: successResponse('Account created', loginResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/login',
        tags: [TAG],
        summary: 'Email + password login. Optionally accepts twoFactorCode.',
        request: JSON_BODY(loginSchema),
        responses: {
            200: successResponse('Login successful', loginResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/logout',
        tags: [TAG],
        summary: 'Invalidate the refresh token tied to this session.',
        request: JSON_BODY(z.object({ refreshToken: z.string().optional() })),
        responses: {
            200: successResponse('Logged out', messageOnlyResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/refresh-token',
        tags: [TAG],
        summary: 'Rotate the access + refresh token pair.',
        request: JSON_BODY(refreshTokenSchema),
        responses: {
            200: successResponse('Tokens rotated', authTokensSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/forgot-password',
        tags: [TAG],
        summary: 'Mail a password-reset link.',
        request: JSON_BODY(forgotPasswordSchema),
        responses: {
            200: successResponse('Reset link issued (or silently dropped if email is unknown)', messageOnlyResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/reset-password',
        tags: [TAG],
        summary: 'Consume a reset token and set a new password.',
        request: JSON_BODY(resetPasswordSchema),
        responses: {
            200: successResponse('Password reset', messageOnlyResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/2fa/setup',
        tags: [TAG],
        summary: 'Begin 2FA enrollment — returns TOTP secret + recovery codes.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Setup token generated', setup2faResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/2fa/verify',
        tags: [TAG],
        summary: 'Confirm the first TOTP code and enable 2FA on the account.',
        security: requireBearerAuth,
        request: JSON_BODY(verify2FASchema),
        responses: {
            200: successResponse('2FA enabled', verify2faResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/2fa/disable',
        tags: [TAG],
        summary: 'Turn 2FA off after confirming TOTP + password.',
        security: requireBearerAuth,
        request: JSON_BODY(disable2FASchema),
        responses: {
            200: successResponse('2FA disabled', disable2faResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'get',
        path: '/auth/2fa/recovery-codes',
        tags: [TAG],
        summary: 'Regenerate and return 10 single-use recovery codes.',
        security: requireBearerAuth,
        responses: {
            200: successResponse('Recovery codes regenerated', recoveryCodesResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'post',
        path: '/auth/login/oauth/{provider}',
        tags: [TAG],
        summary: 'OAuth login/register for google | apple | facebook.',
        request: {
            params: z.object({
                provider: z.enum(['google', 'apple', 'facebook']),
            }),
            ...JSON_BODY(oauthLoginSchema),
        },
        responses: {
            200: successResponse('OAuth login successful', loginResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    // Sessions — defined in session.routes.ts but logically part of auth.
    registry.registerPath({
        method: 'get',
        path: '/auth/sessions',
        tags: [TAG],
        summary: 'List active login sessions for the current user.',
        security: requireBearerAuth,
        responses: {
            200: paginatedResponse(
                'List of sessions',
                z.object({
                    id: z.string(),
                    userAgent: z.string(),
                    ipAddress: z.string(),
                    lastActive: z.string(),
                    createdAt: z.string(),
                    isCurrent: z.boolean(),
                })
            ),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/auth/sessions/{id}',
        tags: [TAG],
        summary: 'Revoke a specific session by id.',
        security: requireBearerAuth,
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: successResponse('Session revoked', messageOnlyResponseSchema),
            ...STANDARD_ERROR_RESPONSES,
        },
    });

    registry.registerPath({
        method: 'delete',
        path: '/auth/sessions/all',
        tags: [TAG],
        summary: 'Revoke every other session after password confirmation.',
        security: requireBearerAuth,
        request: JSON_BODY(z.object({ password: z.string().min(1) })),
        responses: {
            200: successResponse(
                'Other sessions revoked',
                z.object({ message: z.string(), revokedCount: z.number().int() })
            ),
            ...STANDARD_ERROR_RESPONSES,
        },
    });
};
