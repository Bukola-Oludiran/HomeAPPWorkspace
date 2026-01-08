/**
 * Auth Routes
 * Implements PRD Section 6.1 Authentication Endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { authenticate } from '../../common/middleware/auth.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    initiateRegistrationSchema,
    verifyEmailSchema,
    completeRegistrationSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verify2FASchema,
    disable2FASchema,
} from './auth.dto';

const router = Router();

// ============================================
// HELPER: Validate request body
// ============================================

const validate = <T>(schema: { parse: (data: unknown) => T }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

// ============================================
// REGISTRATION ENDPOINTS
// ============================================

/**
 * @swagger
 * /auth/register/initiate:
 *   post:
 *     summary: Start registration process
 *     description: Initiates user registration by sending a verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               role:
 *                 type: string
 *                 enum: [TENANT, LANDLORD, AGENT]
 *                 example: TENANT
 *               regionCode:
 *                 type: string
 *                 example: NG
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Verification email sent
 *                     expiresIn:
 *                       type: number
 *                       example: 600
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 */
router.post(
    '/register/initiate',
    validate(initiateRegistrationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, role, regionCode } = req.body;
            const result = await authService.initiateRegistration(email, role, regionCode);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/register/verify-email
 * @desc Verify email with code
 * @access Public
 */
router.post(
    '/register/verify-email',
    validate(verifyEmailSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body;
            const result = await authService.verifyEmail(email, code);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/register/complete
 * @desc Complete registration with password
 * @access Public
 */
router.post(
    '/register/complete',
    validate(completeRegistrationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, firstName, lastName, phone } = req.body;
            const result = await authService.completeRegistration(
                email,
                password,
                firstName,
                lastName,
                phone
            );
            sendCreated(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// LOGIN / LOGOUT ENDPOINTS
// ============================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account inactive or requires 2FA
 */
router.post(
    '/login',
    validate(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, twoFactorCode } = req.body;
            const result = await authService.login(email, password, twoFactorCode);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/logout
 * @desc Logout - invalidate refresh token
 * @access Public
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
    '/refresh-token',
    validate(refreshTokenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshToken(refreshToken);
            sendSuccess(res, tokens);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// PASSWORD RESET ENDPOINTS
// ============================================

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
    '/forgot-password',
    validate(forgotPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
    '/reset-password',
    validate(resetPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// TWO-FACTOR AUTHENTICATION ENDPOINTS
// ============================================

/**
 * @route POST /auth/2fa/setup
 * @desc Initialize 2FA setup
 * @access Private
 */
router.post(
    '/2fa/setup',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.setup2FA(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/2fa/verify
 * @desc Verify and enable 2FA
 * @access Private
 */
router.post(
    '/2fa/verify',
    authenticate,
    validate(verify2FASchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code } = req.body;
            const result = await authService.verify2FA(req.user!.id, code);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /auth/2fa/disable
 * @desc Disable 2FA
 * @access Private
 */
router.post(
    '/2fa/disable',
    authenticate,
    validate(disable2FASchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code, password } = req.body;
            const result = await authService.disable2FA(req.user!.id, code, password);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /auth/2fa/recovery-codes
 * @desc Get 2FA recovery codes
 * @access Private
 */
router.get(
    '/2fa/recovery-codes',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.getRecoveryCodes(req.user!.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

// ============================================
// OAUTH ENDPOINTS
// ============================================

/**
 * @route POST /auth/login/oauth/:provider
 * @desc Login with OAuth provider (Google, Apple, Facebook)
 * @access Public
 */
router.post(
    '/login/oauth/:provider',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Lazy import to avoid circular dependencies
            const { oauthService } = await import('./oauth.service');

            const provider = oauthService.validateProvider(req.params.provider);
            const { token, role, regionCode } = req.body;

            if (!token) {
                throw new Error('OAuth token is required');
            }

            const result = await oauthService.loginWithOAuth(
                provider,
                token,
                role,
                regionCode
            );

            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

export default router;

