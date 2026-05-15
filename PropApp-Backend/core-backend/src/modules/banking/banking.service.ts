/**
 * Banking Service
 * Manages bank accounts, payouts, and supported banks
 * Per APIRevised.md Section 2
 * Uses PaymentProvider for multi-region abstraction
 */

import { prisma } from '../../config/database';
import { NotFoundError, AppError } from '../../common/utils/errors';
import { paymentProviderFactory } from '../../integrations/payment';
import { encrypt, decrypt, maskSensitiveData } from '../../common/utils/encryption.util';
import { AddBankAccountDto, RequestPayoutDto, PayoutQueryDto } from './banking.dto';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================

interface BankAccountResponse {
    id: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    currency: string;
    isDefault: boolean;
    isVerified: boolean;
    verifiedAt: Date | null;
    createdAt: Date;
}

interface SupportedBank {
    code: string;
    name: string;
    slug: string;
    country?: string;
}

interface ResolvedAccount {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
}

// ============================================
// SERVICE
// ============================================

class BankingService {
    /**
     * Get list of supported banks via payment provider (multi-region)
     */
    async getSupportedBanks(country: string = 'NG', search?: string): Promise<SupportedBank[]> {
        const provider = paymentProviderFactory.getProvider(country);

        // Use payment provider's bank list if available
        let banks: SupportedBank[] = [];
        if (provider.listBanks) {
            const bankList = await provider.listBanks(country);
            banks = bankList.map(b => ({
                code: b.code,
                name: b.name,
                slug: b.slug,
                country: b.country,
            }));
        }

        if (search) {
            const searchLower = search.toLowerCase();
            banks = banks.filter(b =>
                b.name.toLowerCase().includes(searchLower) ||
                b.slug.includes(searchLower)
            );
        }

        return banks.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Resolve bank account (verify account name) via payment provider
     */
    async resolveBankAccount(bankCode: string, accountNumber: string, regionCode: string = 'NG'): Promise<ResolvedAccount> {
        const provider = paymentProviderFactory.getProvider(regionCode);

        if (!provider.resolveBankAccount) {
            throw new AppError('Bank account resolution not supported for this region', 'BANK_006', 400);
        }

        const result = await provider.resolveBankAccount({ bankCode, accountNumber });

        if (!result.success) {
            throw new AppError('Could not verify account. Please check the details.', 'BANK_001', 400);
        }

        return {
            accountNumber: result.accountNumber,
            accountName: result.accountName,
            bankCode: result.bankCode,
            bankName: result.bankName || '',
        };
    }

    /**
     * Get user's bank accounts
     */
    async getBankAccounts(userId: string): Promise<{ items: BankAccountResponse[]; total: number }> {
        const accounts = await prisma.bankAccount.findMany({
            where: { userId, deletedAt: null },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });

        return {
            items: accounts.map(this.formatBankAccount),
            total: accounts.length,
        };
    }

    /**
     * Add a bank account
     */
    async addBankAccount(userId: string, dto: AddBankAccountDto, regionCode: string = 'NG'): Promise<BankAccountResponse> {
        // Validate bank exists via payment provider
        const banks = await this.getSupportedBanks(regionCode);
        const bank = banks.find(b => b.code === dto.bankCode);
        if (!bank) {
            throw new AppError('Invalid bank code', 'BANK_001', 400);
        }

        // Check for duplicate
        const existing = await prisma.bankAccount.findFirst({
            where: {
                userId,
                bankCode: dto.bankCode,
                accountNumber: dto.accountNumber,
                deletedAt: null,
            },
        });

        if (existing) {
            throw new AppError('This bank account is already registered', 'BANK_002', 400);
        }

        // Check max accounts (5)
        const count = await prisma.bankAccount.count({
            where: { userId, deletedAt: null },
        });
        if (count >= 5) {
            throw new AppError('Maximum of 5 bank accounts allowed', 'BANK_003', 400);
        }

        // If setting as default, unset existing
        if (dto.setAsDefault) {
            await prisma.bankAccount.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const shouldBeDefault = dto.setAsDefault || count === 0;
        const maskedNumber = maskSensitiveData(dto.accountNumber, 4);

        // Encrypt account number before storing
        const encryptedAccountNumber = encrypt(dto.accountNumber);

        const account = await prisma.bankAccount.create({
            data: {
                userId,
                bankCode: dto.bankCode,
                bankName: bank.name,
                accountNumber: encryptedAccountNumber, // Encrypted at rest
                accountNumberMasked: maskedNumber,
                accountName: dto.accountName,
                accountType: dto.accountType,
                isDefault: shouldBeDefault,
                isVerified: true, // In production, verify first
                verifiedAt: new Date(),
            },
        });

        return this.formatBankAccount(account);
    }

    /**
     * Set default bank account
     */
    async setDefaultBankAccount(userId: string, accountId: string): Promise<void> {
        const account = await prisma.bankAccount.findFirst({
            where: { id: accountId, userId, deletedAt: null },
        });

        if (!account) {
            throw new NotFoundError('Bank account not found');
        }

        await prisma.bankAccount.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        await prisma.bankAccount.update({
            where: { id: accountId },
            data: { isDefault: true },
        });
    }

    /**
     * Delete bank account
     */
    async deleteBankAccount(userId: string, accountId: string): Promise<void> {
        const account = await prisma.bankAccount.findFirst({
            where: { id: accountId, userId, deletedAt: null },
        });

        if (!account) {
            throw new NotFoundError('Bank account not found');
        }

        // Check for pending payouts
        const pendingPayouts = await prisma.payout.count({
            where: { bankAccountId: accountId, status: 'PROCESSING' },
        });

        if (pendingPayouts > 0) {
            throw new AppError('Cannot delete account with pending payouts', 'BANK_004', 400);
        }

        await prisma.bankAccount.update({
            where: { id: accountId },
            data: { deletedAt: new Date() },
        });

        // Promote another if this was default
        if (account.isDefault) {
            const nextAccount = await prisma.bankAccount.findFirst({
                where: { userId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
            if (nextAccount) {
                await prisma.bankAccount.update({
                    where: { id: nextAccount.id },
                    data: { isDefault: true },
                });
            }
        }
    }

    /**
     * Request a payout
     */
    async requestPayout(userId: string, dto: RequestPayoutDto): Promise<{
        payoutId: string;
        amount: number;
        status: string;
        estimatedArrival: Date;
    }> {
        const account = await prisma.bankAccount.findFirst({
            where: { id: dto.bankAccountId, userId, deletedAt: null },
        });

        if (!account) {
            throw new NotFoundError('Bank account not found');
        }

        if (!account.isVerified) {
            throw new AppError('Bank account must be verified', 'BANK_005', 400);
        }

        // TODO: Check available balance from wallet/earnings

        const payout = await prisma.payout.create({
            data: {
                userId,
                bankAccountId: dto.bankAccountId,
                amount: dto.amount,
                currency: 'NGN',
                status: 'PROCESSING',
                reference: `PAYOUT-${uuidv4().slice(0, 8).toUpperCase()}`,
                description: dto.description,
            },
        });

        const estimatedArrival = new Date();
        estimatedArrival.setDate(estimatedArrival.getDate() + 1); // Next day

        return {
            payoutId: payout.id,
            amount: Number(payout.amount),
            status: payout.status.toLowerCase(),
            estimatedArrival,
        };
    }

    /**
     * Get payout history
     */
    async getPayoutHistory(userId: string, query: PayoutQueryDto): Promise<{
        items: Array<{
            id: string;
            amount: number;
            currency: string;
            status: string;
            bankAccount: { bankName: string; accountNumber: string };
            completedAt: Date | null;
            createdAt: Date;
        }>;
        total: number;
        page: number;
        totalPages: number;
    }> {
        const where: Record<string, unknown> = { userId };

        if (query.status && query.status !== 'all') {
            where.status = query.status.toUpperCase();
        }

        const total = await prisma.payout.count({ where });
        const totalPages = Math.ceil(total / query.limit);

        const payouts = await prisma.payout.findMany({
            where,
            include: { bankAccount: true },
            orderBy: { createdAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });

        return {
            items: payouts.map(p => ({
                id: p.id,
                amount: Number(p.amount),
                currency: p.currency,
                status: p.status.toLowerCase(),
                bankAccount: {
                    bankName: p.bankAccount.bankName,
                    accountNumber: p.bankAccount.accountNumberMasked,
                },
                completedAt: p.completedAt,
                createdAt: p.createdAt,
            })),
            total,
            page: query.page,
            totalPages,
        };
    }

    /**
     * Get payout settings
     */
    async getPayoutSettings(userId: string): Promise<{
        payoutSchedule: string;
        minimumPayoutAmount: number;
        defaultBankAccountId: string | null;
        autoPayoutEnabled: boolean;
        pendingBalance: number;
        availableBalance: number;
        currency: string;
        lastPayoutDate: Date | null;
        lastPayoutAmount: number | null;
        nextScheduledPayout: Date | null;
    }> {
        // Get user profile for payout settings
        const profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        // Extract payout settings from profileData JSON
        const profileData = (profile?.profileData || {}) as Record<string, unknown>;

        // Get last completed payout
        const lastPayout = await prisma.payout.findFirst({
            where: { userId, status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
        });

        // Get default bank account
        const defaultAccount = await prisma.bankAccount.findFirst({
            where: { userId, isDefault: true, deletedAt: null },
        });

        // TODO: Get actual balances from wallet/earnings system
        const pendingBalance = 0;
        const availableBalance = 0;

        // Calculate next scheduled payout based on schedule
        const payoutSchedule = (profileData.payoutSchedule as string) || 'weekly';
        let nextScheduledPayout: Date | null = null;

        if (payoutSchedule !== 'manual') {
            nextScheduledPayout = new Date();
            switch (payoutSchedule) {
                case 'daily':
                    nextScheduledPayout.setDate(nextScheduledPayout.getDate() + 1);
                    break;
                case 'weekly':
                    nextScheduledPayout.setDate(nextScheduledPayout.getDate() + 7);
                    break;
                case 'biweekly':
                    nextScheduledPayout.setDate(nextScheduledPayout.getDate() + 14);
                    break;
                case 'monthly':
                    nextScheduledPayout.setMonth(nextScheduledPayout.getMonth() + 1);
                    break;
            }
        }

        return {
            payoutSchedule,
            minimumPayoutAmount: (profileData.minimumPayoutAmount as number) || 5000,
            defaultBankAccountId: defaultAccount?.id || null,
            autoPayoutEnabled: (profileData.autoPayoutEnabled as boolean) ?? true,
            pendingBalance,
            availableBalance,
            currency: 'NGN',
            lastPayoutDate: lastPayout?.completedAt || null,
            lastPayoutAmount: lastPayout ? Number(lastPayout.amount) : null,
            nextScheduledPayout,
        };
    }

    /**
     * Update payout settings
     */
    async updatePayoutSettings(userId: string, dto: {
        payoutSchedule?: string;
        minimumPayoutAmount?: number;
        defaultBankAccountId?: string;
        autoPayoutEnabled?: boolean;
    }): Promise<void> {
        // Validate default bank account if provided
        if (dto.defaultBankAccountId) {
            const account = await prisma.bankAccount.findFirst({
                where: { id: dto.defaultBankAccountId, userId, deletedAt: null },
            });
            if (!account) {
                throw new NotFoundError('Bank account not found');
            }
            // Set as default
            await prisma.bankAccount.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            await prisma.bankAccount.update({
                where: { id: dto.defaultBankAccountId },
                data: { isDefault: true },
            });
        }

        // Update profile with payout settings in profileData JSON
        const existingProfile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        const existingData = (existingProfile?.profileData || {}) as Record<string, unknown>;
        const newProfileData = {
            ...existingData,
            ...(dto.payoutSchedule && { payoutSchedule: dto.payoutSchedule }),
            ...(dto.minimumPayoutAmount && { minimumPayoutAmount: dto.minimumPayoutAmount }),
            ...(dto.autoPayoutEnabled !== undefined && { autoPayoutEnabled: dto.autoPayoutEnabled }),
        };

        await prisma.userProfile.upsert({
            where: { userId },
            create: {
                userId,
                profileData: {
                    payoutSchedule: dto.payoutSchedule || 'weekly',
                    minimumPayoutAmount: dto.minimumPayoutAmount || 5000,
                    autoPayoutEnabled: dto.autoPayoutEnabled ?? true,
                },
            },
            update: {
                profileData: newProfileData,
            },
        });
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private formatBankAccount(account: {
        id: string;
        bankName: string;
        bankCode: string;
        accountNumberMasked: string;
        accountName: string;
        accountType: string;
        currency: string;
        isDefault: boolean;
        isVerified: boolean;
        verifiedAt: Date | null;
        createdAt: Date;
    }): BankAccountResponse {
        return {
            id: account.id,
            bankName: account.bankName,
            bankCode: account.bankCode,
            accountNumber: account.accountNumberMasked, // Always return masked
            accountName: account.accountName,
            accountType: account.accountType,
            currency: account.currency,
            isDefault: account.isDefault,
            isVerified: account.isVerified,
            verifiedAt: account.verifiedAt,
            createdAt: account.createdAt,
        };
    }

    /**
     * Get decrypted account number for payout processing
     * INTERNAL USE ONLY - Never expose decrypted data via API
     */
    async getDecryptedAccountNumber(accountId: string): Promise<string> {
        const account = await prisma.bankAccount.findUnique({
            where: { id: accountId },
            select: { accountNumber: true },
        });

        if (!account) {
            throw new NotFoundError('Bank account not found');
        }

        return decrypt(account.accountNumber);
    }
}

export const bankingService = new BankingService();

