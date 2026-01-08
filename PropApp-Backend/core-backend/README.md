# HomeAI Nigeria - Core Backend

A comprehensive property rental platform backend built with Express, TypeScript, Prisma, and PostgreSQL.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Docker services (PostgreSQL + Redis)
npm run docker:up

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## 📁 Project Structure

```
core-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── common/
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   └── utils/             # Logger, response helpers, error classes
│   ├── config/
│   │   ├── env.ts             # Environment validation (Zod)
│   │   ├── database.ts        # Prisma client
│   │   └── regions/           # Multi-region configuration
│   ├── integrations/
│   │   ├── payment/           # Payment provider abstraction
│   │   └── communication/     # Email, SMS, Push abstraction
│   ├── modules/
│   │   ├── auth/              # Authentication (JWT, OAuth, 2FA)
│   │   ├── users/             # User profiles, preferences, wallet
│   │   ├── properties/        # Property CRUD, search, favorites
│   │   ├── landlord/          # Landlord dashboard, applicants, financials
│   │   └── ...                # Other modules
│   └── index.ts               # Express app entry point
└── tests/
    └── unit/                  # Jest unit tests
```

## 🔐 Authentication

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/initiate` | Start registration |
| POST | `/api/v1/auth/register/verify-email` | Verify email code |
| POST | `/api/v1/auth/register/complete` | Complete registration |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/login/oauth/:provider` | OAuth login (Google, Apple, Facebook) |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/2fa/setup` | Setup 2FA |
| POST | `/api/v1/auth/2fa/verify` | Verify and enable 2FA |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA |
| GET | `/api/v1/auth/2fa/recovery-codes` | Get recovery codes |

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "TENANT|LANDLORD|AGENT|ADMIN",
  "permissions": ["property:read", "application:write"],
  "verificationLevel": "BRONZE|SILVER|GOLD|PLATINUM",
  "regionCode": "NG"
}
```

### Base URL
```
Development: http://localhost:3000/api/v1
Production:  https://api.homeai.ng/api/v1
```

### Authorization Header
All authenticated endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Request Examples

**Register (Initiate)**
```bash
POST /api/v1/auth/register/initiate
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "TENANT"
}
```

**Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpcy...",
    "expiresIn": 900,
    "user": { "id": "uuid", "email": "...", "role": "TENANT" }
  }
}
```

**Create Property**
```bash
POST /api/v1/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Luxury 3BR Apartment",
  "description": "Beautiful apartment in Lekki Phase 1",
  "propertyType": "APARTMENT",
  "listingType": "RENT",
  "price": 2500000,
  "priceUnit": "PER_YEAR",
  "bedrooms": 3,
  "bathrooms": 2,
  "addressStreet": "123 Admiralty Way",
  "addressCity": "Lekki",
  "addressState": "Lagos",
  "addressLga": "Eti-Osa",
  "amenities": ["SWIMMING_POOL", "GYM", "PARKING"]
}
```

**Initiate Payment**
```bash
POST /api/v1/transactions/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2500000,
  "currency": "NGN",
  "type": "RENT_PAYMENT",
  "paymentMethod": "card",
  "leaseId": "uuid-of-lease"
}

# Response:
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "paymentUrl": "https://checkout.paystack.com/...",
    "reference": "PAY_1234567890_abc123",
    "provider": "paystack"
  }
}
```

## 👤 User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |
| PUT | `/api/v1/users/me` | Update profile |
| PUT | `/api/v1/users/me/password` | Change password |
| PUT | `/api/v1/users/me/preferences` | Update preferences |
| PUT | `/api/v1/users/me/notification-settings` | Notification settings |
| DELETE | `/api/v1/users/me` | Delete account |
| POST | `/api/v1/users/me/avatar` | Upload avatar |
| GET | `/api/v1/users/me/wallet` | Get wallet info |
| POST | `/api/v1/users/me/wallet/connect` | Connect blockchain wallet |
| GET | `/api/v1/users/me/favorites` | Get saved properties |
| POST | `/api/v1/users/me/favorites/:propertyId` | Save property |
| DELETE | `/api/v1/users/me/favorites/:propertyId` | Remove from favorites |
| GET | `/api/v1/users/public/landlord/:id` | Public landlord profile |
| GET | `/api/v1/users/public/tenant/:id` | Public tenant profile |
| GET | `/api/v1/users/public/agent/:id` | Public agent profile |

## 🏠 Property Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/properties` | List properties (with filters) |
| GET | `/api/v1/properties/search` | Search properties |
| GET | `/api/v1/properties/featured` | Get featured properties |
| GET | `/api/v1/properties/nearby` | Get nearby properties |
| GET | `/api/v1/properties/:id` | Get property details |
| POST | `/api/v1/properties` | Create property |
| PUT | `/api/v1/properties/:id` | Update property |
| DELETE | `/api/v1/properties/:id` | Delete property |
| PATCH | `/api/v1/properties/:id/status` | Update status |
| POST | `/api/v1/properties/:id/media` | Upload media (images, videos, 3D tours) |
| DELETE | `/api/v1/properties/:id/media/:mediaId` | Delete media |
| POST | `/api/v1/properties/draft` | Create draft |
| PUT | `/api/v1/properties/draft/:id` | Update draft |
| POST | `/api/v1/properties/draft/:id/publish` | Publish draft |

### Property Media Types
Properties support multiple media types via the `PropertyMedia` model:

| Type | Description | Example URL |
|------|-------------|-------------|
| `IMAGE` | Property photos | Standard image URLs |
| `VIDEO` | Video tours | YouTube, Vimeo, direct video URLs |
| `TOUR_3D` | 3D virtual tours | Matterport, CloudPano embeds |
| `FLOOR_PLAN` | Floor plan images | Layout diagrams |
| `DOCUMENT` | Property documents | PDFs, certificates |

Media object structure:
```json
{
  "id": "uuid",
  "url": "https://example.com/media.jpg",
  "type": "IMAGE",
  "isPrimary": true,
  "caption": "Living room view",
  "orderIndex": 0,
  "metadata": { "provider": "matterport", "embedCode": "..." }
}
```


### Search Query Parameters
- `propertyType`: APARTMENT, HOUSE, DUPLEX, etc.
- `listingType`: RENT, SALE, SHORT_LET
- `minPrice`, `maxPrice`: Price range
- `bedrooms`, `bathrooms`: Room count
- `city`, `state`, `lga`, `neighborhood`: Location filters
- `verificationTier`: BRONZE, SILVER, GOLD, PLATINUM
- `sortBy`: price, createdAt, bedrooms
- `sortOrder`: asc, desc

## 📊 Landlord Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/landlord/dashboard` | Dashboard stats |
| GET | `/api/v1/landlord/properties` | My properties |
| GET | `/api/v1/landlord/applicants` | Pending applicants |
| GET | `/api/v1/landlord/applicants/:id` | Applicant details |
| PUT | `/api/v1/landlord/applicants/:id/approve` | Approve applicant |
| PUT | `/api/v1/landlord/applicants/:id/reject` | Reject applicant |
| GET | `/api/v1/landlord/financials` | Financial overview |
| GET | `/api/v1/landlord/financials/summary` | Financial summary |
| GET | `/api/v1/landlord/financials/transactions` | Transaction history |
| POST | `/api/v1/landlord/financials/payout` | Request payout |
| GET | `/api/v1/landlord/alerts` | Actionable alerts |
| POST | `/api/v1/landlord/properties/:id/verify` | Start verification |
| POST | `/api/v1/landlord/jobs` | Create agent job |
| GET | `/api/v1/landlord/jobs` | My jobs |

## 🏪 Tenant Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tenant/dashboard` | Dashboard stats |
| GET | `/api/v1/tenant/rental` | Current rental info |
| GET | `/api/v1/tenant/applications` | My applications |
| POST | `/api/v1/tenant/applications` | Submit application |
| DELETE | `/api/v1/tenant/applications/:id` | Withdraw application |
| GET | `/api/v1/tenant/saved` | Saved properties |
| POST | `/api/v1/tenant/saved/:propertyId` | Save property |
| DELETE | `/api/v1/tenant/saved/:propertyId` | Remove saved |
| GET | `/api/v1/tenant/payments` | Payment history |
| POST | `/api/v1/tenant/payments` | Make payment |

## 🛡️ Role-Based Access Control (RBAC)

| Permission | Tenant | Landlord | Agent | Admin |
|------------|--------|----------|-------|-------|
| property:read | ✓ | ✓ | ✓ | ✓ |
| property:write | - | ✓ | - | ✓ |
| application:read/write | ✓ | ✓ | - | ✓ |
| payment:read/write | ✓ | ✓ | ✓ | ✓ |
| job:read/write | - | ✓ | ✓ | ✓ |
| admin:* | - | - | - | ✓ |

## � Lease Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leases` | Get user's leases |
| GET | `/api/v1/leases/:id` | Get lease details |
| POST | `/api/v1/leases` | Create lease (Landlord) |
| PUT | `/api/v1/leases/:id` | Update lease (Landlord) |
| POST | `/api/v1/leases/:id/renew` | Send renewal offer |
| POST | `/api/v1/leases/:id/respond` | Respond to renewal |
| POST | `/api/v1/leases/:id/sign` | Sign lease |

## 🔧 Maintenance System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/maintenance` | List requests |
| GET | `/api/v1/maintenance/:id` | Get request details |
| POST | `/api/v1/maintenance` | Create request (Tenant) |
| PUT | `/api/v1/maintenance/:id` | Update request |
| POST | `/api/v1/maintenance/:id/assign` | Assign agent |

## 👷 Agent Platform

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agent/jobs` | Available jobs |
| GET | `/api/v1/agent/jobs/accepted` | My accepted jobs |
| POST | `/api/v1/agent/jobs/:id/accept` | Accept job |
| POST | `/api/v1/agent/jobs/:id/decline` | Decline job |
| PUT | `/api/v1/agent/jobs/:id/complete` | Mark job complete |
| GET | `/api/v1/agent/schedule` | Get schedule |
| GET | `/api/v1/agent/earnings` | Earnings summary |
| GET | `/api/v1/agent/earnings/history` | Payout history |
| POST | `/api/v1/agent/earnings/withdraw` | Request withdrawal |

## 💬 Messaging System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages/conversations` | List conversations |
| POST | `/api/v1/messages/conversations` | Start conversation |
| GET | `/api/v1/messages/conversations/:id` | Get messages |
| POST | `/api/v1/messages/conversations/:id` | Send message |

## 💳 Transaction & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | Transaction history |
| GET | `/api/v1/transactions/:id` | Transaction details |
| POST | `/api/v1/transactions/pay` | Initiate payment |
| POST | `/api/v1/transactions/verify` | Verify payment |
| POST | `/api/v1/transactions/escrow` | Create escrow |
| POST | `/api/v1/transactions/escrow/:id/release` | Release escrow |
| POST | `/api/v1/transactions/:id/refund` | Request refund |
| POST | `/api/v1/transactions/webhook/paystack` | Payment webhook |

## ✅ Verification System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/verification/status` | Get verification status |
| POST | `/api/v1/verification/identity` | Submit identity KYC |
| POST | `/api/v1/verification/address` | Submit address verification |
| GET | `/api/v1/verification/properties` | Property verifications |
| GET | `/api/v1/verification/properties/:id` | Property verification status |
| POST | `/api/v1/verification/properties/:id/cofo` | Submit C of O |
| POST | `/api/v1/verification/properties/:id/audit/request` | Request audit |
| GET | `/api/v1/verification/admin/pending` | Pending verifications (Admin) |
| POST | `/api/v1/verification/admin/:id/approve` | Approve (Admin) |
| POST | `/api/v1/verification/admin/:id/reject` | Reject (Admin) |

## 🔔 Notification System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Unread count |
| POST | `/api/v1/notifications/mark-read` | Mark as read |
| POST | `/api/v1/notifications/mark-all-read` | Mark all read |
| GET | `/api/v1/notifications/devices` | List devices |
| POST | `/api/v1/notifications/devices` | Register device |
| DELETE | `/api/v1/notifications/devices/:token` | Unregister device |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences |
| DELETE | `/api/v1/notifications` | Delete notifications |
| DELETE | `/api/v1/notifications/all` | Clear all |
| POST | `/api/v1/notifications/send` | Send (Admin) |

## �🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/homeai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3001

# Region
DEFAULT_REGION=NG
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## 🏗️ Architecture

- **Multi-Region Abstraction**: Region-specific configurations for providers
- **Provider Pattern**: Swappable payment, communication, and verification providers
- **JWT Authentication**: Access + Refresh token pattern with RBAC
- **Error Handling**: Standardized error codes per PRD Appendix B
- **Logging**: Winston logger with request tracing

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": [{ "field": "email", "message": "..." }]
  }
}
```

## 📄 Pagination

All list endpoints support pagination via query parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number (1-indexed) |
| `limit` | 20 | Items per page (max 100) |
| `sortBy` | varies | Field to sort by |
| `sortOrder` | `desc` | `asc` or `desc` |

**Response with pagination:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 156,
    "page": 1,
    "totalPages": 8
  }
}
```

## ❌ Error Codes

### Authentication Errors (AUTH_XXX)
| Code | HTTP | Message |
|------|------|---------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 401 | Invalid token |
| AUTH_004 | 403 | Insufficient permissions |
| AUTH_005 | 400 | Email already registered |
| AUTH_006 | 400 | Invalid verification code |
| AUTH_007 | 400 | 2FA required |
| AUTH_008 | 429 | Too many attempts |

### Validation Errors (VAL_XXX)
| Code | HTTP | Message |
|------|------|---------|
| VAL_001 | 400 | Validation failed |
| VAL_002 | 400 | Invalid request body |
| VAL_003 | 400 | Missing required field |

### Resource Errors (RES_XXX)
| Code | HTTP | Message |
|------|------|---------|
| RES_001 | 404 | Resource not found |
| RES_002 | 404 | Property not found |
| RES_003 | 404 | User not found |
| RES_004 | 404 | Lease not found |
| RES_005 | 409 | Resource already exists |

### Payment Errors (PAY_XXX)
| Code | HTTP | Message |
|------|------|---------|
| PAY_001 | 400 | Payment failed |
| PAY_002 | 400 | Invalid payment method |
| PAY_003 | 400 | Insufficient funds |
| PAY_004 | 400 | Transaction not found |
| PAY_005 | 400 | Compliance check failed |

## 🔌 WebSocket Events

Connect to WebSocket for real-time messaging:
```
ws://localhost:3000/ws?token=<access_token>
wss://api.homeai.ng/ws?token=<access_token>
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId: string }` | Join a conversation room |
| `leave_conversation` | `{ conversationId: string }` | Leave a conversation room |
| `send_message` | `{ conversationId: string, content: string }` | Send a message |
| `typing` | `{ conversationId: string, isTyping: boolean }` | Typing indicator |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ id, conversationId, senderId, content, createdAt }` | New message received |
| `message_read` | `{ conversationId, messageId, readBy }` | Message was read |
| `user_typing` | `{ conversationId, userId, isTyping }` | User is typing |
| `notification` | `{ id, type, title, body, data }` | Push notification |
| `property_update` | `{ propertyId, status, verificationTier }` | Property status changed |

### WebSocket Example
```javascript
const socket = new WebSocket('wss://api.homeai.ng/ws?token=eyJhbG...');

socket.onopen = () => {
  socket.send(JSON.stringify({
    event: 'join_conversation',
    data: { conversationId: 'uuid-here' }
  }));
};

socket.onmessage = (event) => {
  const { event: eventName, data } = JSON.parse(event.data);
  if (eventName === 'new_message') {
    console.log('New message:', data);
  }
};
```

## 📄 License

Proprietary - HomeAI Nigeria
