/**
 * Authentication Types
 * Types for authentication, users, and sessions
 */

// Cross-cutting enums sourced from @homeai/contracts/enums (same value
// list backend zod + Prisma use).
import type { UserRole, VerificationLevel } from '@homeai/contracts/enums';
export type { UserRole, VerificationLevel };

// Base user type — the exact wire shape that login / register /
// oauth-login / users/me emit. Plan section (D) gap closed: the
// frontend no longer types `LoginResponse.user` more permissively than
// the wire actually carries.
export type { WireAuthUser as User } from '@homeai/contracts/auth.contract';

// Extended user with profile data — preserves the `User` wire shape and
// adds optional frontend-only profile sections.
import type { WireAuthUser } from '@homeai/contracts/auth.contract';
export interface UserWithProfile extends WireAuthUser {
    bio?: string;
    preferences?: UserPreferences;
    notificationSettings?: NotificationSettings;
    privacySettings?: PrivacySettings;
}

// User preferences
export interface UserPreferences {
    language: string;
    currency: string;
    timezone: string;
}

// Notification settings
export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketingEmails: boolean;
    types?: {
        payments: boolean;
        messages: boolean;
        marketing: boolean;
    };
}

// Privacy settings
export interface PrivacySettings {
    profileVisibility: 'public' | 'verified_users_only' | 'private';
    showPhoneToPublic: boolean;
    allowSearchDiscovery: boolean;
}

// JWT token payload structure
export interface TokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    permissions: string[];
    verificationLevel: VerificationLevel;
    regionCode: string;
    exp: number;
    iat: number;
}

// Auth tokens + login response — sourced from @homeai/contracts. The
// backend now ships the full `User` wire shape on every auth response,
// so the frontend no longer needs to refetch /users/me to hydrate the
// profile after login (plan section (D) gap closed).
export type {
    AuthTokens,
    LoginResponse,
} from '@homeai/contracts/auth.contract';

// ============================================
// REQUEST TYPES — re-exported from @homeai/contracts
// (Zod-inferred source-of-truth lives in
// `HomeAPPWorkspace/contracts/auth.contract.ts`.)
// ============================================
export type {
    InitiateRegistrationRequest,
    VerifyEmailRequest,
    CompleteRegistrationRequest,
    LoginRequest,
    RefreshTokenRequest,
    OAuthLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Verify2FARequest,
    Disable2FARequest,
} from '@homeai/contracts/auth.contract';

// 2FA setup response — wire shape is `{ secret, qrCodeUrl, recoveryCodes }`
// per backend service; frontend currently consumes only secret + qrCodeUrl.
// Response shapes will move to the contract in a follow-up alongside gap-(D).
export interface Setup2FAResponse {
    secret: string;
    qrCodeUrl: string;
}

// Session types
export interface Session {
    id: string;
    userAgent: string;
    ipAddress: string;
    lastActive: string;
    createdAt: string;
    isCurrent: boolean;
}

// Profile update types
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Role-specific profile types
export interface TenantProfile {
    displayName?: string;
    bio?: string;
    preferences?: {
        desiredBedrooms?: string;
        monthlyBudgetMax?: number;
    };
}

export interface LandlordProfile {
    businessName?: string;
    businessEmail?: string;
    publicVisibility?: {
        showContactPhone: boolean;
    };
}

export interface AgentProfile {
    companyName?: string;
    licenseNumber?: string;
    specialties?: string[];
    yearsOfExperience?: number;
    serviceAreas?: string[];
}

export interface AgentCertification {
    id: string;
    name: string;
    issuer: string;
    expiryDate?: string;
    documentUrl?: string;
}

// Connected account types
export type OAuthProvider = 'google' | 'apple' | 'facebook';

export interface ConnectedAccount {
    provider: OAuthProvider;
    email: string;
    connectedAt: string;
}
