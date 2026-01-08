/**
 * AWS S3 Storage Provider
 * Implements StorageProvider interface
 * Per PRD Section 14.1
 */

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export class S3Provider implements StorageProvider {
    readonly providerId = 's3';

    private client: S3Client;
    private defaultBucket: string;
    private cdnDomain?: string;

    constructor(
        region: string,
        accessKeyId: string,
        secretAccessKey: string,
        defaultBucket: string,
        cdnDomain?: string
    ) {
        this.defaultBucket = defaultBucket;
        this.cdnDomain = cdnDomain;

        this.client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        logger.info(`S3 provider initialized (bucket: ${defaultBucket})`);
    }

    async upload(params: UploadParams): Promise<UploadResult> {
        try {
            const bucket = params.bucket || this.defaultBucket;

            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: params.key,
                Body: params.body,
                ContentType: params.contentType,
                ACL: params.acl || 'private',
                Metadata: params.metadata,
            });

            const response = await this.client.send(command);

            // Build URL
            const url = this.cdnDomain
                ? `https://${this.cdnDomain}/${params.key}`
                : `https://${bucket}.s3.amazonaws.com/${params.key}`;

            logger.info(`S3 upload success: ${params.key}`);

            return {
                success: true,
                key: params.key,
                url,
                bucket,
                etag: response.ETag,
            };
        } catch (error: any) {
            logger.error('S3 upload error:', error.message);
            return {
                success: false,
                key: params.key,
                url: '',
                bucket: params.bucket || this.defaultBucket,
                error: error.message,
            };
        }
    }

    async getSignedUrl(params: GetSignedUrlParams): Promise<string> {
        try {
            const bucket = params.bucket || this.defaultBucket;
            const expiresIn = params.expiresIn || 3600; // 1 hour default

            const command = params.operation === 'putObject'
                ? new PutObjectCommand({ Bucket: bucket, Key: params.key })
                : new GetObjectCommand({ Bucket: bucket, Key: params.key });

            const url = await getSignedUrl(this.client, command, { expiresIn });

            return url;
        } catch (error: any) {
            logger.error('S3 getSignedUrl error:', error.message);
            throw error;
        }
    }

    async delete(params: DeleteParams): Promise<DeleteResult> {
        try {
            const bucket = params.bucket || this.defaultBucket;

            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: params.key,
            });

            await this.client.send(command);

            logger.info(`S3 delete success: ${params.key}`);

            return {
                success: true,
                key: params.key,
            };
        } catch (error: any) {
            logger.error('S3 delete error:', error.message);
            return {
                success: false,
                key: params.key,
                error: error.message,
            };
        }
    }

    async list(params: ListParams): Promise<ListResult> {
        try {
            const bucket = params.bucket || this.defaultBucket;

            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: params.prefix,
                MaxKeys: params.maxKeys || 100,
                ContinuationToken: params.continuationToken,
            });

            const response = await this.client.send(command);

            return {
                success: true,
                files: (response.Contents || []).map(item => ({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                })),
                continuationToken: response.NextContinuationToken,
                isTruncated: response.IsTruncated || false,
            };
        } catch (error: any) {
            logger.error('S3 list error:', error.message);
            return {
                success: false,
                files: [],
                isTruncated: false,
            };
        }
    }
}
