/**
 * Communication Provider Interface
 * Abstraction for SMS, Email, and Push notifications
 */

// ============================================
// EMAIL TYPES
// ============================================

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
    templateId?: string;
    templateData?: Record<string, unknown>;
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// ============================================
// SMS TYPES
// ============================================

export interface SendSMSParams {
    to: string | string[];
    message: string;
    from?: string;
}

export interface SendSMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// ============================================
// PUSH NOTIFICATION TYPES
// ============================================

export interface SendPushParams {
    tokens: string | string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}

export interface SendPushResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    errors?: string[];
}

// ============================================
// PROVIDER INTERFACES
// ============================================

export interface EmailProvider {
    readonly providerId: string;
    sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
}

export interface SMSProvider {
    readonly providerId: string;
    sendSMS(params: SendSMSParams): Promise<SendSMSResult>;
}

export interface PushProvider {
    readonly providerId: string;
    sendPush(params: SendPushParams): Promise<SendPushResult>;
}
