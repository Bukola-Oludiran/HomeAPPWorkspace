/**
 * Auth Module - DTO Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod';

// ============================================
// REGISTRATION
// ============================================

export const initiateRegistrationSchema = z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['TENANT', 'LANDLORD', 'AGENT']).default('TENANT'),
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
    verificationToken: z.string(),
});

// ============================================
// LOGIN
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    twoFactorCode: z.string().optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// PASSWORD RESET
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
// TWO-FACTOR AUTHENTICATION
// ============================================

export const setup2FASchema = z.object({
    // No body needed, just requires authentication
});

export const verify2FASchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits'),
});

export const disable2FASchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits'),
    password: z.string().min(1, 'Password is required'),
});

// ============================================
// TYPES
// ============================================

export type InitiateRegistrationDto = z.infer<typeof initiateRegistrationSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type CompleteRegistrationDto = z.infer<typeof completeRegistrationSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type Verify2FADto = z.infer<typeof verify2FASchema>;
export type Disable2FADto = z.infer<typeof disable2FASchema>;
