/**
 * Firebase Cloud Messaging (FCM) Push Provider
 * Implements PushProvider interface
 * Per PRD Section 14.1
 */

import axios, { AxiosInstance } from 'axios';
import * as admin from 'firebase-admin';
import { logger } from '../../common/utils/logger';
import {
    PushProvider,
    SendPushParams,
    SendPushResult,
} from './communication.interface';

export class FCMProvider implements PushProvider {
    readonly providerId = 'fcm';

    private messaging: admin.messaging.Messaging | null = null;

    constructor(serviceAccountPath?: string, serviceAccountJson?: object) {
        try {
            // Initialize Firebase Admin if not already done
            if (admin.apps.length === 0) {
                if (serviceAccountJson) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccountJson as admin.ServiceAccount),
                    });
                } else if (serviceAccountPath) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccountPath),
                    });
                } else {
                    // Use application default credentials
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                }
            }

            this.messaging = admin.messaging();
            logger.info('FCM provider initialized');
        } catch (error) {
            logger.warn('FCM provider not initialized - Firebase credentials not configured');
        }
    }

    async sendPush(params: SendPushParams): Promise<SendPushResult> {
        if (!this.messaging) {
            logger.warn('FCM not configured - push notification not sent');
            return {
                success: false,
                successCount: 0,
                failureCount: 1,
                errors: ['FCM not configured'],
            };
        }

        try {
            const tokens = Array.isArray(params.tokens) ? params.tokens : [params.tokens];

            // Build notification
            const message: admin.messaging.MulticastMessage = {
                tokens,
                notification: {
                    title: params.title,
                    body: params.body,
                    imageUrl: params.imageUrl,
                },
                data: params.data,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'default',
                        priority: 'high',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            const response = await this.messaging.sendEachForMulticast(message);

            logger.info(`FCM push sent: ${response.successCount} success, ${response.failureCount} failed`);

            const errors = response.responses
                .filter(r => !r.success)
                .map(r => r.error?.message || 'Unknown error');

            return {
                success: response.successCount > 0,
                successCount: response.successCount,
                failureCount: response.failureCount,
                errors: errors.length > 0 ? errors : undefined,
            };
        } catch (error: any) {
            logger.error('FCM error:', error.message);
            return {
                success: false,
                successCount: 0,
                failureCount: 1,
                errors: [error.message],
            };
        }
    }
}
