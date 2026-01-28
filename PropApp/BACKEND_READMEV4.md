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

# Seed database with test data
npm run prisma:seed

# Start development server
npm run dev
```

## 🧪 Test Accounts

After running `npm run prisma:seed`, the following test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@homeai.ng | Password123! |
| **Landlord** | landlord1@homeai.ng | Password123! |
| **Landlord** | landlord2@homeai.ng | Password123! |
| **Tenant** | tenant1@homeai.ng | Password123! |
| **Tenant** | tenant2@homeai.ng | Password123! |
| **Tenant** | tenant3@homeai.ng | Password123! |
| **Agent** | agent1@homeai.ng | Password123! |
| **Agent** | agent2@homeai.ng | Password123! |

### Seed Data Included

| Entity | Count | Description |
|--------|-------|-------------|
| Users | 8 | 1 admin, 2 landlords, 3 tenants, 2 agents |
| User Profiles | 7 | Role-specific profile data |
| Properties | 10 | Various types across Lagos (with media) |
| Property Media | 30+ | Images, 3D tours, videos, floor plans |
| Applications | 4 | PENDING, APPROVED, REJECTED statuses |
| Leases | 3 | Active leases with transactions |
| Transactions | 8 | Rent payments, security deposits |
| Escrows | 2 | FUNDED and RELEASED examples |
| Verifications | 12+ | User identity + property verification |
| Maintenance Requests | 3 | Different priorities and categories |
| Agent Jobs | 4 | Viewings, inspections, key handovers |
| Conversations | 3 | With 9 messages |
| Favorites | 6-9 | Tenant saved properties |
| Notifications | 3 | Payment reminders |

### Quick Login Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tenant1@homeai.ng", "password": "Password123!"}'
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

#### Authentication

**Register (Initiate)**
```bash
POST /api/v1/auth/register/initiate
Content-Type: application/json

{ "email": "user@example.com" }  # role is optional here, can be provided at completion
```

**Verify Email**
```bash
POST /api/v1/auth/register/verify-email
Content-Type: application/json

{ "email": "user@example.com", "code": "123456" }
```

**Complete Registration**
```bash
POST /api/v1/auth/register/complete
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "TENANT",
  "phone": "+2348012345678"
}
```

> **Note**: `role` can be provided either at initiation OR completion (completion overrides initiation). `phone` is optional.

**Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "SecurePass123!" }

# Response: { accessToken, refreshToken, expiresIn, user }
```

**OAuth Login**
```bash
POST /api/v1/auth/login/oauth/google
Content-Type: application/json

{ "idToken": "google-id-token-from-client", "role": "TENANT" }
```

**Refresh Token**
```bash
POST /api/v1/auth/refresh-token
Content-Type: application/json

{ "refreshToken": "current-refresh-token" }
```

**Forgot Password**
```bash
POST /api/v1/auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }
```

**Reset Password**
```bash
POST /api/v1/auth/reset-password
Content-Type: application/json

{ "token": "reset-token-from-email", "password": "NewSecurePass123!" }
```

**Setup 2FA**
```bash
POST /api/v1/auth/2fa/setup
Authorization: Bearer <token>

# Response: { secret, qrCodeUrl }
```

**Verify 2FA**
```bash
POST /api/v1/auth/2fa/verify
Authorization: Bearer <token>
Content-Type: application/json

{ "code": "123456" }
```

**Disable 2FA**
```bash
POST /api/v1/auth/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{ "password": "currentPassword" }
```

#### User Management

**Update Profile**
```bash
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{ "firstName": "John", "lastName": "Doe", "phone": "+2348012345678", "bio": "Property investor" }
```

**Change Password**
```bash
PUT /api/v1/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{ "currentPassword": "OldPass123!", "newPassword": "NewPass456!" }
```

**Update Preferences**
```bash
PUT /api/v1/users/me/preferences
Authorization: Bearer <token>
Content-Type: application/json

{ "language": "en", "currency": "NGN", "timezone": "Africa/Lagos" }
```

**Update Notification Settings**
```bash
PUT /api/v1/users/me/notification-settings
Authorization: Bearer <token>
Content-Type: application/json

{ "email": true, "push": true, "sms": false, "marketingEmails": false }
```

**Upload Avatar**
```bash
POST /api/v1/users/me/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary image data>
```

**Connect Wallet**
```bash
POST /api/v1/users/me/wallet/connect
Authorization: Bearer <token>
Content-Type: application/json

{ "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD5F", "signature": "0x...", "message": "Connect wallet to HomeAI: nonce_123456" }
```

**Save Property to Favorites**
```bash
POST /api/v1/users/me/favorites/:propertyId
Authorization: Bearer <token>
```

#### Property Management

**Create Property**
```bash
POST /api/v1/properties
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Luxury 3BR Apartment", "propertyType": "APARTMENT", "listingType": "RENT", "price": 2500000, "priceUnit": "PER_YEAR", "bedrooms": 3, "bathrooms": 2, "addressStreet": "123 Admiralty Way", "addressCity": "Lekki", "addressState": "Lagos", "amenities": ["SWIMMING_POOL", "GYM"] }
```

**Update Property**
```bash
PUT /api/v1/properties/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "price": 2800000, "description": "Updated description with new features" }
```

**Update Property Status**
```bash
PATCH /api/v1/properties/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "ACTIVE" }  # DRAFT, ACTIVE, RENTED, SOLD, INACTIVE
```

**Upload Property Media**
```bash
POST /api/v1/properties/:id/media
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary image/video data>
type: "IMAGE"  # IMAGE, VIDEO, TOUR_3D, FLOOR_PLAN, DOCUMENT
caption: "Living room view"
isPrimary: true
```

**Create Property Draft**
```bash
POST /api/v1/properties/draft
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Work in Progress", "propertyType": "APARTMENT" }
```

**Update Draft**
```bash
PUT /api/v1/properties/draft/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "bedrooms": 3, "bathrooms": 2, "price": 2500000 }
```

**Publish Draft**
```bash
POST /api/v1/properties/draft/:id/publish
Authorization: Bearer <token>
```

#### Landlord Operations

**Approve Applicant**
```bash
PUT /api/v1/landlord/applicants/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{ "moveInDate": "2024-02-01", "monthlyRent": 250000, "securityDeposit": 500000 }
```

**Reject Applicant**
```bash
PUT /api/v1/landlord/applicants/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{ "reason": "Income verification failed" }
```

**Request Payout**
```bash
POST /api/v1/landlord/financials/payout
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 500000, "bankAccountId": "uuid-of-bank-account" }
```

**Start Property Verification**
```bash
POST /api/v1/landlord/properties/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{ "tier": "GOLD", "documents": ["cofo-url", "survey-url"] }
```

**Create Agent Job**
```bash
POST /api/v1/landlord/jobs
Authorization: Bearer <token>
Content-Type: application/json

{ "propertyId": "uuid", "type": "PROPERTY_VIEWING", "description": "Show to tenant", "scheduledDate": "2024-01-20T14:00:00Z", "commission": 5000 }
```

#### Tenant Operations

**Submit Application**
```bash
POST /api/v1/tenant/applications
Authorization: Bearer <token>
Content-Type: application/json

{ "propertyId": "uuid", "message": "I am interested", "moveInDate": "2024-02-01", "employmentStatus": "EMPLOYED", "monthlyIncome": 500000 }
```

**Save Property**
```bash
POST /api/v1/tenant/saved/:propertyId
Authorization: Bearer <token>
```

**Make Payment**
```bash
POST /api/v1/tenant/payments
Authorization: Bearer <token>
Content-Type: application/json

{ "leaseId": "uuid", "amount": 250000, "paymentMethod": "card" }
```

#### Lease Management

**Create Lease**
```bash
POST /api/v1/leases
Authorization: Bearer <token>
Content-Type: application/json

{ "propertyId": "uuid", "tenantId": "uuid", "startDate": "2024-02-01", "endDate": "2025-01-31", "monthlyRent": 250000, "securityDeposit": 500000, "paymentDueDay": 1 }
```

**Update Lease**
```bash
PUT /api/v1/leases/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "monthlyRent": 275000 }
```

**Send Renewal Offer**
```bash
POST /api/v1/leases/:id/renew
Authorization: Bearer <token>
Content-Type: application/json

{ "newEndDate": "2026-01-31", "newMonthlyRent": 280000, "message": "We'd like to offer you a renewal" }
```

**Respond to Renewal**
```bash
POST /api/v1/leases/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{ "accepted": true }
```

**Sign Lease**
```bash
POST /api/v1/leases/:id/sign
Authorization: Bearer <token>
Content-Type: application/json

{ "signature": "base64-encoded-signature", "signedAt": "2024-01-15T10:30:00Z" }
```

#### Maintenance

**Create Request**
```bash
POST /api/v1/maintenance
Authorization: Bearer <token>
Content-Type: application/json

{ "leaseId": "uuid", "title": "Broken AC", "description": "Not cooling properly", "priority": "MEDIUM", "category": "HVAC" }
```

**Update Request**
```bash
PUT /api/v1/maintenance/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "IN_PROGRESS", "notes": "Technician scheduled" }
```

**Assign Agent**
```bash
POST /api/v1/maintenance/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{ "agentId": "uuid-of-agent" }
```

#### Agent Operations

**Accept Job**
```bash
POST /api/v1/agent/jobs/:id/accept
Authorization: Bearer <token>
```

**Decline Job**
```bash
POST /api/v1/agent/jobs/:id/decline
Authorization: Bearer <token>
Content-Type: application/json

{ "reason": "Schedule conflict" }
```

**Complete Job**
```bash
PUT /api/v1/agent/jobs/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{ "notes": "Viewing completed, tenant interested", "photos": ["url1", "url2"] }
```

**Request Withdrawal**
```bash
POST /api/v1/agent/earnings/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 50000, "bankAccountId": "uuid" }
```

#### Messaging

**Start Conversation**
```bash
POST /api/v1/messages/conversations
Authorization: Bearer <token>
Content-Type: application/json

{ "propertyId": "uuid", "recipientId": "uuid", "initialMessage": "Hello, I'm interested" }
```

**Send Message**
```bash
POST /api/v1/messages/conversations/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "content": "Is the property still available?" }
```

#### Transactions

**Initiate Payment**
```bash
POST /api/v1/transactions/pay
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 2500000, "currency": "NGN", "type": "RENT_PAYMENT", "paymentMethod": "card", "leaseId": "uuid" }

# Response: { transactionId, paymentUrl, reference, provider }
```

**Verify Payment**
```bash
POST /api/v1/transactions/verify
Content-Type: application/json

{ "reference": "PAY_1234567890_abc123", "provider": "paystack" }
```

**Create Escrow**
```bash
POST /api/v1/transactions/escrow
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 500000, "currency": "NGN", "leaseId": "uuid", "description": "Security deposit" }
```

**Release Escrow**
```bash
POST /api/v1/transactions/escrow/:id/release
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 500000, "releaseReason": "Lease ended, no damages" }
```

**Request Refund**
```bash
POST /api/v1/transactions/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 100000, "reason": "Partial refund for early termination" }
```

#### Verification

**Submit Identity KYC**
```bash
POST /api/v1/verification/identity
Authorization: Bearer <token>
Content-Type: application/json

{ "type": "NIN", "idNumber": "12345678901", "firstName": "John", "lastName": "Doe", "dateOfBirth": "1990-05-15" }
```

**Submit Address Verification**
```bash
POST /api/v1/verification/address
Authorization: Bearer <token>
Content-Type: application/json

{ "documentUrl": "https://storage.example.com/utility-bill.pdf", "type": "utility_bill", "address": "123 Main St, Lagos" }
```

**Submit C of O**
```bash
POST /api/v1/verification/properties/:propertyId/cofo
Authorization: Bearer <token>
Content-Type: application/json

{ "documentUrl": "https://storage.example.com/cofo.pdf", "type": "certificate_of_occupancy" }
```

**Request Audit**
```bash
POST /api/v1/verification/properties/:propertyId/audit/request
Authorization: Bearer <token>
Content-Type: application/json

{ "tier": "GOLD", "preferredDate": "2024-02-01" }
```

**Approve (Admin)**
```bash
POST /api/v1/verification/admin/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{ "tier": "GOLD", "notes": "All documents verified" }
```

**Reject (Admin)**
```bash
POST /api/v1/verification/admin/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{ "reason": "Document unclear, please resubmit" }
```

#### Notifications

**Mark as Read**
```bash
POST /api/v1/notifications/mark-read
Authorization: Bearer <token>
Content-Type: application/json

{ "notificationIds": ["uuid1", "uuid2"] }
```

**Mark All Read**
```bash
POST /api/v1/notifications/mark-all-read
Authorization: Bearer <token>
```

**Register Device**
```bash
POST /api/v1/notifications/devices
Authorization: Bearer <token>
Content-Type: application/json

{ "token": "fcm-device-token", "platform": "ios", "deviceName": "iPhone 14 Pro" }
```

**Update Preferences**
```bash
PUT /api/v1/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{ "email": true, "push": true, "sms": false, "types": { "payments": true, "messages": true, "marketing": false } }
```

**Send Notification (Admin)**
```bash
POST /api/v1/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{ "userId": "uuid", "title": "Important Update", "body": "Your verification is complete", "type": "VERIFICATION" }
```

#### Session Management

**Revoke All Other Sessions**
```bash
DELETE /api/v1/auth/sessions/all
Authorization: Bearer <token>
Content-Type: application/json

{ "password": "currentPassword123!" }
```

#### Banking & Payouts

**Add Bank Account**
```bash
POST /api/v1/users/me/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{ "bankCode": "011", "accountNumber": "0123456789", "accountName": "JOHN DOE", "accountType": "savings", "setAsDefault": true }
```

**Request Payout**
```bash
POST /api/v1/users/me/payouts
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 250000, "bankAccountId": "uuid", "description": "Monthly earnings" }
```

**Update Payout Settings**
```bash
PUT /api/v1/users/me/payout-settings
Authorization: Bearer <token>
Content-Type: application/json

{ "payoutSchedule": "weekly", "minimumPayoutAmount": 10000, "autoPayoutEnabled": true }
```

#### Privacy Settings

**Update Privacy**
```bash
PUT /api/v1/users/me/privacy
Authorization: Bearer <token>
Content-Type: application/json

{ "profileVisibility": "verified_users_only", "showPhoneToPublic": false, "allowSearchDiscovery": true }
```

#### Role-Specific Profiles

**Update Tenant Profile**
```bash
PUT /api/v1/users/me/profile/tenant
Authorization: Bearer <token>
Content-Type: application/json

{ "displayName": "Alex J.", "bio": "Young professional", "preferences": { "desiredBedrooms": "2", "monthlyBudgetMax": 300000 } }
```

**Update Landlord Profile**
```bash
PUT /api/v1/users/me/profile/landlord
Authorization: Bearer <token>
Content-Type: application/json

{ "businessName": "Johnson Properties", "businessEmail": "contact@example.com", "publicVisibility": { "showContactPhone": true } }
```

**Add Agent Certification**
```bash
POST /api/v1/users/me/profile/agent/certifications
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Real Estate Broker License", "issuer": "State Board", "expiryDate": "2026-12-31", "documentUrl": "https://storage.example.com/cert.pdf" }
```

#### Social Account Linking

**Link Account**
```bash
POST /api/v1/users/me/connected-accounts/google
Authorization: Bearer <token>
Content-Type: application/json

{ "idToken": "google-oauth-id-token" }
```

#### Analytics

**Get Market Trends**
```bash
GET /api/v1/analytics/market-trends?city=Lagos&period=1y
Authorization: Bearer <token>
```

**Get AI Price Suggestions**
```bash
POST /api/v1/properties/:id/analytics/price-optimization
Authorization: Bearer <token>
Content-Type: application/json

{ "targetMetric": "balanced", "constraints": { "minPrice": 200000, "maxPrice": 500000 } }
```

#### Documents

**Upload Document**
```bash
POST /api/v1/users/me/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary data>
type: "income"
subtype: "bank_statement"
name: "Bank Statement - January 2024"
```

**Generate Lease Document**
```bash
POST /api/v1/leases/:id/document/generate
Authorization: Bearer <token>
Content-Type: application/json

{ "templateId": "standard_residential", "includeAddendums": true }
```

**Generate Financial Report**
```bash
POST /api/v1/reports/generate
Authorization: Bearer <token>
Content-Type: application/json

{ "reportType": "income_statement", "startDate": "2024-01-01", "endDate": "2024-12-31", "format": "pdf" }
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

## 🔐 Session Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/sessions` | List active sessions |
| DELETE | `/api/v1/auth/sessions/:id` | Revoke session |
| DELETE | `/api/v1/auth/sessions/all` | Revoke all other sessions |

## 🏦 Banking & Payouts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/banking/banks` | List supported banks |
| POST | `/api/v1/banking/resolve` | Resolve bank account |
| GET | `/api/v1/users/me/bank-accounts` | List bank accounts |
| POST | `/api/v1/users/me/bank-accounts` | Add bank account |
| PUT | `/api/v1/users/me/bank-accounts/:id/default` | Set default |
| DELETE | `/api/v1/users/me/bank-accounts/:id` | Remove account |
| GET | `/api/v1/users/me/payouts` | Payout history |
| POST | `/api/v1/users/me/payouts` | Request payout |
| GET | `/api/v1/users/me/payout-settings` | Get settings |
| PUT | `/api/v1/users/me/payout-settings` | Update settings |

## 💳 Payment Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me/payment-methods` | List payment methods |
| POST | `/api/v1/users/me/payment-methods` | Add payment method |
| PUT | `/api/v1/users/me/payment-methods/:id/default` | Set default |
| DELETE | `/api/v1/users/me/payment-methods/:id` | Remove method |

## 🔒 Privacy Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me/privacy` | Get privacy settings |
| PUT | `/api/v1/users/me/privacy` | Update privacy settings |

## 👤 Role-Specific Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me/profile/tenant` | Get tenant profile |
| PUT | `/api/v1/users/me/profile/tenant` | Update tenant profile |
| GET | `/api/v1/users/me/profile/landlord` | Get landlord profile |
| PUT | `/api/v1/users/me/profile/landlord` | Update landlord profile |
| GET | `/api/v1/users/me/profile/agent` | Get agent profile |
| PUT | `/api/v1/users/me/profile/agent` | Update agent profile |
| POST | `/api/v1/users/me/profile/agent/certifications` | Add certification |
| DELETE | `/api/v1/users/me/profile/agent/certifications/:id` | Delete certification |

## 🔗 Social Account Linking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me/connected-accounts` | List connected accounts |
| POST | `/api/v1/users/me/connected-accounts/:provider` | Link account |
| DELETE | `/api/v1/users/me/connected-accounts/:provider` | Unlink account |

## 📊 Analytics & Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/properties/:id/analytics/views` | Property view analytics |
| GET | `/api/v1/properties/:id/analytics/market-comparison` | Market comparison |
| POST | `/api/v1/properties/:id/analytics/price-optimization` | AI price suggestions |
| GET | `/api/v1/analytics/market-trends` | Area market trends |
| GET | `/api/v1/landlord/dashboard/analytics` | Dashboard analytics |

## 📄 User Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me/documents` | List documents |
| POST | `/api/v1/users/me/documents` | Upload document |
| GET | `/api/v1/users/me/documents/:id/download` | Download document |
| DELETE | `/api/v1/users/me/documents/:id` | Delete document |

## 📋 Lease Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/leases` | List lease documents |
| GET | `/api/v1/leases/:id/document` | Get lease document |
| POST | `/api/v1/leases/:id/document/generate` | Generate lease PDF |

## 📈 Financial Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports` | List reports |
| GET | `/api/v1/reports/:id` | Get report |
| POST | `/api/v1/reports/generate` | Generate report |

## 🔧 Environment Variables

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
  "data": [...items],
  "pagination": {
    "total": 156,
    "page": 1,
    "totalPages": 8
  }
}
```

### Paginated Endpoints

#### Properties Module
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/properties` | `propertyType`, `listingType`, `minPrice`, `maxPrice`, `city` |
| `GET /api/v1/properties/search` | Full-text search with filters |

#### Landlord Module
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/landlord/properties` | `status` (active, draft, pending, rented, all) |
| `GET /api/v1/landlord/applicants` | `propertyId`, `status` |
| `GET /api/v1/landlord/financials/transactions` | `type`, `propertyId`, `startDate`, `endDate` |
| `GET /api/v1/landlord/alerts` | `unreadOnly` (boolean) |
| `GET /api/v1/landlord/jobs` | `status` (pending, assigned, in_progress, completed, all) |

#### Tenant Module
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/tenant/applications` | `status` (pending, approved, rejected, withdrawn, all) |
| `GET /api/v1/tenant/payments` | `status`, `type`, `startDate`, `endDate` |
| `GET /api/v1/tenant/saved` | — |

#### Leases Module
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/leases` | `status` (draft, pending_signatures, active, expired, terminated, renewed, all) |

#### Agent Module
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/agent/jobs` | `category`, `status` |
| `GET /api/v1/agent/jobs/accepted` | `status` |
| `GET /api/v1/agent/earnings/history` | `type` (earning, withdrawal, all) |

#### Other Modules
| Endpoint | Additional Filters |
|----------|-------------------|
| `GET /api/v1/transactions` | `type`, `status`, `startDate`, `endDate` |
| `GET /api/v1/notifications` | `type`, `read` |
| `GET /api/v1/messages/conversations` | — |
| `GET /api/v1/maintenance` | `status`, `priority`, `propertyId` |
| `GET /api/v1/users/me/documents` | `type` |
| `GET /api/v1/users/me/payouts` | `status` |
| `GET /api/v1/verification/properties` | `status` |

### Pagination Example

```bash
# Get page 2 of landlord properties, 10 per page, only active
GET /api/v1/landlord/properties?page=2&limit=10&status=active

# Get tenant saved properties
GET /api/v1/tenant/saved?page=1&limit=20

# Get agent earnings history (withdrawals only)
GET /api/v1/agent/earnings/history?page=1&limit=50&type=withdrawal

# Get user leases (active only)
GET /api/v1/leases?page=1&limit=20&status=active
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
