/**
 * Document Verification Provider Interface
 * Abstraction for property document verification (land titles, C of O, etc.)
 * Per MultiRegion Abstraction Section 6
 */

// ============================================
// TYPES
// ============================================

export type PropertyDocumentType =
    // Nigeria
    | 'certificate_of_occupancy'
    | 'governors_consent'
    | 'survey_plan'
    | 'deed_of_assignment'
    // Ghana
    | 'land_title_certificate'
    | 'site_plan'
    | 'indenture'
    // Kenya
    | 'title_deed'
    | 'land_search'
    | 'rates_clearance'
    // UK
    | 'title_register'
    | 'epc'
    | 'gas_safety_certificate'
    | 'electrical_certificate'
    // Canada
    | 'land_title'
    | 'property_tax_certificate'
    // Universal
    | 'utility_bill'
    | 'tax_receipt'
    | 'other';

export interface VerifyPropertyDocumentParams {
    documentType: PropertyDocumentType;
    documentUrl: string;
    documentNumber?: string;
    propertyAddress: string;
    ownerName?: string;
    country: string;
}

export interface DocumentVerifyResult {
    success: boolean;
    verificationId: string;
    status: 'verified' | 'failed' | 'pending' | 'manual_review';
    confidence?: number;
    extractedData?: ExtractedDocumentData;
    matchScore?: number;
    issues?: string[];
    validUntil?: Date;
    error?: string;
}

export interface ExtractedDocumentData {
    documentNumber?: string;
    address?: string;
    ownerNames?: string[];
    issueDate?: Date;
    expiryDate?: Date;
    registryNumber?: string;
    [key: string]: unknown;
}

export interface RegistrySearchParams {
    titleNumber?: string;
    address?: string;
    postcode?: string;
    county?: string;
    country: string;
}

export interface RegistrySearchResult {
    found: boolean;
    titles?: RegistryTitle[];
}

export interface RegistryTitle {
    titleNumber: string;
    address?: string;
    tenure?: string;
    registeredOwners?: string[];
    area?: string;
}

export interface LicenseVerifyParams {
    licenseNumber: string;
    country: string;
}

export interface LicenseVerifyResult {
    valid: boolean;
    licenseNumber: string;
    agentName?: string;
    companyName?: string;
    expiryDate?: Date;
    category?: string;
    error?: string;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface DocumentProvider {
    readonly providerId: string;
    readonly supportedRegions: string[];
    readonly supportedDocumentTypes: PropertyDocumentType[];

    verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult>;
    searchRegistry?(params: RegistrySearchParams): Promise<RegistrySearchResult>;
    verifyAgentLicense?(params: LicenseVerifyParams): Promise<LicenseVerifyResult>;
}
