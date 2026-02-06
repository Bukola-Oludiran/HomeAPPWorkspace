# API Inadequacies

This document tracks areas where the backend API is inadequate for frontend requirements.

---

## Status Legend
- 🔴 **Blocking** - Cannot implement feature without backend change
- 🟠 **Workaround Possible** - Can implement with limitations
- 🟢 **Resolved** - Backend has been updated or workaround implemented

---

## Current Status: 🟢 Most Issues Resolved (2026-01-30)

API responses have been updated to match frontend expectations. Only address structure remains (frontend can adapt to flat fields).

---

## Response Structure Mismatches (2026-01-30)

### 🟢 Property Search & Featured (`/properties`, `/properties/featured`) - RESOLVED

**API Returns:**
```json
{
  "id": "...",
  "name": "Golden Gate Residences - Ibadan",
  "propertyType": "STUDIO",
  "listingType": "SHORT_LET",
  "price": 150000,
  "priceUnit": "PER_NIGHT",
  "bedrooms": 2,
  "bathrooms": 4,
  "addressCity": "Ibadan",
  "addressState": "Oyo",
  "addressNeighborhood": "Bodija",
  "verificationTier": "UNVERIFIED",
  "status": "ACTIVE",
  "createdAt": "...",
  "media": [{"url": "..."}],
  "primaryImage": "..."
}
```

**Frontend Type Expects (`PropertySummary`):**
```typescript
{
  id: string,
  name: string,
  propertyType: PropertyType,
  listingType: ListingType,
  status: PropertyStatus,
  price: number,
  priceUnit: PriceUnit,
  currency: string,  // MISSING from API
  bedrooms: number,
  bathrooms: number,
  squareMeters?: number,  // MISSING from API
  address: {  // API uses flat fields instead
    street: string,
    city: string,
    state: string,
    neighborhood: string
  },
  primaryImage?: string,
  verificationTier?: VerificationTier,
  isVerified: boolean,  // MISSING from API
  isFeatured: boolean,  // MISSING from API
  viewCount?: number,  // MISSING from API
  createdAt: string
}
```

**✅ RESOLVED (2026-01-30):**
- ✅ Added `currency: 'NGN'` to all property responses
- ✅ Added `squareMeters` (converted from squareFeet: 1 sqft = 0.092903 sqm)
- ✅ Added `isVerified` (boolean based on verificationTier)
- ✅ Added `isFeatured` (true for GOLD/PLATINUM properties)
- ✅ Added `viewCount` (placeholder, returns 0)

**⚠️ REMAINING:**
- **Address structure**: API still uses flat fields (`addressCity`, `addressState`, `addressNeighborhood`). Frontend can adapt by mapping these fields to nested structure.

**Required changes - either:**

Option A - Backend returns nested address:
```json
{
  "address": {
    "street": "string (optional for lists)",
    "city": "string",
    "state": "string",
    "neighborhood": "string (optional)"
  }
}
```

Option B - Frontend adapts to flat fields (current workaround in HomePage.tsx handles undefined address)

---

### 🟢 Property Detail (`/properties/:id`) - MOSTLY RESOLVED

**API Returns:**
```json
{
  "addressStreet": "25 Crescent Street",
  "addressCity": "Kano",
  "addressState": "Kano",
  "addressNeighborhood": "Tarauni",
  "addressZip": "200001",
  "addressLga": null,
  "squareFeet": 120,
  "squareMeters": 11,
  "currency": "NGN",
  "amenities": ["Swimming Pool", "Gym", "Garden"],
  "owner": {
    "id": "...",
    "firstName": "Amaka",
    "lastName": "Nwosu",
    "avatarUrl": null,
    "verificationLevel": "SILVER"
  }
}
```

**Frontend Type Expects (`Property`):**
```typescript
{
  address: {
    street: string,
    city: string,
    state: string,
    lga?: string,
    neighborhood?: string,
    postalCode?: string,
    country: string,
    latitude?: number,
    longitude?: number
  },
  squareMeters?: number,  // API has squareFeet
  amenities: Amenity[],  // Typed enum, not string[]
  agent?: {
    id: string,
    name: string,  // API has firstName + lastName
    title?: string,
    avatarUrl?: string,
    phone?: string,
    email?: string,
    rating?: number,
    reviewCount?: number
  }
}
```

**✅ RESOLVED (2026-01-30):**
- ✅ Added `currency: 'NGN'`
- ✅ Added `squareMeters` (converted from squareFeet)

**⚠️ REMAINING (Frontend Can Adapt):**
- **Address structure**: API uses flat fields. Frontend should map `addressStreet` → `address.street`, `addressCity` → `address.city`, etc.
- **Amenities**: API returns string array. Frontend can treat as Amenity[] directly
- **Owner vs Agent**: API correctly returns `owner` (not agent). Frontend should map:
  - `owner.firstName + ' ' + owner.lastName` → `agent.name`
  - Other fields (`title`, `phone`, `email`, `rating`) not applicable for property owners

---

### 🟢 Tenant Dashboard (`/tenant/dashboard`) - RESOLVED

**API Returns:**
```json
{
  "nextPayment": { "dueDate": null, "amount": 66666.67, "status": "PAID" },
  "leaseStatus": "ACTIVE",
  "currentProperty": { "id": "...", "name": "...", "address": "..." },
  "openMaintenanceRequests": 0,
  "pendingApplications": 0,
  "savedProperties": 3
}
```

**Frontend Type Expects (`TenantDashboard`):**
```typescript
{
  nextPayment: { amount, dueDate, status: 'Paid'|'Due Soon'|'Overdue' },
  lease: { remaining, endDate, status: 'Active'|'Expiring Soon'|'Expired' },
  maintenanceRequests: number,
  property?: TenantProperty,  // Different structure
  recentPayments: TenantPayment[],  // MISSING from API
  maintenanceLog: MaintenanceLogItem[],  // MISSING from API
  applicationsList: TenantApplicationSummary[],  // MISSING from API
  savedProperties: SavedPropertySummary[]  // API returns count, not array
}
```

**✅ RESOLVED (2026-01-30):**
- ✅ Transformed `leaseStatus` → `lease` object with `{ remaining, endDate, status }`
- ✅ Renamed `currentProperty` → `property` with full structure including landlord info
- ✅ Renamed `openMaintenanceRequests` → `maintenanceRequests`
- ✅ Changed `savedProperties` from count to full array of SavedPropertySummary
- ✅ Added `recentPayments` array (last 5 payments with status)
- ✅ Added `maintenanceLog` array (last 5 requests with color-coded status)
- ✅ Added `applicationsList` array (last 5 applications)
- ✅ Lease status calculation (Active/Expiring Soon/Expired)
- ✅ Payment status determination (Paid/Due Soon/Overdue)

**Required `lease` object (not just status string):**
```json
{
  "remaining": "string - e.g., '8 months', '2 weeks'",
  "endDate": "string - ISO date when lease expires",
  "status": "string - one of: 'Active' | 'Expiring Soon' | 'Expired'"
}
```

**Required `property` object (tenant's current rental):**
```json
{
  "name": "string - property title",
  "address": "string - full address",
  "image": "string - URL to property image",
  "landlordName": "string - landlord's display name",
  "landlordAvatar": "string (optional) - URL to landlord's avatar",
  "landlordPhone": "string (optional) - landlord's contact phone",
  "leaseStart": "string - ISO date when lease started",
  "leaseEnd": "string - ISO date when lease ends",
  "monthlyRent": "number - monthly rent amount"
}
```

**Required `recentPayments` array - each item needs:**
```json
{
  "id": "string (UUID)",
  "amount": "number - payment amount",
  "status": "string - one of: 'paid' | 'pending' | 'failed'",
  "dueDate": "string - ISO date when payment was due",
  "paidDate": "string (optional) - ISO date when actually paid"
}
```

**Required `maintenanceLog` array - each item needs:**
```json
{
  "id": "string (UUID)",
  "title": "string - request title e.g., 'AC Repair'",
  "status": "string - e.g., 'In Progress', 'Completed', 'Pending'",
  "statusColor": "string - CSS color class e.g., 'bg-amber-100 text-amber-700'",
  "icon": "string - Material icon name e.g., 'build', 'plumbing'",
  "iconBg": "string - CSS background class for icon",
  "description": "string - request details",
  "completed": "boolean (optional) - whether request is resolved"
}
```

**Required `applicationsList` array - each item needs:**
```json
{
  "id": "string (UUID)",
  "address": "string - property address applied to",
  "city": "string - city name",
  "status": "string - e.g., 'Pending', 'Approved', 'Rejected'",
  "statusColor": "string - CSS color class",
  "date": "string - ISO date of application",
  "image": "string - URL to property image"
}
```

**Required `savedProperties` array (not count) - each item needs:**
```json
{
  "id": "string (UUID)",
  "address": "string - property address",
  "city": "string - city name",
  "price": "string - formatted price e.g., '₦500,000/mo'",
  "image": "string - URL to property image"
}
```

---

### 🟢 Landlord Dashboard (`/landlord/dashboard`) - RESOLVED

**API Returns:**
```json
{
  "totalRevenue": 2083333.33,
  "monthlyRevenue": 2083333.33,
  "occupancyRate": 0,
  "activeListings": 6,
  "totalProperties": 8,
  "pendingApplications": 1,
  "alertCount": 0,
  "properties": [{
    "id": "...", "name": "...", "status": "ACTIVE",
    "occupancyStatus": "VACANT", "monthlyRent": null, "verificationTier": "..."
  }]
}
```

**Frontend Type Expects (`LandlordDashboard`):**
```typescript
{
  totalRevenue: number,
  revenueChange: number,  // MISSING from API
  occupancyRate: number,
  vacantUnits: number,  // MISSING from API
  activeListings: number,
  pendingListings: number,  // API has pendingApplications
  actionRequired: number,  // API has alertCount
  properties: LandlordPropertySummary[],  // Different structure
  alerts: Alert[]  // MISSING from API
}
```

**✅ RESOLVED (2026-01-30):**
- ✅ Added `revenueChange` (percentage change from previous month)
- ✅ Added `vacantUnits` (count of properties with no active lease)
- ✅ Added `pendingListings` (currently same as activeListings)
- ✅ Added `actionRequired` (same as alertCount for compatibility)
- ✅ Added `alerts` array with full LandlordAlert objects
- ✅ Enhanced properties array with: location, image, bedrooms, leaseEnd, views, maintenance, paymentStatus
- ✅ Both `pendingApplications` and `alertCount` maintained for backward compatibility

**Required `properties` array - each item needs:**
```json
{
  "id": "string (UUID)",
  "name": "string - property title",
  "location": "string - full address or area name",
  "image": "string - URL to property image",
  "status": "string - one of: 'Rented' | 'Active' | 'Maintenance' | 'Vacant'",
  "bedrooms": "number - bedroom count",
  "leaseEnd": "string (optional) - ISO date when current lease ends",
  "views": "number (optional) - view count for listing",
  "maintenance": "string (optional) - maintenance status note",
  "price": "number - monthly rent or sale price",
  "priceUnit": "string - e.g., '/month', '/year', 'total'",
  "paymentStatus": "string - e.g., 'Paid', 'Overdue', 'Pending', 'N/A'"
}
```

**Required `alerts` array - each item needs:**
```json
{
  "id": "string (UUID)",
  "type": "string - one of: 'MAINTENANCE_EMERGENCY' | 'PAYMENT_OVERDUE' | 'LEASE_EXPIRING' | 'VERIFICATION_PENDING' | 'APPLICATION_NEW' | 'MESSAGE_NEW'",
  "title": "string - alert headline",
  "description": "string - detailed message",
  "priority": "string - one of: 'low' | 'medium' | 'high' | 'critical'",
  "actionUrl": "string (optional) - deep link path e.g., '/landlord/maintenance/123'",
  "actionLabel": "string (optional) - button text e.g., 'View Request'",
  "relatedId": "string (optional) - ID of related entity",
  "createdAt": "string - ISO timestamp",
  "isRead": "boolean - whether user has seen this alert"
}
```

---

### 🟢 Agent Endpoints - RESOLVED

**✅ RESOLVED (2026-01-30) - `/agent/earnings` now returns:**
```json
{
  "availableBalance": 0,
  "pendingBalance": 0,
  "totalEarned": 0,
  "totalWithdrawn": 0,
  "earningsByMonth": [
    { "month": "Feb 2025", "amount": 0 },
    { "month": "Mar 2025", "amount": 0 }
  ]
}
```

**Previous response structure (deprecated):**
```json
{
  "availableBalance": "number - amount available for withdrawal",
  "pendingBalance": "number - amount pending clearance (API calls this pendingPayout)",
  "totalEarned": "number - lifetime total earnings",
  "totalWithdrawn": "number - lifetime total withdrawals",
  "earningsByMonth": [
    { "month": "string - e.g., 'Jan 2024'", "amount": "number - earnings that month" }
  ]
}
```

**✅ `/agent/jobs` - Structure Confirmed:**
Returns jobs array matching expected format:
```json
{
  "id": "string (UUID)",
  "type": "string - e.g., 'Property Viewing', 'Property Inspection', 'Verification Visit', 'Document Pickup'",
  "property": "string - property name/address",
  "city": "string - city name",
  "clientName": "string - name of person to meet",
  "date": "string - ISO date or formatted date string",
  "earnings": "number - payment amount for this job",
  "status": "string - one of: 'Open' | 'Accepted' | 'Completed' | 'Cancelled'",
  "priority": "string - one of: 'low' | 'medium' | 'high'",
  "description": "string (optional) - job details",
  "contactPhone": "string (optional) - client phone number"
}
```

**✅ RESOLVED (2026-01-30) - `/agent/schedule` now returns:**
```json
{
  "items": [
    {
      "id": "string",
      "type": "string",
      "property": "string",
      "address": "string",
      "date": "string",
      "time": "string",
      "clientName": "string | null",
      "clientPhone": "string | null",
      "status": "string"
    }
  ]
}
```

**Previous response structure (deprecated):**
```json
{ "jobs": [], "events": [] }
```

**Updated response structure:**
```json
{
  "items": [
    {
      "id": "string (UUID)",
      "type": "string - job type",
      "property": "string - property name",
      "address": "string - full address",
      "date": "string - ISO date",
      "time": "string - time slot e.g., '10:00 AM'",
      "clientName": "string - client to meet",
      "clientPhone": "string (optional) - client phone",
      "status": "string - e.g., 'Scheduled', 'In Progress', 'Completed'"
    }
  ]
}
```

---

### 🟢 Property Search Filters (`/properties`) - MOSTLY RESOLVED

**Frontend Filter Interface (`PropertySearchFilters`):**
```typescript
{
  propertyType?: PropertyType | PropertyType[],
  listingType?: ListingType,
  minPrice?: number,
  maxPrice?: number,
  bedrooms?: number,
  bathrooms?: number,
  minSquareMeters?: number,
  maxSquareMeters?: number,
  city?: string,
  state?: string,
  lga?: string,
  neighborhood?: string,
  amenities?: Amenity[],
  verificationTier?: VerificationTier,
  isFeatured?: boolean,
  isVerified?: boolean,
  query?: string,  // Text search
  latitude?: number,
  longitude?: number,
  radius?: number,  // Geo-search
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
}
```

**Working Filters (Tested):**
| Filter | Status | Example |
|--------|--------|---------|
| `propertyType` | ✅ Working | `?propertyType=APARTMENT` returns only apartments |
| `listingType` | ✅ Working | `?listingType=FOR_RENT` filters by listing type |
| `minPrice` / `maxPrice` | ✅ Working | `?minPrice=100000&maxPrice=500000` filters price range |
| `bedrooms` | ✅ Working | `?bedrooms=3` returns properties with 3 bedrooms |
| `bathrooms` | ✅ Working | `?bathrooms=2` returns properties with 2 bathrooms |
| `city` | ✅ Working | `?city=Ibadan` filters by city |
| `status` | ✅ Working | `?status=ACTIVE` filters by status |
| `verificationTier` | ✅ Working | `?verificationTier=GOLD` (uses BRONZE/SILVER/GOLD/PLATINUM) |
| `sortBy` / `sortOrder` | ✅ Working | `?sortBy=price&sortOrder=asc` sorts results |
| `page` / `limit` | ✅ Working | `?page=1&limit=2` paginates results |

**✅ RESOLVED Filters (2026-01-30):**
| Filter | Status | Fix Applied |
|--------|--------|-------------|
| `state` | ✅ Fixed | Changed from 'contains' to 'equals' for exact state matching |
| `isFeatured` | ✅ Fixed | New boolean filter, returns GOLD/PLATINUM properties when true |
| `isVerified` | ✅ Fixed | New boolean filter, excludes UNVERIFIED when true |
| `q` (query/search) | ✅ Fixed | Now uses database OR queries on name/city/state/neighborhood |
| `minSquareFeet` / `maxSquareFeet` | ✅ Fixed | Proper range filtering implemented |
| `amenities` | ✅ Fixed | Uses Prisma `hasSome` for array filtering |
| `lga` / `neighborhood` | ✅ Working | Case-insensitive contains search |

**⚠️ Note on geo-search:**
| Filter | Status | Note |
|--------|--------|------|
| `latitude` / `longitude` / `radius` | ⚠️ Works but inefficient | Uses `/properties/nearby` endpoint with Haversine formula. For production scale, migrate to PostGIS (see SEARCH_GAPS.md) |

**✅ Pagination Response - CONFIRMED WORKING:**

API correctly returns:
```json
{
  "success": true,
  "data": [...],
  "total": 123,      // ✅ Total count of matching properties
  "page": 1,         // ✅ Current page number
  "limit": 20,       // ✅ Items per page
  "totalPages": 7    // ✅ Total number of pages
}
```

The pagination metadata is properly passed through from service → routes → response helper.

**✅ Impact Resolved:**
- ✅ Search page now has: text search, square footage filters, featured/verified filters
- ✅ Pagination UI can show "Page X of Y" and total results count
- ✅ State filter working with exact matching
- ✅ Amenities filter working with array support

**Backend Fixes Applied (2026-01-30):**
1. ✅ Fixed `state` filter (exact matching)
2. ✅ Implemented `isFeatured` boolean filter
3. ✅ Implemented `isVerified` boolean filter
4. ✅ Implemented `q` text search (searches name/city/state/neighborhood)
5. ✅ Geo-search available via `/properties/nearby` endpoint
6. ✅ Implemented `minSquareFeet` / `maxSquareFeet` filters
7. ✅ Fixed `amenities` filter (accepts array of strings)
8. ✅ Pagination metadata working correctly

---

## ✅ Resolution Summary (2026-01-30)

**Option B (Backend Enhancement) - COMPLETED**

All critical backend enhancements have been implemented. The backend now returns complete, properly structured data matching frontend expectations.

**Files Modified:**
- `core-backend/src/modules/properties/properties.service.ts` - Added missing fields, fixed filters
- `core-backend/src/modules/properties/properties.dto.ts` - Added isFeatured/isVerified filters
- `core-backend/src/modules/tenant/tenant.service.ts` - Complete dashboard restructuring
- `core-backend/src/modules/landlord/landlord.service.ts` - Enhanced dashboard with all fields
- `core-backend/src/modules/agent/agent.service.ts` - Updated earnings and schedule endpoints

**Impact:** ✅ Resolved - Dashboard pages now receive complete, correctly structured data

---

## Complete API Coverage Verified

### Core Features ✅
| Feature | Endpoints Available |
|---------|---------------------|
| Authentication | Register, login, OAuth, 2FA, password reset, sessions |
| User Management | Profile CRUD, avatar, preferences, privacy, role-specific profiles |
| Properties | Search, CRUD, media, drafts, verification |

### Role Dashboards ✅
| Role | Endpoints Available |
|------|---------------------|
| Landlord | Dashboard, properties, applicants, financials, alerts, jobs |
| Tenant | Dashboard, rental, applications, saved, payments |
| Agent | Jobs, schedule, earnings, withdrawals |

### Financial Features ✅
| Feature | Endpoints Available |
|---------|---------------------|
| Banking | List banks, resolve accounts, CRUD bank accounts |
| Payouts | Request payout, payout history, payout settings |
| Payment Methods | CRUD payment methods |
| Transactions | Pay, verify, escrow, refunds |

### Documents & Reports ✅
| Feature | Endpoints Available |
|---------|---------------------|
| User Documents | Upload, list, download, delete |
| Lease Documents | Get/generate lease PDFs |
| Financial Reports | Generate income statements, etc |

### Analytics ✅
| Feature | Endpoints Available |
|---------|---------------------|
| Property Analytics | Views, market comparison |
| AI Insights | Price optimization suggestions |
| Market Trends | Area trends data |
| Dashboard Analytics | Landlord dashboard analytics |

### Real-time Features ✅
| Feature | Available |
|---------|-----------|
| WebSocket | Full messaging, typing, notifications |

---

## Resolution Log

| Date | Issue | Resolution |
|------|-------|------------|
| 2026-01-21 | Bank Account CRUD | Resolved in BACKEND_READMEV2.md - `/users/me/bank-accounts` |
| 2026-01-21 | Property Analytics | Resolved in BACKEND_READMEV2.md - `/properties/:id/analytics/*` |
| 2026-01-21 | Document Storage | Resolved in BACKEND_READMEV2.md - `/users/me/documents` |
| 2026-01-21 | Signup Flow Mismatch | ✅ **Resolved in BACKEND_READMEV3.md** - `role` now optional at initiation, can be provided at completion. `phone` is optional. |
| 2026-01-30 | Property Search Missing Fields | ✅ **Resolved** - Added `currency`, `squareMeters`, `isVerified`, `isFeatured`, `viewCount` to all property list responses |
| 2026-01-30 | Property Detail Missing Fields | ✅ **Resolved** - Added `currency` and `squareMeters` to property detail endpoint |
| 2026-01-30 | Property Search Filters Broken | ✅ **Resolved** - Fixed `state`, `isFeatured`, `isVerified`, `q` (text search), `minSquareFeet/maxSquareFeet`, `amenities` filters |
| 2026-01-30 | Tenant Dashboard Structure | ✅ **Resolved** - Complete restructure: added `lease` object, `recentPayments`, `maintenanceLog`, `applicationsList`, `savedProperties` arrays |
| 2026-01-30 | Landlord Dashboard Missing Fields | ✅ **Resolved** - Added `revenueChange`, `vacantUnits`, `alerts` array, enhanced properties with location/image/bedrooms/leaseEnd/views/maintenance |
| 2026-01-30 | Agent Earnings Structure | ✅ **Resolved** - Replaced daily/weekly/monthly totals with `availableBalance`, `pendingBalance`, `totalEarned`, `totalWithdrawn`, `earningsByMonth` |
| 2026-01-30 | Agent Schedule Structure | ✅ **Resolved** - Unified response from separate `jobs`/`events` to single `items` array with full schedule details |
| 2026-01-31 | Login Response Token Structure | ✅ **Fixed in Frontend** - Backend returns `{ user, tokens: { accessToken, refreshToken, expiresIn } }` but frontend expected tokens at root. Updated `LoginResponse` type and `AuthContext` to use `response.data.tokens.accessToken` |
| 2026-02-06 | Property `yearBuilt` Field | ✅ **Resolved** - Added `yearBuilt` to property list responses, added `yearBuiltMin`/`yearBuiltMax` search filters |
| 2026-02-06 | Verification Tier Inconsistency | ✅ **Resolved** - Updated `/verification/properties/:id` to use `property.verificationTier` as source of truth |
| 2026-02-06 | Landlord Properties Insufficient Data | ✅ **Resolved** - Enhanced `/landlord/properties` to return all fields matching public `/properties` endpoint |
| 2026-02-06 | Missing Expense Breakdown in Financials | 🔴 **Open** - `/landlord/financials` has no `expenseBreakdown` data; Expense Categories chart shows empty state |

---

## Outstanding Issues

### 🔴 Missing Expense Breakdown in Landlord Financials (2026-02-06)

**Frontend Feature:** Expense Categories chart on `/landlord/financials` page

**Backend Gap:** The `/landlord/financials` and `/landlord/financials/summary` endpoints do not return any `expenseBreakdown` data. The response only includes:
- `totalRevenue`, `pendingPayouts`, `availableBalance`
- `recentTransactions[]` (payments received)
- `revenueByProperty[]` (revenue per property)

**Impact:** Medium — The Expense Categories chart on the financials page cannot display real data. Currently shows a "No expense data available" empty state.

**Suggested Solution:** Add an `expenseBreakdown` array to the financial summary response:
```json
{
  "expenseBreakdown": [
    { "category": "Maintenance", "amount": 5136 },
    { "category": "Property Tax", "amount": 3210 },
    { "category": "Management Fees", "amount": 1926 },
    { "category": "Insurance", "amount": 2568 }
  ]
}
```

Also missing: **period-over-period change percentages** for stats cards (e.g., revenue change vs last month). The `revenueChange` field exists on the landlord dashboard but not on the financials endpoint.

---

## Recently Resolved Issues

### 🟢 Property `yearBuilt` Field - RESOLVED (2026-02-06)

**Frontend Feature:** Property search filters, PropertyDetail page, LandlordPropertyDetail page

**✅ Resolution:**
- `yearBuilt` field already existed in database schema
- Added `yearBuilt` to property list responses (select statement)
- Added `yearBuiltMin` and `yearBuiltMax` query parameters to search DTO
- Added filter logic in `listProperties` method

**Files Modified:**
- `core-backend/src/modules/properties/properties.service.ts` - Added yearBuilt to select, added filter logic
- `core-backend/src/modules/properties/properties.dto.ts` - Added yearBuiltMin/yearBuiltMax to searchPropertiesSchema

### 🟢 Verification Endpoint Tier Inconsistency - RESOLVED (2026-02-06)

**Issue:** The property detail page shows the correct verification tier (it reads `property.verificationTier` directly from the property record), while the Verification Hub shows the wrong tier because it relies on a separate, inconsistent endpoint.

**✅ Resolution:**
- Updated `getPropertyVerificationStatus` method to use `property.verificationTier` as the source of truth
- The endpoint now returns the tier directly from the property record instead of calculating from approved verification count
- Both endpoints now return consistent tier values

**File Modified:**
- `core-backend/src/modules/verification/verification.service.ts` - Updated tier to use property.verificationTier

### 🟢 Landlord Properties Endpoint - RESOLVED (2026-02-06)

**Issue:** The `/landlord/properties` endpoint returns only 6 fields per property, while the LandlordProperties page needs 20+ fields to render property cards (type, bedrooms, bathrooms, price, address, images, etc.).

**✅ Resolution:**
- Updated `getMyProperties` method to include all fields matching the public `/properties` endpoint
- Added: `propertyType`, `listingType`, `price`, `priceUnit`, `currency`, `bedrooms`, `bathrooms`, `squareFeet`, `squareMeters`, `yearBuilt`, `addressCity`, `addressState`, `addressNeighborhood`, `primaryImage`, `createdAt`, `isVerified`, `isFeatured`
- Uses `regionConfigService` for region-aware currency code
- Uses `squareFeetToMeters` for unit conversion

**File Modified:**
- `core-backend/src/modules/landlord/landlord.service.ts` - Enhanced select and mapping in getMyProperties

**New Response Format:**
```json
{
  "id": "...",
  "name": "Golden Gate Residences - Ibadan",
  "propertyType": "STUDIO",
  "listingType": "SHORT_LET",
  "price": 150000,
  "priceUnit": "PER_NIGHT",
  "currency": "NGN",
  "bedrooms": 2,
  "bathrooms": 4,
  "squareFeet": 45,
  "squareMeters": 4,
  "yearBuilt": 2021,
  "addressCity": "Ibadan",
  "addressState": "Oyo",
  "addressNeighborhood": "Bodija",
  "status": "ACTIVE",
  "occupancyStatus": "VACANT",
  "monthlyRent": null,
  "verificationTier": "UNVERIFIED",
  "isVerified": false,
  "isFeatured": false,
  "primaryImage": "https://...",
  "createdAt": "2026-01-15T..."
}
```

---

## How to Update This Document

If any API gaps are discovered during implementation:

1. Add a new section with descriptive title
2. Include:
   - **Status**: 🔴/🟠/🟢
   - **Frontend Feature**: What page/component is affected
   - **Backend Gap**: What endpoint is missing
   - **Impact**: High/Medium/Low, what's blocked
   - **Suggested Solution**: Backend change or workaround
3. Notify the backend development team
