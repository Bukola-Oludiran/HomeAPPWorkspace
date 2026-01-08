/**
 * Messaging Module - DTO Validation Schemas
 * Per Backend Requirements.md Messaging System section
 */

import { z } from 'zod';

// ============================================
// CONVERSATIONS
// ============================================

export const createConversationSchema = z.object({
    participantIds: z.array(z.string().uuid()).min(1),
    propertyId: z.string().uuid().optional(),
    initialMessage: z.string().max(2000).optional(),
});

export const conversationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// MESSAGES
// ============================================

export const sendMessageSchema = z.object({
    content: z.string().min(1).max(5000),
    attachments: z.array(z.object({
        type: z.enum(['image', 'document', 'property']),
        url: z.string().url().optional(),
        propertyId: z.string().uuid().optional(),
    })).optional(),
});

export const messageQuerySchema = z.object({
    before: z.string().optional(), // Cursor for pagination
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ============================================
// TYPES
// ============================================

export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export type ConversationQueryDto = z.infer<typeof conversationQuerySchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type MessageQueryDto = z.infer<typeof messageQuerySchema>;
