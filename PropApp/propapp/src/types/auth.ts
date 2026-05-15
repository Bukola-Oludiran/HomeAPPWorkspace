/**
 * Authentication Types
 * Types for authentication, users, and sessions
 */

// User roles
export type UserRole = 'TENANT' | 'LANDLORD' | 'AGENT' | 'ADMIN';

// Verification levels
export type VerificationLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// Base user type
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role: UserRole;
    verificationLevel: VerificationLevel;
    isEmailVerified: boolean;
    is2FAEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

// Extended user with profile data
export interface UserWithProfile extends User {
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

// Auth tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// Login response - matches backend V4 structure where tokens are nested
export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
    requires2FA?: boolean;
}

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
