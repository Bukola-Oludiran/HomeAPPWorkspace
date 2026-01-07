# HomeAI Nigeria - Backend Requirements

> **Purpose:** Track backend API endpoints and data models needed as frontend development progresses.  
> **Last Updated:** December 13, 2025

---

## 📌 Overview

This document tracks all backend requirements discovered during frontend development. Each endpoint includes:
- HTTP method and path
- Request/response structure
- Feature/screen where it's needed

---

## 🔐 Authentication & User Management

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| POST | `/api/v1/auth/login` | User login with email/phone + password | Login screen |
| POST | `/api/v1/auth/register` | User registration | Register screen |
| POST | `/api/v1/auth/verify-otp` | Verify OTP for phone/email | Verification flow |
| POST | `/api/v1/auth/logout` | Logout and invalidate session | All dashboards |
| GET | `/api/v1/users/me` | Get current user profile | All authenticated screens |
| PATCH | `/api/v1/users/me` | Update user profile | Profile settings |
| POST | `/api/v1/users/me/verify-nin` | Initiate NIN verification | Verification hub |

### Data Models

```typescript
// User
interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: 'tenant' | 'landlord' | 'agent' | 'buyer' | 'seller';
  verificationLevel: 'unverified' | 'bronze' | 'silver' | 'gold' | 'platinum';
  trustScore: number;
  createdAt: Date;
}
```

---

## 🏠 Property Discovery

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/properties` | Search/filter properties | Homepage, Search pages |
| GET | `/api/v1/properties/:id` | Get property details | Property detail page |
| GET | `/api/v1/properties/featured` | Get featured properties | Homepage |
| GET | `/api/v1/properties/saved` | Get user's saved properties | Saved properties page |
| POST | `/api/v1/properties/:id/save` | Save/unsave property | Property cards |
| GET | `/api/v1/properties/:id/similar` | Get similar properties | Property detail page |

### Query Parameters for Search

```
/api/v1/properties?
  type=rent|buy|short-let|land
  &location=Lagos
  &minPrice=500000
  &maxPrice=2000000
  &bedrooms=2
  &bathrooms=1
  &amenities=pool,gym,parking
  &verificationTier=gold,platinum
  &sort=price_asc|price_desc|newest|verified
  &page=1
  &limit=20
```

### Data Models

```typescript
// Property
interface Property {
  id: string;
  ownerId: string;
  listingType: 'rent' | 'sale' | 'short-let' | 'land';
  title: string;
  description: string;
  address: string;
  lga: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
  price: number;
  pricePeriod?: 'month' | 'year' | 'day';
  bedrooms: number;
  bathrooms: number;
  size: number; // sqft
  amenities: string[];
  photos: string[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  verificationTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'pending' | 'rented' | 'sold' | 'maintenance' | 'off-market';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📝 Applications (Rental/Purchase)

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/applications` | List user's applications | Applications tracker |
| POST | `/api/v1/applications` | Create new application | Apply flow |
| GET | `/api/v1/applications/:id` | Get application details | Application detail |
| PATCH | `/api/v1/applications/:id` | Update application | Edit application |
| DELETE | `/api/v1/applications/:id` | Withdraw application | Withdraw popup |
| GET | `/api/v1/properties/:id/applications` | Get applications for property (landlord) | Applicant manager |
| PATCH | `/api/v1/applications/:id/status` | Approve/reject application (landlord) | Applicant detail |

### Data Models

```typescript
// Application
interface Application {
  id: string;
  propertyId: string;
  applicantId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'escrow_pending';
  applicationType: 'rental' | 'purchase';
  employmentInfo: object;
  references: object;
  documents: string[];
  notes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}
```

---

## 📅 Viewings & Scheduling

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| POST | `/api/v1/viewings` | Schedule a viewing | Schedule viewing flow |
| GET | `/api/v1/viewings` | List user's viewings | Dashboard |
| PATCH | `/api/v1/viewings/:id` | Reschedule viewing | Viewing management |
| DELETE | `/api/v1/viewings/:id` | Cancel viewing | Viewing management |
| GET | `/api/v1/properties/:id/availability` | Get available slots | Schedule viewing flow |

---

## 🔧 Maintenance Requests

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/maintenance-requests` | List maintenance requests | Maintenance log |
| POST | `/api/v1/maintenance-requests` | Create maintenance request | Request form |
| GET | `/api/v1/maintenance-requests/:id` | Get request details | Request detail |
| PATCH | `/api/v1/maintenance-requests/:id` | Update request | Edit request |
| POST | `/api/v1/maintenance-requests/:id/assign` | Assign agent (landlord) | Landlord dashboard |

### Data Models

```typescript
// MaintenanceRequest
interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  assignedAgentId?: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  photos: string[];
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

---

## 💳 Payments & Transactions

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/payments` | List payment history | Payments history |
| POST | `/api/v1/payments/initiate` | Initiate payment | Pay rent flow |
| GET | `/api/v1/payments/:id` | Get payment details | Payment detail modal |
| GET | `/api/v1/transactions` | List transactions | Transaction history |
| GET | `/api/v1/escrow/:id/status` | Check escrow status | Escrow status |

### Data Models

```typescript
// Payment
interface Payment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'purchase' | 'service_fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  reference: string;
  dueDate: Date;
  paidAt?: Date;
}
```

---

## 📜 Lease Management

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/leases/:id` | Get lease details | My Home, Lease details |
| POST | `/api/v1/leases` | Create lease agreement | Post-approval flow |
| PATCH | `/api/v1/leases/:id` | Update lease terms | Edit lease terms |
| POST | `/api/v1/leases/:id/renew` | Send renewal offer | Draft renewal |
| PATCH | `/api/v1/leases/:id/respond` | Respond to offer | Accept/reject offer |

---

## 👷 Agent Services

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/jobs` | List available jobs | Agent job board |
| GET | `/api/v1/jobs/:id` | Get job details | Job detail |
| POST | `/api/v1/jobs/:id/accept` | Accept job | Job board |
| POST | `/api/v1/jobs/:id/decline` | Decline job | Job board |
| PATCH | `/api/v1/jobs/:id/status` | Update job status | Active job |
| GET | `/api/v1/agents/me/schedule` | Get agent schedule | Schedule page |
| POST | `/api/v1/agents/me/events` | Add personal event | Add event modal |
| GET | `/api/v1/agents/me/earnings` | Get earnings summary | Earnings dashboard |

---

## 💬 Messaging

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/conversations` | List conversations | Messages page |
| GET | `/api/v1/conversations/:id/messages` | Get messages | Conversation view |
| POST | `/api/v1/conversations/:id/messages` | Send message | Chat input |
| GET | `/api/v1/users/:id/profile` | Get user public profile | Profile sidebar |

---

## 🤖 AI Assistant

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| POST | `/api/v1/ai/chat` | Send message to AI | Floating AI bar |
| GET | `/api/v1/ai/suggestions` | Get contextual suggestions | AI suggested actions |
| POST | `/api/v1/ai/execute` | Execute AI-suggested action | AI action buttons |

---

## 📄 Property Verification

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/properties/:id/verification` | Get verification status | Verification hub |
| POST | `/api/v1/properties/:id/documents` | Upload verification docs | Document upload |
| GET | `/api/v1/verification/steps` | Get verification steps | Progress tracker |

---

## 🔔 Notifications

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| GET | `/api/v1/notifications` | List notifications | Notification bell |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | Notification item |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read | Notification dropdown |

---

## 📎 File Uploads

### Endpoints

| Method | Endpoint | Description | Required For |
|--------|----------|-------------|--------------|
| POST | `/api/v1/uploads/image` | Upload image | Photos, avatars |
| POST | `/api/v1/uploads/document` | Upload document | Verification docs |
| DELETE | `/api/v1/uploads/:id` | Delete upload | File management |

---

## 🔒 Security Notes

- All endpoints require authentication unless marked as public
- Use JWT tokens in Authorization header
- Implement rate limiting
- Validate all file uploads (type, size)
- Sanitize all user inputs
- Log all sensitive operations

---

## 📝 Changelog

| Date | Change | Developer |
|------|--------|-----------|
| Dec 13, 2025 | Initial document creation | - |
