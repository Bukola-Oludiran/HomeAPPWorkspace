/**
 * Property Routes
 * Implements PRD Section 8.1 Property Endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { propertyService } from './properties.service';
import { authenticate, optionalAuth, requirePermission } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import { storageProviderFactory } from '../../integrations/storage';
import { logger } from '../../common/utils/logger';
import {
    createPropertySchema,
    updatePropertySchema,
    updatePropertyStatusSchema,
    createDraftSchema,
    updateDraftSchema,
    searchPropertiesSchema,
    nearbyPropertiesSchema,
} from './properties.dto';

const router = Router();

// Multer config for image upload (memory storage for S3)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @route GET /properties
 * @desc List properties with filters
 * @access Public
 */
router.get(
    '/',
    validateQuery(searchPropertiesSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await propertyService.listProperties(req.query as any);
            sendSuccess(res, result.properties, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /properties/search
 * @desc Search properties with text query
 * @access Public
 */
router.get(
    '/search',
    validateQuery(searchPropertiesSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await propertyService.searchProperties(req.query as any);
            sendSuccess(res, result.properties, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /properties/featured
 * @desc Get featured properties (Gold/Platinum verified)
 * @access Public
 */
router.get('/featured', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const properties = await propertyService.getFeaturedProperties(limit);
        sendSuccess(res, properties);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /properties/nearby
 * @desc Get nearby properties
 * @access Public
 */
router.get(
    '/nearby',
    validateQuery(nearbyPropertiesSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const properties = await propertyService.getNearbyProperties(req.query as any);
            sendSuccess(res, properties);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /properties/:id
 * @desc Get property by ID
 * @access Public
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const includeInactive = req.user?.role === 'ADMIN';
        const property = await propertyService.getPropertyById(req.params.id, includeInactive);
        sendSuccess(res, property);
    } catch (error) {
        next(error);
    }
});

// ============================================
// LANDLORD ENDPOINTS
// ============================================

/**
 * @route GET /properties/my
 * @desc Get my properties (landlord)
 * @access Private (Landlord)
 */
router.get(
    '/my/list',
    authenticate,
    requirePermission('property:write'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const status = req.query.status as string | undefined;
            const properties = await propertyService.getMyProperties(req.user!.id, status);
            sendSuccess(res, properties);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /properties
 * @desc Create a new property
 * @access Private (Landlord)
 */
router.post(
    '/',
    authenticate,
    requirePermission('property:write'),
    validate(createPropertySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const property = await propertyService.createProperty(req.user!.id, req.body);
            sendCreated(res, property);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /properties/:id
 * @desc Update a property
 * @access Private (Landlord)
 */
router.put(
    '/:id',
    authenticate,
    requirePermission('property:write'),
    validate(updatePropertySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const property = await propertyService.updateProperty(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendSuccess(res, property);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /properties/:id
 * @desc Delete a property (soft delete)
 * @access Private (Landlord)
 */
router.delete(
    '/:id',
    authenticate,
    requirePermission('property:write'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await propertyService.deleteProperty(req.params.id, req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PATCH /properties/:id/status
 * @desc Update property status
 * @access Private (Landlord)
 */
router.patch(
    '/:id/status',
    authenticate,
    requirePermission('property:write'),
    validate(updatePropertyStatusSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await propertyService.updatePropertyStatus(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// IMAGE ENDPOINTS
// ============================================

/**
 * @route POST /properties/:id/images
 * @desc Upload images to property
 * @access Private (Landlord)
 */
router.post(
    '/:id/images',
    authenticate,
    requirePermission('property:write'),
    upload.array('images', 10),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                throw new Error('No files uploaded');
            }

            // Upload to S3 storage
            const storage = storageProviderFactory.getProvider();
            const imageUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const key = `properties/${req.params.id}/${Date.now()}_${i}.jpg`;

                const uploadResult = await storage.upload({
                    key,
                    body: file.buffer,
                    contentType: file.mimetype,
                    bucket: 'homeai-properties',
                });

                if (uploadResult.success && uploadResult.url) {
                    imageUrls.push(uploadResult.url);
                } else {
                    logger.warn(`Failed to upload image ${i}: ${uploadResult.error}`);
                }
            }

            if (imageUrls.length === 0) {
                throw new Error('Failed to upload any images');
            }

            const result = await propertyService.addImages(req.params.id, req.user!.id, imageUrls);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /properties/:id/images/:imageId
 * @desc Delete an image from property
 * @access Private (Landlord)
 */
router.delete(
    '/:id/images/:imageId',
    authenticate,
    requirePermission('property:write'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await propertyService.deleteImage(
                req.params.id,
                req.params.imageId,
                req.user!.id
            );
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// DRAFT/WIZARD ENDPOINTS
// ============================================

/**
 * @route POST /properties/draft
 * @desc Create a draft property
 * @access Private (Landlord)
 */
router.post(
    '/draft',
    authenticate,
    requirePermission('property:write'),
    validate(createDraftSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const property = await propertyService.createDraft(req.user!.id, req.body);
            sendCreated(res, property);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /properties/draft/:id
 * @desc Update a draft property
 * @access Private (Landlord)
 */
router.put(
    '/draft/:id',
    authenticate,
    requirePermission('property:write'),
    validate(updateDraftSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const property = await propertyService.updateDraft(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendSuccess(res, property);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /properties/draft/:id/publish
 * @desc Publish a draft property
 * @access Private (Landlord)
 */
router.post(
    '/draft/:id/publish',
    authenticate,
    requirePermission('property:write'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const property = await propertyService.publishDraft(req.params.id, req.user!.id);
            sendSuccess(res, property);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
