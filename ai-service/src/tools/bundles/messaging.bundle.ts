/**
 * messaging bundle — reads (conversations, recent messages) +
 * writes (createConversation, sendMessage) via gRPC.
 *
 * IDOR posture: tools query the database scoped to conversations the
 * authenticated user participates in (via ConversationParticipant); the
 * backend's gRPC handler additionally enforces participation before
 * accepting a sendMessage. Both layers must agree — neither alone is
 * sufficient.
 */

import { z } from 'zod';
import type { MessageThreadPreviewProps } from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import { grpc } from '../../grpc/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

// ============================================
// listConversations
// ============================================

const listConversationsParams = z.object({
    limit: z.number().int().min(1).max(50).default(20),
});

const listConversations = defineLocalTool({
    name: 'messaging.listConversations',
    label: 'My conversations',
    description:
        'List conversations the authenticated user participates in. Returns one MessageThreadPreview fragment per conversation.',
    parameters: listConversationsParams,
    async execute(params, ctx, sink) {
        const userId = ctx.user.userId;
        const rows = await prismaReadonly.conversationParticipant.findMany({
            where: { userId },
            take: params.limit,
            include: {
                conversation: {
                    include: {
                        participants: {
                            where: { NOT: { userId } },
                            include: {
                                user: {
                                    select: { id: true, firstName: true, lastName: true },
                                },
                            },
                            take: 1,
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: { conversation: { updatedAt: 'desc' } },
        });

        let emitted = 0;
        for (const row of rows) {
            const conv = row.conversation;
            const lastMsg = conv.messages[0];
            const otherUser = conv.participants[0]?.user;
            const counterpartyName = otherUser
                ? [otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') ||
                  'Unknown'
                : 'Unknown';
            const card: MessageThreadPreviewProps = {
                conversationId: conv.id,
                counterpartyName,
                lastMessage: lastMsg?.content?.slice(0, 200) ?? '(no messages)',
                lastMessageAt: (lastMsg?.createdAt ?? conv.updatedAt).toISOString(),
                unreadCount: 0,
                actions: [{ id: 'open', label: 'Open thread', kind: 'primary' as const }],
            };
            sink.ui({ type: 'MessageThreadPreview', props: card });
            emitted += 1;
        }
        return {
            text: `You have ${emitted} conversation(s).`,
            details: { count: emitted, userId },
        };
    },
});

// ============================================
// recentMessages
// ============================================

const recentMessagesParams = z.object({
    conversationId: z.string().uuid(),
    limit: z.number().int().min(1).max(50).default(20),
});

const recentMessages = defineLocalTool({
    name: 'messaging.recentMessages',
    label: 'Recent messages',
    description:
        'Fetch recent messages from a conversation. Only works for conversations the authenticated user participates in.',
    parameters: recentMessagesParams,
    async execute(params, ctx) {
        const userId = ctx.user.userId;
        // Verify participation BEFORE returning any message content.
        const part = await prismaReadonly.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: params.conversationId,
                    userId,
                },
            },
        });
        if (!part) {
            return {
                text: 'Conversation not accessible.',
                ui: {
                    type: 'ErrorCard',
                    props: {
                        title: 'Not a participant',
                        message: 'You are not a participant in that conversation.',
                        code: 'AUTH_003',
                    },
                },
            };
        }
        const messages = await prismaReadonly.message.findMany({
            where: { conversationId: params.conversationId },
            take: params.limit,
            orderBy: { createdAt: 'desc' },
        });
        const summary = messages
            .slice(0, 5)
            .map(
                (m) =>
                    `${m.senderId === userId ? 'me' : 'them'}: ${m.content.slice(0, 80)}`
            )
            .join(' | ');
        return {
            text: `${messages.length} message(s). Recent: ${summary || '(none)'}.`,
            details: { count: messages.length, conversationId: params.conversationId },
        };
    },
});

// ============================================
// sendMessage (write — gRPC + confirm-light)
// ============================================

const sendParams = z.object({
    conversationId: z.string().uuid(),
    content: z.string().min(1).max(4000),
    messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
});

const sendMessage = defineLocalTool({
    name: 'messaging.sendMessage',
    label: 'Send message',
    description:
        'Send a message in an existing conversation. The authenticated user must be a participant. Confirmation only when the message is unusually long or contains sensitive markers.',
    parameters: sendParams,
    confirm: {
        humanSummary: (p) =>
            `Send to conversation ${p.conversationId}: "${p.content.slice(0, 120)}${p.content.length > 120 ? '…' : ''}"`,
        riskLevel: 'low',
    },
    async execute(params, ctx, sink) {
        const m = await grpc.messaging.sendMessage(ctx.jwt, {
            conversation_id: params.conversationId,
            content: params.content,
            message_type: params.messageType,
        });
        sink.ui({
            type: 'MessageThreadPreview',
            props: {
                conversationId: m.conversation_id,
                counterpartyName: 'You',
                lastMessage: m.content,
                lastMessageAt: m.created_at,
                unreadCount: 0,
                actions: [{ id: 'open', label: 'Open thread', kind: 'primary' as const }],
            },
        });
        return {
            text: `Message sent to conversation ${m.conversation_id}.`,
            details: { messageId: m.id, sentBy: ctx.user.userId },
        };
    },
});

// ============================================
// createConversation (write — gRPC)
// ============================================

const createConversationParams = z.object({
    participantIds: z.array(z.string().uuid()).min(1).max(10),
    propertyId: z.string().uuid().optional(),
    initialMessage: z.string().min(1).max(4000).optional(),
});

const createConversation = defineLocalTool({
    name: 'messaging.createConversation',
    label: 'Start conversation',
    description:
        'Start a new conversation with one or more other users, optionally about a specific property. May reuse an existing direct conversation between the same two users.',
    parameters: createConversationParams,
    confirm: {
        humanSummary: (p) =>
            `Start a conversation with ${p.participantIds.length} other user(s)${p.propertyId ? ` about a property` : ''}${p.initialMessage ? `: "${p.initialMessage.slice(0, 80)}…"` : ''}`,
        riskLevel: 'low',
    },
    async execute(params, ctx, sink) {
        const conv = await grpc.messaging.createConversation(ctx.jwt, {
            participant_ids: params.participantIds,
            property_id: params.propertyId,
            initial_message: params.initialMessage,
        });
        sink.ui({
            type: 'MessageThreadPreview',
            props: {
                conversationId: conv.id,
                counterpartyName: 'New conversation',
                lastMessage: params.initialMessage ?? '(no messages yet)',
                lastMessageAt: conv.created_at,
                unreadCount: 0,
                actions: [{ id: 'open', label: 'Open thread', kind: 'primary' as const }],
            },
        });
        return {
            text: `Conversation ${conv.id} started.`,
            details: { conversationId: conv.id, createdBy: ctx.user.userId },
        };
    },
});

export const messagingBundle: ToolBundle = {
    name: 'messaging',
    description: 'Read and write to conversations you are a participant of.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [listConversations, recentMessages],
    writeTools: [createConversation, sendMessage],
};
