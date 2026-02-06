/**
 * Messaging Service
 * API calls for conversations and messages
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
    Conversation,
    Message,
    StartConversationRequest,
    SendMessageRequest,
} from '../../../types/dashboard';

/**
 * Get user's conversations
 */
export async function getConversations(params?: { page?: number; limit?: number }) {
    return api.get<Conversation[]>(API_ENDPOINTS.MESSAGES.CONVERSATIONS, params);
}

/**
 * Start a new conversation
 */
export async function startConversation(data: StartConversationRequest) {
    return api.post<Conversation>(API_ENDPOINTS.MESSAGES.CONVERSATIONS, data);
}

/**
 * Get messages in a conversation
 */
export async function getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    return api.get<Message[]>(API_ENDPOINTS.MESSAGES.CONVERSATION(conversationId), params);
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, data: SendMessageRequest) {
    return api.post<Message>(API_ENDPOINTS.MESSAGES.CONVERSATION(conversationId), data);
}

// Export all functions as named exports and as default object
export const messageService = {
    getConversations,
    startConversation,
    getMessages,
    sendMessage,
};

export default messageService;
