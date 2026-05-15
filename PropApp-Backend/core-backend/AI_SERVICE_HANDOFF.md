# AI Service Developer Handoff

This document provides everything needed to build the HomeAI AI Assistant service—an intelligent agent capable of performing almost any action a user can do on the platform.

---

## Vision

The AI Assistant acts as a **personal real estate concierge** that can:
- Answer questions about properties, leases, and payments
- Execute actions on behalf of users (search, apply, pay, message)
- Provide personalized recommendations
- Handle complex multi-step workflows
- Operate via chat, voice, or automated triggers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│   Chat UI  │  Voice Input  │  Quick Actions  │  Suggestions     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Gateway Service                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Intent       │  │ Context      │  │ Action               │  │
│  │ Recognition  │──│ Management   │──│ Executor             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                 │                    │                │
│         ▼                 ▼                    ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ LLM Provider │  │ User Session │  │ Backend API Client   │  │
│  │ (OpenAI/etc) │  │ & Preferences│  │ (Internal Actions)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Core Backend API                              │
│   Properties │ Leases │ Payments │ Messages │ Verification      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Capabilities Matrix

### Tenant Actions

| Action | Natural Language Example | API Endpoint |
|--------|--------------------------|--------------|
| Search properties | "Find me a 3-bedroom apartment in Lekki under 2M" | `GET /properties/search` |
| View property details | "Tell me more about this property" | `GET /properties/:id` |
| Save property | "Save this to my favorites" | `POST /users/me/favorites/:id` |
| Apply for property | "I want to apply for this apartment" | `POST /tenant/applications` |
| Check application status | "What's the status of my applications?" | `GET /tenant/applications` |
| Make payment | "Pay my rent for this month" | `POST /transactions/pay` |
| View payment history | "Show me my payment history" | `GET /transactions` |
| Submit maintenance | "Report a broken AC in my apartment" | `POST /maintenance` |
| Message landlord | "Message the landlord about the viewing" | `POST /messages/conversations/:id` |
| Check lease details | "When does my lease expire?" | `GET /leases/:id` |

### Landlord Actions

| Action | Natural Language Example | API Endpoint |
|--------|--------------------------|--------------|
| List property | "List my new 2-bedroom in Ikoyi for 1.5M/year" | `POST /properties` |
| Update property | "Change the price to 1.8M" | `PUT /properties/:id` |
| View applicants | "Show me who applied for my VI property" | `GET /landlord/applicants` |
| Approve applicant | "Approve the first applicant" | `PUT /landlord/applicants/:id/approve` |
| Create lease | "Create a 12-month lease for the approved tenant" | `POST /leases` |
| Check financials | "How much rent did I collect this month?" | `GET /landlord/financials` |
| Request payout | "Withdraw my available balance" | `POST /landlord/financials/payout` |
| Hire agent | "Get an agent to show the property tomorrow" | `POST /landlord/jobs` |

### Agent Actions

| Action | Natural Language Example | API Endpoint |
|--------|--------------------------|--------------|
| View available jobs | "Show me available jobs near me" | `GET /agent/jobs` |
| Accept job | "Accept the viewing job at Lekki" | `POST /agent/jobs/:id/accept` |
| Complete job | "Mark the inspection as complete" | `PUT /agent/jobs/:id/complete` |
| Check earnings | "How much have I earned this week?" | `GET /agent/earnings` |
| Withdraw earnings | "Withdraw 50,000 to my bank account" | `POST /agent/earnings/withdraw` |

---

## Core Components

### 1. Intent Recognition

Classify user input into actionable intents:

```typescript
interface Intent {
    action: string;           // e.g., "search_properties", "make_payment"
    entities: {
        propertyType?: string;
        location?: string;
        priceRange?: { min: number; max: number };
        bedrooms?: number;
        amount?: number;
        // ... other extracted entities
    };
    confidence: number;       // 0-1
    requiresConfirmation: boolean;  // For destructive actions
}
```

**Implementation Options**:
- OpenAI Function Calling (recommended)
- Fine-tuned classification model
- Hybrid: LLM + rule-based extraction

### 2. Context Management

Maintain conversation context and user state:

```typescript
interface ConversationContext {
    userId: string;
    sessionId: string;
    role: 'TENANT' | 'LANDLORD' | 'AGENT';
    
    // Conversation memory
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
    }>;
    
    // Current focus
    currentProperty?: Property;
    currentLease?: Lease;
    currentApplication?: Application;
    
    // User preferences (learned over time)
    preferences: {
        preferredLocations: string[];
        budgetRange: { min: number; max: number };
        propertyTypes: string[];
    };
}
```

### 3. Action Executor

Execute actions against the backend API:

```typescript
interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    requiresFollowUp?: boolean;
    suggestedNextActions?: string[];
}

class ActionExecutor {
    private apiClient: BackendAPIClient;
    private userToken: string;

    async execute(intent: Intent, context: ConversationContext): Promise<ActionResult> {
        switch (intent.action) {
            case 'search_properties':
                return this.searchProperties(intent.entities);
            case 'apply_for_property':
                return this.applyForProperty(intent.entities, context);
            case 'make_payment':
                return this.initiatePayment(intent.entities, context);
            // ... other actions
        }
    }
}
```

### 4. Response Generator

Generate natural language responses:

```typescript
interface Response {
    text: string;                    // Natural language response
    richContent?: {
        type: 'property_card' | 'payment_summary' | 'lease_details';
        data: any;
    };
    quickActions?: Array<{
        label: string;
        action: string;
    }>;
    requiresInput?: boolean;
}
```

---

## Safety & Guardrails

### Action Confirmation

High-risk actions require explicit confirmation:

| Action | Risk Level | Confirmation Required |
|--------|------------|----------------------|
| Search properties | Low | No |
| Save property | Low | No |
| Apply for property | Medium | Yes |
| Make payment | High | Yes (2-step) |
| Approve applicant | High | Yes |
| Create lease | High | Yes |
| Request payout | High | Yes |

### Confirmation Flow

```
User: "Pay my rent"
AI: "I'll process your rent payment of ₦250,000 for January 2024 
     to [Landlord Name]. Should I proceed?"
     
     [Confirm Payment] [Cancel]
     
User: [Confirm Payment]
AI: "Payment initiated! You'll receive a confirmation once complete.
     Transaction reference: PAY_123456"
```

### Spending Limits

```typescript
interface SafetyLimits {
    maxSinglePayment: number;        // e.g., 5,000,000 NGN
    maxDailySpending: number;        // e.g., 10,000,000 NGN
    requiresPinForPayments: boolean;
    requiresBiometricConfirmation: boolean;
}
```

### Action Audit Log

Every AI-executed action must be logged:

```typescript
interface AIActionLog {
    id: string;
    userId: string;
    sessionId: string;
    intent: Intent;
    action: string;
    parameters: Record<string, any>;
    result: ActionResult;
    timestamp: Date;
    userConfirmed: boolean;
}
```

---

## Backend API Client

The AI service needs an internal API client to call backend endpoints:

```typescript
class BackendAPIClient {
    private baseUrl: string;
    private serviceToken: string;  // Internal service-to-service auth

    constructor(config: { baseUrl: string; serviceToken: string }) {
        this.baseUrl = config.baseUrl;
        this.serviceToken = config.serviceToken;
    }

    // Execute action on behalf of user
    async executeAsUser<T>(
        userId: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data?: any
    ): Promise<T> {
        return this.request({
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'X-Service-Auth': this.serviceToken,
                'X-On-Behalf-Of': userId,  // Impersonation header
            },
            data,
        });
    }
}
```

### Service Authentication

The AI service authenticates with a special service token:

```env
AI_SERVICE_TOKEN=<internal-service-token>
AI_SERVICE_ALLOWED_ACTIONS=search,apply,pay,message
```

Backend validates:
```typescript
// Middleware to validate AI service requests
function validateAIServiceRequest(req, res, next) {
    const serviceToken = req.headers['x-service-auth'];
    const onBehalfOf = req.headers['x-on-behalf-of'];

    if (serviceToken !== env.AI_SERVICE_TOKEN) {
        return res.status(401).json({ error: 'Invalid service token' });
    }

    // Load user context for the on-behalf-of user
    req.userId = onBehalfOf;
    req.isAIAction = true;
    next();
}
```

---

## LLM Integration

### Recommended: OpenAI Function Calling

```typescript
const functions = [
    {
        name: "search_properties",
        description: "Search for properties based on criteria",
        parameters: {
            type: "object",
            properties: {
                propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "DUPLEX"] },
                listingType: { type: "string", enum: ["RENT", "SALE", "SHORT_LET"] },
                city: { type: "string" },
                minPrice: { type: "number" },
                maxPrice: { type: "number" },
                bedrooms: { type: "number" },
            },
        },
    },
    {
        name: "apply_for_property",
        description: "Submit an application for a property",
        parameters: {
            type: "object",
            properties: {
                propertyId: { type: "string" },
                message: { type: "string" },
                moveInDate: { type: "string", format: "date" },
            },
            required: ["propertyId"],
        },
    },
    // ... define all 30+ functions
];
```

### System Prompt Template

```
You are HomeAI Assistant, a helpful real estate concierge for the HomeAI platform in Nigeria.

Current User Context:
- Role: {user.role}
- Name: {user.firstName}
- Verification Level: {user.verificationLevel}
- Active Lease: {user.currentLease ? 'Yes' : 'No'}

Your capabilities:
- Search and recommend properties
- Help with rental applications
- Process payments
- Answer questions about leases and transactions
- Connect users with landlords/agents
- Report and track maintenance issues

Guidelines:
1. Be conversational and helpful
2. Always confirm before executing payments or applications
3. Respect the user's role (tenants can't list properties)
4. Provide specific, actionable information
5. If unsure, ask clarifying questions
6. Use Naira (₦) for all prices
```

---

## Conversation Examples

### Property Search (Tenant)

```
User: "I need a 3-bedroom in Lekki, budget around 2 million"

AI: I found 5 properties matching your criteria in Lekki:

🏠 **Sunset Apartments** - Lekki Phase 1
   3 bed, 2 bath | ₦1,800,000/year | Gold Verified
   [View Details] [Save] [Apply]

🏠 **Ocean View Residences** - Lekki
   3 bed, 3 bath | ₦2,200,000/year | Platinum Verified
   [View Details] [Save] [Apply]

Would you like more details on any of these?
```

### Payment (Tenant)

```
User: "Pay my rent"

AI: I'll help you pay your January 2024 rent.

📋 **Payment Summary**
   Property: Harmony Place, Ikoyi
   Amount: ₦250,000
   Due Date: January 5, 2024
   Landlord: Mr. Chinedu Okoro

Would you like to proceed with this payment?
[Pay Now] [Pay Later] [Cancel]

User: [Pay Now]

AI: Perfect! I'm redirecting you to complete the payment securely.
    You'll receive a confirmation once the payment is processed.
```

### Listing Property (Landlord)

```
User: "I want to list my apartment in Victoria Island"

AI: Great! Let me help you list your property. I'll need a few details:

1. What type of property is it?
   [Apartment] [House] [Duplex] [Studio]

User: [Apartment]

AI: How many bedrooms and bathrooms?

User: "2 bedrooms, 2 bathrooms"

AI: What's your asking price per year?

User: "3.5 million naira"

AI: Here's your listing preview:

🏠 **New Apartment Listing**
   📍 Victoria Island, Lagos
   🛏️ 2 bedrooms, 2 bathrooms
   💰 ₦3,500,000/year

Would you like to add photos now or save as draft?
[Add Photos] [Save as Draft] [Edit Details]
```

---

## Technical Requirements

### Service Stack
- **Runtime**: Node.js or Python
- **LLM Provider**: OpenAI GPT-4 / Anthropic Claude
- **Vector Database**: Pinecone / Weaviate (for semantic search)
- **Cache**: Redis (for session management)
- **Queue**: Bull / RabbitMQ (for async actions)

### Environment Variables
```env
# LLM
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4-turbo-preview

# Backend Connection
BACKEND_API_URL=http://localhost:3000/api/v1
AI_SERVICE_TOKEN=xxx

# Session Storage
REDIS_URL=redis://localhost:6379

# Safety
MAX_TOKENS_PER_REQUEST=2000
CONVERSATION_HISTORY_LIMIT=20
```

---

## API Endpoints to Expose

The AI service should expose:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/chat` | POST | Send message, get response |
| `/ai/chat/stream` | POST | Streaming response (SSE) |
| `/ai/voice` | POST | Voice input (audio → text → response) |
| `/ai/suggestions` | GET | Context-aware suggestions |
| `/ai/actions/confirm/:actionId` | POST | Confirm pending action |
| `/ai/actions/cancel/:actionId` | POST | Cancel pending action |
| `/ai/history` | GET | Get conversation history |

---

## Implementation Phases

### Phase 1: Basic Chat (Week 1-2)
- Intent recognition for top 10 actions
- Property search integration
- Basic conversation flow
- Text responses only

### Phase 2: Full Actions (Week 3-4)
- All tenant/landlord/agent actions
- Confirmation flows
- Rich responses (cards, buttons)
- Action logging

### Phase 3: Intelligence (Week 5-6)
- Personalized recommendations
- Learning user preferences
- Proactive suggestions
- Multi-turn complex workflows

### Phase 4: Polish (Week 7-8)
- Voice input/output
- Performance optimization
- Edge case handling
- Production hardening

---

## Testing Strategy

1. **Unit Tests**: Each action executor
2. **Intent Tests**: Classification accuracy
3. **E2E Tests**: Full conversation flows
4. **Safety Tests**: Guardrail verification
5. **Load Tests**: Concurrent users

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Intent accuracy | >95% |
| Action success rate | >98% |
| Avg response time | <2s |
| User satisfaction | >4.5/5 |
| Actions requiring human handoff | <5% |

---

## Contact & Questions

For backend API questions, refer to:
- `README.md` - Complete API documentation
- `PRODUCTION_CHECKLIST.md` - Deployment requirements
- Backend team contact: [TBD]
