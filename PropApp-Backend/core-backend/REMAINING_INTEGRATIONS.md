# Remaining Integration Items

This document tracks low-priority integration items that require external credentials or infrastructure setup before activation.

## Overview

The core backend is **fully functional** with mock providers for development. These items enhance the platform but are not blockers for frontend integration or initial deployment.

---

## Pending Integrations

| Item | Status | Blocker | Priority |
|------|--------|---------|----------|
| Google OAuth | 🔶 Mock Ready | Needs Google Cloud API credentials | Low |
| Smile Identity KYC | 🔶 Mock Ready | Needs Smile Identity API credentials | Low |
| Elasticsearch Search | 🔶 Basic Search | Infrastructure setup required | Low |
| Smart Contracts | 🔶 Mock Ready | Needs Polygon deployment | Low |

---

## Details

### 1. Google OAuth

**Current State:** Mock provider returns simulated OAuth responses for development.

**What's Needed:**
- [ ] Create Google Cloud Console project
- [ ] Enable Google+ API and OAuth 2.0
- [ ] Generate OAuth 2.0 Client ID and Secret
- [ ] Add credentials to `.env`:
  ```
  GOOGLE_CLIENT_ID=your-client-id
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```

**Files to Update:**
- `src/modules/auth/auth.service.ts` - OAuth handler
- `.env` / `.env.example`

---

### 2. Smile Identity KYC

**Current State:** Mock provider simulates identity verification for development.

**What's Needed:**
- [ ] Sign up for Smile Identity account
- [ ] Obtain API Key and Partner ID
- [ ] Configure callback URLs
- [ ] Add credentials to `.env`:
  ```
  SMILE_IDENTITY_API_KEY=your-api-key
  SMILE_IDENTITY_PARTNER_ID=your-partner-id
  SMILE_IDENTITY_CALLBACK_URL=https://api.homeai.ng/webhooks/smile
  ```

**Files to Update:**
- `src/integrations/verification/smileidentity.provider.ts`
- `.env` / `.env.example`

---

### 3. Elasticsearch Search

**Current State:** Basic PostgreSQL full-text search works. Elasticsearch would provide advanced search features.

**What's Needed:**
- [ ] Set up Elasticsearch cluster (AWS OpenSearch, Elastic Cloud, or self-hosted)
- [ ] Configure index mappings for properties
- [ ] Set up data sync from PostgreSQL
- [ ] Add connection details to `.env`:
  ```
  ELASTICSEARCH_URL=https://your-cluster.elastic.co
  ELASTICSEARCH_API_KEY=your-api-key
  ```

**Files to Create/Update:**
- `src/integrations/search/elasticsearch.provider.ts` (new)
- `src/modules/properties/properties.service.ts` - Use search provider

---

### 4. Smart Contracts (Polygon)

**Current State:** Mock provider simulates blockchain interactions for development.

**What's Needed:**
- [ ] Deploy LeaseNFT contract to Polygon Mumbai (testnet)
- [ ] Deploy PropertyVerification contract to Polygon Mumbai
- [ ] Fund deployment wallet with MATIC
- [ ] Deploy to Polygon Mainnet for production
- [ ] Add credentials to `.env`:
  ```
  POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_KEY
  POLYGON_PRIVATE_KEY=your-deployment-wallet-private-key
  LEASE_NFT_CONTRACT_ADDRESS=0x...
  VERIFICATION_CONTRACT_ADDRESS=0x...
  ```

**Contract Files:**
- `contracts/LeaseNFT.sol` - Lease tokenization
- `contracts/PropertyVerification.sol` - On-chain verification records

**Files to Update:**
- `src/integrations/blockchain/polygon.provider.ts`
- `.env` / `.env.example`

---

## Timeline Recommendations

| Phase | Items | Timeline |
|-------|-------|----------|
| **Phase 1** (MVP) | Use mocks, proceed with frontend | Immediate |
| **Phase 2** (Beta) | Google OAuth, Smile Identity | Before beta launch |
| **Phase 3** (Production) | Smart contracts, Elasticsearch | Post-launch enhancement |

---

## Notes

- All items have **mock providers** that work for development and testing
- Frontend integration can proceed immediately
- Production deployment requires at minimum: Google OAuth and Smile Identity KYC
- Smart contracts and Elasticsearch are enhancements, not blockers
