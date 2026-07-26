import type { ModuleComplianceRegistry } from '../../common/observability/registry.types';

const registry: ModuleComplianceRegistry = {
    'POST /register/initiate': { resource: 'homeai:auth.registration', action: 'write', dataClassification: 'PII', reason: 'registration initiated' },
    'POST /register/verify-email': { resource: 'homeai:auth.email-verification', action: 'write', dataClassification: 'PII', reason: 'email verification code' },
    'POST /register/complete': { resource: 'homeai:auth.user-creation', action: 'write', dataClassification: 'PII', reason: 'account creation' },

    'POST /login': { resource: 'homeai:auth.session', action: 'write', dataClassification: 'PII', reason: 'credential login' },
    'POST /logout': { resource: 'homeai:auth.session', action: 'delete', dataClassification: 'internal', reason: 'session termination' },
    'POST /refresh-token': { resource: 'homeai:auth.token', action: 'write', dataClassification: 'internal', reason: 'JWT refresh' },

    'POST /forgot-password': { resource: 'homeai:auth.password-reset', action: 'write', dataClassification: 'PII', reason: 'password reset request' },
    'POST /reset-password': { resource: 'homeai:auth.password', action: 'write', dataClassification: 'PII', reason: 'password reset' },

    'POST /2fa/setup': { resource: 'homeai:auth.mfa', action: 'write', dataClassification: 'PII', reason: 'TOTP setup' },
    'POST /2fa/verify': { resource: 'homeai:auth.mfa', action: 'write', dataClassification: 'PII', reason: 'TOTP enable' },
    'POST /2fa/disable': { resource: 'homeai:auth.mfa', action: 'delete', dataClassification: 'PII', reason: 'TOTP disable' },
    'GET /2fa/recovery-codes': { resource: 'homeai:auth.mfa', action: 'read', dataClassification: 'PII', reason: 'recovery code retrieval' },

    'POST /login/oauth/:provider': { resource: 'homeai:auth.oauth', action: 'write', dataClassification: 'PII', reason: 'OAuth login' },
};

export default registry;
