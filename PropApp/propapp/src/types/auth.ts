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

// Registration types
export interface InitiateRegistrationRequest {
    email: string;
    role?: UserRole; // Optional - can be provided at completion instead
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface CompleteRegistrationRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole; // Can be provided here if not at initiation
    phone?: string; // Optional per BACKEND_READMEV3.md
}

// Login types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface OAuthLoginRequest {
    idToken: string;
    role?: UserRole;
}

// Password reset types
export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

// 2FA types
export interface Setup2FAResponse {
    secret: string;
    qrCodeUrl: string;
}

export interface Verify2FARequest {
    code: string;
}

export interface Disable2FARequest {
    password: string;
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
