/**
 * Messaging Service
 * Handles conversations and messages
 * Per Backend Requirements.md Messaging System section
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { ValidationError } from '../../common/utils/errors';
import { communicationProviderFactory } from '../../integrations/communication';
import { env } from '../../config/env';
import {
    CreateConversationDto,
    ConversationQueryDto,
    SendMessageDto,
    MessageQueryDto,
} from './messaging.dto';

// ============================================
// TYPES
// ============================================

interface ConversationSummary {
    id: string;
    participants: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    }[];
    lastMessage: {
        content: string;
        senderId: string;
        createdAt: Date;
    } | null;
    propertyId: string | null;
    unreadCount: number;
    updatedAt: Date;
}

interface MessageDetail {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachments: Record<string, unknown>[];
    read: boolean;
    createdAt: Date;
}

// ============================================
// MESSAGING SERVICE CLASS
// ============================================

class MessagingService {
    // ----------------------------------------
    // CONVERSATIONS
    // ----------------------------------------

    /**
     * Get user's conversations
     * GET /api/v1/messages/conversations
     */
    async getConversations(userId: string, query: ConversationQueryDto): Promise<{
        conversations: ConversationSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const where: Prisma.ConversationWhereInput = {
            participants: {
                some: { userId },
            },
        };

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            content: true,
                            senderId: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            prisma.conversation.count({ where }),
        ]);

        // Get unread counts
        const conversationsWithUnread = await Promise.all(
            conversations.map(async c => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: c.id,
                        senderId: { not: userId },
                        read: false,
                    },
                });

                return {
                    id: c.id,
                    participants: c.participants.map(p => p.user),
                    lastMessage: c.messages[0] || null,
                    propertyId: c.propertyId,
                    unreadCount,
                    updatedAt: c.updatedAt,
                };
            })
        );

        return {
            conversations: conversationsWithUnread,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get conversation messages
     * GET /api/v1/messages/conversations/:id
     */
    async getMessages(
        conversationId: string,
        userId: string,
        query: MessageQueryDto
    ): Promise<{
        messages: MessageDetail[];
        hasMore: boolean;
    }> {
        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
        });

        if (!participant) {
            throw new ValidationError('Access denied', [
                { field: 'conversationId', message: 'You are not a participant of this conversation' },
            ]);
        }

        const where: Prisma.MessageWhereInput = { conversationId };

        if (query.before) {
            where.createdAt = { lt: new Date(query.before) };
        }

        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: query.limit + 1, // Fetch one extra to check hasMore
        });

        const hasMore = messages.length > query.limit;
        if (hasMore) messages.pop(); // Remove extra

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                read: false,
            },
            data: { read: true },
        });

        return {
            messages: messages.reverse().map(m => ({
                id: m.id,
                conversationId: m.conversationId,
                senderId: m.senderId,
                content: m.content,
                attachments: (m.attachments as Record<string, unknown>[]) || [],
                read: m.read,
                createdAt: m.createdAt,
            })),
            hasMore,
        };
    }

    /**
     * Send message
     * POST /api/v1/messages/conversations/:id
     */
    async sendMessage(
        conversationId: string,
        senderId: string,
        data: SendMessageDto
    ): Promise<MessageDetail> {
        // Verify user is participant
        const participant = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId: senderId },
        });

        if (!participant) {
            throw new ValidationError('Access denied', [
                { field: 'conversationId', message: 'You are not a participant of this conversation' },
            ]);
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: data.content,
                attachments: data.attachments || [],
                read: false,
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // Send push notification to other participants (fire and forget)
        this.notifyParticipants(conversationId, senderId, data.content).catch(err => {
            logger.error(`Failed to notify participants: ${err.message}`);
        });

        logger.info(`Message sent in conversation ${conversationId} by ${senderId}`);

        return {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            attachments: (message.attachments as Record<string, unknown>[]) || [],
            read: message.read,
            createdAt: message.createdAt,
        };
    }

    /**
     * Notify other participants of new message
     */
    private async notifyParticipants(
        conversationId: string,
        senderId: string,
        messageContent: string
    ): Promise<void> {
        // Get other participants
        const participants = await prisma.conversationParticipant.findMany({
            where: { conversationId, userId: { not: senderId } },
            include: { user: { select: { id: true, firstName: true } } },
        });

        // Get sender name
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { firstName: true, lastName: true },
        });
        const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'Someone';

        const regionCode = env.DEFAULT_REGION || 'NG';
        const pushProvider = communicationProviderFactory.getPushProvider(regionCode);

        for (const participant of participants) {
            // Get user's device tokens
            const devices = await prisma.deviceToken.findMany({
                where: { userId: participant.userId, active: true },
            });

            if (devices.length === 0) continue;

            const tokens = devices.map(d => d.token);
            await pushProvider.sendPush({
                tokens,
                title: `New message from ${senderName}`,
                body: messageContent.substring(0, 100),
                data: {
                    type: 'new_message',
                    conversationId,
                    senderId,
                },
            });
        }
    }

    /**
     * Start new conversation
     * POST /api/v1/messages/conversations
     */
    async createConversation(
        creatorId: string,
        data: CreateConversationDto
    ): Promise<ConversationSummary> {
        // Include creator in participants
        const allParticipantIds = [...new Set([creatorId, ...data.participantIds])];

        // Check if conversation already exists between these users
        if (allParticipantIds.length === 2 && !data.propertyId) {
            const existing = await prisma.conversation.findFirst({
                where: {
                    propertyId: null,
                    participants: {
                        every: {
                            userId: { in: allParticipantIds },
                        },
                    },
                },
                include: {
                    participants: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
            });

            if (existing && existing.participants.length === 2) {
                return {
                    id: existing.id,
                    participants: existing.participants.map(p => p.user),
                    lastMessage: existing.messages[0] || null,
                    propertyId: existing.propertyId,
                    unreadCount: 0,
                    updatedAt: existing.updatedAt,
                };
            }
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                propertyId: data.propertyId,
                participants: {
                    create: allParticipantIds.map(id => ({ userId: id })),
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        // Send initial message if provided
        if (data.initialMessage) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: creatorId,
                    content: data.initialMessage,
                    read: false,
                },
            });
        }

        logger.info(`Conversation created: ${conversation.id} by ${creatorId}`);

        return {
            id: conversation.id,
            participants: conversation.participants.map(p => p.user),
            lastMessage: data.initialMessage ? {
                content: data.initialMessage,
                senderId: creatorId,
                createdAt: new Date(),
            } : null,
            propertyId: conversation.propertyId,
            unreadCount: 0,
            updatedAt: conversation.updatedAt,
        };
    }
}

export const messagingService = new MessagingService();
export { MessagingService };
