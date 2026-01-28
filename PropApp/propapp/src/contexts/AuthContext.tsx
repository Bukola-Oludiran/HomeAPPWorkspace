/**
 * Authentication Context
 * Provides authentication state and actions throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, tokenManager } from '../lib/api/client';
import { API_ENDPOINTS } from '../lib/api/config';
import type {
    User,
    UserRole,
    LoginRequest,
    LoginResponse,
    InitiateRegistrationRequest,
    VerifyEmailRequest,
    CompleteRegistrationRequest,
    OAuthLoginRequest,
    AuthTokens,
} from '../types/auth';
import type { ApiError } from '../types/api';

// Auth state interface
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: ApiError | null;
}

// Registration state for multi-step flow
interface RegistrationState {
    email: string;
    role: UserRole | null;
    isEmailVerified: boolean;
    step: number;
}

// Auth context interface
interface AuthContextValue extends AuthState {
    // Registration actions
    registrationState: RegistrationState;
    initiateRegistration: (data: InitiateRegistrationRequest) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    resendVerificationCode: () => Promise<void>;
    completeRegistration: (data: Omit<CompleteRegistrationRequest, 'email'>) => Promise<void>;
    resetRegistration: () => void;

    // Login actions
    login: (data: LoginRequest) => Promise<{ requires2FA?: boolean }>;
    verify2FA: (code: string) => Promise<void>;
    oauthLogin: (provider: string, data: OAuthLoginRequest) => Promise<void>;

    // Logout
    logout: () => Promise<void>;

    // Password reset
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;

    // Session
    refreshSession: () => Promise<void>;

    // Error handling
    clearError: () => void;
}

// Default registration state
const defaultRegistrationState: RegistrationState = {
    email: '',
    role: null,
    isEmailVerified: false,
    step: 1,
};

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider props
interface AuthProviderProps {
    children: ReactNode;
}

// Temporary token storage for 2FA flow
let pending2FAToken: string | null = null;

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const [registrationState, setRegistrationState] = useState<RegistrationState>(defaultRegistrationState);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const accessToken = tokenManager.getAccessToken();
            const storedUser = tokenManager.getStoredUser<User>();

            if (accessToken && storedUser) {
                // Validate token by fetching current user
                try {
                    const response = await api.get<User>(API_ENDPOINTS.USERS.ME);
                    setAuthState({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    tokenManager.setStoredUser(response.data);
                } catch {
                    // Token invalid, clear everything
                    tokenManager.clearTokens();
                    setAuthState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            } else {
                setAuthState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        initAuth();
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setAuthState((prev) => ({ ...prev, error: null }));
    }, []);

    // Set error helper
    const setError = useCallback((error: ApiError) => {
        setAuthState((prev) => ({ ...prev, error, isLoading: false }));
    }, []);

    // ==========================================
    // Registration Actions
    // ==========================================

    const initiateRegistration = useCallback(async (data: InitiateRegistrationRequest) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await api.post(API_ENDPOINTS.AUTH.REGISTER_INITIATE, data);
            setRegistrationState({
                email: data.email,
                role: data.role ?? null,
                isEmailVerified: false,
                step: 2,
            });
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    const verifyEmail = useCallback(async (code: string) => {
        if (!registrationState.email) {
            throw new Error('No email in registration state');
        }

        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const data: VerifyEmailRequest = {
                email: registrationState.email,
                code,
            };
            await api.post(API_ENDPOINTS.AUTH.REGISTER_VERIFY_EMAIL, data);
            setRegistrationState((prev) => ({
                ...prev,
                isEmailVerified: true,
                step: 3,
            }));
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [registrationState.email, setError]);

    const resendVerificationCode = useCallback(async () => {
        if (!registrationState.email || !registrationState.role) {
            throw new Error('No email or role in registration state');
        }

        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await api.post(API_ENDPOINTS.AUTH.REGISTER_INITIATE, {
                email: registrationState.email,
                role: registrationState.role,
            });
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [registrationState.email, registrationState.role, setError]);

    const completeRegistration = useCallback(async (data: Omit<CompleteRegistrationRequest, 'email'>) => {
        if (!registrationState.email) {
            throw new Error('No email in registration state');
        }

        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const requestData: CompleteRegistrationRequest = {
                ...data,
                email: registrationState.email,
            };
            const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER_COMPLETE, requestData);

            // Store tokens and user
            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            tokenManager.setStoredUser(response.data.user);

            setRegistrationState((prev) => ({ ...prev, step: 4 }));
            setAuthState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [registrationState.email, setError]);

    const resetRegistration = useCallback(() => {
        setRegistrationState(defaultRegistrationState);
    }, []);

    // ==========================================
    // Login Actions
    // ==========================================

    const login = useCallback(async (data: LoginRequest): Promise<{ requires2FA?: boolean }> => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);

            if (response.data.requires2FA) {
                // Store temporary token for 2FA verification
                pending2FAToken = response.data.accessToken;
                setAuthState((prev) => ({ ...prev, isLoading: false }));
                return { requires2FA: true };
            }

            // Store tokens and user
            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            tokenManager.setStoredUser(response.data.user);

            setAuthState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { requires2FA: false };
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    const verify2FA = useCallback(async (code: string) => {
        if (!pending2FAToken) {
            throw new Error('No pending 2FA verification');
        }

        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Temporarily set the pending token for this request
            localStorage.setItem('homeai_access_token', pending2FAToken);

            const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_2FA, { code });

            // Clear pending token
            pending2FAToken = null;

            // Store tokens and user
            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            tokenManager.setStoredUser(response.data.user);

            setAuthState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            // Restore original token if 2FA fails
            if (pending2FAToken) {
                localStorage.removeItem('homeai_access_token');
            }
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    const oauthLogin = useCallback(async (provider: string, data: OAuthLoginRequest) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.OAUTH_LOGIN(provider), data);

            // Store tokens and user
            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
            tokenManager.setStoredUser(response.data.user);

            setAuthState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    // ==========================================
    // Logout
    // ==========================================

    const logout = useCallback(async () => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        try {
            await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch {
            // Ignore errors on logout
        } finally {
            tokenManager.clearTokens();
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            resetRegistration();
        }
    }, [resetRegistration]);

    // ==========================================
    // Password Reset
    // ==========================================

    const forgotPassword = useCallback(async (email: string) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    const resetPassword = useCallback(async (token: string, password: string) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        } catch (error) {
            setError(error as ApiError);
            throw error;
        }
    }, [setError]);

    // ==========================================
    // Session Management
    // ==========================================

    const refreshSession = useCallback(async () => {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
            tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
        } catch (error) {
            tokenManager.clearTokens();
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            throw error;
        }
    }, []);

    // Context value
    const value: AuthContextValue = {
        ...authState,
        registrationState,
        initiateRegistration,
        verifyEmail,
        resendVerificationCode,
        completeRegistration,
        resetRegistration,
        login,
        verify2FA,
        oauthLogin,
        logout,
        forgotPassword,
        resetPassword,
        refreshSession,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Export context for testing
export { AuthContext };
