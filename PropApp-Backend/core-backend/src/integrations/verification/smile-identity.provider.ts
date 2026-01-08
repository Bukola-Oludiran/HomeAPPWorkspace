/**
 * Smile Identity Verification Provider
 * Implements IdentityVerificationProvider interface for Nigeria
 * Per PRD Section 14.1
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../../common/utils/logger';
import {
    IdentityVerificationProvider,
    VerificationType,
    VerifyIdentityParams,
    VerifyIdentityResult,
    VerifyBiometricParams,
    VerifyBiometricResult,
} from './verification.interface';

export class SmileIdentityProvider implements IdentityVerificationProvider {
    readonly providerId = 'smile_identity';
    readonly supportedTypes: VerificationType[] = ['NIN', 'BVN', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_CARD'];
    readonly supportedCountries = ['NG', 'GH', 'KE', 'ZA'];

    private client: AxiosInstance;
    private partnerId: string;
    private apiKey: string;

    constructor(partnerId: string, apiKey: string, sandbox: boolean = false) {
        this.partnerId = partnerId;
        this.apiKey = apiKey;

        const baseURL = sandbox
            ? 'https://testapi.smileidentity.com/v1'
            : 'https://api.smileidentity.com/v1';

        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 60000, // Verification can take longer
        });

        logger.info(`Smile Identity provider initialized (${sandbox ? 'sandbox' : 'production'})`);
    }

    async verifyIdentity(params: VerifyIdentityParams): Promise<VerifyIdentityResult> {
        try {
            const timestamp = new Date().toISOString();
            const signature = this.generateSignature(timestamp);

            const jobType = this.getJobType(params.type);
            const idType = this.mapIdType(params.type);

            const payload = {
                partner_id: this.partnerId,
                timestamp,
                signature,
                source_sdk: 'homeai_backend',
                source_sdk_version: '1.0.0',
                partner_params: {
                    job_id: `JOB_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    user_id: `USER_${crypto.randomBytes(8).toString('hex')}`,
                    job_type: jobType,
                },
                id_info: {
                    country: params.country || 'NG',
                    id_type: idType,
                    id_number: params.idNumber,
                    first_name: params.firstName,
                    last_name: params.lastName,
                    dob: params.dateOfBirth,
                    entered: true,
                },
            };

            // Add selfie if provided for enhanced verification
            if (params.selfieBase64) {
                (payload as any).images = [
                    {
                        image_type_id: 0, // Selfie
                        image: params.selfieBase64,
                    },
                ];
            }

            const response = await this.client.post('/id_verification', payload);
            const { ResultCode, ResultText, IsFinalResult, FullData } = response.data;

            const success = ResultCode === '1012'; // Verified

            logger.info(`Smile Identity verification: ${ResultCode} - ${ResultText}`);

            return {
                success,
                verified: success,
                confidence: FullData?.ConfidenceValue,
                data: {
                    firstName: FullData?.FullName?.split(' ')[0],
                    lastName: FullData?.FullName?.split(' ').slice(-1)[0],
                    dateOfBirth: FullData?.DOB,
                    gender: FullData?.Gender,
                    phone: FullData?.PhoneNumber,
                    photo: FullData?.Photo,
                },
                providerReference: response.data.SmileJobID,
            };
        } catch (error: any) {
            logger.error('Smile Identity error:', error.response?.data || error.message);
            return {
                success: false,
                verified: false,
                error: error.response?.data?.error || error.message,
            };
        }
    }

    async verifyBiometric(params: VerifyBiometricParams): Promise<VerifyBiometricResult> {
        try {
            const timestamp = new Date().toISOString();
            const signature = this.generateSignature(timestamp);

            const payload = {
                partner_id: this.partnerId,
                timestamp,
                signature,
                source_sdk: 'homeai_backend',
                partner_params: {
                    job_id: `BIO_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    user_id: `USER_${crypto.randomBytes(8).toString('hex')}`,
                    job_type: params.livenessCheck ? 4 : 6, // SmartSelfie Authentication or Biometric KYC
                },
                images: [
                    {
                        image_type_id: 0, // Selfie
                        image: params.selfieBase64,
                    },
                ],
                options: {
                    return_images: false,
                    return_job_status: true,
                },
            };

            const response = await this.client.post('/biometric', payload);
            const { ResultCode, Actions } = response.data;

            const success = ResultCode === '0810' || ResultCode === '0820';

            return {
                success,
                matched: success,
                livenessScore: Actions?.Liveness_Check?.score,
                confidenceScore: Actions?.Selfie_Match?.score,
            };
        } catch (error: any) {
            logger.error('Smile Identity biometric error:', error.response?.data || error.message);
            return {
                success: false,
                matched: false,
                error: error.response?.data?.error || error.message,
            };
        }
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private generateSignature(timestamp: string): string {
        const toSign = `${this.partnerId}:${timestamp}`;
        return crypto.createHmac('sha256', this.apiKey).update(toSign).digest('base64');
    }

    private getJobType(type: VerificationType): number {
        // Job types per Smile Identity docs
        switch (type) {
            case 'NIN':
            case 'BVN':
                return 5; // Enhanced KYC
            case 'PASSPORT':
            case 'DRIVERS_LICENSE':
            case 'VOTERS_CARD':
                return 1; // Basic KYC
            default:
                return 1;
        }
    }

    private mapIdType(type: VerificationType): string {
        const mapping: Record<VerificationType, string> = {
            NIN: 'NIN',
            BVN: 'BVN',
            PASSPORT: 'PASSPORT',
            DRIVERS_LICENSE: 'DRIVERS_LICENSE',
            VOTERS_CARD: 'VOTER_ID',
        };
        return mapping[type];
    }
}
