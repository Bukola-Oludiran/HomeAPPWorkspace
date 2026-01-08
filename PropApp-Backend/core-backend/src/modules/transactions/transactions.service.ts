/**
 * Transaction Service
 * Handles payments, escrow, and transaction history
 * Per Backend Requirements.md + PRD Section 9 (Payments)
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { ValidationError } from '../../common/utils/errors';
import {
    TransactionQueryDto,
    InitiatePaymentDto,
    VerifyPaymentDto,
    CreateEscrowDto,
    ReleaseEscrowDto,
    RefundDto,
} from './transactions.dto';

// ============================================
// TYPES
// ============================================

interface TransactionDetail {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string | null;
    paymentReference: string | null;
    payerId: string | null;
    payeeId: string | null;
    propertyId: string | null;
    property: { id: string; name: string } | null;
    payer: { id: string; firstName: string | null; lastName: string | null } | null;
    payee: { id: string; firstName: string | null; lastName: string | null } | null;
    escrowId: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

interface PaymentInitResult {
    transactionId: string;
    paymentUrl: string;
    reference: string;
    provider: string;
}

// ============================================
// TRANSACTION SERVICE CLASS
// ============================================

class TransactionService {
    // ----------------------------------------
    // GET TRANSACTIONS
    // ----------------------------------------

    /**
     * Get transaction history
     * GET /api/v1/transactions
     */
    async getTransactions(userId: string, query: TransactionQueryDto): Promise<{
        transactions: TransactionDetail[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = {
            OR: [{ payerId: userId }, { payeeId: userId }],
        };

        if (query.type && query.type !== 'all') {
            where.type = query.type.toUpperCase();
        }

        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        if (query.propertyId) {
            where.propertyId = query.propertyId;
        }

        if (query.startDate || query.endDate) {
            const createdAt: Record<string, Date> = {};
            if (query.startDate) createdAt.gte = new Date(query.startDate);
            if (query.endDate) createdAt.lte = new Date(query.endDate);
            where.createdAt = createdAt;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: where as any,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                include: {
                    property: { select: { id: true, name: true } },
                    payer: { select: { id: true, firstName: true, lastName: true } },
                    payee: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            prisma.transaction.count({ where: where as any }),
        ]);

        return {
            transactions: transactions.map((t: any) => this.formatTransaction(t)),
            total,
            page: query.page,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    /**
     * Get transaction by ID
     * GET /api/v1/transactions/:id
     */
    async getTransactionById(transactionId: string, userId: string): Promise<TransactionDetail> {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                property: { select: { id: true, name: true } },
                payer: { select: { id: true, firstName: true, lastName: true } },
                payee: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        if (!transaction) {
            throw new ValidationError('Transaction not found', [
                { field: 'id', message: 'Transaction not found' },
            ]);
        }

        // Verify access
        if (transaction.payerId !== userId && transaction.payeeId !== userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                throw new ValidationError('Access denied', [
                    { field: 'id', message: 'You do not have access to this transaction' },
                ]);
            }
        }

        return this.formatTransaction(transaction);
    }

    // ----------------------------------------
    // INITIATE PAYMENT
    // ----------------------------------------

    /**
     * Initiate payment
     * POST /api/v1/transactions/pay
     */
    async initiatePayment(userId: string, data: InitiatePaymentDto): Promise<PaymentInitResult> {
        // Determine payee based on transaction type
        let payeeId: string = userId; // Default to self

        if (data.leaseId) {
            const lease = await prisma.lease.findUnique({
                where: { id: data.leaseId },
                select: { landlordId: true, tenantId: true },
            });

            if (!lease || lease.tenantId !== userId) {
                throw new ValidationError('Invalid lease', [
                    { field: 'leaseId', message: 'Lease not found or not your lease' },
                ]);
            }

            payeeId = lease.landlordId;
        } else if (data.propertyId) {
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
                select: { ownerId: true },
            });

            if (property) {
                payeeId = property.ownerId;
            }
        }

        // Map transaction type to valid enum value
        const transactionType = this.mapTransactionType(data.type);

        // Create transaction record
        const transaction = await prisma.transaction.create({
            data: {
                type: transactionType,
                payerId: userId,
                payeeId,
                propertyId: data.propertyId,
                amount: data.amount,
                currency: data.currency,
                status: 'PENDING',
                paymentMethod: data.paymentMethod.toUpperCase(),
                paymentReference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
            },
        });

        // TODO: Integrate with Paystack/Flutterwave
        const paymentUrl = `https://checkout.paystack.com/mock/${transaction.paymentReference}`;

        logger.info(`Payment initiated: ${transaction.id} for ${data.amount} ${data.currency}`);

        return {
            transactionId: transaction.id,
            paymentUrl,
            reference: transaction.paymentReference!,
            provider: 'paystack',
        };
    }

    /**
     * Verify payment (webhook callback)
     * POST /api/v1/transactions/verify
     */
    async verifyPayment(data: VerifyPaymentDto): Promise<{ success: boolean; transaction: TransactionDetail }> {
        const transaction = await prisma.transaction.findFirst({
            where: { paymentReference: data.reference },
            include: {
                property: { select: { id: true, name: true } },
                payer: { select: { id: true, firstName: true, lastName: true } },
                payee: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        if (!transaction) {
            throw new ValidationError('Transaction not found', [
                { field: 'reference', message: 'Invalid payment reference' },
            ]);
        }

        // TODO: Verify with Paystack/Flutterwave API
        const updated = await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: 'COMPLETED',
                updatedAt: new Date(),
            },
            include: {
                property: { select: { id: true, name: true } },
                payer: { select: { id: true, firstName: true, lastName: true } },
                payee: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        logger.info(`Payment verified: ${transaction.id}`);

        return {
            success: true,
            transaction: this.formatTransaction(updated),
        };
    }

    // ----------------------------------------
    // ESCROW
    // ----------------------------------------

    /**
     * Create escrow
     * POST /api/v1/transactions/escrow
     */
    async createEscrow(landlordId: string, data: CreateEscrowDto): Promise<{
        escrowId: string;
        transactionId: string;
        message: string;
    }> {
        // Verify property ownership
        const property = await prisma.property.findFirst({
            where: { id: data.propertyId, ownerId: landlordId },
        });

        if (!property) {
            throw new ValidationError('Property not found', [
                { field: 'propertyId', message: 'Property not found or not owned by you' },
            ]);
        }

        // Create escrow transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: 'SECURITY_DEPOSIT',
                payerId: data.tenantId,
                payeeId: landlordId,
                propertyId: data.propertyId,
                amount: data.amount,
                currency: 'NGN',
                status: 'PENDING',
                escrowId: `ESC_${Date.now()}`,
                metadata: JSON.parse(JSON.stringify({
                    releaseConditions: data.releaseConditions,
                    notes: data.notes,
                    tenantConfirmed: false,
                    landlordConfirmed: false,
                })),
            },
        });

        logger.info(`Escrow created: ${transaction.escrowId} for ${data.amount}`);

        return {
            escrowId: transaction.escrowId!,
            transactionId: transaction.id,
            message: 'Escrow created. Waiting for tenant to fund it.',
        };
    }

    /**
     * Release escrow
     * POST /api/v1/transactions/escrow/:id/release
     */
    async releaseEscrow(
        escrowId: string,
        userId: string,
        role: 'TENANT' | 'LANDLORD',
        data: ReleaseEscrowDto
    ): Promise<{ message: string; released: boolean }> {
        const transaction = await prisma.transaction.findFirst({
            where: { escrowId },
        });

        if (!transaction) {
            throw new ValidationError('Escrow not found', [
                { field: 'id', message: 'Escrow not found' },
            ]);
        }

        // Verify access
        const isParty =
            (role === 'TENANT' && transaction.payerId === userId) ||
            (role === 'LANDLORD' && transaction.payeeId === userId);

        if (!isParty) {
            throw new ValidationError('Access denied', [
                { field: 'id', message: 'You are not a party to this escrow' },
            ]);
        }

        const metadata = transaction.metadata as Record<string, unknown>;

        if (role === 'TENANT') {
            metadata.tenantConfirmed = data.confirm;
        } else {
            metadata.landlordConfirmed = data.confirm;
        }

        if (data.notes) {
            metadata.releaseNotes = data.notes;
        }

        // Check if both parties confirmed
        const bothConfirmed = Boolean(metadata.tenantConfirmed && metadata.landlordConfirmed);

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: bothConfirmed ? 'COMPLETED' : transaction.status,
                metadata: JSON.parse(JSON.stringify(metadata)),
                updatedAt: new Date(),
            },
        });

        if (bothConfirmed) {
            logger.info(`Escrow released: ${escrowId}`);
        }

        return {
            message: bothConfirmed
                ? 'Escrow released. Funds transferred to landlord.'
                : `${role === 'TENANT' ? 'Tenant' : 'Landlord'} confirmation recorded. Waiting for other party.`,
            released: bothConfirmed,
        };
    }

    // ----------------------------------------
    // REFUND
    // ----------------------------------------

    /**
     * Request refund
     * POST /api/v1/transactions/:id/refund
     */
    async requestRefund(
        transactionId: string,
        userId: string,
        data: RefundDto
    ): Promise<{ message: string; refundTransactionId: string }> {
        const transaction = await prisma.transaction.findFirst({
            where: { id: transactionId, payerId: userId, status: 'COMPLETED' },
        });

        if (!transaction) {
            throw new ValidationError('Transaction not found', [
                { field: 'id', message: 'Transaction not found or not eligible for refund' },
            ]);
        }

        const refundAmount = data.amount || Number(transaction.amount);

        if (refundAmount > Number(transaction.amount)) {
            throw new ValidationError('Invalid refund amount', [
                { field: 'amount', message: 'Refund amount exceeds original transaction' },
            ]);
        }

        // Create refund transaction
        const refund = await prisma.transaction.create({
            data: {
                type: 'REFUND',
                payerId: transaction.payeeId,
                payeeId: transaction.payerId,
                propertyId: transaction.propertyId,
                amount: refundAmount,
                currency: transaction.currency,
                status: 'PENDING',
                metadata: JSON.parse(JSON.stringify({
                    originalTransactionId: transaction.id,
                    reason: data.reason,
                })),
            },
        });

        logger.info(`Refund requested: ${refund.id} for transaction ${transactionId}`);

        return {
            message: 'Refund request submitted. Processing within 3-5 business days.',
            refundTransactionId: refund.id,
        };
    }

    // ----------------------------------------
    // HELPER
    // ----------------------------------------

    private formatTransaction(t: any): TransactionDetail {
        return {
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            currency: t.currency,
            status: t.status,
            paymentMethod: t.paymentMethod,
            paymentReference: t.paymentReference,
            payerId: t.payerId,
            payeeId: t.payeeId,
            propertyId: t.propertyId,
            property: t.property,
            payer: t.payer,
            payee: t.payee,
            escrowId: t.escrowId,
            metadata: (t.metadata as Record<string, unknown>) || {},
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        };
    }

    private mapTransactionType(type: string): 'RENT_PAYMENT' | 'SECURITY_DEPOSIT' | 'SERVICE_FEE' | 'AGENT_COMMISSION' | 'PURCHASE_PAYMENT' | 'REFUND' {
        const typeMap: Record<string, 'RENT_PAYMENT' | 'SECURITY_DEPOSIT' | 'SERVICE_FEE' | 'AGENT_COMMISSION' | 'PURCHASE_PAYMENT' | 'REFUND'> = {
            'RENT': 'RENT_PAYMENT',
            'RENT_PAYMENT': 'RENT_PAYMENT',
            'DEPOSIT': 'SECURITY_DEPOSIT',
            'SECURITY_DEPOSIT': 'SECURITY_DEPOSIT',
            'MAINTENANCE': 'SERVICE_FEE',
            'SERVICE_FEE': 'SERVICE_FEE',
            'ESCROW': 'SECURITY_DEPOSIT',
            'AGENT_COMMISSION': 'AGENT_COMMISSION',
            'PURCHASE_PAYMENT': 'PURCHASE_PAYMENT',
            'REFUND': 'REFUND',
        };
        return typeMap[type.toUpperCase()] || 'SERVICE_FEE';
    }
}

export const transactionService = new TransactionService();
export { TransactionService };
