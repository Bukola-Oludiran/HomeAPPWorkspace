/**
 * Authentication Service
 * API calls for authentication-related operations
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
    LoginRequest,
    LoginResponse,
    InitiateRegistrationRequest,
    VerifyEmailRequest,
    CompleteRegistrationRequest,
    OAuthLoginRequest,
    AuthTokens,
    Setup2FAResponse,
    Session,
} from '../../../types/auth';

/**
 * Initiate registration by sending verification email
 */
export async function initiateRegistration(data: InitiateRegistrationRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.REGISTER_INITIATE, data);
}

/**
 * Verify email with code sent during registration
 */
export async function verifyEmail(data: VerifyEmailRequest) {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.REGISTER_VERIFY_EMAIL, data);
}

/**
 * Complete registration with user details
 */
export async function completeRegistration(data: CompleteRegistrationRequest) {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER_COMPLETE, data);
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest) {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
}

/**
 * OAuth login with provider token
 */
export async function oauthLogin(provider: string, data: OAuthLoginRequest) {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.OAUTH_LOGIN(provider), data);
}

/**
 * Logout current session
 */
export async function logout() {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
}

/**
 * Refresh access token
 */
export async function refreshToken(token: string) {
    return api.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken: token });
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

/**
 * Reset password with token from email
 */
export async function resetPassword(token: string, password: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
}

/**
 * Setup 2FA for current user
 */
export async function setup2FA() {
    return api.post<Setup2FAResponse>(API_ENDPOINTS.AUTH.SETUP_2FA);
}

/**
 * Verify and enable 2FA
 */
export async function verify2FA(code: string) {
    return api.post<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_2FA, { code });
}

/**
 * Disable 2FA for current user
 */
export async function disable2FA(password: string) {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.DISABLE_2FA, { password });
}

/**
 * Get 2FA recovery codes
 */
export async function getRecoveryCodes() {
    return api.get<{ codes: string[] }>(API_ENDPOINTS.AUTH.RECOVERY_CODES);
}

/**
 * Get all active sessions
 */
export async function getSessions() {
    return api.get<Session[]>(API_ENDPOINTS.AUTH.SESSIONS);
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.AUTH.REVOKE_SESSION(sessionId));
}

/**
 * Revoke all other sessions
 */
export async function revokeAllSessions(password: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS, { password });
}

// Export all functions as named exports and as default object
export const authService = {
    initiateRegistration,
    verifyEmail,
    completeRegistration,
    login,
    oauthLogin,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    setup2FA,
    verify2FA,
    disable2FA,
    getRecoveryCodes,
    getSessions,
    revokeSession,
    revokeAllSessions,
};

export default authService;
