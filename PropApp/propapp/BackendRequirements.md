# PropertyApp Backend Requirements Document

> **Document Version:** 1.0  
> **Last Updated:** January 6, 2026  
> **Purpose:** Backend developer handoff specification derived from frontend UI analysis

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [User Management](#user-management)
4. [Property Management](#property-management)
5. [Search & Discovery](#search--discovery)
6. [Tenant Features](#tenant-features)
7. [Landlord Features](#landlord-features)
8. [Agent Features](#agent-features)
9. [Messaging & Notifications](#messaging--notifications)
10. [Payments & Financials](#payments--financials)
11. [File Storage](#file-storage)
12. [AI Features](#ai-features)
13. [Data Models](#data-models)

---

## Overview

PropertyApp is a multi-role real estate platform supporting three user types:
- **Tenants** - Property seekers who can browse, apply, and manage rentals
- **Landlords** - Property owners who list, manage properties, and handle tenants
- **Agents** - Service providers who handle viewings, document pickup, and maintenance

---

## Authentication & Authorization

### Endpoints Required

#### Login
```
POST /api/auth/login
```
**Request:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```
**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": { "id", "email", "role", "firstName", "lastName" },
  "requires2FA": "boolean"
}
```

#### OAuth Login (Google/Apple)
```
POST /api/auth/oauth/{provider}
```
**Providers:** `google`, `apple`

#### Registration (Multi-step)
```
POST /api/auth/register/step1
```
**Request:**
```json
{
  "email": "string",
  "password": "string",
  "acceptedTerms": "boolean"
}
```
**Response:** Sends verification email, returns `registrationToken`

```
POST /api/auth/register/verify-email
```
**Request:**
```json
{
  "registrationToken": "string",
  "code": "string (6 digits)"
}
```

```
POST /api/auth/register/step3
```
**Request:**
```json
{
  "registrationToken": "string",
  "role": "tenant | landlord | agent",
  "firstName": "string",
  "lastName": "string"
}
```

```
POST /api/auth/register/complete
```
**Request varies by role:**

**Tenant:**
```json
{
  "registrationToken": "string",
  "preferences": {
    "location": "string",
    "propertyType": "apartment | house | condo",
    "bedrooms": "string",
    "bathrooms": "string",
    "budgetMin": "number",
    "budgetMax": "number",
    "amenities": ["string"],
    "moveInTimeline": "immediate | 1-3months | 3+months"
  }
}
```

**Landlord:**
```json
{
  "registrationToken": "string",
  "portfolio": {
    "propertyCount": "1 | 2-5 | 6-20 | 21-50 | 50+",
    "propertyTypes": ["residential", "commercial", "mixed"],
    "role": "owner | manager",
    "listingSoon": "boolean",
    "contactPreference": "chat | email | phone"
  }
}
```

**Agent:**
```json
{
  "registrationToken": "string",
  "profile": {
    "specialties": ["string"],
    "serviceArea": "string",
    "yearsExperience": "string",
    "licenseNumber": "string (optional)"
  }
}
```

#### Two-Factor Authentication
```
POST /api/auth/2fa/verify
```
**Request:**
```json
{
  "sessionToken": "string",
  "code": "string",
  "method": "authenticator | sms | recovery"
}
```

```
POST /api/auth/2fa/resend
```
```
GET /api/auth/2fa/methods
```
```
POST /api/auth/2fa/setup
```

#### Password Reset
```
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Session Management
```
POST /api/auth/refresh-token
POST /api/auth/logout
```

### Authorization Rules

| Role | Access Scope |
|------|-------------|
| Guest | Public properties, search, property details |
| Tenant | + Applications, saved properties, payments, maintenance requests, messages |
| Landlord | + Property management, tenant management, financials, leases |
| Agent | + Job board, schedule, earnings, assigned tasks |

---

## User Management

### Endpoints

```
GET /api/users/me
PUT /api/users/me
PUT /api/users/me/password
PUT /api/users/me/preferences
DELETE /api/users/me
```

### Profile Fields by Role

**All Users:**
- `id`, `email`, `firstName`, `lastName`, `phone`, `avatar`, `createdAt`

**Tenant-specific:**
- `preferences` (location, budget, amenities, etc.)
- `documents` (ID, proof of income, references)

**Landlord-specific:**
- `portfolio` (property types, count)
- `verificationStatus` { identity, ownership, bank }
- `contactPreference`

**Agent-specific:**
- `specialties`, `serviceArea`, `experience`
- `licenseNumber`, `licenseDocument`
- `rating`, `reviewCount`, `completedJobs`

### Public Profiles
```
GET /api/users/public/agent/:id
GET /api/users/public/landlord/:id
GET /api/users/public/tenant/:id
```

---

## Property Management

### Core Property CRUD

```
GET /api/properties                    # List with filters
GET /api/properties/:id                # Single property
POST /api/properties                   # Create (Landlord only)
PUT /api/properties/:id                # Update
DELETE /api/properties/:id             # Delete
PATCH /api/properties/:id/status       # Toggle listing status
```

### Property Data Model

```json
{
  "id": "string",
  "ownerId": "string",
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "neighborhood": "string",
    "coordinates": { "lat": "number", "lng": "number" }
  },
  "type": "house | apartment | condo | townhouse | land | commercial",
  "listingType": "sale | rent | short-let",
  "price": "number",
  "priceUnit": "total | /mo | /night",
  "bedrooms": "number",
  "bathrooms": "number",
  "squareFeet": "number",
  "yearBuilt": "number",
  "description": "string",
  "amenities": ["string"],
  "images": [{ "url": "string", "isPrimary": "boolean" }],
  "virtualTourUrl": "string",
  "status": "active | off-market | rented | sold",
  "verificationStatus": "unverified | verified | platinum-verified",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Property Wizard (Multi-step Creation)
```
POST /api/properties/draft
PUT /api/properties/draft/:id/step/:stepNumber
POST /api/properties/draft/:id/publish
```

### Property Tasks
```
GET /api/properties/:id/tasks
POST /api/properties/:id/tasks
PUT /api/properties/:id/tasks/:taskId
DELETE /api/properties/:id/tasks/:taskId
```

---

## Search & Discovery

### Search Endpoint
```
GET /api/properties/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text search (location, keywords) |
| `type` | string[] | Property types (house, apartment, etc.) |
| `listingType` | string | sale, rent, short-let |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `beds` | string | 1+, 2+, 3+, etc. |
| `baths` | string | 1+, 2+, etc. |
| `sqftMin` | number | Min square footage |
| `sqftMax` | number | Max square footage |
| `yearBuiltMin` | number | Year built from |
| `yearBuiltMax` | number | Year built to |
| `amenities` | string[] | Required amenities |
| `verifiedOnly` | boolean | Filter verified properties |
| `sortBy` | string | recommended, price-asc, price-desc, newest |
| `page` | number | Pagination |
| `limit` | number | Items per page |
| `bounds` | string | Map viewport bounds (for map view) |

### AI-Powered Search
```
POST /api/properties/search/ai
```
**Request:**
```json
{
  "query": "3 bedroom house with pool under $500k near good schools",
  "context": { "userLocation": "...", "preferences": {...} }
}
```

### Favorites
```
GET /api/users/me/favorites
POST /api/users/me/favorites/:propertyId
DELETE /api/users/me/favorites/:propertyId
```

---

## Tenant Features

### Applications
```
GET /api/applications                        # Tenant's applications
GET /api/applications/:id                    # Application detail
POST /api/properties/:id/apply               # Submit application
PUT /api/applications/:id                    # Update application
DELETE /api/applications/:id                 # Withdraw
```

**Application Data:**
```json
{
  "propertyId": "string",
  "tenantId": "string",
  "status": "pending | under-review | approved | rejected | withdrawn",
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "currentAddress": "string"
  },
  "employment": {
    "employer": "string",
    "position": "string",
    "income": "number",
    "employmentLength": "string"
  },
  "documents": {
    "idDocument": "string (URL)",
    "proofOfIncome": "string (URL)",
    "references": [{ "name": "string", "phone": "string", "relationship": "string" }]
  },
  "moveInDate": "date",
  "leaseTerm": "number (months)",
  "pets": { "hasPets": "boolean", "details": "string" },
  "additionalNotes": "string",
  "submittedAt": "date"
}
```

### My Home (Current Rental)
```
GET /api/tenant/my-home
```
Returns current lease, property details, landlord info

### Lease Management
```
GET /api/tenant/lease
GET /api/tenant/lease/renewal
POST /api/tenant/lease/renewal/sign
```

### Maintenance Requests
```
GET /api/tenant/maintenance
GET /api/tenant/maintenance/:id
POST /api/tenant/maintenance
PUT /api/tenant/maintenance/:id
```

**Maintenance Request:**
```json
{
  "id": "string",
  "propertyId": "string",
  "tenantId": "string",
  "title": "string",
  "description": "string",
  "category": "plumbing | electrical | hvac | appliance | structural | other",
  "priority": "low | medium | high | emergency",
  "status": "submitted | in-progress | scheduled | completed",
  "images": ["string"],
  "assignedAgentId": "string",
  "scheduledDate": "date",
  "completedAt": "date",
  "createdAt": "date"
}
```

### Saved Properties
```
GET /api/tenant/saved
POST /api/tenant/saved/:propertyId
DELETE /api/tenant/saved/:propertyId
```

---

## Landlord Features

### Dashboard Stats
```
GET /api/landlord/dashboard
```
**Response:**
```json
{
  "totalProperties": "number",
  "occupiedUnits": "number",
  "vacantUnits": "number",
  "monthlyRevenue": "number",
  "pendingPayments": "number",
  "activeMaintenanceRequests": "number",
  "upcomingLeaseExpirations": [...]
}
```

### Tenant Management
```
GET /api/landlord/tenants                    # All tenants across properties
GET /api/landlord/tenants/:id                # Tenant detail
GET /api/landlord/properties/:id/tenants     # Tenants for specific property
```

### Applicant Management
```
GET /api/landlord/applicants
GET /api/landlord/applicants/:id
PUT /api/landlord/applicants/:id/status
POST /api/landlord/applicants/:id/approve
POST /api/landlord/applicants/:id/reject
```

### Lease Management
```
GET /api/landlord/leases
GET /api/landlord/leases/:id
POST /api/landlord/leases
PUT /api/landlord/leases/:id
POST /api/landlord/leases/:id/terminate
```

**Lease Data:**
```json
{
  "id": "string",
  "propertyId": "string",
  "tenantId": "string",
  "landlordId": "string",
  "startDate": "date",
  "endDate": "date",
  "monthlyRent": "number",
  "securityDeposit": "number",
  "terms": {
    "petsAllowed": "boolean",
    "utilitiesIncluded": ["string"],
    "parkingSpaces": "number",
    "customTerms": "string"
  },
  "status": "draft | pending-signature | active | expired | terminated",
  "documents": {
    "leaseAgreement": "string (URL)",
    "signedByTenant": "boolean",
    "signedByLandlord": "boolean"
  }
}
```

### Verification Hub

The Verification Hub is a compliance system that allows landlords to verify their identity and property ownership to unlock trust tiers and increase listing visibility.

#### Verification Levels

| Level | Scope | Description |
|-------|-------|-------------|
| **Account Level** | Applies to landlord account | Identity verification, address proof |
| **Property Level** | Per-property verification | Ownership documents, physical audits |

#### Verification Types

| Type | Level | Required Documents | Validity |
|------|-------|-------------------|----------|
| Identity Verification | Account | Government-issued ID (passport, driver's license, national ID) | Until ID expiry |
| Landlord Address Proof | Account | Utility bill, bank statement (< 3 months old) | 12 months |
| Certificate of Occupancy (C of O) | Property | Official C of O document matching property address | 5 years |
| Physical Property Audit | Property | Scheduled in-person inspection by verified agent | 12 months |

#### Tier System

Properties progress through verification tiers that affect visibility and trust badges:

| Tier | Badge | Requirements | Benefits |
|------|-------|--------------|----------|
| **Unverified** | None | None | Basic listing |
| **Bronze** | 🥉 Bronze Property | Identity verified | "Verified Owner" badge |
| **Silver** | 🥈 Silver Property | + Address proof + C of O | Higher search ranking, +15% visibility |
| **Gold** | 🥇 Gold Property | + Physical audit | Featured placement, +25% visibility |
| **Platinum** | 💎 Platinum Verified | + 6 months clean history + 4.5+ rating | Premium badge, top search results |

#### Endpoints

**Get Verification Status**
```
GET /api/landlord/verification
```
**Response:**
```json
{
  "accountLevel": {
    "overallStatus": "partial | complete",
    "completedSteps": 2,
    "totalSteps": 2,
    "verifications": [
      {
        "id": "identity",
        "type": "identity_verification",
        "title": "Identity Verification",
        "level": "account",
        "status": "completed | pending | rejected | not_started",
        "description": "Confirmed via Government ID",
        "completedAt": "2023-10-12T00:00:00Z",
        "expiresAt": "2028-10-12T00:00:00Z",
        "documentId": "doc_abc123"
      },
      {
        "id": "address",
        "type": "address_proof",
        "title": "Landlord Address Proof",
        "level": "account",
        "status": "completed",
        "description": "Utility bill verified",
        "completedAt": "2023-10-14T00:00:00Z",
        "expiresAt": "2024-10-14T00:00:00Z",
        "documentId": "doc_def456"
      }
    ]
  },
  "propertyLevel": {
    "propertyId": "prop_123",
    "propertyName": "Highland Heights Apt 4B",
    "propertyAddress": "123 Highland Ave, Apt 4B",
    "currentTier": "bronze",
    "nextTier": "silver",
    "progressPercent": 50,
    "completedSteps": 2,
    "totalSteps": 4,
    "verifications": [
      {
        "id": "cofo",
        "type": "certificate_of_occupancy",
        "title": "Certificate of Occupancy (C of O)",
        "level": "property",
        "status": "pending",
        "description": "Please upload the Certificate of Occupancy for this property",
        "requirements": {
          "maxAge": "5 years",
          "mustMatchAddress": true,
          "acceptedFormats": ["pdf", "jpg", "png"],
          "maxFileSize": "10MB"
        },
        "uploadedAt": null,
        "reviewedAt": null,
        "rejectionReason": null
      },
      {
        "id": "audit",
        "type": "physical_audit",
        "title": "Physical Property Audit",
        "level": "property",
        "status": "locked",
        "description": "Unlocks after C of O verification is approved",
        "unlocksAfter": "cofo",
        "scheduledDate": null,
        "assignedAgentId": null
      }
    ]
  }
}
```

**Get Verification Status for Specific Property**
```
GET /api/landlord/verification/properties/:propertyId
```

**Get All Properties Verification Summary**
```
GET /api/landlord/verification/properties
```
**Response:**
```json
{
  "properties": [
    {
      "propertyId": "prop_123",
      "propertyName": "Highland Heights Apt 4B",
      "address": "123 Highland Ave, Apt 4B",
      "currentTier": "bronze",
      "progressPercent": 50,
      "pendingActions": 1
    },
    {
      "propertyId": "prop_456",
      "propertyName": "Sunset Boulevard Retail",
      "address": "456 Sunset Blvd, Unit 10",
      "currentTier": "silver",
      "progressPercent": 75,
      "pendingActions": 0
    }
  ]
}
```

**Submit Identity Verification**
```
POST /api/landlord/verification/identity
```
**Request:**
```json
{
  "documentType": "passport | drivers_license | national_id",
  "documentNumber": "string",
  "issuingCountry": "string",
  "expiryDate": "date",
  "frontImageUrl": "string (uploaded file URL)",
  "backImageUrl": "string (optional, for IDs with back)",
  "selfieImageUrl": "string (for liveness check)"
}
```
**Response:**
```json
{
  "verificationId": "ver_xyz789",
  "status": "pending_review",
  "estimatedReviewTime": "24-48 hours",
  "submittedAt": "2024-01-06T20:00:00Z"
}
```

**Submit Address Proof**
```
POST /api/landlord/verification/address
```
**Request:**
```json
{
  "documentType": "utility_bill | bank_statement | tax_document",
  "documentUrl": "string (uploaded file URL)",
  "addressOnDocument": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "documentDate": "date (must be within 3 months)"
}
```

**Submit Certificate of Occupancy**
```
POST /api/landlord/verification/properties/:propertyId/cofo
```
**Request:**
```json
{
  "documentUrl": "string (uploaded file URL)",
  "documentNumber": "string (optional)",
  "issueDate": "date",
  "issuingAuthority": "string",
  "propertyAddressOnDocument": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  }
}
```
**Validation Rules:**
- Document must be less than 5 years old
- Address on document must match property address
- File must be PDF, JPG, or PNG
- Max file size: 10MB

**Request Physical Audit**
```
POST /api/landlord/verification/properties/:propertyId/audit/request
```
**Request:**
```json
{
  "preferredDates": ["date", "date", "date"],
  "preferredTimeSlots": ["morning | afternoon | evening"],
  "accessInstructions": "string",
  "contactPhone": "string"
}
```
**Response:**
```json
{
  "auditRequestId": "audit_req_123",
  "status": "pending_assignment",
  "estimatedScheduling": "3-5 business days"
}
```

**Get Audit Status**
```
GET /api/landlord/verification/properties/:propertyId/audit
```
**Response:**
```json
{
  "auditId": "audit_456",
  "status": "scheduled | in_progress | completed | failed",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "assignedAgent": {
    "id": "agent_789",
    "name": "John Smith",
    "phone": "+1234567890",
    "rating": 4.8
  },
  "completedAt": null,
  "report": null
}
```

#### Verification Document Model

```json
{
  "id": "string",
  "landlordId": "string",
  "propertyId": "string | null (null for account-level)",
  "verificationType": "identity | address | cofo | audit",
  "documentUrl": "string",
  "documentType": "string (passport, utility_bill, etc.)",
  "documentNumber": "string",
  "issueDate": "date",
  "expiryDate": "date | null",
  "status": "pending | approved | rejected | expired",
  "submittedAt": "date",
  "reviewedAt": "date | null",
  "reviewedBy": "string (admin user ID) | null",
  "rejectionReason": "string | null",
  "metadata": {
    "addressOnDocument": {...},
    "issuingAuthority": "string",
    "matchScore": "number (for address matching)"
  }
}
```

#### Admin Review Endpoints (Internal)

```
GET /api/admin/verifications/pending
GET /api/admin/verifications/:id
POST /api/admin/verifications/:id/approve
POST /api/admin/verifications/:id/reject
```

**Reject Request:**
```json
{
  "reason": "document_expired | address_mismatch | unreadable | fraudulent | other",
  "details": "string (explanation for landlord)",
  "allowResubmission": "boolean"
}
```

#### Notifications Triggered

| Event | Notification Type | Recipients |
|-------|------------------|------------|
| Document submitted | `verification_submitted` | Landlord |
| Document approved | `verification_approved` | Landlord |
| Document rejected | `verification_rejected` | Landlord |
| Tier upgraded | `tier_upgrade` | Landlord |
| Verification expiring (30 days) | `verification_expiring` | Landlord |
| Audit scheduled | `audit_scheduled` | Landlord, Agent |
| Audit completed | `audit_completed` | Landlord |

#### Business Rules

1. **Unlock Dependencies**: Physical audit cannot be requested until C of O is approved
2. **Expiration Handling**: 
   - System checks daily for expiring verifications
   - Notifications sent at 30, 14, and 7 days before expiry
   - Expired verifications automatically downgrade tier
3. **Address Matching**: C of O address must have >90% match score with property address
4. **Rejection Limits**: After 3 rejections for same document type, require manual support ticket
5. **Audit Assignment**: Auto-assign to available agent in property's service area

### Maintenance (Landlord View)
```
GET /api/landlord/maintenance
GET /api/landlord/maintenance/:id
PUT /api/landlord/maintenance/:id
POST /api/landlord/maintenance/:id/assign
```

### Alerts
```
GET /api/landlord/alerts
PUT /api/landlord/alerts/:id/read
PUT /api/landlord/alerts/read-all
```

---

## Agent Features

### Job Board
```
GET /api/agent/jobs                          # Available jobs
GET /api/agent/jobs/:id                      # Job detail
POST /api/agent/jobs/:id/accept              # Accept job
```

**Job Types:**
- Property Viewing
- Move-in/Move-out Inspection
- Document Pickup
- Maintenance Coordination

**Job Data:**
```json
{
  "id": "string",
  "type": "viewing | inspection | document-pickup | maintenance",
  "propertyId": "string",
  "propertyAddress": "string",
  "clientName": "string",
  "clientPhone": "string",
  "scheduledDate": "date",
  "earnings": "number",
  "status": "open | accepted | in-progress | completed | cancelled",
  "priority": "low | medium | high",
  "notes": "string"
}
```

### My Jobs
```
GET /api/agent/my-jobs
GET /api/agent/my-jobs/:id
PUT /api/agent/my-jobs/:id/status
POST /api/agent/my-jobs/:id/complete
```

### Schedule
```
GET /api/agent/schedule
GET /api/agent/schedule?date=YYYY-MM-DD
```

### Earnings
```
GET /api/agent/earnings
GET /api/agent/earnings/history
POST /api/agent/earnings/withdraw
```

**Earnings Response:**
```json
{
  "totalEarnings": "number",
  "pendingPayout": "number",
  "weeklyEarnings": "number",
  "monthlyEarnings": "number",
  "completedJobs": "number",
  "rating": "number",
  "reviewCount": "number",
  "transactions": [...]
}
```

---

## Messaging & Notifications

### Messages
```
GET /api/messages/conversations
GET /api/messages/conversations/:id
POST /api/messages/conversations
POST /api/messages/conversations/:id/messages
PUT /api/messages/conversations/:id/read
```

### Real-time Messaging
**WebSocket:** `wss://api.example.com/ws/messages`

### Notifications
```
GET /api/notifications
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
DELETE /api/notifications/:id
```

**Notification Types:**
- `payment_due` - Upcoming payment reminder
- `payment_received` - Payment confirmation
- `application_status` - Application update
- `maintenance_update` - Maintenance status change
- `lease_expiring` - Lease expiration warning
- `new_message` - New message received
- `viewing_scheduled` - Viewing confirmation
- `job_available` - New job for agents

### Push Notifications (Mobile)
```
POST /api/notifications/register-device
DELETE /api/notifications/unregister-device
PUT /api/notifications/preferences
```

---

## Payments & Financials

### Tenant Payments
```
GET /api/tenant/payments
GET /api/tenant/payments/upcoming
POST /api/tenant/payments
GET /api/tenant/payments/history
```

**Payment Methods:**
```
GET /api/payments/methods
POST /api/payments/methods
DELETE /api/payments/methods/:id
PUT /api/payments/methods/:id/default
```

### Landlord Financials
```
GET /api/landlord/financials/summary
GET /api/landlord/financials/transactions
GET /api/landlord/financials/reports
POST /api/landlord/financials/payout
```

**Financial Summary:**
```json
{
  "totalRevenue": "number",
  "monthlyRevenue": "number",
  "pendingPayments": "number",
  "overduePayments": "number",
  "upcomingPayments": "number",
  "expenses": "number",
  "netIncome": "number",
  "occupancyRate": "number",
  "revenueByProperty": [...]
}
```

### Transaction History
```
GET /api/transactions
```
Shared by all roles with role-based filtering

---

## File Storage

### File Upload
```
POST /api/uploads
POST /api/uploads/signed-url
```

**File Types Needed:**
- Property images (multiple per property)
- User avatars
- Document uploads (ID, lease agreements, licenses)
- Maintenance request images

### Recommended Storage:
- AWS S3 or Google Cloud Storage
- CloudFront/CDN for image delivery
- Presigned URLs for secure uploads

---

## AI Features

### AI Chat
```
POST /api/ai/chat
```
**Request:**
```json
{
  "message": "string",
  "context": {
    "currentPage": "string",
    "userId": "string",
    "propertyId": "string (if on property page)"
  }
}
```

### AI Property Search
```
POST /api/ai/search
```
Natural language property search

### AI Recommendations
```
GET /api/ai/recommendations
```
Personalized property recommendations based on user behavior

### Voice Input Processing
```
POST /api/ai/voice-to-text
```

---

## Data Models

### Entity Relationship Summary

```
User (1) ──── (N) Property              # Landlord owns properties
User (1) ──── (N) Application           # Tenant submits applications
User (1) ──── (N) SavedProperty         # Tenant saves properties
Property (1) ── (N) Application         # Property receives applications
Property (1) ── (1) Lease               # Active lease per property
Lease (N) ──── (1) User (Tenant)        # Tenant has lease
Lease (N) ──── (1) User (Landlord)      # Landlord owns lease
Property (1) ── (N) MaintenanceRequest  # Property has maintenance
User (Agent) ── (N) Job                 # Agent takes jobs
Property (1) ── (N) Job                 # Jobs are for properties
User (1) ──── (N) Transaction           # All users have transactions
User (1) ──── (N) Notification          # Users receive notifications
User (N) ──── (N) Conversation          # Users participate in chats
```

### Required Database Tables

| Table | Description |
|-------|-------------|
| `users` | All user types with role field |
| `user_profiles` | Extended profile data by role |
| `properties` | Property listings |
| `property_images` | Images for properties |
| `applications` | Rental applications |
| `leases` | Lease agreements |
| `maintenance_requests` | Maintenance tickets |
| `jobs` | Agent job assignments |
| `transactions` | Payment records |
| `messages` | Chat messages |
| `conversations` | Chat threads |
| `notifications` | User notifications |
| `favorites` | Saved/favorited properties |
| `verification_documents` | KYC/verification uploads |

---

## Integration Requirements

### Third-Party Services

| Service | Purpose |
|---------|---------|
| **Stripe/Paystack** | Payment processing |
| **Twilio/MessageBird** | SMS for 2FA, notifications |
| **SendGrid/Mailgun** | Email delivery |
| **Google Maps API** | Maps, geocoding, autocomplete |
| **OpenAI/Claude API** | AI chat and search |
| **AWS S3** | File storage |
| **Firebase/OneSignal** | Push notifications |
| **WebSocket Server** | Real-time messaging |

### Security Requirements

- [ ] JWT-based authentication with refresh tokens
- [ ] Rate limiting on all endpoints
- [ ] Input validation and sanitization
- [ ] CORS configuration for frontend domains
- [ ] Encryption at rest for sensitive data
- [ ] HTTPS only
- [ ] PCI compliance for payment handling
- [ ] GDPR compliance for user data

---

## Next Steps

1. **Review & Feedback** - Review this document and provide feedback
2. **Prioritize Modules** - Decide which features to implement first
3. **API Design** - Finalize endpoint specifications with OpenAPI/Swagger
4. **Database Schema** - Create detailed ERD and migration scripts
5. **Development** - Begin backend implementation

---

> **Questions for Backend Team:**
> 1. Preferred backend framework (Node.js/Express, Python/Django, Go, etc.)?
> 2. Database preference (PostgreSQL, MongoDB, etc.)?
> 3. Hosting platform (AWS, GCP, Azure, etc.)?
> 4. Any existing infrastructure to integrate with?

