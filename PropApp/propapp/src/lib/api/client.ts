/**
 * API Client
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEYS, REQUEST_TIMEOUT, API_ENDPOINTS } from './config';
import type { ApiError, ApiResponse } from '../../types/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management utilities
export const tokenManager = {
    getAccessToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    },

    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.USER);
    },

    getStoredUser: <T>(): T | null => {
        const userJson = localStorage.getItem(TOKEN_KEYS.USER);
        if (!userJson) return null;
        try {
            return JSON.parse(userJson) as T;
        } catch {
            return null;
        }
    },

    setStoredUser: <T>(user: T): void => {
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    },
};

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => {
        // Return the response data directly for successful requests
        return response;
    },
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if it's a 2FA required error - don't try to refresh
            if (error.response?.data?.error?.code === 'AUTH_007') {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue the request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenManager.getRefreshToken();

            if (!refreshToken) {
                // No refresh token, redirect to login
                tokenManager.clearTokens();
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
                    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                tokenManager.setTokens(accessToken, newRefreshToken);

                processQueue(null, accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(new Error('Token refresh failed'), null);
                tokenManager.clearTokens();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Transform error to a consistent format
        const apiError: ApiError = {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
                message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
                details: error.response?.data?.error?.details,
            },
        };

        return Promise.reject(apiError);
    }
);

// Helper functions for common HTTP methods
export const api = {
    get: <T>(url: string, params?: Record<string, unknown>) =>
        apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

    post: <T>(url: string, data?: unknown) =>
        apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),

    put: <T>(url: string, data?: unknown) =>
        apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),

    patch: <T>(url: string, data?: unknown) =>
        apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data),

    delete: <T>(url: string, data?: unknown) =>
        apiClient.delete<ApiResponse<T>>(url, { data }).then((res) => res.data),

    // For file uploads
    upload: <T>(url: string, formData: FormData) =>
        apiClient.post<ApiResponse<T>>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then((res) => res.data),
};

export default apiClient;
