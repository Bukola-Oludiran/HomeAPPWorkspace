/**
 * WebSocket Service
 * Real-time messaging and notifications using Socket.IO
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../common/utils/logger';
import { prisma } from '../config/database';

// Types
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}

interface MessagePayload {
    conversationId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE';
    attachments?: unknown;
}

interface TypingPayload {
    conversationId: string;
    isTyping: boolean;
}

// ============================================
// WEBSOCKET SERVICE CLASS
// ============================================

class WebSocketService {
    private io: Server | null = null;
    private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socket IDs

    /**
     * Initialize WebSocket server
     */
    initialize(httpServer: HttpServer): void {
        this.io = new Server(httpServer, {
            cors: {
                origin: env.FRONTEND_URL,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        // Authentication middleware
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return next(new Error('Authentication required'));
                }

                const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });

        // Connection handler
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            this.handleConnection(socket);
        });

        logger.info('WebSocket server initialized');
    }

    /**
     * Handle new socket connection
     */
    private handleConnection(socket: AuthenticatedSocket): void {
        const userId = socket.userId!;

        // Track user's sockets
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);

        logger.info(`User ${userId} connected via WebSocket: ${socket.id}`);

        // Join user's personal room
        socket.join(`user:${userId}`);

        // Load and join user's conversations
        this.joinUserConversations(socket, userId);

        // Event handlers
        socket.on('message:send', (data: MessagePayload) => this.handleSendMessage(socket, data));
        socket.on('message:typing', (data: TypingPayload) => this.handleTyping(socket, data));
        socket.on('conversation:join', (conversationId: string) => this.handleJoinConversation(socket, conversationId));
        socket.on('conversation:leave', (conversationId: string) => socket.leave(`conversation:${conversationId}`));

        // Disconnect handler
        socket.on('disconnect', () => {
            this.userSockets.get(userId)?.delete(socket.id);
            if (this.userSockets.get(userId)?.size === 0) {
                this.userSockets.delete(userId);
            }
            logger.info(`User ${userId} disconnected: ${socket.id}`);
        });
    }

    /**
     * Join all user's conversations
     */
    private async joinUserConversations(socket: AuthenticatedSocket, userId: string): Promise<void> {
        try {
            const participations = await prisma.conversationParticipant.findMany({
                where: { userId },
                select: { conversationId: true },
            });

            for (const p of participations) {
                socket.join(`conversation:${p.conversationId}`);
            }

            logger.debug(`User ${userId} joined ${participations.length} conversation rooms`);
        } catch (error) {
            logger.error('Error joining conversations:', error);
        }
    }

    /**
     * Handle send message event
     */
    private async handleSendMessage(socket: AuthenticatedSocket, data: MessagePayload): Promise<void> {
        const userId = socket.userId!;

        try {
            // Verify user is participant
            const participant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: {
                        conversationId: data.conversationId,
                        userId,
                    },
                },
            });

            if (!participant) {
                socket.emit('error', { message: 'Not a participant of this conversation' });
                return;
            }

            // Create message in database
            const message = await prisma.message.create({
                data: {
                    conversationId: data.conversationId,
                    senderId: userId,
                    content: data.content,
                    messageType: data.messageType || 'TEXT',
                    attachments: data.attachments as any,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });

            // Update conversation timestamp
            await prisma.conversation.update({
                where: { id: data.conversationId },
                data: { updatedAt: new Date() },
            });

            // Broadcast to conversation room
            this.io?.to(`conversation:${data.conversationId}`).emit('message:new', {
                id: message.id,
                conversationId: message.conversationId,
                content: message.content,
                messageType: message.messageType,
                attachments: message.attachments,
                sender: message.sender,
                createdAt: message.createdAt,
            });

            logger.debug(`Message sent in conversation ${data.conversationId} by user ${userId}`);
        } catch (error) {
            logger.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    /**
     * Handle typing indicator
     */
    private handleTyping(socket: AuthenticatedSocket, data: TypingPayload): void {
        socket.to(`conversation:${data.conversationId}`).emit('message:typing', {
            conversationId: data.conversationId,
            userId: socket.userId,
            isTyping: data.isTyping,
        });
    }

    /**
     * Handle join conversation request
     */
    private async handleJoinConversation(socket: AuthenticatedSocket, conversationId: string): Promise<void> {
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: socket.userId!,
                },
            },
        });

        if (participant) {
            socket.join(`conversation:${conversationId}`);
            socket.emit('conversation:joined', { conversationId });
        } else {
            socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
    }

    // ============================================
    // PUBLIC METHODS FOR EXTERNAL USE
    // ============================================

    /**
     * Send notification to a specific user
     */
    sendToUser(userId: string, event: string, data: unknown): void {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }

    /**
     * Send notification to multiple users
     */
    sendToUsers(userIds: string[], event: string, data: unknown): void {
        if (this.io) {
            for (const userId of userIds) {
                this.io.to(`user:${userId}`).emit(event, data);
            }
        }
    }

    /**
     * Send message to a conversation
     */
    sendToConversation(conversationId: string, event: string, data: unknown): void {
        if (this.io) {
            this.io.to(`conversation:${conversationId}`).emit(event, data);
        }
    }

    /**
     * Broadcast to all connected users
     */
    broadcast(event: string, data: unknown): void {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
    }

    /**
     * Get online users count
     */
    getOnlineUsersCount(): number {
        return this.userSockets.size;
    }

    /**
     * Get Socket.IO server instance
     */
    getIO(): Server | null {
        return this.io;
    }
}

// Export singleton
export const webSocketService = new WebSocketService();
