/**
 * Mock Storage Provider
 * For development and testing
 */

import { logger } from '../../common/utils/logger';
import {
    StorageProvider,
    UploadParams,
    UploadResult,
    GetSignedUrlParams,
    DeleteParams,
    DeleteResult,
    ListParams,
    ListResult,
} from './storage.interface';

export class MockStorageProvider implements StorageProvider {
    readonly providerId = 'mock';

    private storage: Map<string, { body: Buffer | string; contentType: string }> = new Map();

    async upload(params: UploadParams): Promise<UploadResult> {
        logger.info(`[MOCK] Storage upload: ${params.key}`);

        this.storage.set(params.key, {
            body: params.body,
            contentType: params.contentType || 'application/octet-stream',
        });

        return {
            success: true,
            key: params.key,
            url: `http://localhost:3000/mock-storage/${params.key}`,
            bucket: params.bucket || 'mock-bucket',
            etag: `etag-${Date.now()}`,
        };
    }

    async getSignedUrl(params: GetSignedUrlParams): Promise<string> {
        logger.info(`[MOCK] Storage getSignedUrl: ${params.key}`);
        return `http://localhost:3000/mock-storage/${params.key}?token=mock-signed-url&expires=${Date.now() + (params.expiresIn || 3600) * 1000}`;
    }

    async delete(params: DeleteParams): Promise<DeleteResult> {
        logger.info(`[MOCK] Storage delete: ${params.key}`);

        this.storage.delete(params.key);

        return {
            success: true,
            key: params.key,
        };
    }

    async list(params: ListParams): Promise<ListResult> {
        logger.info(`[MOCK] Storage list: ${params.prefix || '*'}`);

        const files = Array.from(this.storage.keys())
            .filter(key => !params.prefix || key.startsWith(params.prefix))
            .map(key => ({
                key,
                size: 1024,
                lastModified: new Date(),
            }));

        return {
            success: true,
            files,
            isTruncated: false,
        };
    }
}
