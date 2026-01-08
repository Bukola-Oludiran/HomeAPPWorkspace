# Blockchain Integration

## Overview

HomeAI uses blockchain technology to provide:
- **Lease NFTs**: Immutable digital lease agreements
- **Property Verification Records**: On-chain proof of verification
- **Smart Contract Escrow**: Trustless rent and deposit handling

Nigeria has `blockchainEnabled: true`, Canada has `blockchainEnabled: false`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  LeaseService │ VerificationService │ TransactionService    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 BLOCKCHAIN ABSTRACTION                       │
│                                                              │
│  BlockchainProvider Interface                                │
│  ├── mintLeaseNFT()          ├── createEscrow()             │
│  ├── recordVerification()    ├── releaseEscrow()            │
│  └── getTransactionStatus()  └── refundEscrow()             │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│   MockProvider      │     │   PolygonProvider   │
│   (Development)     │     │   (Production)      │
│   - In-memory       │     │   - ethers.js v6    │
│   - No real txns    │     │   - Polygon L2      │
└─────────────────────┘     └─────────────────────┘
```

---

## Provider Interface

Located at: `src/integrations/blockchain/blockchain.interface.ts`

### Core Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `mintLeaseNFT()` | Create NFT representing lease agreement | `tokenId`, `txHash` |
| `burnLeaseNFT()` | Destroy lease NFT (on termination) | `txHash` |
| `recordVerification()` | Store verification hash on-chain | `verificationId`, `txHash` |
| `createEscrow()` | Create smart contract escrow | `escrowId`, `escrowAddress` |
| `releaseEscrow()` | Release funds to payee | `txHash`, `amountReleased` |
| `refundEscrow()` | Refund funds to payer | `txHash`, `amountRefunded` |
| `validateAddress()` | Check if wallet address is valid | `boolean` |
| `getTransactionStatus()` | Check tx confirmation status | `status`, `confirmations` |

---

## Providers

### Mock Provider (Development)
- File: `mock.provider.ts`
- Uses in-memory storage
- Simulates all operations with delays
- No real blockchain interaction

### Polygon Provider (Production)
- File: `polygon.provider.ts`
- Uses ethers.js v6
- Supports Polygon Mainnet (chainId: 137) and Mumbai testnet (chainId: 80001)
- RPC via Alchemy with Infura fallback

---

## Configuration

### Environment Variables

```env
# Required for production blockchain
ALCHEMY_API_KEY=xxxxx           # Primary RPC provider
INFURA_API_KEY=xxxxx            # Fallback RPC provider
BLOCKCHAIN_PRIVATE_KEY=xxxxx    # Wallet for signing transactions

# Optional
POLYGON_RPC_URL=https://...     # Custom RPC URL
```

### Region Configuration

```typescript
// nigeria.ts
providers: {
    blockchain: {
        network: 'polygon',
        rpcProvider: 'alchemy',
        fallbackRpc: 'infura'
    }
}
```

---

## Usage Examples

### Basic Usage

```typescript
import { blockchainProviderFactory } from './integrations/blockchain';

// Get provider (auto-selects based on config)
const blockchain = blockchainProviderFactory.getProvider('NG');

// Check availability
if (blockchainProviderFactory.isBlockchainAvailable()) {
    // Proceed with blockchain operations
}
```

### Minting Lease NFT

```typescript
const result = await blockchain.mintLeaseNFT({
    leaseId: lease.id,
    propertyId: lease.propertyId,
    tenantAddress: '0x123...',
    landlordAddress: '0x456...',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-01-01'),
    monthlyRent: 150000,
    currency: 'NGN'
});

if (result.success) {
    await prisma.lease.update({
        where: { id: lease.id },
        data: {
            blockchainTokenId: result.tokenId,
            blockchainTxHash: result.txHash
        }
    });
}
```

### Recording Verification

```typescript
const result = await blockchain.recordVerification({
    propertyId: property.id,
    verificationType: 'property',
    documentHash: sha256(verificationData)
});

if (result.success) {
    await prisma.verification.update({
        where: { id: verification.id },
        data: {
            blockchainVerificationId: result.verificationId,
            blockchainTxHash: result.txHash
        }
    });
}
```

### Creating Escrow

```typescript
const result = await blockchain.createEscrow({
    transactionId: transaction.id,
    payerAddress: tenant.walletAddress,
    payeeAddress: landlord.walletAddress,
    amount: 300000, // 2 months deposit
    currency: 'NGN'
});

if (result.success) {
    await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
            blockchainEscrowId: result.escrowId,
            blockchainTxHash: result.txHash
        }
    });
}
```

---

## Smart Contracts (To Deploy)

The following contracts need to be deployed:

| Contract | Purpose | Status |
|----------|---------|--------|
| LeaseNFT (ERC-721) | Lease agreement tokens | Pending |
| VerificationRegistry | Property verification records | Pending |
| EscrowFactory | Rent/deposit escrow | Pending |

Contract addresses are configured in `blockchain.interface.ts`:

```typescript
export const POLYGON_MAINNET_CONTRACTS: ContractAddresses = {
    leaseNFT: '0x...', // TODO: Deploy
    verificationRegistry: '0x...',
    escrowFactory: '0x...',
};
```

---

## Database Fields

The following schema fields support blockchain:

| Model | Field | Purpose |
|-------|-------|---------|
| Property | `blockchainVerificationId` | On-chain verification hash |
| Lease | `blockchainTokenId` | NFT token ID |
| Lease | `blockchainTxHash` | Minting transaction |
| Transaction | `blockchainTxHash` | Payment proof |
| Transaction | `blockchainEscrowId` | Escrow contract address |
| Verification | `blockchainVerificationId` | Verification record ID |

---

## Region Behavior

| Region | Blockchain Enabled | Network |
|--------|-------------------|---------|
| Nigeria (NG) | ✅ Yes | Polygon |
| Canada (CA) | ❌ No | N/A |

When blockchain is disabled for a region, the factory returns the mock provider.

---

## Error Handling

All blockchain operations return `{ success: boolean, error?: string }`. Services should:

1. Check `success` before using results
2. Log failures but don't block user operations
3. Store `txHash` for transaction tracking
4. Retry failed operations with exponential backoff

---

## Gas Estimation

```typescript
const gasEstimate = await blockchain.estimateGas('mintLeaseNFT', params);
// Returns gas units as string, e.g., "250000"
```

Typical gas costs on Polygon (at 30 gwei):
- Mint NFT: ~0.0075 MATIC (~$0.005)
- Record Verification: ~0.0045 MATIC (~$0.003)
- Create Escrow: ~0.009 MATIC (~$0.006)
