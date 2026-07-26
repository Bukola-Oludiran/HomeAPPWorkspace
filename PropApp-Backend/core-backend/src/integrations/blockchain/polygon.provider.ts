/**
 * Polygon Blockchain Provider
 * Production implementation using ethers.js
 * Per PRD Section 14 and MultiRegion Abstraction Section 10
 */

import { ethers } from 'ethers';
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
    ContractAddresses,
    POLYGON_MAINNET_CONTRACTS,
    POLYGON_MUMBAI_CONTRACTS,
} from './blockchain.interface';

// ============================================
// CONTRACT ABIs (Simplified)
// ============================================

const LEASE_NFT_ABI = [
    'function mint(address to, string memory uri) public returns (uint256)',
    'function burn(uint256 tokenId) public',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

const VERIFICATION_REGISTRY_ABI = [
    'function recordVerification(bytes32 propertyId, bytes32 documentHash, string memory verType) public returns (bytes32)',
    'function getVerification(bytes32 verificationId) public view returns (bytes32 propertyId, bytes32 documentHash, uint256 timestamp)',
    'function isVerified(bytes32 verificationId) public view returns (bool)',
    'event VerificationRecorded(bytes32 indexed verificationId, bytes32 indexed propertyId)',
];

const ESCROW_FACTORY_ABI = [
    'function createEscrow(address payer, address payee, uint256 amount) public payable returns (address)',
    'function release(address escrowAddress) public',
    'function refund(address escrowAddress, uint256 percentage) public',
    'function getEscrowDetails(address escrowAddress) public view returns (uint256 balance, uint8 status, uint256 createdAt)',
    'event EscrowCreated(address indexed escrowAddress, address payer, address payee, uint256 amount)',
];

// ============================================
// POLYGON PROVIDER
// ============================================

export class PolygonProvider implements BlockchainProvider {
    readonly providerId = 'polygon';
    readonly network: string;
    readonly chainId: number;

    private provider: ethers.JsonRpcProvider;
    private fallbackProviders: ethers.JsonRpcProvider[] = [];
    private signer?: ethers.Wallet;
    private contracts: ContractAddresses;
    private explorerUrl: string;

    constructor(
        rpcUrl: string,
        fallbackRpcUrls: string[],
        privateKey: string | undefined,
        isMainnet: boolean = false
    ) {
        this.network = isMainnet ? 'polygon-mainnet' : 'polygon-mumbai';
        this.chainId = isMainnet ? 137 : 80001;
        this.contracts = isMainnet ? POLYGON_MAINNET_CONTRACTS : POLYGON_MUMBAI_CONTRACTS;
        this.explorerUrl = isMainnet ? 'https://polygonscan.com' : 'https://mumbai.polygonscan.com';

        // Initialize primary provider
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        // Initialize fallback providers
        for (const fallbackUrl of fallbackRpcUrls) {
            this.fallbackProviders.push(new ethers.JsonRpcProvider(fallbackUrl));
        }

        // Initialize signer if private key provided
        if (privateKey) {
            try {
                this.signer = new ethers.Wallet(privateKey, this.provider);
                logger.info(`Polygon provider initialized with signer: ${this.signer.address}`);
            } catch (err) {
                logger.warn(
                    `Polygon BLOCKCHAIN_PRIVATE_KEY is set but invalid; falling back to read-only mode: ${(err as Error).message}`
                );
            }
        } else {
            logger.warn('Polygon provider initialized in read-only mode (no private key)');
        }

        logger.info(`Polygon provider initialized (network: ${this.network}, chainId: ${this.chainId})`);
    }

    // ----------------------------------------
    // NFT LEASE OPERATIONS
    // ----------------------------------------

    async mintLeaseNFT(params: MintLeaseNFTParams): Promise<MintLeaseNFTResult> {
        if (!this.signer) {
            return { success: false, error: 'Signer not configured' };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.leaseNFT,
                LEASE_NFT_ABI,
                this.signer
            );

            // Create metadata URI (would typically upload to IPFS first)
            const metadataUri = this.createLeaseMetadataUri(params);

            // Mint NFT
            const tx = await contract.mint(params.tenantAddress, metadataUri);
            const receipt = await tx.wait();

            // Parse Transfer event to get tokenId
            const transferEvent = receipt.logs.find(
                (log: any) => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
            );
            const tokenId = transferEvent ? parseInt(transferEvent.topics[3], 16) : 0;

            logger.info(`Lease NFT minted: tokenId=${tokenId}, tx=${receipt.hash}`);

            return {
                success: true,
                tokenId,
                txHash: receipt.hash,
                contractAddress: this.contracts.leaseNFT,
            };
        } catch (error: any) {
            logger.error('Mint lease NFT error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getLeaseNFT(tokenId: number): Promise<MintLeaseNFTParams | null> {
        try {
            const contract = new ethers.Contract(
                this.contracts.leaseNFT,
                LEASE_NFT_ABI,
                this.provider
            );

            const uri = await contract.tokenURI(tokenId);
            // Parse metadata from URI (would fetch from IPFS in production)
            return JSON.parse(atob(uri.split(',')[1])) as MintLeaseNFTParams;
        } catch (error: any) {
            logger.error('Get lease NFT error:', error.message);
            return null;
        }
    }

    async burnLeaseNFT(tokenId: number, reason: string): Promise<{ success: boolean; txHash?: string }> {
        if (!this.signer) {
            return { success: false };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.leaseNFT,
                LEASE_NFT_ABI,
                this.signer
            );

            const tx = await contract.burn(tokenId);
            const receipt = await tx.wait();

            logger.info(`Lease NFT burned: tokenId=${tokenId}, reason=${reason}, tx=${receipt.hash}`);

            return { success: true, txHash: receipt.hash };
        } catch (error: any) {
            logger.error('Burn lease NFT error:', error.message);
            return { success: false };
        }
    }

    // ----------------------------------------
    // VERIFICATION RECORDS
    // ----------------------------------------

    async recordVerification(params: RecordVerificationParams): Promise<RecordVerificationResult> {
        if (!this.signer) {
            return { success: false, error: 'Signer not configured' };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.verificationRegistry,
                VERIFICATION_REGISTRY_ABI,
                this.signer
            );

            // Convert IDs to bytes32
            const propertyIdBytes = ethers.id(params.propertyId);
            const documentHashBytes = ethers.id(params.documentHash);

            const tx = await contract.recordVerification(
                propertyIdBytes,
                documentHashBytes,
                params.verificationType
            );
            const receipt = await tx.wait();

            // Parse event to get verification ID
            const verificationEvent = receipt.logs.find(
                (log: any) => log.topics[0] === ethers.id('VerificationRecorded(bytes32,bytes32)')
            );
            const verificationId = verificationEvent?.topics[1] || '';

            logger.info(`Verification recorded: id=${verificationId}, tx=${receipt.hash}`);

            return {
                success: true,
                verificationId,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error: any) {
            logger.error('Record verification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getVerification(verificationId: string): Promise<RecordVerificationParams | null> {
        try {
            const contract = new ethers.Contract(
                this.contracts.verificationRegistry,
                VERIFICATION_REGISTRY_ABI,
                this.provider
            );

            const [propertyId, documentHash] = await contract.getVerification(verificationId);

            return {
                propertyId: ethers.decodeBytes32String(propertyId),
                documentHash: ethers.decodeBytes32String(documentHash),
                verificationType: 'property',
            };
        } catch (error: any) {
            logger.error('Get verification error:', error.message);
            return null;
        }
    }

    async verifyOnChain(verificationId: string): Promise<boolean> {
        try {
            const contract = new ethers.Contract(
                this.contracts.verificationRegistry,
                VERIFICATION_REGISTRY_ABI,
                this.provider
            );

            return await contract.isVerified(verificationId);
        } catch (error: any) {
            logger.error('Verify on chain error:', error.message);
            return false;
        }
    }

    // ----------------------------------------
    // ESCROW OPERATIONS
    // ----------------------------------------

    async createEscrow(params: CreateEscrowParams): Promise<CreateEscrowResult> {
        if (!this.signer) {
            return { success: false, error: 'Signer not configured' };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.escrowFactory,
                ESCROW_FACTORY_ABI,
                this.signer
            );

            // Convert amount to wei (assuming NGN to MATIC conversion done elsewhere)
            const amountWei = ethers.parseEther(params.amount.toString());

            const tx = await contract.createEscrow(
                params.payerAddress,
                params.payeeAddress,
                amountWei,
                { value: amountWei }
            );
            const receipt = await tx.wait();

            // Parse event to get escrow address
            const escrowEvent = receipt.logs.find(
                (log: any) => log.topics[0] === ethers.id('EscrowCreated(address,address,address,uint256)')
            );
            const escrowAddress = escrowEvent ? ethers.getAddress('0x' + escrowEvent.topics[1].slice(26)) : '';
            const escrowId = `ESC-${receipt.hash.slice(0, 16)}`;

            logger.info(`Escrow created: id=${escrowId}, address=${escrowAddress}, tx=${receipt.hash}`);

            return {
                success: true,
                escrowId,
                escrowAddress,
                txHash: receipt.hash,
            };
        } catch (error: any) {
            logger.error('Create escrow error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async releaseEscrow(params: ReleaseEscrowParams): Promise<ReleaseEscrowResult> {
        if (!this.signer) {
            return { success: false, error: 'Signer not configured' };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.escrowFactory,
                ESCROW_FACTORY_ABI,
                this.signer
            );

            // Extract escrow address from escrowId (simplified)
            const escrowAddress = params.escrowId; // Would need proper mapping in production

            const tx = await contract.release(escrowAddress);
            const receipt = await tx.wait();

            logger.info(`Escrow released: id=${params.escrowId}, tx=${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                amountReleased: params.amount,
            };
        } catch (error: any) {
            logger.error('Release escrow error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async refundEscrow(params: RefundEscrowParams): Promise<RefundEscrowResult> {
        if (!this.signer) {
            return { success: false, error: 'Signer not configured' };
        }

        try {
            const contract = new ethers.Contract(
                this.contracts.escrowFactory,
                ESCROW_FACTORY_ABI,
                this.signer
            );

            const escrowAddress = params.escrowId;
            const percentage = params.refundPercentage ?? 100;

            const tx = await contract.refund(escrowAddress, percentage);
            const receipt = await tx.wait();

            logger.info(`Escrow refunded: id=${params.escrowId}, percentage=${percentage}%, tx=${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
            };
        } catch (error: any) {
            logger.error('Refund escrow error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getEscrowStatus(escrowId: string): Promise<{
        status: 'active' | 'released' | 'refunded' | 'disputed';
        balance: number;
        createdAt: Date;
    } | null> {
        try {
            const contract = new ethers.Contract(
                this.contracts.escrowFactory,
                ESCROW_FACTORY_ABI,
                this.provider
            );

            const [balance, statusCode, timestamp] = await contract.getEscrowDetails(escrowId);
            const statuses = ['active', 'released', 'refunded', 'disputed'] as const;

            return {
                status: statuses[statusCode] || 'active',
                balance: Number(ethers.formatEther(balance)),
                createdAt: new Date(Number(timestamp) * 1000),
            };
        } catch (error: any) {
            logger.error('Get escrow status error:', error.message);
            return null;
        }
    }

    // ----------------------------------------
    // UTILITY METHODS
    // ----------------------------------------

    validateAddress(address: string): boolean {
        return ethers.isAddress(address);
    }

    async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);

            if (!receipt) {
                return { txHash, status: 'pending' };
            }

            const block = await this.provider.getBlock('latest');
            const confirmations = block ? block.number - receipt.blockNumber : 0;

            return {
                txHash,
                status: receipt.status === 1 ? 'confirmed' : 'failed',
                blockNumber: receipt.blockNumber,
                confirmations,
                gasUsed: receipt.gasUsed.toString(),
            };
        } catch (error: any) {
            logger.error('Get transaction status error:', error.message);
            return { txHash, status: 'failed', error: error.message };
        }
    }

    async estimateGas(operation: string, params: Record<string, unknown>): Promise<string> {
        // Simplified gas estimates for Polygon
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

    private createLeaseMetadataUri(params: MintLeaseNFTParams): string {
        // Create data URI with lease metadata (would use IPFS in production)
        const metadata = {
            name: `HomeAI Lease - ${params.leaseId}`,
            description: 'Digital lease agreement NFT',
            properties: {
                leaseId: params.leaseId,
                propertyId: params.propertyId,
                tenant: params.tenantAddress,
                landlord: params.landlordAddress,
                startDate: params.startDate.toISOString(),
                endDate: params.endDate.toISOString(),
                monthlyRent: params.monthlyRent,
                currency: params.currency,
            },
        };

        return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    }

    getExplorerUrl(txHash: string): string {
        return `${this.explorerUrl}/tx/${txHash}`;
    }
}
