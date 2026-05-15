/**
 * Payment Methods Service
 * Manages user payment methods (credit/debit cards)
 * Per APIRevised.md Section 1.1
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import { encrypt } from '../../common/utils/encryption.util';
import { AddPaymentMethodDto } from './payment-methods.dto';

// ============================================
// TYPES
// ============================================

interface PaymentMethodResponse {
    id: string;
    type: string;
    brand: string | null;
    last4: string;
    expiryMonth: number | null;
    expiryYear: number | null;
    holderName: string | null;
    isDefault: boolean;
    createdAt: Date;
}

interface TokenizedCardData {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
}

// ============================================
// SERVICE
// ============================================

class PaymentMethodsService {
    /**
     * List all payment methods for a user
     */
    async getPaymentMethods(userId: string): Promise<{ items: PaymentMethodResponse[]; total: number }> {
        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return {
            items: paymentMethods.map(this.formatPaymentMethod),
            total: paymentMethods.length,
        };
    }

    /**
     * Add a new payment method
     */
    async addPaymentMethod(
        userId: string,
        dto: AddPaymentMethodDto
    ): Promise<PaymentMethodResponse> {
        // In production, this would call the payment provider's API
        // to exchange the token for card details
        const cardData = await this.resolvePaymentToken(dto.paymentToken);

        // Check for duplicate card
        const existingCard = await prisma.paymentMethod.findFirst({
            where: {
                userId,
                last4: cardData.last4,
                brand: cardData.brand,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                deletedAt: null,
            },
        });

        if (existingCard) {
            throw new AppError('This card is already registered', 'DUPLICATE_CARD', 400);
        }

        // If setting as default, unset existing default
        if (dto.setAsDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Check if this is the first card (auto-set as default)
        const existingCount = await prisma.paymentMethod.count({
            where: { userId, deletedAt: null },
        });
        const shouldBeDefault = dto.setAsDefault || existingCount === 0;

        // Encrypt provider token before storing
        const encryptedToken = encrypt(dto.paymentToken);

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                userId,
                type: 'card',
                brand: cardData.brand,
                last4: cardData.last4,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                holderName: cardData.holderName,
                isDefault: shouldBeDefault,
                providerToken: encryptedToken, // Encrypted at rest
            },
        });

        return this.formatPaymentMethod(paymentMethod);
    }

    /**
     * Set a payment method as default
     */
    async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
        // Verify ownership
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { id: paymentMethodId, userId, deletedAt: null },
        });

        if (!paymentMethod) {
            throw new NotFoundError('Payment method not found');
        }

        // Unset all other defaults
        await prisma.paymentMethod.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        // Set new default
        await prisma.paymentMethod.update({
            where: { id: paymentMethodId },
            data: { isDefault: true },
        });
    }

    /**
     * Delete a payment method
     */
    async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
        // Verify ownership
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: { id: paymentMethodId, userId, deletedAt: null },
        });

        if (!paymentMethod) {
            throw new NotFoundError('Payment method not found');
        }

        // Check if it's the only payment method with active auto-pay
        if (paymentMethod.isDefault) {
            // For now, we'll allow deletion but warn in production
            // this should check for active leases with auto-pay
            const otherMethods = await prisma.paymentMethod.count({
                where: {
                    userId,
                    id: { not: paymentMethodId },
                    deletedAt: null,
                },
            });

            // Soft delete
            await prisma.paymentMethod.update({
                where: { id: paymentMethodId },
                data: { deletedAt: new Date() },
            });

            // Promote another card to default if available
            if (otherMethods > 0) {
                const nextCard = await prisma.paymentMethod.findFirst({
                    where: { userId, deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                });
                if (nextCard) {
                    await prisma.paymentMethod.update({
                        where: { id: nextCard.id },
                        data: { isDefault: true },
                    });
                }
            }
        } else {
            await prisma.paymentMethod.update({
                where: { id: paymentMethodId },
                data: { deletedAt: new Date() },
            });
        }
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    /**
     * Resolve payment token to card details
     * In production, this calls Paystack/Stripe API
     */
    private async resolvePaymentToken(token: string): Promise<TokenizedCardData> {
        // Mock implementation for development
        // In production, call payment provider API
        if (token.startsWith('tok_test_')) {
            return {
                brand: 'visa',
                last4: token.slice(-4),
                expiryMonth: 12,
                expiryYear: new Date().getFullYear() + 2,
                holderName: 'Test Card Holder',
            };
        }

        // For real tokens, this would be an API call
        return {
            brand: 'visa',
            last4: Math.floor(1000 + Math.random() * 9000).toString(),
            expiryMonth: Math.floor(1 + Math.random() * 12),
            expiryYear: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
            holderName: 'Card Holder',
        };
    }

    private formatPaymentMethod(method: {
        id: string;
        type: string;
        brand: string | null;
        last4: string;
        expiryMonth: number | null;
        expiryYear: number | null;
        holderName: string | null;
        isDefault: boolean;
        createdAt: Date;
    }): PaymentMethodResponse {
        return {
            id: method.id,
            type: method.type,
            brand: method.brand,
            last4: method.last4,
            expiryMonth: method.expiryMonth,
            expiryYear: method.expiryYear,
            holderName: method.holderName,
            isDefault: method.isDefault,
            createdAt: method.createdAt,
        };
    }
}

export const paymentMethodsService = new PaymentMethodsService();
