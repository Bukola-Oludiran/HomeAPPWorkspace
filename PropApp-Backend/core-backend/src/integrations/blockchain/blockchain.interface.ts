/**
 * Blockchain Provider Interface
 * Abstraction for blockchain services (NFT minting, escrow, verification)
 * Per PRD Section 14: Blockchain Integration
 */

// ============================================
// TYPES
// ============================================

export interface MintLeaseNFTParams {
    leaseId: string;
    propertyId: string;
    tenantAddress: string;
    landlordAddress: string;
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
    currency: string;
    metadata?: Record<string, unknown>;
}

export interface MintLeaseNFTResult {
    success: boolean;
    tokenId?: number;
    txHash?: string;
    contractAddress?: string;
    error?: string;
}

export interface RecordVerificationParams {
    propertyId: string;
    verificationType: 'identity' | 'property' | 'document';
    documentHash: string; // SHA-256 hash of verification data
    verifierAddress?: string;
    metadata?: Record<string, unknown>;
}

export interface RecordVerificationResult {
    success: boolean;
    verificationId?: string;
    txHash?: string;
    blockNumber?: number;
    error?: string;
}

export interface CreateEscrowParams {
    transactionId: string;
    payerAddress: string;
    payeeAddress: string;
    amount: number;
    currency: string;
    releaseConditions?: {
        requiresMultiSig?: boolean;
        requiredSignatures?: number;
        timelock?: number; // seconds
    };
    metadata?: Record<string, unknown>;
}

export interface CreateEscrowResult {
    success: boolean;
    escrowId?: string;
    escrowAddress?: string;
    txHash?: string;
    error?: string;
}

export interface ReleaseEscrowParams {
    escrowId: string;
    releaseType: 'full' | 'partial';
    amount?: number; // For partial release
    reason?: string;
}

export interface ReleaseEscrowResult {
    success: boolean;
    txHash?: string;
    amountReleased?: number;
    error?: string;
}

export interface RefundEscrowParams {
    escrowId: string;
    reason: string;
    refundPercentage?: number; // 0-100, default 100
}

export interface RefundEscrowResult {
    success: boolean;
    txHash?: string;
    amountRefunded?: number;
    error?: string;
}

export interface WalletInfo {
    address: string;
    chainId: number;
    network: string;
    balance?: string;
}

export interface TransactionStatus {
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    confirmations?: number;
    gasUsed?: string;
    error?: string;
}

// ============================================
// PROVIDER INTERFACE
// ============================================

export interface BlockchainProvider {
    readonly providerId: string;
    readonly network: string;
    readonly chainId: number;

    // NFT Lease Operations
    mintLeaseNFT(params: MintLeaseNFTParams): Promise<MintLeaseNFTResult>;
    getLeaseNFT(tokenId: number): Promise<MintLeaseNFTParams | null>;
    burnLeaseNFT(tokenId: number, reason: string): Promise<{ success: boolean; txHash?: string }>;

    // Verification Records
    recordVerification(params: RecordVerificationParams): Promise<RecordVerificationResult>;
    getVerification(verificationId: string): Promise<RecordVerificationParams | null>;
    verifyOnChain(verificationId: string): Promise<boolean>;

    // Escrow Operations
    createEscrow(params: CreateEscrowParams): Promise<CreateEscrowResult>;
    releaseEscrow(params: ReleaseEscrowParams): Promise<ReleaseEscrowResult>;
    refundEscrow(params: RefundEscrowParams): Promise<RefundEscrowResult>;
    getEscrowStatus(escrowId: string): Promise<{
        status: 'active' | 'released' | 'refunded' | 'disputed';
        balance: number;
        createdAt: Date;
    } | null>;

    // Utility Methods
    validateAddress(address: string): boolean;
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
    estimateGas(operation: string, params: Record<string, unknown>): Promise<string>;
}

// ============================================
// CONTRACT ADDRESSES (per network)
// ============================================

export interface ContractAddresses {
    leaseNFT: string;
    verificationRegistry: string;
    escrowFactory: string;
}

export const POLYGON_MAINNET_CONTRACTS: ContractAddresses = {
    leaseNFT: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    verificationRegistry: '0x0000000000000000000000000000000000000000',
    escrowFactory: '0x0000000000000000000000000000000000000000',
};

export const POLYGON_MUMBAI_CONTRACTS: ContractAddresses = {
    leaseNFT: '0x0000000000000000000000000000000000000000', // TODO: Deploy testnet
    verificationRegistry: '0x0000000000000000000000000000000000000000',
    escrowFactory: '0x0000000000000000000000000000000000000000',
};
