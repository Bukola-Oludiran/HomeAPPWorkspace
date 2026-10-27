/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import { API_ROUTES } from '@homeai/contracts/routes';

// Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

// Token storage keys
export const TOKEN_KEYS = {
    ACCESS_TOKEN: 'homeai_access_token',
    REFRESH_TOKEN: 'homeai_refresh_token',
    USER: 'homeai_user',
} as const;

// API Endpoints organized by module
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER_INITIATE: '/auth/register/initiate',
        REGISTER_VERIFY_EMAIL: '/auth/register/verify-email',
        REGISTER_COMPLETE: '/auth/register/complete',
        LOGIN: '/auth/login',
        OAUTH_LOGIN: (provider: string) => `/auth/login/oauth/${provider}`,
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        SETUP_2FA: '/auth/2fa/setup',
        VERIFY_2FA: '/auth/2fa/verify',
        VERIFY_2FA_CHALLENGE: API_ROUTES.AUTH_2FA_CHALLENGE_VERIFY,
        DISABLE_2FA: '/auth/2fa/disable',
        RECOVERY_CODES: '/auth/2fa/recovery-codes',
        SESSIONS: API_ROUTES.AUTH_SESSIONS,
        REVOKE_SESSION: (id: string) => `/auth/sessions/${id}`,
        REVOKE_ALL_SESSIONS: '/auth/sessions/all',
    },

    // Users
    USERS: {
        ME: '/users/me',
        PASSWORD: '/users/me/password',
        PREFERENCES: '/users/me/preferences',
        NOTIFICATION_SETTINGS: '/users/me/notification-settings',
        AVATAR: '/users/me/avatar',
        WALLET: '/users/me/wallet',
        WALLET_CONNECT: '/users/me/wallet/connect',
        FAVORITES: '/users/me/favorites',
        FAVORITE: (propertyId: string) => `/users/me/favorites/${propertyId}`,
        PUBLIC_LANDLORD: (id: string) => `/users/public/landlord/${id}`,
        PUBLIC_TENANT: (id: string) => `/users/public/tenant/${id}`,
        PUBLIC_AGENT: (id: string) => `/users/public/agent/${id}`,
        PRIVACY: '/users/me/privacy',
        PROFILE_TENANT: '/users/me/profile/tenant',
        PROFILE_LANDLORD: '/users/me/profile/landlord',
        PROFILE_AGENT: '/users/me/profile/agent',
        AGENT_CERTIFICATIONS: '/users/me/profile/agent/certifications',
        AGENT_CERTIFICATION: (id: string) => `/users/me/profile/agent/certifications/${id}`,
        CONNECTED_ACCOUNTS: '/users/me/connected-accounts',
        CONNECTED_ACCOUNT: (provider: string) => `/users/me/connected-accounts/${provider}`,
        DOCUMENTS: '/users/me/documents',
        DOCUMENT: (id: string) => `/users/me/documents/${id}`,
        DOCUMENT_DOWNLOAD: (id: string) => `/users/me/documents/${id}/download`,
    },

    // Banking & Payouts
    BANKING: {
        BANKS: '/banking/banks',
        RESOLVE: '/banking/resolve',
        BANK_ACCOUNTS: '/users/me/bank-accounts',
        BANK_ACCOUNT: (id: string) => `/users/me/bank-accounts/${id}`,
        BANK_ACCOUNT_DEFAULT: (id: string) => `/users/me/bank-accounts/${id}/default`,
        PAYOUTS: '/users/me/payouts',
        PAYOUT_SETTINGS: '/users/me/payout-settings',
        PAYMENT_METHODS: '/users/me/payment-methods',
        PAYMENT_METHOD: (id: string) => `/users/me/payment-methods/${id}`,
        PAYMENT_METHOD_DEFAULT: (id: string) => `/users/me/payment-methods/${id}/default`,
    },

    // Properties
    PROPERTIES: {
        LIST: '/properties',
        SEARCH: '/properties/search',
        FEATURED: '/properties/featured',
        NEARBY: '/properties/nearby',
        DETAIL: (id: string) => `/properties/${id}`,
        CREATE: '/properties',
        UPDATE: (id: string) => `/properties/${id}`,
        DELETE: (id: string) => `/properties/${id}`,
        STATUS: (id: string) => `/properties/${id}/status`,
        MEDIA: API_ROUTES.propertyMedia,
        MEDIA_DELETE: (id: string, mediaId: string) => `/properties/${id}/media/${mediaId}`,
        DRAFT: '/properties/draft',
        DRAFT_UPDATE: (id: string) => `/properties/draft/${id}`,
        DRAFT_PUBLISH: (id: string) => `/properties/draft/${id}/publish`,
        ANALYTICS_VIEWS: (id: string) => `/properties/${id}/analytics/views`,
        ANALYTICS_MARKET: (id: string) => `/properties/${id}/analytics/market-comparison`,
        ANALYTICS_PRICE: (id: string) => `/properties/${id}/analytics/price-optimization`,
    },

    // Landlord
    LANDLORD: {
        DASHBOARD: '/landlord/dashboard',
        DASHBOARD_ANALYTICS: '/landlord/dashboard/analytics',
        PROPERTIES: '/landlord/properties',
        APPLICANTS: '/landlord/applicants',
        APPLICANT: (id: string) => `/landlord/applicants/${id}`,
        APPLICANT_APPROVE: (id: string) => `/landlord/applicants/${id}/approve`,
        APPLICANT_REJECT: (id: string) => `/landlord/applicants/${id}/reject`,
        FINANCIALS: '/landlord/financials',
        FINANCIALS_SUMMARY: '/landlord/financials/summary',
        FINANCIALS_TRANSACTIONS: '/landlord/financials/transactions',
        FINANCIALS_PAYOUT: '/landlord/financials/payout',
        ALERTS: '/landlord/alerts',
        PROPERTY_VERIFY: (id: string) => `/landlord/properties/${id}/verify`,
        JOBS: '/landlord/jobs',
    },

    // Tenant
    TENANT: {
        DASHBOARD: '/tenant/dashboard',
        RENTAL: '/tenant/rental',
        APPLICATIONS: '/tenant/applications',
        APPLICATION: (id: string) => `/tenant/applications/${id}`,
        SAVED: '/tenant/saved',
        SAVED_PROPERTY: (propertyId: string) => `/tenant/saved/${propertyId}`,
        PAYMENTS: '/tenant/payments',
    },

    // Agent
    AGENT: {
        JOBS: '/agent/jobs',
        JOBS_ACCEPTED: '/agent/jobs/accepted',
        JOB_ACCEPT: (id: string) => `/agent/jobs/${id}/accept`,
        JOB_DECLINE: (id: string) => `/agent/jobs/${id}/decline`,
        JOB_COMPLETE: (id: string) => `/agent/jobs/${id}/complete`,
        SCHEDULE: '/agent/schedule',
        AVAILABILITY: API_ROUTES.AGENT_AVAILABILITY,
        AVAILABILITY_ITEM: (id: string) => `/agent/availability/${id}`,
        EARNINGS: '/agent/earnings',
        EARNINGS_HISTORY: '/agent/earnings/history',
        EARNINGS_WITHDRAW: '/agent/earnings/withdraw',
    },

    // Leases
    LEASES: {
        LIST: '/leases',
        DETAIL: (id: string) => `/leases/${id}`,
        CREATE: '/leases',
        UPDATE: (id: string) => `/leases/${id}`,
        RENEW: (id: string) => `/leases/${id}/renew`,
        RESPOND: (id: string) => `/leases/${id}/respond`,
        SIGN: (id: string) => `/leases/${id}/sign`,
        DOCUMENT: (id: string) => `/leases/${id}/document`,
        DOCUMENT_GENERATE: (id: string) => `/leases/${id}/document/generate`,
    },

    // Maintenance
    MAINTENANCE: {
        LIST: '/maintenance',
        DETAIL: (id: string) => `/maintenance/${id}`,
        CREATE: '/maintenance',
        UPDATE: (id: string) => `/maintenance/${id}`,
        ASSIGN: (id: string) => `/maintenance/${id}/assign`,
    },

    // Messages
    MESSAGES: {
        CONVERSATIONS: '/messages/conversations',
        CONVERSATION: (id: string) => `/messages/conversations/${id}`,
    },

    // Transactions
    TRANSACTIONS: {
        LIST: '/transactions',
        DETAIL: (id: string) => `/transactions/${id}`,
        PAY: '/transactions/pay',
        VERIFY: '/transactions/verify',
        ESCROW: '/transactions/escrow',
        ESCROW_RELEASE: (id: string) => `/transactions/escrow/${id}/release`,
        REFUND: (id: string) => `/transactions/${id}/refund`,
    },

    // Verification
    VERIFICATION: {
        STATUS: '/verification/status',
        IDENTITY: '/verification/identity',
        ADDRESS: '/verification/address',
        PROPERTIES: '/verification/properties',
        PROPERTY: (id: string) => `/verification/properties/${id}`,
        PROPERTY_COFO: (id: string) => `/verification/properties/${id}/cofo`,
        PROPERTY_AUDIT: (id: string) => `/verification/properties/${id}/audit/request`,
        ADMIN_PENDING: '/verification/admin/pending',
        ADMIN_APPROVE: (id: string) => `/verification/admin/${id}/approve`,
        ADMIN_REJECT: (id: string) => `/verification/admin/${id}/reject`,
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD_COUNT: '/notifications/unread-count',
        MARK_READ: '/notifications/mark-read',
        MARK_ALL_READ: '/notifications/mark-all-read',
        DEVICES: '/notifications/devices',
        DEVICE: (token: string) => `/notifications/devices/${token}`,
        PREFERENCES: '/notifications/preferences',
        DELETE: '/notifications',
        DELETE_ALL: '/notifications/all',
        SEND: '/notifications/send',
    },

    // Analytics
    ANALYTICS: {
        MARKET_TRENDS: '/analytics/market-trends',
    },

    // Reports
    REPORTS: {
        LIST: '/reports',
        DETAIL: (id: string) => `/reports/${id}`,
        GENERATE: '/reports/generate',
    },
    INTEGRATION: {
        APPLICANT_INVITATIONS: API_ROUTES.APPLICANT_INVITATIONS,
        TENANT_INVITATION: API_ROUTES.tenantInvitation,
        REVIEWS: API_ROUTES.REVIEWS,
        USER_REVIEWS: API_ROUTES.userReviews,
        BILLING_STATEMENTS: API_ROUTES.BILLING_STATEMENTS,
        EXPORTS: API_ROUTES.EXPORTS,
    },
} as const;

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;
