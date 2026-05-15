/**
 * Documents Service
 * User document storage and management
 * Per APIRevised.md Section 4
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import { storageProviderFactory } from '../../integrations/storage';
import { UploadDocumentDto, DocumentQueryDto } from './documents.dto';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================

interface DocumentResponse {
    id: string;
    type: string;
    subtype: string | null;
    name: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string | null;
    thumbnailUrl: string | null;
    status: string;
    expiryDate: Date | null;
    uploadedAt: Date;
    verifiedAt: Date | null;
}

// ============================================
// SERVICE
// ============================================

class DocumentsService {
    /**
     * List user documents
     */
    async getDocuments(userId: string, query: DocumentQueryDto): Promise<{
        items: DocumentResponse[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            userId,
            deletedAt: null,
        };

        if (query.type) {
            where.type = query.type;
        }
        if (query.status) {
            where.status = query.status;
        }

        const total = await prisma.document.count({ where });
        const totalPages = Math.ceil(total / query.limit);

        const documents = await prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });

        const items = await Promise.all(
            documents.map(doc => this.formatDocument(doc))
        );

        return {
            items,
            total,
            page: query.page,
            totalPages,
        };
    }

    /**
     * Upload a document
     */
    async uploadDocument(
        userId: string,
        dto: UploadDocumentDto,
        file: {
            originalname: string;
            mimetype: string;
            size: number;
            buffer: Buffer;
        }
    ): Promise<DocumentResponse> {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new AppError('Only PDF, JPEG, and PNG files are allowed', 'DOC_001', 400);
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new AppError('File size must be less than 10MB', 'DOC_002', 400);
        }

        // Generate storage key
        const ext = file.originalname.split('.').pop() || 'pdf';
        const storageKey = `documents/${userId}/${uuidv4()}.${ext}`;

        // Upload to storage
        const storageProvider = storageProviderFactory.getProvider();
        await storageProvider.upload({
            key: storageKey,
            body: file.buffer,
            contentType: file.mimetype,
        });

        // Create document record
        const document = await prisma.document.create({
            data: {
                userId,
                type: dto.type,
                subtype: dto.subtype,
                name: dto.name,
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                storageKey,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
            },
        });

        return this.formatDocument(document);
    }

    /**
     * Get document download URL
     */
    async getDownloadUrl(userId: string, documentId: string): Promise<{
        downloadUrl: string;
        expiresIn: number;
        filename: string;
    }> {
        const document = await prisma.document.findFirst({
            where: { id: documentId, userId, deletedAt: null },
        });

        if (!document) {
            throw new NotFoundError('Document not found');
        }

        const storageProvider = storageProviderFactory.getProvider();
        const downloadUrl = await storageProvider.getSignedUrl({ key: document.storageKey, expiresIn: 3600 });

        return {
            downloadUrl,
            expiresIn: 3600,
            filename: document.filename,
        };
    }

    /**
     * Delete a document
     */
    async deleteDocument(userId: string, documentId: string): Promise<void> {
        const document = await prisma.document.findFirst({
            where: { id: documentId, userId, deletedAt: null },
        });

        if (!document) {
            throw new NotFoundError('Document not found');
        }

        // Check if document is being reviewed
        if (document.status === 'PENDING') {
            // Allow deletion of pending documents
        }

        // Soft delete
        await prisma.document.update({
            where: { id: documentId },
            data: { deletedAt: new Date() },
        });

        // Optionally delete from storage
        // const storageProvider = storageProviderFactory.getProvider();
        // await storageProvider.deleteFile(document.storageKey);
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private async formatDocument(doc: {
        id: string;
        type: string;
        subtype: string | null;
        name: string;
        filename: string;
        mimeType: string;
        size: number;
        storageKey: string;
        thumbnailKey: string | null;
        status: string;
        expiryDate: Date | null;
        uploadedAt: Date;
        verifiedAt: Date | null;
    }): Promise<DocumentResponse> {
        const storageProvider = storageProviderFactory.getProvider();

        let url: string | null = null;
        let thumbnailUrl: string | null = null;

        try {
            url = await storageProvider.getSignedUrl({ key: doc.storageKey, expiresIn: 3600 });
            if (doc.thumbnailKey) {
                thumbnailUrl = await storageProvider.getSignedUrl({ key: doc.thumbnailKey, expiresIn: 3600 });
            }
        } catch {
            // Ignore storage errors
        }

        return {
            id: doc.id,
            type: doc.type.toLowerCase(),
            subtype: doc.subtype,
            name: doc.name,
            filename: doc.filename,
            mimeType: doc.mimeType,
            size: doc.size,
            url,
            thumbnailUrl,
            status: doc.status.toLowerCase(),
            expiryDate: doc.expiryDate,
            uploadedAt: doc.uploadedAt,
            verifiedAt: doc.verifiedAt,
        };
    }
}

export const documentsService = new DocumentsService();
