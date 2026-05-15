/**
 * Messaging Routes
 * Implements Backend Requirements.md Messaging System section
 */

import { Router, Request, Response, NextFunction } from 'express';
import { messagingService } from './messaging.service';
import { authenticate } from '../../common/middleware/auth.middleware';
import { validate, validateQuery } from '../../common/middleware/validate.middleware';
import { sendSuccess, sendCreated } from '../../common/utils/response.util';
import {
    createConversationSchema,
    conversationQuerySchema,
    sendMessageSchema,
    messageQuerySchema,
} from './messaging.dto';

const router = Router();

// All messaging routes require authentication
router.use(authenticate);
// ============================================
// CONVERSATIONS
// ============================================

/**
 * @route GET /messages/conversations
 * @desc List conversations
 * @access Private
 */
router.get(
    '/conversations',
    validateQuery(conversationQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await messagingService.getConversations(req.user!.id, req.query as any);
            sendSuccess(res, result.conversations, {
                page: result.page,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /messages/conversations
 * @desc Start new conversation
 * @access Private
 */
router.post(
    '/conversations',
    validate(createConversationSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const conversation = await messagingService.createConversation(req.user!.id, req.body);
            sendCreated(res, conversation);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /messages/conversations/:id
 * @desc Get conversation messages
 * @access Private
 */
router.get(
    '/conversations/:id',
    validateQuery(messageQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await messagingService.getMessages(
                req.params.id,
                req.user!.id,
                req.query as any
            );
            sendSuccess(res, result.messages, { page: 1, total: result.messages.length, totalPages: 1, hasMore: result.hasMore });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /messages/conversations/:id
 * @desc Send message
 * @access Private
 */
router.post(
    '/conversations/:id',
    validate(sendMessageSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await messagingService.sendMessage(
                req.params.id,
                req.user!.id,
                req.body
            );
            sendCreated(res, message);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
