# HomeAI Nigeria - Backend Requirements

This document tracks backend API endpoints and data requirements identified during frontend development. Each section maps to a frontend feature area.

---

## Authentication & User Management

### Endpoints
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/register` | User registration | `{ email, password, userType, ... }` | `{ token, user }` |
| POST | `/api/auth/logout` | Logout | - | `{ success }` |
| GET | `/api/auth/me` | Get current user | - | `{ user }` |
| PUT | `/api/users/:id` | Update user profile | `{ ...userFields }` | `{ user }` |
| GET | `/api/users/:id` | Get user profile (public) | - | `{ user }` |

### Data Models
- **User**: id, email, phone, userType (tenant/landlord/agent), verificationLevel, trustScore, avatar, createdAt

---

## Property Management

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List properties (with filters) |
| GET | `/api/properties/:id` | Get property details |
| POST | `/api/properties` | Create new property listing |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| GET | `/api/properties/featured` | Get featured properties |
| GET | `/api/properties/search` | Search with filters (location, price, beds, type, verification) |

### Query Parameters for Search
- `type`: buy | rent | short-let | land
- `location`: string
- `minPrice`, `maxPrice`: number
- `beds`, `baths`: number
- `propertyType`: apartment | house | condo | land
- `verificationTier`: bronze | silver | gold | platinum
- `sort`: price_asc | price_desc | newest | most_verified

### Data Models
- **Property**: id, ownerId, listingType, address, lga, verificationTier, price, photos[], description, beds, baths, sqft, amenities[], cOfOVerified, physicalAuditDate, createdAt

---

## Landlord Dashboard

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/landlord/dashboard` | Dashboard stats (revenue, occupancy, alerts) |
| GET | `/api/landlord/properties` | Landlord's properties |
| GET | `/api/landlord/applicants` | Pending applicants |
| GET | `/api/landlord/applicants/:id` | Applicant details |
| PUT | `/api/landlord/applicants/:id/approve` | Approve applicant |
| PUT | `/api/landlord/applicants/:id/reject` | Reject applicant |
| GET | `/api/landlord/financials` | Financial overview |
| POST | `/api/landlord/properties/:id/verify` | Start verification process |
| GET | `/api/landlord/alerts` | Actionable alerts |

### Data Models
- **DashboardStats**: totalRevenue, occupancyRate, activeListings, alertCount, properties[]
- **Applicant**: id, tenantId, propertyId, status, applicationDate, verificationStatus

---

## Tenant Dashboard

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant/dashboard` | Dashboard stats |
| GET | `/api/tenant/rental` | Current rental info |
| GET | `/api/tenant/applications` | User's applications |
| POST | `/api/tenant/applications` | Submit application |
| DELETE | `/api/tenant/applications/:id` | Withdraw application |
| GET | `/api/tenant/saved` | Saved/favorited properties |
| POST | `/api/tenant/saved/:propertyId` | Save property |
| DELETE | `/api/tenant/saved/:propertyId` | Unsave property |
| GET | `/api/tenant/payments` | Payment history |
| POST | `/api/tenant/payments` | Make payment |

### Data Models
- **TenantDashboard**: nextPayment, leaseStatus, openRequests, pendingApplications
- **Application**: id, propertyId, status, submittedAt, documents[]

---

## Maintenance System

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | List maintenance requests |
| GET | `/api/maintenance/:id` | Get request details |
| POST | `/api/maintenance` | Create maintenance request |
| PUT | `/api/maintenance/:id` | Update request status |
| POST | `/api/maintenance/:id/assign` | Assign agent to request |

### Data Models
- **MaintenanceRequest**: id, propertyId, tenantId, category, description, urgency, status, photos[], assignedAgentId, createdAt, resolvedAt

---

## Agent Platform

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/jobs` | Available jobs |
| GET | `/api/agent/jobs/accepted` | My accepted jobs |
| POST | `/api/agent/jobs/:id/accept` | Accept job |
| POST | `/api/agent/jobs/:id/decline` | Decline job |
| PUT | `/api/agent/jobs/:id/complete` | Mark job complete |
| GET | `/api/agent/schedule` | Calendar/schedule |
| POST | `/api/agent/schedule/event` | Add personal event |
| GET | `/api/agent/earnings` | Earnings summary |
| GET | `/api/agent/earnings/history` | Payout history |

### Data Models
- **Job**: id, title, location, category, payout, scheduledTime, distance, urgency, status
- **Earnings**: todayTotal, weekTotal, monthTotal, pendingPayout, transactions[]

---

## Messaging System

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | List conversations |
| GET | `/api/messages/conversations/:id` | Get conversation messages |
| POST | `/api/messages/conversations/:id` | Send message |
| POST | `/api/messages/conversations` | Start new conversation |

### Data Models
- **Conversation**: id, participants[], lastMessage, updatedAt
- **Message**: id, conversationId, senderId, content, createdAt, read

---

## Verification System

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/verification/:propertyId` | Get verification status |
| POST | `/api/verification/:propertyId/documents` | Upload verification document |
| GET | `/api/verification/:propertyId/progress` | Get verification progress |

### External Integrations Required
- NIN verification (NIMC)
- Land Registry API (Lagos)
- LASRERA verification

---

## Lease & Agreements

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leases/:id` | Get lease details |
| POST | `/api/leases` | Create lease |
| PUT | `/api/leases/:id` | Update lease terms |
| POST | `/api/leases/:id/renew` | Send renewal offer |
| POST | `/api/leases/:id/respond` | Respond to renewal offer |

### Data Models
- **Lease**: id, propertyId, tenantId, landlordId, startDate, endDate, rentAmount, status, terms

---

## Transaction & Payment History

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transaction history |
| GET | `/api/transactions/:id` | Get transaction details |

### Data Models
- **Transaction**: id, type, amount, status, createdAt, propertyId, parties[]

---

## AI Assistant

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Send message to AI assistant |
| GET | `/api/ai/suggestions` | Get contextual suggestions |

### Request/Response
- **Chat Request**: `{ message, context: { screen, propertyId?, userId? } }`
- **Chat Response**: `{ response, actions?, propertyCards? }`

---

## Notes for Backend Team

1. **Authentication**: All endpoints except public property search require JWT authentication
2. **User Types**: System supports `tenant`, `landlord`, `agent` roles with different permissions
3. **Verification Tiers**: Bronze (40%), Silver (70%), Gold (90%), Platinum (100%)
4. **Currency**: Primary currency is NGN (Nigerian Naira), USD support for diaspora
5. **File Storage**: Property photos, verification documents need secure storage (S3 recommended)
6. **Real-time**: Messaging and notifications should support WebSocket for real-time updates
