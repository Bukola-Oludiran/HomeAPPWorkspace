/**
 * User Routes
 * Implements PRD Section 7.1 & 7.2 User Management Endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { userService } from './users.service';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticateService, requireService } from '../../common/middleware/service.middleware';
import { sendSuccess } from '../../common/utils/response.util';
import { storageProviderFactory } from '../../integrations/storage';
import {
    updateProfileSchema,
    updatePasswordSchema,
    updatePreferencesSchema,
    updateNotificationSettingsSchema,
    connectWalletSchema,
} from './users.dto';

const router = Router();

// Multer config for avatar upload (memory storage for S3)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
// ============================================
// CURRENT USER ENDPOINTS
// ============================================

/**
 * @route GET /users/me
 * @desc Get current user's profile
 * @access Private
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getCurrentUser(req.user!.id);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
});

/**
 * @route PUT /users/me
 * @desc Update current user's profile
 * @access Private
 */
router.put(
    '/me',
    authenticate,
    validate(updateProfileSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await userService.updateProfile(req.user!.id, req.body);
            sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /users/me/password
 * @desc Change password
 * @access Private
 */
router.put(
    '/me/password',
    authenticate,
    validate(updatePasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await userService.changePassword(req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /users/me/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put(
    '/me/preferences',
    authenticate,
    validate(updatePreferencesSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await userService.updatePreferences(req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /users/me/notification-settings
 * @desc Update notification settings
 * @access Private
 */
router.put(
    '/me/notification-settings',
    authenticate,
    validate(updateNotificationSettingsSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await userService.updateNotificationSettings(req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route DELETE /users/me
 * @desc Delete current user's account
 * @access Private
 */
router.delete('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.deleteAccount(req.user!.id);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /users/me/avatar
 * @desc Upload avatar image
 * @access Private
 */
router.post(
    '/me/avatar',
    authenticate,
    upload.single('avatar'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            // Upload to S3 storage
            const storage = storageProviderFactory.getProvider();
            const key = `avatars/${req.user!.id}/${Date.now()}.jpg`;

            const uploadResult = await storage.upload({
                key,
                body: req.file.buffer,
                contentType: req.file.mimetype,
                bucket: 'homeai-avatars',
            });

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || 'Failed to upload avatar');
            }

            const result = await userService.updateAvatar(req.user!.id, uploadResult.url);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/me/avatar', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        sendSuccess(res, await userService.updateAvatar(req.user!.id, null));
    } catch (error) {
        next(error);
    }
});

// ============================================
// WALLET ENDPOINTS (PRD Section 7.2)
// ============================================

/**
 * @route GET /users/me/wallet
 * @desc Get wallet info
 * @access Private
 */
router.get('/me/wallet', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wallet = await userService.getWallet(req.user!.id);
        sendSuccess(res, wallet);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /users/me/wallet/connect
 * @desc Connect blockchain wallet
 * @access Private
 */
router.post(
    '/me/wallet/connect',
    authenticate,
    validate(connectWalletSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await userService.connectWallet(req.user!.id, req.body);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PUBLIC PROFILE ENDPOINTS
// ============================================

/**
 * @route GET /users/public/landlord/:id
 * @desc Get public landlord profile
 * @access Public
 */
router.get('/public/landlord/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.getPublicLandlordProfile(req.params.id);
        sendSuccess(res, profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /users/public/tenant/:id
 * @desc Get public tenant profile
 * @access Public
 */
router.get('/public/tenant/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.getPublicTenantProfile(req.params.id);
        sendSuccess(res, profile);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /users/public/agent/:id
 * @desc Get public agent profile
 * @access Public
 */
router.get('/public/agent/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.getPublicAgentProfile(req.params.id);
        sendSuccess(res, profile);
    } catch (error) {
        next(error);
    }
});

// ============================================
// INTERNAL ENDPOINTS (Service-to-Service)
// ============================================

/**
 * @route GET /internal/users/:id/context
 * @desc Get user context for AI service
 * @access Service-to-Service only
 */
router.get(
    '/internal/:id/context',
    authenticateService,
    requireService('ai-service'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const context = await userService.getUserContext(req.params.id);
            sendSuccess(res, context);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// FAVORITES ENDPOINTS (PRD Section 8.1)
// ============================================

// Import favorites service lazily to avoid circular dependencies
const getFavoritesService = async () => {
    const { favoritesService } = await import('../properties/favorites.service');
    return favoritesService;
};

/**
 * @route GET /users/me/favorites
 * @desc Get user's favorite properties
 * @access Private
 */
router.get('/me/favorites', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const favoritesService = await getFavoritesService();
        const favorites = await favoritesService.getFavorites(req.user!.id);
        sendSuccess(res, favorites);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /users/me/favorites/:propertyId
 * @desc Add property to favorites
 * @access Private
 */
router.post('/me/favorites/:propertyId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const favoritesService = await getFavoritesService();
        const result = await favoritesService.addFavorite(req.user!.id, req.params.propertyId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route DELETE /users/me/favorites/:propertyId
 * @desc Remove property from favorites
 * @access Private
 */
router.delete('/me/favorites/:propertyId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const favoritesService = await getFavoritesService();
        const result = await favoritesService.removeFavorite(req.user!.id, req.params.propertyId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

export default router;
