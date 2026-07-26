/**
 * Messaging gRPC handlers — thin wrappers around messagingService.
 */

import { handleUnaryCall, sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { messagingService } from '../../modules/messaging/messaging.service';
import { authenticateGrpc } from '../auth';
import { toGrpcError } from '../errors';

interface CreateConversationRequest {
    participant_ids: string[];
    property_id?: string;
    initial_message?: string;
    request_id?: string;
}

interface SendMessageRequest {
    conversation_id: string;
    content: string;
    message_type?: string;
    attachment_urls: string[];
    request_id?: string;
}

interface ConversationPb {
    id: string;
    type: string;
    property_id?: string;
    participants: { id: string; first_name?: string; last_name?: string }[];
    created_at: string;
    updated_at: string;
}

interface MessagePb {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    attachments: string[];
    created_at: string;
}

export const createConversation: handleUnaryCall<CreateConversationRequest, ConversationPb> =
    async (
        call: ServerUnaryCall<CreateConversationRequest, ConversationPb>,
        callback: sendUnaryData<ConversationPb>
    ) => {
        try {
            const ctx = await authenticateGrpc(call.metadata);
            const r = call.request;
            const conv = await messagingService.createConversation(ctx.userId, {
                participantIds: r.participant_ids,
                propertyId: r.property_id,
                initialMessage: r.initial_message,
            } as never);

            const wire: ConversationPb = {
                id: conv.id,
                type: (conv as any).type ?? 'DIRECT',
                property_id: (conv as any).propertyId ?? undefined,
                participants: ((conv as any).participants ?? []).map((p: any) => ({
                    id: p.id ?? p.userId,
                    first_name: p.firstName ?? undefined,
                    last_name: p.lastName ?? undefined,
                })),
                created_at: ((conv as any).createdAt ?? new Date()).toISOString
                    ? ((conv as any).createdAt as Date).toISOString()
                    : String((conv as any).createdAt ?? new Date().toISOString()),
                updated_at: ((conv as any).updatedAt ?? new Date()).toISOString
                    ? ((conv as any).updatedAt as Date).toISOString()
                    : String((conv as any).updatedAt ?? new Date().toISOString()),
            };
            callback(null, wire);
        } catch (err) {
            callback(toGrpcError(err) as never, null);
        }
    };

export const sendMessage: handleUnaryCall<SendMessageRequest, MessagePb> = async (
    call: ServerUnaryCall<SendMessageRequest, MessagePb>,
    callback: sendUnaryData<MessagePb>
) => {
    try {
        const ctx = await authenticateGrpc(call.metadata);
        const r = call.request;
        const m = await messagingService.sendMessage(r.conversation_id, ctx.userId, {
            content: r.content,
            messageType: r.message_type ?? 'TEXT',
            attachments: r.attachment_urls,
        } as never);

        const wire: MessagePb = {
            id: (m as any).id,
            conversation_id: (m as any).conversationId,
            sender_id: (m as any).senderId,
            content: (m as any).content,
            message_type: (m as any).messageType ?? 'TEXT',
            attachments: Array.isArray((m as any).attachments) ? (m as any).attachments : [],
            created_at: ((m as any).createdAt as Date).toISOString
                ? ((m as any).createdAt as Date).toISOString()
                : String((m as any).createdAt),
        };
        callback(null, wire);
    } catch (err) {
        callback(toGrpcError(err) as never, null);
    }
};

export const messagingHandlers = {
    CreateConversation: createConversation,
    SendMessage: sendMessage,
};
