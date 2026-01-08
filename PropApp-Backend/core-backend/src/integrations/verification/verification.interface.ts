/**
 * Identity Verification Provider Interface
 * Abstraction for KYC/Identity verification services
 */

// ============================================
// TYPES
// ============================================

export type VerificationType = 'NIN' | 'BVN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD';

export interface VerifyIdentityParams {
    type: VerificationType;
    idNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    selfieBase64?: string;
    country?: string;
}

export interface VerifyIdentityResult {
    success: boolean;
    verified: boolean;
    confidence?: number;
    data?: {
        firstName?: string;
        lastName?: string;
        middleName?: string;
        dateOfBirth?: string;
        gender?: string;
        phone?: string;
        photo?: string;
    };
    error?: string;
    providerReference?: string;
}

export interface VerifyDocumentParams {
    documentType: string;
    documentUrl: string;
    country?: string;
}

export interface VerifyDocumentResult {
    success: boolean;
    verified: boolean;
    documentType?: string;
    extractedData?: Record<string, unknown>;
    error?: string;
}

export interface VerifyBiometricParams {
    selfieBase64: string;
    referenceImageUrl?: string;
    livenessCheck?: boolean;
}

export interface VerifyBiometricResult {
    success: boolean;
    matched: boolean;
    livenessScore?: number;
    confidenceScore?: number;
    error?: string;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface IdentityVerificationProvider {
    readonly providerId: string;
    readonly supportedTypes: VerificationType[];
    readonly supportedCountries: string[];

    verifyIdentity(params: VerifyIdentityParams): Promise<VerifyIdentityResult>;
    verifyDocument?(params: VerifyDocumentParams): Promise<VerifyDocumentResult>;
    verifyBiometric?(params: VerifyBiometricParams): Promise<VerifyBiometricResult>;
}
