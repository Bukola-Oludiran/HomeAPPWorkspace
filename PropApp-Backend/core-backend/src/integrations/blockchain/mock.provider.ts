/**
 * Mock Blockchain Provider
 * Development implementation that simulates blockchain operations
 */

import { logger } from '../../common/utils/logger';
import {
    BlockchainProvider,
    MintLeaseNFTParams,
    MintLeaseNFTResult,
    RecordVerificationParams,
    RecordVerificationResult,
    CreateEscrowParams,
    CreateEscrowResult,
    ReleaseEscrowParams,
    ReleaseEscrowResult,
    RefundEscrowParams,
    RefundEscrowResult,
    TransactionStatus,
} from './blockchain.interface';

// In-memory storage for mock data
const mockLeases = new Map<number, MintLeaseNFTParams>();
const mockVerifications = new Map<string, RecordVerificationParams>();
const mockEscrows = new Map<string, {
    params: CreateEscrowParams;
    status: 'active' | 'released' | 'refunded' | 'disputed';
    balance: number;
    createdAt: Date;
}>();

let tokenCounter = 1000;
let verificationCounter = 1;

export class MockBlockchainProvider implements BlockchainProvider {
    readonly providerId = 'mock';
    readonly network = 'mock-network';
    readonly chainId = 0;

    constructor() {
        logger.info('Mock blockchain provider initialized (development mode)');
    }

    // ----------------------------------------
    // NFT LEASE OPERATIONS
    // ----------------------------------------

    async mintLeaseNFT(params: MintLeaseNFTParams): Promise<MintLeaseNFTResult> {
        await this.simulateDelay();

        const tokenId = ++tokenCounter;
        const txHash = this.generateMockTxHash();

        mockLeases.set(tokenId, params);

        logger.info(`[MOCK] Minted lease NFT: tokenId=${tokenId}, lease=${params.leaseId}`);

        return {
            success: true,
            tokenId,
            txHash,
            contractAddress: '0xMOCK_LEASE_NFT_CONTRACT',
        };
    }

    async getLeaseNFT(tokenId: number): Promise<MintLeaseNFTParams | null> {
        return mockLeases.get(tokenId) || null;
    }

    async burnLeaseNFT(tokenId: number, reason: string): Promise<{ success: boolean; txHash?: string }> {
        await this.simulateDelay();

        if (mockLeases.has(tokenId)) {
            mockLeases.delete(tokenId);
            logger.info(`[MOCK] Burned lease NFT: tokenId=${tokenId}, reason=${reason}`);
            return { success: true, txHash: this.generateMockTxHash() };
        }

        return { success: false };
    }

    // ----------------------------------------
    // VERIFICATION RECORDS
    // ----------------------------------------

    async recordVerification(params: RecordVerificationParams): Promise<RecordVerificationResult> {
        await this.simulateDelay();

        const verificationId = `VRF-${Date.now()}-${++verificationCounter}`;
        const txHash = this.generateMockTxHash();

        mockVerifications.set(verificationId, params);

        logger.info(`[MOCK] Recorded verification: id=${verificationId}, property=${params.propertyId}`);

        return {
            success: true,
            verificationId,
            txHash,
            blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
        };
    }

    async getVerification(verificationId: string): Promise<RecordVerificationParams | null> {
        return mockVerifications.get(verificationId) || null;
    }

    async verifyOnChain(verificationId: string): Promise<boolean> {
        return mockVerifications.has(verificationId);
    }

    // ----------------------------------------
    // ESCROW OPERATIONS
    // ----------------------------------------

    async createEscrow(params: CreateEscrowParams): Promise<CreateEscrowResult> {
        await this.simulateDelay();

        const escrowId = `ESC-${Date.now()}-${params.transactionId.slice(0, 8)}`;
        const txHash = this.generateMockTxHash();

        mockEscrows.set(escrowId, {
            params,
            status: 'active',
            balance: params.amount,
            createdAt: new Date(),
        });

        logger.info(`[MOCK] Created escrow: id=${escrowId}, amount=${params.amount} ${params.currency}`);

        return {
            success: true,
            escrowId,
            escrowAddress: `0xMOCK_ESCROW_${escrowId}`,
            txHash,
        };
    }

    async releaseEscrow(params: ReleaseEscrowParams): Promise<ReleaseEscrowResult> {
        await this.simulateDelay();

        const escrow = mockEscrows.get(params.escrowId);
        if (!escrow || escrow.status !== 'active') {
            return { success: false, error: 'Escrow not found or not active' };
        }

        const amountReleased = params.releaseType === 'full'
            ? escrow.balance
            : (params.amount || escrow.balance);

        escrow.balance -= amountReleased;
        if (escrow.balance <= 0) {
            escrow.status = 'released';
        }

        logger.info(`[MOCK] Released escrow: id=${params.escrowId}, amount=${amountReleased}`);

        return {
            success: true,
            txHash: this.generateMockTxHash(),
            amountReleased,
        };
    }

    async refundEscrow(params: RefundEscrowParams): Promise<RefundEscrowResult> {
        await this.simulateDelay();

        const escrow = mockEscrows.get(params.escrowId);
        if (!escrow || escrow.status !== 'active') {
            return { success: false, error: 'Escrow not found or not active' };
        }

        const refundPercentage = params.refundPercentage ?? 100;
        const amountRefunded = (escrow.balance * refundPercentage) / 100;

        escrow.balance = 0;
        escrow.status = 'refunded';

        logger.info(`[MOCK] Refunded escrow: id=${params.escrowId}, amount=${amountRefunded}, reason=${params.reason}`);

        return {
            success: true,
            txHash: this.generateMockTxHash(),
            amountRefunded,
        };
    }

    async getEscrowStatus(escrowId: string): Promise<{
        status: 'active' | 'released' | 'refunded' | 'disputed';
        balance: number;
        createdAt: Date;
    } | null> {
        const escrow = mockEscrows.get(escrowId);
        if (!escrow) return null;

        return {
            status: escrow.status,
            balance: escrow.balance,
            createdAt: escrow.createdAt,
        };
    }

    // ----------------------------------------
    // UTILITY METHODS
    // ----------------------------------------

    validateAddress(address: string): boolean {
        // Mock validation - accepts any 0x-prefixed string of 42 chars
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
        await this.simulateDelay(100);

        // Mock always returns confirmed
        return {
            txHash,
            status: 'confirmed',
            blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
            confirmations: 12,
            gasUsed: '150000',
        };
    }

    async estimateGas(operation: string, _params: Record<string, unknown>): Promise<string> {
        // Mock gas estimates
        const estimates: Record<string, string> = {
            mintLeaseNFT: '250000',
            burnLeaseNFT: '50000',
            recordVerification: '150000',
            createEscrow: '300000',
            releaseEscrow: '100000',
            refundEscrow: '120000',
        };

        return estimates[operation] || '100000';
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private async simulateDelay(ms = 500): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    private generateMockTxHash(): string {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }
}
