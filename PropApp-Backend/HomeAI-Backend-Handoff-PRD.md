# HomeAI Nigeria
## Backend Developer Handoff PRD

**Complete Backend Implementation Specification**

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | January 2026 |
| Status | Ready for Development |
| Target Audience | Backend Engineers, DevOps, System Architects |

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Service Decomposition](#2-service-decomposition)
3. [Core Backend Service](#3-core-backend-service)
4. [AI Backend Service (Separate)](#4-ai-backend-service-separate)
5. [Blockchain Integration](#5-blockchain-integration)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [User Management Service](#7-user-management-service)
8. [Property Service](#8-property-service)
9. [Transaction & Escrow Service](#9-transaction--escrow-service)
10. [Verification Service](#10-verification-service)
11. [Agent Service](#11-agent-service)
12. [Messaging & Notification Service](#12-messaging--notification-service)
13. [Database Schema](#13-database-schema)
14. [External Integrations](#14-external-integrations)
15. [API Gateway & Inter-Service Communication](#15-api-gateway--inter-service-communication)
16. [Security Requirements](#16-security-requirements)
17. [Infrastructure & DevOps](#17-infrastructure--devops)
18. [Implementation Phases](#18-implementation-phases)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Web App     │  │  Mobile App  │  │  Agent App   │  │  Admin Portal│         │
│  │  (Next.js)   │  │(React Native)│  │  (React)     │  │  (Internal)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │                 │
          └─────────────────┴────────┬────────┴─────────────────┘
                                     │
                              ┌──────▼──────┐
                              │ API Gateway │ (Kong / AWS API Gateway)
                              │   + WAF     │
                              └──────┬──────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│  CORE BACKEND   │◄────►│   AI BACKEND        │      │  BLOCKCHAIN     │
│  (Main API)     │      │   (Separate)        │      │  SERVICE        │
│                 │      │                     │      │                 │
│ • Auth Service  │      │ • Intent Processing │      │ • Smart Escrow  │
│ • User Service  │      │ • NLP Engine        │      │ • Agreement NFT │
│ • Property Svc  │      │ • Action Executor   │      │ • Verification  │
│ • Transaction   │      │ • Context Manager   │      │ • Audit Trail   │
│ • Verification  │      │ • Recommendation    │      │                 │
│ • Agent Service │      │ • Voice Processing  │      │                 │
│ • Messaging     │      │                     │      │                 │
└────────┬────────┘      └──────────┬──────────┘      └────────┬────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │    Redis     │  │Elasticsearch │  │   MongoDB    │ │
│  │  (Primary)   │  │   (Cache)    │  │  (Search)    │  │  (AI Logs)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   AWS S3     │  │  Blockchain  │  │   TimescaleDB│                   │
│  │  (Storage)   │  │  (Immutable) │  │  (Analytics) │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Microservices Architecture**: Independent, deployable services with clear boundaries
2. **AI as Separate Backend**: AI service operates independently, communicating via REST/gRPC
3. **Event-Driven**: Async communication via message queues for non-critical paths
4. **Blockchain for Trust**: Immutable records for escrow, agreements, and verification
5. **API-First**: All services expose well-documented REST APIs
6. **Security by Design**: Zero-trust, encryption everywhere, audit trails

### 1.3 Technology Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **API Gateway** | Kong / AWS API Gateway | Rate limiting, auth, routing |
| **Core Backend** | Node.js (NestJS) or Python (FastAPI) | Strong ecosystem, async support |
| **AI Backend** | Python (FastAPI) | ML library support, Claude/OpenAI SDK |
| **Database** | PostgreSQL 15+ | ACID compliance, JSON support, reliability |
| **Cache** | Redis 7+ | Session management, caching, pub/sub |
| **Search** | Elasticsearch 8+ | Property search, full-text, geo queries |
| **Message Queue** | RabbitMQ / AWS SQS | Async job processing |
| **Blockchain** | Polygon (Ethereum L2) | Low gas fees, Ethereum compatibility |
| **File Storage** | AWS S3 + CloudFront | Scalable, CDN delivery |
| **Container Orchestration** | Kubernetes (EKS/GKE) | Scalability, resilience |

---

## 2. Service Decomposition

### 2.1 Service Map

| Service | Responsibility | Database | Message Topics |
|---------|---------------|----------|----------------|
| **Auth Service** | Authentication, authorization, sessions | PostgreSQL (users) | `auth.events` |
| **User Service** | Profile management, preferences | PostgreSQL (users) | `user.events` |
| **Property Service** | Listings CRUD, search, media | PostgreSQL + Elasticsearch | `property.events` |
| **Transaction Service** | Payments, escrow, financial records | PostgreSQL + Blockchain | `transaction.events` |
| **Verification Service** | KYC, document verification, tiers | PostgreSQL | `verification.events` |
| **Agent Service** | Job board, scheduling, earnings | PostgreSQL | `agent.events` |
| **Messaging Service** | Chat, conversations, notifications | PostgreSQL + Redis | `messaging.events` |
| **Notification Service** | Push, email, SMS delivery | Redis | `notification.queue` |
| **AI Service** | NLP, intent processing, recommendations | MongoDB (logs) + Redis | `ai.requests`, `ai.responses` |
| **Blockchain Service** | Smart contract interaction, chain sync | PostgreSQL (index) | `blockchain.events` |

### 2.2 Service Communication Matrix

```
                    Auth  User  Property  Transaction  Verification  Agent  Messaging  AI  Blockchain
Auth                 -     →       →           →            →          →        →       →      -
User                 ←     -       →           →            →          →        →       →      -
Property             ←     ←       -           →            ←          →        →       ←      →
Transaction          ←     ←       ←           -            ←          →        →       ←      →
Verification         ←     ←       →           →            -          →        →       -      →
Agent                ←     ←       ←           ←            ←          -        →       -      -
Messaging            ←     ←       ←           ←            ←          ←        -       ←      -
AI                   ←     ←       →           →            -          -        →       -      -
Blockchain           -     -       ←           ←            ←          -        -       -      -

→ = Calls/Depends on | ← = Called by
```

---

## 3. Core Backend Service

### 3.1 Service Structure

```
core-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── properties/
│   │   ├── applications/
│   │   ├── leases/
│   │   ├── transactions/
│   │   ├── verification/
│   │   ├── maintenance/
│   │   ├── agents/
│   │   ├── messaging/
│   │   └── notifications/
│   ├── common/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── decorators/
│   │   └── utils/
│   ├── integrations/
│   │   ├── ai-service/
│   │   ├── blockchain-service/
│   │   ├── payment-providers/
│   │   ├── identity-verification/
│   │   └── external-apis/
│   └── config/
├── prisma/
│   └── schema.prisma
├── docker/
└── tests/
```

### 3.2 Core API Base URL Structure

```
Production:  https://api.homeai.ng/v1
Staging:     https://api.staging.homeai.ng/v1
Development: http://localhost:3000/v1

AI Service:  https://ai.homeai.ng/v1  (Separate subdomain)
```

### 3.3 Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ],
    "requestId": "req_abc123"
  }
}
```

---

## 4. AI Backend Service (Separate)

The AI Backend is a **completely separate service** that handles all AI/ML functionality. It communicates with the Core Backend via REST APIs and can make authenticated requests to execute actions on behalf of users.

### 4.1 AI Service Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI BACKEND SERVICE                            │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    API LAYER (FastAPI)                       │    │
│  │  POST /ai/chat      POST /ai/search     POST /ai/execute    │    │
│  │  POST /ai/voice     GET /ai/recommend   GET /ai/context     │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────────────────▼─────────────────────────────────┐    │
│  │                 PROCESSING PIPELINE                          │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Input   │  │  Intent  │  │  Entity  │  │  Action  │    │    │
│  │  │ Parser   │→ │Classifier│→ │Extractor │→ │ Router   │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                              │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────────────────▼─────────────────────────────────┐    │
│  │                    LLM INTEGRATION                           │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ Claude API   │  │ Prompt Mgmt  │  │ Response     │       │    │
│  │  │ (Primary)    │  │ Templates    │  │ Formatter    │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                              │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────────────────▼─────────────────────────────────┐    │
│  │               CORE BACKEND INTEGRATION                       │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ API Client   │  │  Auth Token  │  │ Action       │       │    │
│  │  │ (Core API)   │  │  Manager     │  │ Executor     │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 AI Service Endpoints

#### 4.2.1 Chat Endpoint (Primary)

```
POST /ai/v1/chat
```

**Request:**
```json
{
  "sessionId": "session_abc123",
  "message": "Find me a 3-bedroom apartment in Lekki under 2 million naira",
  "context": {
    "userId": "user_123",
    "userRole": "tenant",
    "currentScreen": "homepage",
    "currentPropertyId": null,
    "conversationHistory": [
      {
        "role": "user",
        "content": "Hi, I'm looking for an apartment",
        "timestamp": "2026-01-06T10:00:00Z"
      },
      {
        "role": "assistant", 
        "content": "Hello! I'd be happy to help you find an apartment. What area are you interested in, and what's your budget?",
        "timestamp": "2026-01-06T10:00:05Z"
      }
    ],
    "userPreferences": {
      "savedLocations": ["Lekki", "Victoria Island"],
      "priceRange": { "min": 800000, "max": 2500000 }
    }
  },
  "options": {
    "includePropertyResults": true,
    "maxResults": 5,
    "executeActions": false
  }
}
```

**Response:**
```json
{
  "sessionId": "session_abc123",
  "response": {
    "type": "property_search",
    "message": "I found 12 three-bedroom apartments in Lekki under ₦2,000,000. Here are the top matches based on your preferences:",
    "data": {
      "properties": [
        {
          "id": "prop_456",
          "name": "Lekki Phase 1 Apartment",
          "price": 1800000,
          "priceUnit": "/year",
          "bedrooms": 3,
          "bathrooms": 2,
          "verificationTier": "gold",
          "thumbnail": "https://...",
          "matchScore": 0.95
        }
      ],
      "totalResults": 12,
      "searchQuery": {
        "location": "Lekki",
        "bedrooms": 3,
        "maxPrice": 2000000,
        "listingType": "rent"
      }
    },
    "suggestedActions": [
      { "action": "view_property", "label": "View Details", "propertyId": "prop_456" },
      { "action": "refine_search", "label": "Show only Gold Verified" },
      { "action": "save_search", "label": "Save this search" }
    ],
    "followUpPrompts": [
      "Show only Gold verified properties",
      "Filter by properties with parking",
      "What's the average rent in Lekki?"
    ]
  },
  "intent": {
    "primary": "property_search",
    "confidence": 0.97,
    "entities": {
      "location": "Lekki",
      "bedrooms": 3,
      "maxPrice": 2000000,
      "currency": "NGN"
    }
  },
  "processingTime": 1250
}
```

#### 4.2.2 Action Execution Endpoint

When the AI needs to perform an action on behalf of the user (with user confirmation):

```
POST /ai/v1/execute
```

**Request:**
```json
{
  "sessionId": "session_abc123",
  "userId": "user_123",
  "userAuthToken": "Bearer eyJ...",
  "action": {
    "type": "submit_application",
    "params": {
      "propertyId": "prop_456",
      "moveInDate": "2026-03-01",
      "leaseTerm": 12,
      "message": "I'm very interested in this property"
    }
  },
  "confirmationToken": "confirm_xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "action": "submit_application",
  "result": {
    "applicationId": "app_789",
    "status": "submitted",
    "propertyName": "Lekki Phase 1 Apartment",
    "nextSteps": [
      "The landlord will review your application within 48 hours",
      "You'll receive a notification when there's an update"
    ]
  },
  "message": "Great! I've submitted your application for the Lekki Phase 1 Apartment. The landlord typically responds within 48 hours."
}
```

#### 4.2.3 AI Search Endpoint (Structured)

```
POST /ai/v1/search
```

**Request:**
```json
{
  "query": "pet-friendly apartments with pool in Victoria Island under 3 million",
  "userId": "user_123",
  "options": {
    "limit": 20,
    "includeNearby": true,
    "sortBy": "relevance"
  }
}
```

**Response:**
```json
{
  "parsedQuery": {
    "location": "Victoria Island",
    "propertyType": "apartment",
    "amenities": ["pet_friendly", "pool"],
    "maxPrice": 3000000,
    "listingType": "rent"
  },
  "results": [...],
  "totalCount": 8,
  "nearbyResults": [...],
  "refinementSuggestions": [
    "Include Ikoyi (nearby area)",
    "Consider properties up to ₦3.5M"
  ]
}
```

#### 4.2.4 Voice Processing Endpoint

```
POST /ai/v1/voice
Content-Type: multipart/form-data
```

**Request:**
```
audio: <binary audio file>
format: "webm" | "wav" | "mp3"
language: "en-NG" | "pcm" (Pidgin)
sessionId: "session_abc123"
```

**Response:**
```json
{
  "transcription": "Find me a two bedroom flat in Surulere",
  "confidence": 0.92,
  "language": "en-NG",
  "processedResponse": {
    // Same as chat response
  }
}
```

#### 4.2.5 Recommendations Endpoint

```
GET /ai/v1/recommendations?userId={userId}&type={type}&limit={limit}
```

**Types:** `similar`, `trending`, `personalized`, `price_drop`

**Response:**
```json
{
  "recommendations": [
    {
      "property": {...},
      "reason": "Based on your saved properties in Lekki",
      "score": 0.89
    }
  ],
  "generatedAt": "2026-01-06T10:00:00Z"
}
```

### 4.3 AI Service Internal Components

#### 4.3.1 Intent Classification

| Intent | Description | Required Entities | Action |
|--------|-------------|------------------|--------|
| `property_search` | Find properties | location?, bedrooms?, price? | Query Property Service |
| `property_detail` | Get property info | propertyId | Fetch Property |
| `submit_application` | Apply for property | propertyId, moveInDate | Create Application |
| `schedule_viewing` | Book viewing | propertyId, date, time | Create Viewing |
| `make_payment` | Pay rent/deposit | amount?, propertyId? | Initiate Payment |
| `maintenance_request` | Report issue | category, description | Create Ticket |
| `check_status` | Status inquiry | entityType, entityId? | Fetch Status |
| `general_question` | FAQ, platform info | topic | Generate Response |
| `negotiate_offer` | Counter-offer | propertyId, amount | Submit Offer |
| `compare_properties` | Side-by-side | propertyIds[] | Generate Comparison |

#### 4.3.2 Core Backend API Client

The AI Service maintains an internal client to call Core Backend APIs:

```python
# ai-service/integrations/core_backend_client.py

class CoreBackendClient:
    def __init__(self, base_url: str, service_api_key: str):
        self.base_url = base_url
        self.service_api_key = service_api_key
    
    async def search_properties(self, params: dict, user_token: str = None) -> dict:
        """Search properties - can be public or user-authenticated"""
        headers = self._get_headers(user_token)
        return await self._get("/properties/search", params, headers)
    
    async def create_application(self, data: dict, user_token: str) -> dict:
        """Create application - requires user auth"""
        headers = self._get_headers(user_token, require_user=True)
        return await self._post("/applications", data, headers)
    
    async def get_user_context(self, user_id: str, service_token: str) -> dict:
        """Get user context for personalization - service-to-service"""
        headers = {"X-Service-Key": service_token}
        return await self._get(f"/internal/users/{user_id}/context", {}, headers)
    
    # ... other methods
```

#### 4.3.3 Action Execution Flow

```
┌─────────┐     ┌───────────┐     ┌─────────────┐     ┌─────────────┐
│  User   │────►│ Frontend  │────►│ AI Service  │────►│Core Backend │
│         │     │           │     │             │     │             │
└─────────┘     └───────────┘     └─────────────┘     └─────────────┘
     │               │                  │                   │
     │  "Pay rent"   │                  │                   │
     │──────────────►│                  │                   │
     │               │  POST /ai/chat   │                   │
     │               │─────────────────►│                   │
     │               │                  │  Parse Intent     │
     │               │                  │  (make_payment)   │
     │               │                  │                   │
     │               │  Confirmation    │                   │
     │               │◄─────────────────│                   │
     │               │  Required        │                   │
     │  Show confirm │                  │                   │
     │◄──────────────│                  │                   │
     │               │                  │                   │
     │  User confirms│                  │                   │
     │──────────────►│                  │                   │
     │               │ POST /ai/execute │                   │
     │               │─────────────────►│                   │
     │               │                  │  POST /payments   │
     │               │                  │  (with user token)│
     │               │                  │─────────────────► │
     │               │                  │                   │
     │               │                  │◄──────────────────│
     │               │◄─────────────────│                   │
     │  Success msg  │                  │                   │
     │◄──────────────│                  │                   │
```

### 4.4 AI Service Data Storage

```
ai-backend/
├── MongoDB Collections:
│   ├── conversations      # Chat history per session
│   ├── ai_interactions    # All interactions log
│   ├── intent_training    # Training data for classifiers
│   └── feedback           # User feedback on AI responses
│
├── Redis Keys:
│   ├── session:{sessionId}           # Active session context
│   ├── user_context:{userId}         # Cached user preferences
│   ├── rate_limit:{userId}           # Rate limiting
│   └── recommendation_cache:{userId} # Cached recommendations
```

### 4.5 AI Service Configuration

```yaml
# ai-service/config.yaml
llm:
  provider: "anthropic"
  model: "claude-3-5-sonnet-20241022"
  max_tokens: 4096
  temperature: 0.7
  
core_backend:
  base_url: "https://api.homeai.ng/v1"
  service_api_key: "${CORE_BACKEND_SERVICE_KEY}"
  timeout_seconds: 30
  
intent_classification:
  confidence_threshold: 0.7
  fallback_intent: "general_question"
  
action_execution:
  require_confirmation:
    - "submit_application"
    - "make_payment"
    - "schedule_viewing"
    - "create_listing"
  auto_execute:
    - "property_search"
    - "check_status"
    - "get_recommendations"

rate_limiting:
  requests_per_minute: 30
  requests_per_day: 500
```

---

## 5. Blockchain Integration

### 5.1 Blockchain Strategy Overview

HomeAI uses blockchain for specific high-value features requiring immutability and trustless verification. We recommend **Polygon (Ethereum L2)** for its low gas fees and Ethereum compatibility.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN INTEGRATION LAYER                      │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │  Smart Escrow   │  │  Agreement NFT  │  │  Verification   │      │
│  │  Contract       │  │  Contract       │  │  Registry       │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│           └────────────────────┼────────────────────┘                │
│                                │                                     │
│                    ┌───────────▼───────────┐                        │
│                    │  Blockchain Service   │                        │
│                    │  (Backend Component)  │                        │
│                    └───────────┬───────────┘                        │
│                                │                                     │
│           ┌────────────────────┼────────────────────┐               │
│           │                    │                    │                │
│  ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐       │
│  │  Event Listener │  │  Transaction   │  │   Index DB     │       │
│  │  (Chain Events) │  │  Submitter     │  │  (PostgreSQL)  │       │
│  └─────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Smart Contract: Escrow

The escrow smart contract handles secure fund holding for rental and purchase transactions.

```solidity
// contracts/HomeAIEscrow.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HomeAIEscrow is ReentrancyGuard, AccessControl {
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    
    enum EscrowState { Created, Funded, Released, Refunded, Disputed }
    
    struct Escrow {
        bytes32 transactionId;      // Off-chain transaction reference
        address payer;              // Tenant/Buyer
        address payee;              // Landlord/Seller
        uint256 amount;
        uint256 platformFee;
        EscrowState state;
        uint256 createdAt;
        uint256 releaseAfter;       // Auto-release timestamp
        string propertyId;          // Off-chain property reference
        string transactionType;     // "rental" | "purchase" | "service"
    }
    
    mapping(bytes32 => Escrow) public escrows;
    address public platformWallet;
    uint256 public platformFeePercent = 300; // 3% = 300 basis points
    
    event EscrowCreated(bytes32 indexed escrowId, address payer, address payee, uint256 amount);
    event EscrowFunded(bytes32 indexed escrowId, uint256 amount);
    event EscrowReleased(bytes32 indexed escrowId, address payee, uint256 amount);
    event EscrowRefunded(bytes32 indexed escrowId, address payer, uint256 amount);
    event DisputeRaised(bytes32 indexed escrowId, address initiator, string reason);
    event DisputeResolved(bytes32 indexed escrowId, address winner, uint256 amount);
    
    function createEscrow(
        bytes32 _transactionId,
        address _payee,
        string calldata _propertyId,
        string calldata _transactionType,
        uint256 _releaseAfterHours
    ) external payable nonReentrant returns (bytes32) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_payee != address(0), "Invalid payee address");
        require(_payee != msg.sender, "Cannot escrow to yourself");
        
        bytes32 escrowId = keccak256(abi.encodePacked(
            _transactionId,
            msg.sender,
            _payee,
            block.timestamp
        ));
        
        uint256 fee = (msg.value * platformFeePercent) / 10000;
        
        escrows[escrowId] = Escrow({
            transactionId: _transactionId,
            payer: msg.sender,
            payee: _payee,
            amount: msg.value - fee,
            platformFee: fee,
            state: EscrowState.Funded,
            createdAt: block.timestamp,
            releaseAfter: block.timestamp + (_releaseAfterHours * 1 hours),
            propertyId: _propertyId,
            transactionType: _transactionType
        });
        
        emit EscrowCreated(escrowId, msg.sender, _payee, msg.value);
        emit EscrowFunded(escrowId, msg.value);
        
        return escrowId;
    }
    
    function confirmAndRelease(bytes32 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");
        require(msg.sender == escrow.payer, "Only payer can confirm");
        
        escrow.state = EscrowState.Released;
        
        // Transfer to payee
        payable(escrow.payee).transfer(escrow.amount);
        // Transfer fee to platform
        payable(platformWallet).transfer(escrow.platformFee);
        
        emit EscrowReleased(_escrowId, escrow.payee, escrow.amount);
    }
    
    function autoRelease(bytes32 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");
        require(block.timestamp >= escrow.releaseAfter, "Release time not reached");
        
        escrow.state = EscrowState.Released;
        
        payable(escrow.payee).transfer(escrow.amount);
        payable(platformWallet).transfer(escrow.platformFee);
        
        emit EscrowReleased(_escrowId, escrow.payee, escrow.amount);
    }
    
    function raiseDispute(bytes32 _escrowId, string calldata _reason) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.Funded, "Invalid escrow state");
        require(
            msg.sender == escrow.payer || msg.sender == escrow.payee,
            "Not a party to this escrow"
        );
        
        escrow.state = EscrowState.Disputed;
        emit DisputeRaised(_escrowId, msg.sender, _reason);
    }
    
    function resolveDispute(
        bytes32 _escrowId,
        address _winner,
        uint256 _payerAmount,
        uint256 _payeeAmount
    ) external onlyRole(ARBITER_ROLE) nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.Disputed, "Not in dispute");
        require(
            _payerAmount + _payeeAmount == escrow.amount,
            "Amounts must equal escrow amount"
        );
        
        if (_payerAmount > 0) {
            payable(escrow.payer).transfer(_payerAmount);
        }
        if (_payeeAmount > 0) {
            payable(escrow.payee).transfer(_payeeAmount);
        }
        payable(platformWallet).transfer(escrow.platformFee);
        
        escrow.state = EscrowState.Released;
        emit DisputeResolved(_escrowId, _winner, _winner == escrow.payer ? _payerAmount : _payeeAmount);
    }
}
```

### 5.3 Smart Contract: Agreement NFT

Tenancy and purchase agreements are minted as NFTs for immutable proof of contract.

```solidity
// contracts/HomeAIAgreement.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HomeAIAgreement is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;
    
    struct Agreement {
        bytes32 agreementHash;      // Hash of the agreement document
        string agreementType;       // "tenancy" | "purchase" | "service"
        address party1;             // Landlord/Seller
        address party2;             // Tenant/Buyer
        string propertyId;          // Off-chain property reference
        uint256 startDate;
        uint256 endDate;
        uint256 value;              // Rent/Purchase price
        bool party1Signed;
        bool party2Signed;
        uint256 signedAt;
    }
    
    mapping(uint256 => Agreement) public agreements;
    mapping(bytes32 => uint256) public agreementHashToTokenId;
    
    event AgreementCreated(uint256 indexed tokenId, bytes32 agreementHash, string agreementType);
    event AgreementSigned(uint256 indexed tokenId, address signer);
    event AgreementFullySigned(uint256 indexed tokenId, uint256 signedAt);
    
    constructor() ERC721("HomeAI Agreement", "HAIA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function createAgreement(
        address _party1,
        address _party2,
        bytes32 _agreementHash,
        string calldata _agreementType,
        string calldata _propertyId,
        string calldata _tokenURI,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _value
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(agreementHashToTokenId[_agreementHash] == 0, "Agreement already exists");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        agreements[tokenId] = Agreement({
            agreementHash: _agreementHash,
            agreementType: _agreementType,
            party1: _party1,
            party2: _party2,
            propertyId: _propertyId,
            startDate: _startDate,
            endDate: _endDate,
            value: _value,
            party1Signed: false,
            party2Signed: false,
            signedAt: 0
        });
        
        agreementHashToTokenId[_agreementHash] = tokenId + 1; // +1 to distinguish from 0
        
        // Mint to the platform initially (will be transferred on full signing)
        _safeMint(address(this), tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit AgreementCreated(tokenId, _agreementHash, _agreementType);
        
        return tokenId;
    }
    
    function signAgreement(uint256 _tokenId) external {
        Agreement storage agreement = agreements[_tokenId];
        require(
            msg.sender == agreement.party1 || msg.sender == agreement.party2,
            "Not a party to this agreement"
        );
        
        if (msg.sender == agreement.party1) {
            require(!agreement.party1Signed, "Already signed");
            agreement.party1Signed = true;
        } else {
            require(!agreement.party2Signed, "Already signed");
            agreement.party2Signed = true;
        }
        
        emit AgreementSigned(_tokenId, msg.sender);
        
        if (agreement.party1Signed && agreement.party2Signed) {
            agreement.signedAt = block.timestamp;
            // Transfer NFT to party2 (tenant/buyer) as proof of agreement
            _transfer(address(this), agreement.party2, _tokenId);
            emit AgreementFullySigned(_tokenId, block.timestamp);
        }
    }
    
    function verifyAgreement(bytes32 _agreementHash) external view returns (
        bool exists,
        bool fullySigned,
        uint256 tokenId
    ) {
        uint256 storedTokenId = agreementHashToTokenId[_agreementHash];
        if (storedTokenId == 0) {
            return (false, false, 0);
        }
        
        tokenId = storedTokenId - 1;
        Agreement storage agreement = agreements[tokenId];
        exists = true;
        fullySigned = agreement.party1Signed && agreement.party2Signed;
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

### 5.4 Smart Contract: Verification Registry

Stores verification proofs on-chain for property and user verification.

```solidity
// contracts/HomeAIVerification.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HomeAIVerification is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct VerificationRecord {
        bytes32 documentHash;       // Hash of verification document
        string verificationType;    // "identity" | "property" | "cofo" | "audit"
        string entityId;            // User ID or Property ID (off-chain)
        string tier;                // "bronze" | "silver" | "gold" | "platinum"
        uint256 verifiedAt;
        uint256 expiresAt;
        address verifier;           // Address of verifier
        bool revoked;
    }
    
    mapping(bytes32 => VerificationRecord) public verifications;
    mapping(string => bytes32[]) public entityVerifications; // entityId => verification IDs
    
    event VerificationRecorded(
        bytes32 indexed verificationId,
        string entityId,
        string verificationType,
        string tier
    );
    event VerificationRevoked(bytes32 indexed verificationId, string reason);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function recordVerification(
        string calldata _entityId,
        string calldata _verificationType,
        string calldata _tier,
        bytes32 _documentHash,
        uint256 _validityDays
    ) external onlyRole(VERIFIER_ROLE) returns (bytes32) {
        bytes32 verificationId = keccak256(abi.encodePacked(
            _entityId,
            _verificationType,
            block.timestamp
        ));
        
        verifications[verificationId] = VerificationRecord({
            documentHash: _documentHash,
            verificationType: _verificationType,
            entityId: _entityId,
            tier: _tier,
            verifiedAt: block.timestamp,
            expiresAt: block.timestamp + (_validityDays * 1 days),
            verifier: msg.sender,
            revoked: false
        });
        
        entityVerifications[_entityId].push(verificationId);
        
        emit VerificationRecorded(verificationId, _entityId, _verificationType, _tier);
        
        return verificationId;
    }
    
    function revokeVerification(bytes32 _verificationId, string calldata _reason) 
        external onlyRole(VERIFIER_ROLE) 
    {
        require(!verifications[_verificationId].revoked, "Already revoked");
        verifications[_verificationId].revoked = true;
        emit VerificationRevoked(_verificationId, _reason);
    }
    
    function isVerificationValid(bytes32 _verificationId) external view returns (bool) {
        VerificationRecord storage record = verifications[_verificationId];
        return !record.revoked && block.timestamp < record.expiresAt;
    }
    
    function getEntityVerifications(string calldata _entityId) 
        external view returns (bytes32[] memory) 
    {
        return entityVerifications[_entityId];
    }
    
    function verifyDocument(bytes32 _verificationId, bytes32 _documentHash) 
        external view returns (bool) 
    {
        return verifications[_verificationId].documentHash == _documentHash;
    }
}
```

### 5.5 Blockchain Service (Backend Component)

```python
# core-backend/integrations/blockchain_service.py

from web3 import Web3
from eth_account import Account
import json

class BlockchainService:
    def __init__(self, config):
        self.w3 = Web3(Web3.HTTPProvider(config.rpc_url))
        self.escrow_contract = self.w3.eth.contract(
            address=config.escrow_address,
            abi=self._load_abi('HomeAIEscrow')
        )
        self.agreement_contract = self.w3.eth.contract(
            address=config.agreement_address,
            abi=self._load_abi('HomeAIAgreement')
        )
        self.verification_contract = self.w3.eth.contract(
            address=config.verification_address,
            abi=self._load_abi('HomeAIVerification')
        )
        self.platform_account = Account.from_key(config.private_key)
    
    async def create_escrow(
        self,
        transaction_id: str,
        payer_address: str,
        payee_address: str,
        amount_wei: int,
        property_id: str,
        transaction_type: str,
        release_hours: int = 48
    ) -> dict:
        """Create escrow on blockchain (called after off-chain payment received)"""
        
        tx = self.escrow_contract.functions.createEscrow(
            Web3.keccak(text=transaction_id),
            payee_address,
            property_id,
            transaction_type,
            release_hours
        ).build_transaction({
            'from': payer_address,
            'value': amount_wei,
            'gas': 300000,
            'nonce': self.w3.eth.get_transaction_count(payer_address)
        })
        
        # Return unsigned transaction for user to sign
        return {
            'transaction': tx,
            'escrowId': Web3.keccak(text=f"{transaction_id}{payer_address}{payee_address}")
        }
    
    async def mint_agreement_nft(
        self,
        agreement_data: dict,
        document_hash: str,
        metadata_uri: str
    ) -> dict:
        """Mint agreement NFT after document is generated"""
        
        tx = self.agreement_contract.functions.createAgreement(
            agreement_data['party1_address'],
            agreement_data['party2_address'],
            Web3.keccak(text=document_hash),
            agreement_data['type'],
            agreement_data['property_id'],
            metadata_uri,
            agreement_data['start_date'],
            agreement_data['end_date'],
            agreement_data['value']
        ).build_transaction({
            'from': self.platform_account.address,
            'gas': 500000,
            'nonce': self.w3.eth.get_transaction_count(self.platform_account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.platform_account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Extract token ID from event
        token_id = self._extract_token_id_from_receipt(receipt)
        
        return {
            'tokenId': token_id,
            'transactionHash': tx_hash.hex(),
            'contractAddress': self.agreement_contract.address
        }
    
    async def record_verification(
        self,
        entity_id: str,
        verification_type: str,
        tier: str,
        document_hash: str,
        validity_days: int
    ) -> dict:
        """Record verification on blockchain"""
        
        tx = self.verification_contract.functions.recordVerification(
            entity_id,
            verification_type,
            tier,
            Web3.keccak(text=document_hash),
            validity_days
        ).build_transaction({
            'from': self.platform_account.address,
            'gas': 200000,
            'nonce': self.w3.eth.get_transaction_count(self.platform_account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.platform_account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return {
            'transactionHash': tx_hash.hex(),
            'verificationId': Web3.keccak(text=f"{entity_id}{verification_type}")
        }
    
    async def verify_on_chain(self, verification_id: str) -> bool:
        """Check if verification is valid on-chain"""
        return self.verification_contract.functions.isVerificationValid(
            Web3.keccak(text=verification_id)
        ).call()
```

### 5.6 Blockchain Integration Points

| Feature | On-Chain Component | Trigger | Benefit |
|---------|-------------------|---------|---------|
| **Escrow Payments** | HomeAIEscrow | Payment initiated | Trustless fund holding |
| **Rental Agreements** | HomeAIAgreement (NFT) | Both parties sign | Immutable proof |
| **Purchase Agreements** | HomeAIAgreement (NFT) | Both parties sign | Ownership record |
| **Verification Records** | HomeAIVerification | Document approved | Tamper-proof verification |
| **Audit Trail** | Event logs | Any state change | Transparency |

### 5.7 Hybrid Architecture (On-Chain + Off-Chain)

```
User Action → Core Backend → Database (Fast, Detailed)
                   ↓
              Blockchain Service → Smart Contract (Immutable, Trustless)
                   ↓
              Event Listener → Sync to Database (Consistency)
```

**What stays OFF-CHAIN:**
- User profiles, preferences
- Property listings, photos, descriptions
- Chat messages
- Search queries
- Application details

**What goes ON-CHAIN:**
- Escrow fund movements
- Signed agreement hashes
- Verification proofs
- Dispute resolutions
- Payment confirmations

---

## 6. Authentication & Authorization

### 6.1 Authentication Endpoints

```
POST   /api/v1/auth/register/initiate
POST   /api/v1/auth/register/verify-email
POST   /api/v1/auth/register/complete
POST   /api/v1/auth/login
POST   /api/v1/auth/login/oauth/{provider}
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/2fa/setup
POST   /api/v1/auth/2fa/verify
POST   /api/v1/auth/2fa/disable
GET    /api/v1/auth/2fa/recovery-codes
```

### 6.2 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123abc",
    "email": "user@example.com",
    "role": "landlord",
    "permissions": ["property:read", "property:write", "tenant:read"],
    "verificationLevel": "gold",
    "iat": 1704556800,
    "exp": 1704557700,
    "jti": "token_unique_id"
  }
}
```

### 6.3 Role-Based Access Control (RBAC)

| Permission | Guest | Tenant | Landlord | Agent | Admin |
|------------|-------|--------|----------|-------|-------|
| `property:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `property:write` | - | - | ✓ | - | ✓ |
| `application:read` | - | Own | Own Properties | - | ✓ |
| `application:write` | - | ✓ | - | - | ✓ |
| `payment:read` | - | Own | Own | Own | ✓ |
| `payment:write` | - | ✓ | - | - | ✓ |
| `verification:read` | - | Own | Own | - | ✓ |
| `verification:write` | - | - | ✓ | - | ✓ |
| `job:read` | - | - | - | ✓ | ✓ |
| `job:write` | - | - | ✓ | ✓ | ✓ |
| `admin:*` | - | - | - | - | ✓ |

### 6.4 Service-to-Service Authentication

For AI Service → Core Backend communication:

```
Headers:
  X-Service-Name: ai-service
  X-Service-Key: {SERVICE_API_KEY}
  X-Request-ID: {unique_request_id}
  X-User-Token: {optional_user_jwt}  // When acting on behalf of user
```

---

## 7. User Management Service

### 7.1 Endpoints

```
GET    /api/v1/users/me
PUT    /api/v1/users/me
PUT    /api/v1/users/me/password
PUT    /api/v1/users/me/preferences
PUT    /api/v1/users/me/notification-settings
DELETE /api/v1/users/me
POST   /api/v1/users/me/avatar
GET    /api/v1/users/me/wallet
POST   /api/v1/users/me/wallet/connect

# Public profiles
GET    /api/v1/users/public/landlord/:id
GET    /api/v1/users/public/tenant/:id
GET    /api/v1/users/public/agent/:id

# Internal (service-to-service)
GET    /api/v1/internal/users/:id/context
```

### 7.2 Wallet Integration

For blockchain features, users need to connect their wallet:

```json
// POST /api/v1/users/me/wallet/connect
{
  "walletAddress": "0x1234...abcd",
  "signature": "0x...", // Signed message proving ownership
  "message": "Connect wallet to HomeAI: {nonce}"
}
```

---

## 8. Property Service

### 8.1 Endpoints

```
# Public
GET    /api/v1/properties
GET    /api/v1/properties/:id
GET    /api/v1/properties/search
GET    /api/v1/properties/featured
GET    /api/v1/properties/nearby

# Authenticated (Landlord)
POST   /api/v1/properties
PUT    /api/v1/properties/:id
DELETE /api/v1/properties/:id
PATCH  /api/v1/properties/:id/status
POST   /api/v1/properties/:id/images
DELETE /api/v1/properties/:id/images/:imageId

# Draft/Wizard
POST   /api/v1/properties/draft
PUT    /api/v1/properties/draft/:id
POST   /api/v1/properties/draft/:id/publish

# Favorites (Tenant)
GET    /api/v1/users/me/favorites
POST   /api/v1/users/me/favorites/:propertyId
DELETE /api/v1/users/me/favorites/:propertyId
```

### 8.2 Search Implementation

**Elasticsearch Mapping:**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text", "analyzer": "standard" },
      "location": { "type": "geo_point" },
      "address": {
        "type": "object",
        "properties": {
          "street": { "type": "text" },
          "city": { "type": "keyword" },
          "state": { "type": "keyword" },
          "lga": { "type": "keyword" },
          "neighborhood": { "type": "keyword" }
        }
      },
      "price": { "type": "long" },
      "priceUnit": { "type": "keyword" },
      "listingType": { "type": "keyword" },
      "propertyType": { "type": "keyword" },
      "bedrooms": { "type": "integer" },
      "bathrooms": { "type": "integer" },
      "squareFeet": { "type": "integer" },
      "amenities": { "type": "keyword" },
      "verificationTier": { "type": "keyword" },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

---

## 9. Transaction & Escrow Service

### 9.1 Endpoints

```
# Transactions
GET    /api/v1/transactions
GET    /api/v1/transactions/:id
POST   /api/v1/transactions/initiate

# Escrow
POST   /api/v1/escrow/create
GET    /api/v1/escrow/:id
POST   /api/v1/escrow/:id/confirm
POST   /api/v1/escrow/:id/dispute
GET    /api/v1/escrow/:id/status

# Payments
GET    /api/v1/payments/methods
POST   /api/v1/payments/methods
DELETE /api/v1/payments/methods/:id
POST   /api/v1/payments/process

# Landlord Financials
GET    /api/v1/landlord/financials/summary
GET    /api/v1/landlord/financials/transactions
POST   /api/v1/landlord/financials/payout

# Agent Earnings
GET    /api/v1/agent/earnings
GET    /api/v1/agent/earnings/history
POST   /api/v1/agent/earnings/withdraw
```

### 9.2 Escrow Flow with Blockchain

```
1. Tenant initiates payment → Core Backend creates transaction record
2. Payment processed via Paystack/Flutterwave → Funds received
3. Backend calls Blockchain Service → Escrow smart contract funded
4. Landlord provides keys → Tenant confirms move-in
5. Backend calls Blockchain Service → Escrow released
6. If dispute → Arbiter resolves on-chain
```

---

## 10. Verification Service

### 10.1 Endpoints

```
# User Verification
GET    /api/v1/verification/status
POST   /api/v1/verification/identity
POST   /api/v1/verification/address

# Property Verification
GET    /api/v1/verification/properties
GET    /api/v1/verification/properties/:propertyId
POST   /api/v1/verification/properties/:propertyId/cofo
POST   /api/v1/verification/properties/:propertyId/audit/request
GET    /api/v1/verification/properties/:propertyId/audit

# Admin
GET    /api/v1/admin/verifications/pending
POST   /api/v1/admin/verifications/:id/approve
POST   /api/v1/admin/verifications/:id/reject
```

### 10.2 Verification with Blockchain Recording

When verification is approved:

```python
async def approve_verification(verification_id: str, admin_id: str):
    verification = await db.verifications.find_one({"_id": verification_id})
    
    # Update database
    verification.status = "approved"
    verification.approved_by = admin_id
    verification.approved_at = datetime.utcnow()
    await db.verifications.save(verification)
    
    # Record on blockchain
    document_hash = hash_document(verification.document_url)
    blockchain_result = await blockchain_service.record_verification(
        entity_id=verification.entity_id,
        verification_type=verification.type,
        tier=calculate_tier(verification),
        document_hash=document_hash,
        validity_days=365
    )
    
    # Store blockchain reference
    verification.blockchain_tx = blockchain_result['transactionHash']
    verification.blockchain_verification_id = blockchain_result['verificationId']
    await db.verifications.save(verification)
    
    # Emit event
    await event_bus.publish('verification.approved', verification)
```

---

## 11. Agent Service

### 11.1 Endpoints

```
# Job Board
GET    /api/v1/agent/jobs
GET    /api/v1/agent/jobs/:id
POST   /api/v1/agent/jobs/:id/accept
POST   /api/v1/agent/jobs/:id/decline

# My Jobs
GET    /api/v1/agent/my-jobs
GET    /api/v1/agent/my-jobs/:id
PUT    /api/v1/agent/my-jobs/:id/status
POST   /api/v1/agent/my-jobs/:id/complete

# Schedule
GET    /api/v1/agent/schedule
PUT    /api/v1/agent/availability

# Profile
GET    /api/v1/agent/profile
PUT    /api/v1/agent/profile
GET    /api/v1/agent/reviews

# Landlord creates jobs
POST   /api/v1/landlord/jobs
GET    /api/v1/landlord/jobs
```

---

## 12. Messaging & Notification Service

### 12.1 Endpoints

```
# Conversations
GET    /api/v1/messages/conversations
GET    /api/v1/messages/conversations/:id
POST   /api/v1/messages/conversations
POST   /api/v1/messages/conversations/:id/messages
PUT    /api/v1/messages/conversations/:id/read

# Notifications
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id

# Push Registration
POST   /api/v1/notifications/devices
DELETE /api/v1/notifications/devices/:deviceId
PUT    /api/v1/notifications/preferences
```

### 12.2 WebSocket Events

```
Connection: wss://api.homeai.ng/ws?token={jwt}

Events:
- message.new          // New chat message
- message.read         // Message read receipt
- notification.new     // New notification
- property.update      // Saved property updated
- application.update   // Application status changed
- escrow.update        // Escrow status changed
- ai.response          // AI response ready (for long operations)
```

---

## 13. Database Schema

### 13.1 Core Tables (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('tenant', 'landlord', 'agent', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    wallet_address VARCHAR(42),
    verification_level VARCHAR(20) DEFAULT 'unverified',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles (role-specific data)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    listing_type VARCHAR(20) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    price_unit VARCHAR(20) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    year_built INTEGER,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip VARCHAR(20),
    address_lga VARCHAR(100),
    address_neighborhood VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    amenities TEXT[],
    status VARCHAR(20) DEFAULT 'draft',
    verification_tier VARCHAR(20) DEFAULT 'unverified',
    blockchain_verification_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Images
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    tenant_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'pending',
    personal_info JSONB,
    employment_info JSONB,
    documents JSONB,
    move_in_date DATE,
    lease_term INTEGER,
    additional_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leases
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    tenant_id UUID REFERENCES users(id),
    landlord_id UUID REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(15, 2) NOT NULL,
    security_deposit DECIMAL(15, 2),
    terms JSONB,
    status VARCHAR(30) DEFAULT 'draft',
    document_url TEXT,
    signed_by_tenant BOOLEAN DEFAULT false,
    signed_by_landlord BOOLEAN DEFAULT false,
    blockchain_token_id INTEGER,
    blockchain_tx_hash VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL,
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(30) DEFAULT 'pending',
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    escrow_id VARCHAR(100),
    blockchain_tx_hash VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escrows
CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    platform_fee DECIMAL(15, 2),
    status VARCHAR(30) DEFAULT 'created',
    release_after TIMESTAMP,
    blockchain_escrow_id VARCHAR(100),
    blockchain_tx_hash VARCHAR(100),
    confirmed_at TIMESTAMP,
    released_at TIMESTAMP,
    disputed_at TIMESTAMP,
    dispute_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifications
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    type VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    document_url TEXT,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    blockchain_verification_id VARCHAR(100),
    blockchain_tx_hash VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    tenant_id UUID REFERENCES users(id),
    assigned_agent_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(30) DEFAULT 'submitted',
    images TEXT[],
    scheduled_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Jobs
CREATE TABLE agent_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    property_id UUID REFERENCES properties(id),
    requester_id UUID REFERENCES users(id),
    assigned_agent_id UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    earnings DECIMAL(10, 2),
    scheduled_date TIMESTAMP,
    notes TEXT,
    completion_evidence JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) DEFAULT 'direct',
    property_id UUID REFERENCES properties(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);

-- Indexes
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_location ON properties(address_city, address_lga);
CREATE INDEX idx_applications_property ON applications(property_id);
CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_payee ON transactions(payee_id);
CREATE INDEX idx_verifications_user ON verifications(user_id);
CREATE INDEX idx_verifications_property ON verifications(property_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

### 13.2 AI Service Collections (MongoDB)

```javascript
// conversations collection
{
  _id: ObjectId,
  sessionId: String,
  userId: String,
  startedAt: Date,
  lastActivityAt: Date,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: Date,
      intent: String,
      entities: Object,
      actionTaken: String
    }
  ],
  context: {
    currentScreen: String,
    propertyId: String,
    searchHistory: Array
  }
}

// ai_interactions collection (for analytics)
{
  _id: ObjectId,
  userId: String,
  sessionId: String,
  input: String,
  intent: String,
  confidence: Number,
  entities: Object,
  response: String,
  actionExecuted: String,
  processingTimeMs: Number,
  timestamp: Date
}

// feedback collection
{
  _id: ObjectId,
  interactionId: String,
  userId: String,
  rating: Number,
  feedback: String,
  timestamp: Date
}
```

---

## 14. External Integrations

### 14.1 Integration Matrix

| Service | Provider | Purpose | Module |
|---------|----------|---------|--------|
| **Payment Processing** | Paystack | NGN payments | Transaction Service |
| **Payment Processing** | Flutterwave | Backup + International | Transaction Service |
| **Identity Verification** | Smile Identity / Verified.me | NIN verification | Verification Service |
| **SMS** | Africa's Talking | OTP, notifications | Notification Service |
| **Email** | SendGrid | Transactional email | Notification Service |
| **Push Notifications** | Firebase Cloud Messaging | Mobile push | Notification Service |
| **Maps** | Google Maps Platform | Geocoding, places | Property Service |
| **Storage** | AWS S3 | File storage | Core Backend |
| **CDN** | CloudFront | Asset delivery | Core Backend |
| **AI/LLM** | Anthropic Claude | AI assistant | AI Service |
| **Blockchain** | Polygon (Alchemy/Infura) | Smart contracts | Blockchain Service |
| **Background Jobs** | Redis + Bull | Job queues | All Services |

### 14.2 External API Wrapper Pattern

```typescript
// integrations/paystack/paystack.service.ts

@Injectable()
export class PaystackService {
  private readonly client: AxiosInstance;

  constructor(private config: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${config.get('PAYSTACK_SECRET_KEY')}`,
      },
    });
  }

  async initializeTransaction(data: InitializeTransactionDto): Promise<PaystackResponse> {
    const response = await this.client.post('/transaction/initialize', {
      email: data.email,
      amount: data.amount * 100, // Convert to kobo
      reference: data.reference,
      callback_url: data.callbackUrl,
      metadata: data.metadata,
    });
    return response.data;
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const response = await this.client.get(`/transaction/verify/${reference}`);
    return response.data;
  }

  async createTransferRecipient(data: TransferRecipientDto): Promise<PaystackResponse> {
    const response = await this.client.post('/transferrecipient', data);
    return response.data;
  }

  async initiateTransfer(data: InitiateTransferDto): Promise<PaystackResponse> {
    const response = await this.client.post('/transfer', data);
    return response.data;
  }
}
```

---

## 15. API Gateway & Inter-Service Communication

### 15.1 API Gateway Configuration (Kong)

```yaml
# kong.yaml
_format_version: "3.0"

services:
  - name: core-backend
    url: http://core-backend:3000
    routes:
      - name: core-routes
        paths:
          - /api/v1
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: jwt
        config:
          claims_to_verify:
            - exp

  - name: ai-backend
    url: http://ai-backend:8000
    routes:
      - name: ai-routes
        paths:
          - /ai/v1
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 30
          policy: local
      - name: jwt
        config:
          claims_to_verify:
            - exp

plugins:
  - name: cors
    config:
      origins:
        - https://homeai.ng
        - https://app.homeai.ng
      methods:
        - GET
        - POST
        - PUT
        - DELETE
        - PATCH
      headers:
        - Authorization
        - Content-Type
      exposed_headers:
        - X-Request-Id
      max_age: 3600
```

### 15.2 Service Mesh Communication

```yaml
# Internal service communication
AI Service → Core Backend:
  Protocol: HTTP/REST
  Authentication: Service API Key
  Endpoints Used:
    - GET /api/v1/properties/search
    - POST /api/v1/applications
    - GET /api/v1/users/{id}/context (internal)
    - POST /api/v1/transactions/initiate

Core Backend → Blockchain Service:
  Protocol: gRPC (or HTTP/REST)
  Authentication: Internal mTLS
  Operations:
    - CreateEscrow
    - ConfirmEscrow
    - MintAgreementNFT
    - RecordVerification

Core Backend → Notification Service:
  Protocol: Message Queue (RabbitMQ)
  Topics:
    - notification.email
    - notification.sms
    - notification.push
```

---

## 16. Security Requirements

### 16.1 Security Checklist

| Category | Requirement | Implementation |
|----------|-------------|----------------|
| **Transport** | TLS 1.3 only | Load balancer config |
| **Authentication** | JWT with RS256 | Auth service |
| **Authorization** | RBAC + ABAC | Permission guards |
| **Rate Limiting** | Per-user, per-IP | API Gateway |
| **Input Validation** | Schema validation | DTO validators |
| **SQL Injection** | Parameterized queries | ORM (Prisma/TypeORM) |
| **XSS** | Output encoding | Response sanitization |
| **CSRF** | Token validation | Cookie settings |
| **Encryption at Rest** | AES-256 | Database encryption |
| **Secrets Management** | AWS Secrets Manager | Config service |
| **Audit Logging** | All sensitive operations | Audit service |
| **Penetration Testing** | Quarterly | External vendor |
| **Compliance** | NDPR, PCI DSS | Compliance module |

### 16.2 Data Classification

| Classification | Examples | Encryption | Retention |
|---------------|----------|------------|-----------|
| **Public** | Property listings, public profiles | TLS only | Indefinite |
| **Internal** | User preferences, search history | TLS + encrypted at rest | 2 years |
| **Confidential** | NIN, payment info, documents | TLS + AES-256 + tokenized | Per regulation |
| **Restricted** | Passwords, API keys, private keys | Hashed/HSM | N/A |

---

## 17. Infrastructure & DevOps

### 17.1 Environment Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
│  Region: AWS eu-west-1 (Dublin) + af-south-1 (Cape Town)        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ EKS Cluster  │  │ RDS Postgres │  │ ElastiCache  │          │
│  │ (3 nodes)    │  │ (Multi-AZ)   │  │ (Redis)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ OpenSearch   │  │ S3 + CDN     │  │ MongoDB Atlas│          │
│  │              │  │              │  │ (AI Logs)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         STAGING                                  │
│  Region: AWS eu-west-1                                          │
│  (Scaled-down version of production)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       DEVELOPMENT                                │
│  Local: Docker Compose                                          │
│  CI/CD: GitHub Actions                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 17.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t homeai/${{ github.event.repository.name }}:${{ github.sha }} .
      - name: Push to ECR
        run: docker push ...

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: kubectl apply -f k8s/staging/

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: kubectl apply -f k8s/production/
```

---

## 18. Implementation Phases

### Phase 1: Foundation (Weeks 1-6)

**Week 1-2: Infrastructure Setup**
- [ ] Set up AWS infrastructure (VPC, EKS, RDS, Redis)
- [ ] Configure CI/CD pipelines
- [ ] Set up monitoring (CloudWatch, Grafana)
- [ ] Deploy API Gateway

**Week 3-4: Core Services**
- [ ] Auth Service (registration, login, JWT, 2FA)
- [ ] User Service (profiles, preferences)
- [ ] Basic Property Service (CRUD)

**Week 5-6: Search & Storage**
- [ ] Elasticsearch setup and indexing
- [ ] S3 + CDN for media
- [ ] Property search implementation

### Phase 2: Transactions (Weeks 7-10)

**Week 7-8: Payment Integration**
- [ ] Paystack integration
- [ ] Transaction Service
- [ ] Basic escrow (off-chain)

**Week 9-10: Applications & Leases**
- [ ] Application Service
- [ ] Lease Service
- [ ] Smart agreement generation

### Phase 3: AI Service (Weeks 11-14)

**Week 11-12: AI Foundation**
- [ ] AI Service setup (FastAPI)
- [ ] Claude API integration
- [ ] Intent classification
- [ ] Property search via AI

**Week 13-14: AI Actions**
- [ ] Action executor
- [ ] Core Backend client
- [ ] Confirmation flow
- [ ] Voice input

### Phase 4: Verification & Agents (Weeks 15-18)

**Week 15-16: Verification**
- [ ] Verification Service
- [ ] NIN integration
- [ ] Document upload & review
- [ ] Tier calculation

**Week 17-18: Agent Service**
- [ ] Agent jobs board
- [ ] Job assignment
- [ ] Earnings & payouts

### Phase 5: Blockchain (Weeks 19-22)

**Week 19-20: Smart Contracts**
- [ ] Deploy contracts to Polygon testnet
- [ ] Escrow contract
- [ ] Agreement NFT contract
- [ ] Verification registry

**Week 21-22: Integration**
- [ ] Blockchain Service
- [ ] Escrow flow with blockchain
- [ ] Agreement minting
- [ ] Verification recording

### Phase 6: Polish & Launch (Weeks 23-26)

**Week 23-24: Testing & Security**
- [ ] Load testing
- [ ] Security audit
- [ ] Penetration testing
- [ ] Bug fixes

**Week 25-26: Launch**
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation
- [ ] Go-live!

---

## Appendix A: API Documentation

Full OpenAPI/Swagger documentation will be available at:
- Development: `http://localhost:3000/api/docs`
- Staging: `https://api.staging.homeai.ng/docs`
- Production: `https://api.homeai.ng/docs`

## Appendix B: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Token expired |
| `AUTH_003` | 403 | Insufficient permissions |
| `AUTH_004` | 400 | 2FA required |
| `USER_001` | 404 | User not found |
| `USER_002` | 409 | Email already exists |
| `PROP_001` | 404 | Property not found |
| `PROP_002` | 403 | Not property owner |
| `TXN_001` | 400 | Invalid payment amount |
| `TXN_002` | 402 | Payment failed |
| `ESC_001` | 400 | Escrow not in valid state |
| `VER_001` | 400 | Invalid document |
| `AI_001` | 500 | AI service unavailable |
| `BC_001` | 500 | Blockchain transaction failed |

---

*Document Version 1.0 | January 2026 | HomeAI Nigeria Backend Team*
