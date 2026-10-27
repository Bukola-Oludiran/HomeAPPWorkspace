/**
 * Auth Routes
 * Implements PRD Section 6.1 Authentication Endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    initiateRegistrationSchema,
    verifyEmailSchema,
    completeRegistrationSchema,
    loginSchema,
    refreshTokenSchema,
    oauthLoginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verify2FASchema,
    verify2FAChallengeSchema,
    disable2FASchema,
} from './auth.dto';

const router = Router();

// ============================================
// REGISTRATION ENDPOINTS
// ============================================

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
 * @route POST /auth/2fa/challenge/verify
 * @desc Complete a 2FA login: exchange the challenge token from /auth/login and a TOTP code for tokens
 * @access Public (the challenge token is the credential)
 */
router.post(
    '/2fa/challenge/verify',
    validate(verify2FAChallengeSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { challengeToken, code } = req.body;
            const result = await authService.verifyLoginChallenge(challengeToken, code);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
);

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
    validate(oauthLoginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Lazy import to avoid circular dependencies
            const { oauthService } = await import('./oauth.service');

            const provider = oauthService.validateProvider(req.params.provider);
            const { token, role, regionCode } = req.body;

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

