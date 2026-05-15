/**
 * Mock Verification Provider
 * For development and testing
 */

import { logger } from '../../common/utils/logger';
import {
    IdentityVerificationProvider,
    VerificationType,
    VerifyIdentityParams,
    VerifyIdentityResult,
    VerifyBiometricParams,
    VerifyBiometricResult,
} from './verification.interface';

export class MockVerificationProvider implements IdentityVerificationProvider {
    readonly providerId = 'mock';
    readonly supportedTypes: VerificationType[] = ['NIN', 'BVN', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_CARD'];
    readonly supportedCountries = ['NG', 'GH', 'KE', 'ZA'];

    async verifyIdentity(params: VerifyIdentityParams): Promise<VerifyIdentityResult> {
        logger.info(`[MOCK] Identity verification for ${params.type}: ${params.idNumber}`);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock successful verification for valid-looking IDs
        const isValid = params.idNumber.length >= 8;

        return {
            success: isValid,
            verified: isValid,
            confidence: isValid ? 95 : 0,
            data: isValid ? {
                firstName: params.firstName,
                lastName: params.lastName,
                dateOfBirth: params.dateOfBirth,
                gender: 'Unknown',
            } : undefined,
            providerReference: `MOCK_${Date.now()}`,
            error: isValid ? undefined : 'Invalid ID number format',
        };
    }

    async verifyBiometric(params: VerifyBiometricParams): Promise<VerifyBiometricResult> {
        logger.info(`[MOCK] Biometric verification (liveness: ${params.livenessCheck})`);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            matched: true,
            livenessScore: 0.95,
            confidenceScore: 0.88,
        };
    }
}
