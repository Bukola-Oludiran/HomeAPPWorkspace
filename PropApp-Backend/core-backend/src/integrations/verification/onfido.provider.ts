/**
 * Onfido/Entrust Identity Verification Provider
 * Implements IdentityVerificationProvider interface for Canada
 * Per HomeAI-Canada-Integrations.md Section 3
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../common/utils/logger';
import {
    IdentityVerificationProvider,
    VerificationType,
    VerifyIdentityParams,
    VerifyIdentityResult,
    VerifyBiometricParams,
    VerifyBiometricResult,
} from './verification.interface';

export class OnfidoProvider implements IdentityVerificationProvider {
    readonly providerId = 'onfido';
    readonly supportedTypes: VerificationType[] = ['PASSPORT', 'DRIVERS_LICENSE'];
    readonly supportedCountries = ['CA', 'US', 'GB'];

    private client: AxiosInstance;
    private apiToken: string;

    constructor(apiToken: string, sandbox: boolean = false) {
        this.apiToken = apiToken;

        const baseURL = sandbox
            ? 'https://api.eu.onfido.com/v3.6'
            : 'https://api.onfido.com/v3.6';

        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Token token=${apiToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });

        logger.info(`Onfido provider initialized (${sandbox ? 'sandbox' : 'production'})`);
    }

    async verifyIdentity(params: VerifyIdentityParams): Promise<VerifyIdentityResult> {
        try {
            // 1. Create applicant
            const applicant = await this.client.post('/applicants', {
                first_name: params.firstName,
                last_name: params.lastName,
                dob: params.dateOfBirth,
                country: params.country || 'CAN',
            });

            const applicantId = applicant.data.id;

            // 2. Create check
            const check = await this.client.post('/checks', {
                applicant_id: applicantId,
                report_names: ['document', 'facial_similarity_photo'],
                document_ids: [], // Would be populated after document upload
                async: true, // Webhook-based completion
            });

            logger.info(`Onfido check created: ${check.data.id} for applicant ${applicantId}`);

            // Note: Full verification requires document upload via SDK
            // This returns the check reference for tracking
            return {
                success: true,
                verified: false, // Pending document upload
                providerReference: check.data.id,
            };
        } catch (error: any) {
            logger.error('Onfido error:', error.response?.data || error.message);
            return {
                success: false,
                verified: false,
                error: error.response?.data?.error?.message || error.message,
            };
        }
    }

    async verifyBiometric(params: VerifyBiometricParams): Promise<VerifyBiometricResult> {
        try {
            // Onfido requires SDK integration for live photos
            // This is a placeholder for webhook-based verification
            logger.info('[Onfido] Biometric verification requires SDK integration');

            return {
                success: false,
                matched: false,
                error: 'Biometric verification requires Onfido SDK integration',
            };
        } catch (error: any) {
            logger.error('Onfido biometric error:', error.message);
            return {
                success: false,
                matched: false,
                error: error.message,
            };
        }
    }

    /**
     * Generate SDK token for client-side integration
     */
    async generateSdkToken(applicantId: string, referrer: string): Promise<string | null> {
        try {
            const response = await this.client.post('/sdk_token', {
                applicant_id: applicantId,
                referrer: referrer,
            });

            return response.data.token;
        } catch (error: any) {
            logger.error('Onfido SDK token error:', error.message);
            return null;
        }
    }

    /**
     * Get check result (called after webhook notification)
     */
    async getCheckResult(checkId: string): Promise<VerifyIdentityResult> {
        try {
            const response = await this.client.get(`/checks/${checkId}`);
            const check = response.data;

            const verified = check.result === 'clear';

            return {
                success: true,
                verified,
                confidence: verified ? 95 : 0,
                providerReference: checkId,
            };
        } catch (error: any) {
            logger.error('Onfido get check error:', error.message);
            return {
                success: false,
                verified: false,
                error: error.message,
            };
        }
    }
}
