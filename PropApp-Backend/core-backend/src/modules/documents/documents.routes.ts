/**
 * Documents Routes
 * Document upload, download, and management
 * Per APIRevised.md Section 4
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendError } from '../../common/utils/response.util';
import { documentsService } from './documents.service';
import { uploadDocumentSchema, documentQuerySchema } from './documents.dto';
import { ZodError } from 'zod';

const router = Router();

// Multer config for document upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
        }
    },
});

// ============================================
// LIST DOCUMENTS
// ============================================

/**
 * @swagger
 * /users/me/documents:
 *   get:
 *     summary: List user documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = documentQuerySchema.parse(req.query);
            const result = await documentsService.getDocuments(req.user!.id, query);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// UPLOAD DOCUMENT
// ============================================

/**
 * @swagger
 * /users/me/documents:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return sendError(res, 'DOC_003', 'No file uploaded', 400);
            }

            const dto = uploadDocumentSchema.parse(req.body);
            const document = await documentsService.uploadDocument(
                req.user!.id,
                dto,
                {
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    buffer: req.file.buffer,
                }
            );
            sendSuccess(res, document, 201);
        } catch (error) {
            if (error instanceof ZodError) {
                return sendError(res, 'VAL_001', 'Validation failed', 400, error.errors as never);
            }
            next(error);
        }
    }
);

// ============================================
// GET DOWNLOAD URL
// ============================================

/**
 * @swagger
 * /users/me/documents/{id}/download:
 *   get:
 *     summary: Get document download URL
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/:id/download',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await documentsService.getDownloadUrl(req.user!.id, req.params.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// DELETE DOCUMENT
// ============================================

/**
 * @swagger
 * /users/me/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/:id',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await documentsService.deleteDocument(req.user!.id, req.params.id);
            sendSuccess(res, { message: 'Document deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
