/**
 * Storage Provider Interface
 * Abstraction for file storage services
 */

// ============================================
// TYPES
// ============================================

export interface UploadParams {
    key: string; // File path/name in storage
    body: Buffer | string;
    contentType?: string;
    bucket?: string;
    acl?: 'private' | 'public-read';
    metadata?: Record<string, string>;
}

export interface UploadResult {
    success: boolean;
    key: string;
    url: string;
    bucket: string;
    etag?: string;
    error?: string;
}

export interface GetSignedUrlParams {
    key: string;
    bucket?: string;
    expiresIn?: number; // seconds
    operation?: 'getObject' | 'putObject';
}

export interface DeleteParams {
    key: string;
    bucket?: string;
}

export interface DeleteResult {
    success: boolean;
    key: string;
    error?: string;
}

export interface ListParams {
    prefix?: string;
    bucket?: string;
    maxKeys?: number;
    continuationToken?: string;
}

export interface ListResult {
    success: boolean;
    files: {
        key: string;
        size: number;
        lastModified: Date;
    }[];
    continuationToken?: string;
    isTruncated: boolean;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface StorageProvider {
    readonly providerId: string;

    upload(params: UploadParams): Promise<UploadResult>;
    getSignedUrl(params: GetSignedUrlParams): Promise<string>;
    delete(params: DeleteParams): Promise<DeleteResult>;
    list(params: ListParams): Promise<ListResult>;
}
