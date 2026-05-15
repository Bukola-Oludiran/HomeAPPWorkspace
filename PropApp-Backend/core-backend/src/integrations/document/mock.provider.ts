/**
 * Mock Document Provider
 * Development fallback for document verification
 */

import {
    DocumentProvider,
    PropertyDocumentType,
    VerifyPropertyDocumentParams,
    DocumentVerifyResult,
    RegistrySearchParams,
    RegistrySearchResult,
    LicenseVerifyParams,
    LicenseVerifyResult,
} from './document.interface';
import { logger } from '../../common/utils/logger';

export class MockDocumentProvider implements DocumentProvider {
    readonly providerId = 'mock';
    readonly supportedRegions = ['*']; // All regions for fallback
    readonly supportedDocumentTypes: PropertyDocumentType[] = [
        'certificate_of_occupancy',
        'governors_consent',
        'survey_plan',
        'deed_of_assignment',
        'land_title_certificate',
        'title_deed',
        'title_register',
        'epc',
        'utility_bill',
        'other',
    ];

    async verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult> {
        logger.info(`[MockDocumentProvider] Verifying document: ${params.documentType}`);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock successful verification
        const verificationId = `mock_doc_${Date.now()}`;

        return {
            success: true,
            verificationId,
            status: 'verified',
            confidence: 0.95,
            matchScore: 0.92,
            extractedData: {
                documentNumber: params.documentNumber || `DOC-${Date.now()}`,
                address: params.propertyAddress,
                ownerNames: params.ownerName ? [params.ownerName] : [],
                issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
            },
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        };
    }

    async searchRegistry(params: RegistrySearchParams): Promise<RegistrySearchResult> {
        logger.info(`[MockDocumentProvider] Searching registry: ${params.titleNumber || params.address}`);

        return {
            found: true,
            titles: [
                {
                    titleNumber: params.titleNumber || `TITLE-${Date.now()}`,
                    address: params.address || 'Mock Address',
                    tenure: 'freehold',
                    registeredOwners: ['Mock Owner'],
                },
            ],
        };
    }

    async verifyAgentLicense(params: LicenseVerifyParams): Promise<LicenseVerifyResult> {
        logger.info(`[MockDocumentProvider] Verifying agent license: ${params.licenseNumber}`);

        return {
            valid: true,
            licenseNumber: params.licenseNumber,
            agentName: 'Mock Agent',
            companyName: 'Mock Agency Ltd',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            category: 'Full',
        };
    }
}
