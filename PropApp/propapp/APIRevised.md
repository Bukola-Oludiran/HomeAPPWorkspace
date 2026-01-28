# PropertyApp API Requirements - Revised & Expanded

> **Document Version:** 2.0  
> **Last Updated:** January 18, 2026  
> **Purpose:** Detailed backend API specifications for missing endpoints identified during frontend analysis

---

## Table of Contents

1. [Settings & User Preferences](#1-settings--user-preferences)
2. [Banking & Connected Accounts](#2-banking--connected-accounts)
3. [Property Analytics & Insights](#3-property-analytics--insights)
4. [Document Storage & Viewer](#4-document-storage--viewer)
5. [Session Management](#5-session-management)
6. [Social Account Linking](#6-social-account-linking)

---

## 1. Settings & User Preferences

### Overview

The Settings dashboard requires several endpoints that are either missing or need expansion from the current backend implementation.

---

### 1.1 Payment Methods Management

**Purpose:** Allow users to add, view, and remove payment methods (credit/debit cards) for making payments.

#### Endpoints Required

**List Payment Methods**
```
GET /api/v1/users/me/payment-methods
```
**Authorization:** Bearer Token (All authenticated users)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "pm_abc123",
        "type": "card",
        "brand": "visa",
        "last4": "4242",
        "expiryMonth": 12,
        "expiryYear": 2025,
        "holderName": "John Doe",
        "isDefault": true,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "pm_def456",
        "type": "card",
        "brand": "mastercard",
        "last4": "8888",
        "expiryMonth": 6,
        "expiryYear": 2026,
        "holderName": "John Doe",
        "isDefault": false,
        "createdAt": "2024-02-20T14:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

**Add Payment Method**
```
POST /api/v1/users/me/payment-methods
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "paymentToken": "tok_visa_xxxxx",
  "setAsDefault": true
}
```

**Notes:**
- `paymentToken` is obtained from the payment provider's client-side SDK (Paystack, Stripe)
- Card details are tokenized client-side; the backend never receives raw card numbers
- If `setAsDefault` is true, update any existing default to `isDefault: false`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pm_new789",
    "type": "card",
    "brand": "visa",
    "last4": "1234",
    "expiryMonth": 8,
    "expiryYear": 2027,
    "holderName": "John Doe",
    "isDefault": true,
    "createdAt": "2024-01-18T12:00:00Z"
  }
}
```

---

**Set Default Payment Method**
```
PUT /api/v1/users/me/payment-methods/:id/default
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Payment method set as default"
  }
}
```

---

**Delete Payment Method**
```
DELETE /api/v1/users/me/payment-methods/:id
```
**Authorization:** Bearer Token

**Validation Rules:**
- Cannot delete a payment method if it's the only one and user has active leases with auto-pay enabled
- Return appropriate error if deletion would leave auto-pay without a payment source

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Payment method removed successfully"
  }
}
```

**Error Response (when cannot delete):**
```json
{
  "success": false,
  "error": {
    "code": "PAY_010",
    "message": "Cannot delete payment method",
    "details": "This is the only payment method linked to active auto-pay subscriptions. Add another payment method first."
  }
}
```

---

### 1.2 Privacy Settings

**Purpose:** Allow users to control data visibility and privacy preferences.

#### Endpoints Required

**Get Privacy Settings**
```
GET /api/v1/users/me/privacy
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "profileVisibility": "public",
    "showPhoneToPublic": false,
    "showEmailToPublic": false,
    "showAddressToPublic": false,
    "allowSearchDiscovery": true,
    "showVerificationBadge": true,
    "showActivityStatus": false,
    "allowMarketingEmails": false,
    "allowDataSharing": false
  }
}
```

---

**Update Privacy Settings**
```
PUT /api/v1/users/me/privacy
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "profileVisibility": "verified_users_only",
  "showPhoneToPublic": true,
  "showEmailToPublic": false,
  "allowSearchDiscovery": true,
  "showVerificationBadge": true
}
```

**Validation:**
- `profileVisibility` must be one of: `public`, `verified_users_only`, `private`
- All boolean fields are optional; only provided fields are updated

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Privacy settings updated successfully",
    "settings": { ... }
  }
}
```

---

### 1.3 Role-Specific Profile Management

**Tenant Profile**
```
GET /api/v1/users/me/profile/tenant
PUT /api/v1/users/me/profile/tenant
```

**Tenant Profile Fields:**
```json
{
  "displayName": "Alex J.",
  "bio": "Young professional working in tech",
  "preferences": {
    "desiredBedrooms": "2",
    "monthlyBudgetMax": 2500,
    "desiredAmenities": ["laundry", "parking", "gym"],
    "moveInTimeline": "1-3months"
  },
  "rentalHistory": {
    "verifiedRentals": 3,
    "yearsHistory": 5,
    "hasDisputes": false
  },
  "documents": {
    "identityVerified": true,
    "identityVerifiedAt": "2023-10-12T00:00:00Z",
    "proofOfIncomeStatus": "needs_update",
    "proofOfIncomeUploadedAt": "2023-07-01T00:00:00Z"
  },
  "privacySettings": {
    "allowLandlordSearch": false,
    "showIncomeBadge": true
  }
}
```

---

**Landlord Profile**
```
GET /api/v1/users/me/profile/landlord
PUT /api/v1/users/me/profile/landlord
```

**Landlord Profile Fields:**
```json
{
  "businessName": "Johnson Properties LLC",
  "businessEmail": "contact@johnsonprops.com",
  "businessPhone": "+1 (555) 123-4567",
  "businessAddress": {
    "street": "123 Business Ave",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001"
  },
  "portfolio": {
    "totalProperties": 12,
    "activeListings": 3,
    "occupiedUnits": 9
  },
  "verificationStatus": {
    "identity": "verified",
    "address": "verified",
    "overallTier": "silver"
  },
  "publicVisibility": {
    "showContactPhone": false,
    "showBusinessAddress": true,
    "showVerificationBadge": true
  }
}
```

---

**Agent Profile**
```
GET /api/v1/users/me/profile/agent
PUT /api/v1/users/me/profile/agent
```

**Agent Profile Fields:**
```json
{
  "professionalName": "Alex Johnson",
  "businessEmail": "alex.agent@realty.com",
  "businessPhone": "+1 (555) 987-6543",
  "certifications": [
    {
      "id": "cert_001",
      "name": "Real Estate Broker License",
      "issuer": "State Board of Realtors",
      "expiryDate": "2025-12-31",
      "documentUrl": "https://storage.example.com/certs/broker.pdf",
      "status": "verified"
    },
    {
      "id": "cert_002",
      "name": "Green Property Specialist",
      "issuer": "EcoHomes Certified",
      "expiryDate": null,
      "documentUrl": "https://storage.example.com/certs/green.pdf",
      "status": "verified"
    }
  ],
  "serviceAreas": ["Downtown", "Westside", "Northside"],
  "specialties": ["Residential Sales", "Commercial Leasing", "Luxury Homes"],
  "publicVisibility": {
    "showContactEmail": true,
    "showPhoneNumber": true,
    "profileSearchable": true
  },
  "ratings": {
    "average": 4.8,
    "totalReviews": 124
  }
}
```

---

**Add Agent Certification**
```
POST /api/v1/users/me/profile/agent/certifications
```
**Request:**
```json
{
  "name": "Certified Property Manager",
  "issuer": "National Association of Realtors",
  "expiryDate": "2026-12-31",
  "documentUrl": "https://storage.example.com/uploads/cert.pdf"
}
```

**Delete Agent Certification**
```
DELETE /api/v1/users/me/profile/agent/certifications/:id
```

---

## 2. Banking & Connected Accounts

### Overview

Users need to manage bank accounts for receiving payouts (landlords, agents) and verifying payment sources. This is critical for the financial flow of the platform.

---

### 2.1 Bank Account Management

**List Bank Accounts**
```
GET /api/v1/users/me/bank-accounts
```
**Authorization:** Bearer Token (Landlords, Agents)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ba_abc123",
        "bankName": "First Bank of Nigeria",
        "bankCode": "011",
        "accountNumber": "****4567",
        "accountNumberFull": null,
        "accountName": "John Doe",
        "accountType": "savings",
        "currency": "NGN",
        "isDefault": true,
        "isVerified": true,
        "verifiedAt": "2024-01-10T09:00:00Z",
        "createdAt": "2024-01-10T08:30:00Z"
      },
      {
        "id": "ba_def456",
        "bankName": "Guaranty Trust Bank",
        "bankCode": "058",
        "accountNumber": "****8901",
        "accountNumberFull": null,
        "accountName": "John Doe",
        "accountType": "current",
        "currency": "NGN",
        "isDefault": false,
        "isVerified": true,
        "verifiedAt": "2024-02-15T11:00:00Z",
        "createdAt": "2024-02-15T10:45:00Z"
      }
    ],
    "total": 2
  }
}
```

**Notes:**
- `accountNumberFull` is only returned if explicitly requested for payout confirmation
- By default, account numbers are masked for security

---

**Get Supported Banks**
```
GET /api/v1/banking/banks
```
**Authorization:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `country` | string | Country code (default: NG) |
| `search` | string | Filter by bank name |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "code": "011", "name": "First Bank of Nigeria", "slug": "first-bank" },
      { "code": "058", "name": "Guaranty Trust Bank", "slug": "gtbank" },
      { "code": "033", "name": "United Bank for Africa", "slug": "uba" },
      { "code": "044", "name": "Access Bank", "slug": "access-bank" },
      { "code": "057", "name": "Zenith Bank", "slug": "zenith-bank" }
    ]
  }
}
```

---

**Resolve Bank Account (Verify Name)**
```
POST /api/v1/banking/resolve
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "bankCode": "011",
  "accountNumber": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "0123456789",
    "accountName": "JOHN DOE SMITH",
    "bankCode": "011",
    "bankName": "First Bank of Nigeria"
  }
}
```

**Error Response (invalid account):**
```json
{
  "success": false,
  "error": {
    "code": "BANK_001",
    "message": "Account resolution failed",
    "details": "Could not verify account number with the specified bank"
  }
}
```

**Notes:**
- This calls the payment provider's account resolution API (Paystack, Flutterwave)
- Used to verify account ownership before adding

---

**Add Bank Account**
```
POST /api/v1/users/me/bank-accounts
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "bankCode": "011",
  "accountNumber": "0123456789",
  "accountName": "JOHN DOE SMITH",
  "accountType": "savings",
  "setAsDefault": true
}
```

**Validation Rules:**
- `accountNumber` must be 10 digits (NUBAN format for Nigeria)
- `accountName` must match the resolved name from the bank
- User can have maximum 5 bank accounts
- Duplicate account numbers are not allowed

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ba_new789",
    "bankName": "First Bank of Nigeria",
    "bankCode": "011",
    "accountNumber": "****6789",
    "accountName": "JOHN DOE SMITH",
    "accountType": "savings",
    "currency": "NGN",
    "isDefault": true,
    "isVerified": true,
    "verifiedAt": "2024-01-18T12:00:00Z",
    "createdAt": "2024-01-18T12:00:00Z"
  }
}
```

---

**Set Default Bank Account**
```
PUT /api/v1/users/me/bank-accounts/:id/default
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bank account set as default payout destination"
  }
}
```

---

**Delete Bank Account**
```
DELETE /api/v1/users/me/bank-accounts/:id
```
**Authorization:** Bearer Token

**Validation Rules:**
- Cannot delete if there's a pending payout to this account
- Cannot delete if it's the only verified account and user has pending earnings
- Warn if deleting default account; auto-promote another if available

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bank account removed successfully"
  }
}
```

---

### 2.2 Payout Management

**Get Payout Settings**
```
GET /api/v1/users/me/payout-settings
```
**Authorization:** Bearer Token (Landlords, Agents)

**Response:**
```json
{
  "success": true,
  "data": {
    "payoutSchedule": "weekly",
    "minimumPayoutAmount": 10000,
    "defaultBankAccountId": "ba_abc123",
    "autoPayoutEnabled": true,
    "pendingBalance": 150000,
    "availableBalance": 500000,
    "currency": "NGN",
    "lastPayoutDate": "2024-01-15T00:00:00Z",
    "lastPayoutAmount": 350000,
    "nextScheduledPayout": "2024-01-22T00:00:00Z"
  }
}
```

---

**Update Payout Settings**
```
PUT /api/v1/users/me/payout-settings
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "payoutSchedule": "monthly",
  "minimumPayoutAmount": 50000,
  "defaultBankAccountId": "ba_def456",
  "autoPayoutEnabled": false
}
```

**Validation:**
- `payoutSchedule` must be one of: `daily`, `weekly`, `biweekly`, `monthly`, `manual`
- `minimumPayoutAmount` must be >= platform minimum (e.g., 5000 NGN)

---

**Request Manual Payout**
```
POST /api/v1/users/me/payouts
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "amount": 250000,
  "bankAccountId": "ba_abc123",
  "description": "Monthly earnings withdrawal"
}
```

**Validation Rules:**
- `amount` must be <= `availableBalance`
- `amount` must be >= platform minimum payout
- `bankAccountId` must belong to the user and be verified

**Response:**
```json
{
  "success": true,
  "data": {
    "payoutId": "payout_xyz789",
    "amount": 250000,
    "currency": "NGN",
    "status": "processing",
    "bankAccount": {
      "id": "ba_abc123",
      "bankName": "First Bank of Nigeria",
      "accountNumber": "****4567"
    },
    "estimatedArrival": "2024-01-19T00:00:00Z",
    "createdAt": "2024-01-18T12:00:00Z"
  }
}
```

---

**Get Payout History**
```
GET /api/v1/users/me/payouts
```
**Authorization:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (processing, completed, failed) |
| `startDate` | date | Filter from date |
| `endDate` | date | Filter to date |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "payout_001",
        "amount": 350000,
        "currency": "NGN",
        "status": "completed",
        "bankAccount": {
          "bankName": "First Bank of Nigeria",
          "accountNumber": "****4567"
        },
        "completedAt": "2024-01-15T14:30:00Z",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

---

### 2.3 Bank Account Data Model

```json
{
  "id": "string (uuid)",
  "userId": "string (uuid)",
  "bankCode": "string",
  "bankName": "string",
  "accountNumber": "string (encrypted)",
  "accountNumberMasked": "string (****1234)",
  "accountName": "string",
  "accountType": "savings | current | corporate",
  "currency": "string (NGN, USD, etc.)",
  "isDefault": "boolean",
  "isVerified": "boolean",
  "verifiedAt": "datetime | null",
  "paymentProviderRecipientId": "string (Paystack/Flutterwave recipient ID)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "deletedAt": "datetime | null"
}
```

---

## 3. Property Analytics & Insights

### Overview

The frontend displays AI-powered insights and property analytics on the Landlord Dashboard. This section specifies the endpoints needed to provide this data.

---

### 3.1 Property View Analytics

**Get Property Views**
```
GET /api/v1/properties/:id/analytics/views
```
**Authorization:** Bearer Token (Property Owner)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `7d`, `30d`, `90d`, `1y`, `all` (default: 30d) |
| `groupBy` | string | `day`, `week`, `month` (default: day) |

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "period": "30d",
    "summary": {
      "totalViews": 1245,
      "uniqueVisitors": 892,
      "avgViewDuration": 45,
      "contactClicks": 67,
      "favoriteAdds": 34,
      "applicationStarts": 12,
      "conversionRate": 1.35
    },
    "timeline": [
      { "date": "2024-01-17", "views": 45, "uniqueVisitors": 38 },
      { "date": "2024-01-16", "views": 52, "uniqueVisitors": 41 },
      { "date": "2024-01-15", "views": 38, "uniqueVisitors": 30 }
    ],
    "sources": {
      "search": 60,
      "direct": 25,
      "shared": 10,
      "featured": 5
    }
  }
}
```

---

### 3.2 Market Comparison Data

**Get Market Comparison**
```
GET /api/v1/properties/:id/analytics/market-comparison
```
**Authorization:** Bearer Token (Property Owner)

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "propertyPrice": 2500000,
    "priceUnit": "per_year",
    "marketAnalysis": {
      "areaName": "Lekki Phase 1",
      "propertyType": "apartment",
      "bedrooms": 3,
      "sampleSize": 45,
      "averagePrice": 2800000,
      "medianPrice": 2650000,
      "minPrice": 1800000,
      "maxPrice": 4500000,
      "pricePerSqft": {
        "property": 12500,
        "areaAverage": 14000
      },
      "percentile": 35,
      "competitiveness": "below_market"
    },
    "priceHistory": {
      "current": 2500000,
      "previousPeriods": [
        { "period": "Q4 2023", "averagePrice": 2600000, "change": -3.8 },
        { "period": "Q3 2023", "averagePrice": 2450000, "change": 6.1 },
        { "period": "Q2 2023", "averagePrice": 2400000, "change": 2.1 }
      ]
    },
    "recommendation": {
      "action": "consider_increase",
      "suggestedPrice": 2700000,
      "potentialImpact": "Based on similar properties, a 8% price increase may still attract the same level of interest",
      "confidence": 0.75
    }
  }
}
```

---

**Get Area Market Trends**
```
GET /api/v1/analytics/market-trends
```
**Authorization:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | City name (required) |
| `neighborhood` | string | Neighborhood/area name |
| `propertyType` | string | Property type filter |
| `period` | string | `6m`, `1y`, `2y`, `5y` |

**Response:**
```json
{
  "success": true,
  "data": {
    "area": "Lekki Phase 1, Lagos",
    "period": "1y",
    "trends": {
      "priceChange": 12.5,
      "demandScore": 85,
      "supplyScore": 45,
      "avgDaysOnMarket": 21,
      "occupancyRate": 92
    },
    "priceByType": [
      { "type": "apartment", "avgPrice": 2800000, "change": 10.2 },
      { "type": "house", "avgPrice": 5500000, "change": 15.8 },
      { "type": "duplex", "avgPrice": 4200000, "change": 8.5 }
    ],
    "monthlyTrend": [
      { "month": "2024-01", "avgPrice": 2800000, "listings": 120, "transactions": 35 },
      { "month": "2023-12", "avgPrice": 2700000, "listings": 115, "transactions": 28 }
    ]
  }
}
```

---

### 3.3 AI Price Optimization

**Get Price Suggestions**
```
POST /api/v1/properties/:id/analytics/price-optimization
```
**Authorization:** Bearer Token (Property Owner)

**Request:**
```json
{
  "targetMetric": "occupancy",
  "constraints": {
    "minPrice": 2000000,
    "maxPrice": 3500000,
    "targetTimeframe": "30_days"
  }
}
```

**Notes:**
- `targetMetric` can be: `occupancy` (rent quickly), `revenue` (maximize income), `balanced`

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "currentPrice": 2500000,
    "analysis": {
      "currentPerformance": {
        "viewsPerDay": 15,
        "estimatedDaysToRent": 45,
        "competitorCount": 12
      },
      "recommendations": [
        {
          "price": 2700000,
          "label": "Maximize Revenue",
          "estimatedDaysToRent": 60,
          "confidence": 0.72,
          "rationale": "Higher price point with extended timeline"
        },
        {
          "price": 2400000,
          "label": "Balanced",
          "estimatedDaysToRent": 30,
          "confidence": 0.85,
          "rationale": "Competitive pricing with reasonable timeline"
        },
        {
          "price": 2200000,
          "label": "Quick Occupancy",
          "estimatedDaysToRent": 14,
          "confidence": 0.91,
          "rationale": "Below market rate for rapid tenant acquisition"
        }
      ],
      "insights": [
        "Properties in this area with similar features average 21 days on market",
        "Adding professional photos could increase views by 40%",
        "Your verification tier affects search ranking - consider upgrading to Gold"
      ]
    },
    "generatedAt": "2024-01-18T12:00:00Z"
  }
}
```

---

### 3.4 Landlord Dashboard Analytics

**Get Dashboard Overview**
```
GET /api/v1/landlord/dashboard/analytics
```
**Authorization:** Bearer Token (Landlord)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `7d`, `30d`, `90d`, `1y` |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "portfolio": {
      "totalProperties": 12,
      "activeListings": 3,
      "occupiedUnits": 9,
      "occupancyRate": 75,
      "avgDaysVacant": 18
    },
    "financials": {
      "totalRevenue": 4500000,
      "revenueChange": 12.5,
      "pendingPayments": 750000,
      "upcomingExpenses": 200000,
      "netIncome": 4300000
    },
    "performance": {
      "totalViews": 3450,
      "viewsChange": 8.2,
      "totalInquiries": 89,
      "inquiriesChange": -5.1,
      "applicationRate": 2.6,
      "avgResponseTime": "2.5 hours"
    },
    "alerts": [
      {
        "type": "lease_expiring",
        "severity": "warning",
        "message": "2 leases expiring in the next 30 days",
        "actionUrl": "/landlord/leases?filter=expiring"
      },
      {
        "type": "maintenance_pending",
        "severity": "info",
        "message": "3 maintenance requests awaiting response",
        "actionUrl": "/landlord/maintenance"
      }
    ],
    "aiInsights": [
      {
        "type": "opportunity",
        "title": "Price Optimization Available",
        "message": "2 of your properties may be underpriced for current market conditions",
        "actionUrl": "/landlord/properties?insight=pricing"
      },
      {
        "type": "trend",
        "title": "Market Heating Up",
        "message": "Rental demand in Lekki has increased 15% this month",
        "actionUrl": "/landlord/analytics/market"
      }
    ]
  }
}
```

---

## 4. Document Storage & Viewer

### Overview

The platform needs comprehensive document management for leases, financial reports, verification documents, and user-uploaded files.

---

### 4.1 User Documents

**List User Documents**
```
GET /api/v1/users/me/documents
```
**Authorization:** Bearer Token

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type (identity, income, lease, financial_report, other) |
| `status` | string | Filter by status (pending, verified, rejected, expired) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "doc_abc123",
        "type": "identity",
        "subtype": "passport",
        "name": "Passport - John Doe",
        "filename": "passport_johndoe.pdf",
        "mimeType": "application/pdf",
        "size": 245890,
        "url": "https://storage.example.com/secure/doc_abc123.pdf",
        "thumbnailUrl": "https://storage.example.com/thumbs/doc_abc123.jpg",
        "status": "verified",
        "expiryDate": "2028-10-12",
        "uploadedAt": "2023-10-12T10:00:00Z",
        "verifiedAt": "2023-10-13T14:30:00Z"
      },
      {
        "id": "doc_def456",
        "type": "income",
        "subtype": "pay_slip",
        "name": "Pay Slip - December 2023",
        "filename": "payslip_dec2023.pdf",
        "mimeType": "application/pdf",
        "size": 128450,
        "url": "https://storage.example.com/secure/doc_def456.pdf",
        "thumbnailUrl": null,
        "status": "pending",
        "expiryDate": null,
        "uploadedAt": "2024-01-05T09:30:00Z",
        "verifiedAt": null
      }
    ],
    "total": 8,
    "page": 1,
    "totalPages": 1
  }
}
```

---

**Upload Document**
```
POST /api/v1/users/me/documents
```
**Authorization:** Bearer Token
**Content-Type:** multipart/form-data

**Request:**
```
file: <binary file data>
type: "income"
subtype: "bank_statement"
name: "Bank Statement - January 2024"
expiryDate: "2024-04-18" (optional)
```

**Validation Rules:**
- Maximum file size: 10MB
- Allowed mime types: `application/pdf`, `image/jpeg`, `image/png`
- `type` must be one of: `identity`, `income`, `address_proof`, `lease`, `other`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_new789",
    "type": "income",
    "subtype": "bank_statement",
    "name": "Bank Statement - January 2024",
    "filename": "bankstatement_jan2024.pdf",
    "mimeType": "application/pdf",
    "size": 456789,
    "url": "https://storage.example.com/secure/doc_new789.pdf",
    "status": "pending",
    "uploadedAt": "2024-01-18T12:00:00Z"
  }
}
```

---

**Get Document Download URL**
```
GET /api/v1/users/me/documents/:id/download
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://storage.example.com/secure/doc_abc123.pdf?token=xyz&expires=1705590000",
    "expiresIn": 3600,
    "filename": "passport_johndoe.pdf"
  }
}
```

**Notes:**
- Returns a time-limited signed URL for secure download
- URL expires after `expiresIn` seconds

---

**Delete Document**
```
DELETE /api/v1/users/me/documents/:id
```
**Authorization:** Bearer Token

**Validation Rules:**
- Cannot delete documents that are currently being reviewed
- Cannot delete verified identity documents if required for compliance

---

### 4.2 Lease Documents

**Get Lease Documents**
```
GET /api/v1/leases/:id/documents
```
**Authorization:** Bearer Token (Tenant or Landlord of the lease)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaseId": "lease_123",
    "documents": [
      {
        "id": "ldoc_001",
        "type": "lease_agreement",
        "name": "Lease Agreement - 123 Main St",
        "version": 1,
        "url": "https://storage.example.com/secure/ldoc_001.pdf",
        "signedByTenant": true,
        "tenantSignedAt": "2024-01-10T14:00:00Z",
        "signedByLandlord": true,
        "landlordSignedAt": "2024-01-10T16:30:00Z",
        "status": "fully_executed",
        "createdAt": "2024-01-08T10:00:00Z"
      },
      {
        "id": "ldoc_002",
        "type": "inventory_checklist",
        "name": "Move-in Inventory Checklist",
        "url": "https://storage.example.com/secure/ldoc_002.pdf",
        "status": "completed",
        "createdAt": "2024-01-15T11:00:00Z"
      },
      {
        "id": "ldoc_003",
        "type": "addendum",
        "name": "Pet Policy Addendum",
        "url": "https://storage.example.com/secure/ldoc_003.pdf",
        "status": "pending_signature",
        "createdAt": "2024-01-17T09:00:00Z"
      }
    ]
  }
}
```

---

**Generate Lease Document**
```
POST /api/v1/leases/:id/documents/generate
```
**Authorization:** Bearer Token (Landlord)

**Request:**
```json
{
  "templateId": "template_standard_residential",
  "customClauses": [
    {
      "section": "pets",
      "content": "Tenant is permitted to keep one (1) cat on the premises."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "ldoc_new456",
    "previewUrl": "https://storage.example.com/preview/ldoc_new456.pdf",
    "status": "draft",
    "message": "Lease document generated. Review and send for signatures."
  }
}
```

---

### 4.3 Financial Reports

**Get Financial Reports**
```
GET /api/v1/landlord/financials/reports
```
**Authorization:** Bearer Token (Landlord)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `monthly_statement`, `annual_summary`, `tax_report` |
| `year` | number | Year filter |
| `month` | number | Month filter (1-12) |
| `propertyId` | string | Filter by property |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "report_001",
        "type": "monthly_statement",
        "name": "December 2023 Financial Statement",
        "period": {
          "year": 2023,
          "month": 12
        },
        "properties": ["all"],
        "summary": {
          "totalIncome": 4500000,
          "totalExpenses": 200000,
          "netIncome": 4300000
        },
        "url": "https://storage.example.com/reports/report_001.pdf",
        "generatedAt": "2024-01-01T06:00:00Z"
      },
      {
        "id": "report_002",
        "type": "annual_summary",
        "name": "2023 Annual Summary",
        "period": {
          "year": 2023
        },
        "properties": ["all"],
        "summary": {
          "totalIncome": 48000000,
          "totalExpenses": 2400000,
          "netIncome": 45600000
        },
        "url": "https://storage.example.com/reports/report_002.pdf",
        "generatedAt": "2024-01-02T06:00:00Z"
      }
    ],
    "total": 14
  }
}
```

---

**Generate Financial Report**
```
POST /api/v1/landlord/financials/reports/generate
```
**Authorization:** Bearer Token (Landlord)

**Request:**
```json
{
  "type": "monthly_statement",
  "year": 2024,
  "month": 1,
  "propertyIds": ["prop_123", "prop_456"],
  "includeDetails": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_new789",
    "status": "generating",
    "estimatedTime": 30,
    "message": "Report is being generated. You will be notified when ready."
  }
}
```

---

### 4.4 Document Data Model

```json
{
  "id": "string (uuid)",
  "userId": "string (uuid)",
  "entityType": "user | property | lease | transaction",
  "entityId": "string (uuid) | null",
  "type": "identity | income | address_proof | lease | financial_report | certificate | other",
  "subtype": "string | null",
  "name": "string",
  "filename": "string",
  "mimeType": "string",
  "size": "number (bytes)",
  "storageKey": "string (S3 key or path)",
  "thumbnailKey": "string | null",
  "status": "pending | verified | rejected | expired",
  "expiryDate": "date | null",
  "metadata": {
    "documentNumber": "string",
    "issuer": "string",
    "issuedDate": "date"
  },
  "verificationId": "string | null",
  "uploadedAt": "datetime",
  "verifiedAt": "datetime | null",
  "verifiedBy": "string (admin user id) | null",
  "rejectionReason": "string | null",
  "deletedAt": "datetime | null"
}
```

---

## 5. Session Management

### Overview

Users need to view and manage their active login sessions for security purposes.

---

### 5.1 Session Endpoints

**Get Active Sessions**
```
GET /api/v1/auth/sessions
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "currentSessionId": "sess_current123",
    "sessions": [
      {
        "id": "sess_current123",
        "deviceName": "Chrome on MacOS",
        "deviceType": "desktop",
        "browser": "Chrome 120",
        "os": "macOS 14.2",
        "ipAddress": "102.89.xxx.xxx",
        "location": "Lagos, Nigeria",
        "isCurrent": true,
        "lastActiveAt": "2024-01-18T12:30:00Z",
        "createdAt": "2024-01-15T09:00:00Z"
      },
      {
        "id": "sess_mobile456",
        "deviceName": "HomeAI iOS App",
        "deviceType": "mobile",
        "browser": "HomeAI App 2.1.0",
        "os": "iOS 17.2",
        "ipAddress": "102.89.xxx.xxx",
        "location": "Lagos, Nigeria",
        "isCurrent": false,
        "lastActiveAt": "2024-01-17T20:15:00Z",
        "createdAt": "2024-01-10T14:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

**Revoke Session**
```
DELETE /api/v1/auth/sessions/:id
```
**Authorization:** Bearer Token

**Validation:**
- Cannot revoke current session through this endpoint (use logout instead)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Session revoked successfully"
  }
}
```

---

**Revoke All Other Sessions**
```
DELETE /api/v1/auth/sessions/all
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "password": "currentPassword123!"
}
```

**Notes:**
- Requires password confirmation for security
- Revokes all sessions except the current one

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "All other sessions have been revoked",
    "revokedCount": 3
  }
}
```

---

### 5.2 Session Data Model

```json
{
  "id": "string (uuid)",
  "userId": "string (uuid)",
  "refreshTokenHash": "string",
  "deviceInfo": {
    "name": "string",
    "type": "desktop | mobile | tablet",
    "browser": "string",
    "browserVersion": "string",
    "os": "string",
    "osVersion": "string"
  },
  "ipAddress": "string",
  "location": {
    "city": "string",
    "country": "string",
    "countryCode": "string"
  },
  "lastActiveAt": "datetime",
  "expiresAt": "datetime",
  "createdAt": "datetime",
  "revokedAt": "datetime | null"
}
```

---

## 6. Social Account Linking

### Overview

Allow users to link/unlink OAuth providers (Google, Apple, Facebook) for alternative login methods.

---

### 6.1 Connected Accounts Endpoints

**Get Connected Accounts**
```
GET /api/v1/users/me/connected-accounts
```
**Authorization:** Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "provider": "google",
        "email": "john.doe@gmail.com",
        "connectedAt": "2024-01-10T14:00:00Z",
        "lastUsedAt": "2024-01-18T10:30:00Z"
      }
    ],
    "availableProviders": ["apple", "facebook"]
  }
}
```

---

**Link Account**
```
POST /api/v1/users/me/connected-accounts/:provider
```
**Authorization:** Bearer Token

**Request:**
```json
{
  "idToken": "oauth-id-token-from-provider"
}
```

**Validation:**
- Provider must be one of: `google`, `apple`, `facebook`
- Email from OAuth must not already be linked to another user

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "apple",
    "email": "john.doe@icloud.com",
    "connectedAt": "2024-01-18T12:00:00Z",
    "message": "Apple account linked successfully"
  }
}
```

**Error Response (email already used):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_020",
    "message": "This social account is already linked to another user"
  }
}
```

---

**Unlink Account**
```
DELETE /api/v1/users/me/connected-accounts/:provider
```
**Authorization:** Bearer Token

**Validation:**
- Cannot unlink if it's the only login method and user has no password set
- Must have at least one authentication method remaining

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Google account unlinked successfully"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_021",
    "message": "Cannot unlink account",
    "details": "This is your only login method. Set a password first before unlinking."
  }
}
```

---

### 6.2 Connected Account Data Model

```json
{
  "id": "string (uuid)",
  "userId": "string (uuid)",
  "provider": "google | apple | facebook",
  "providerUserId": "string",
  "email": "string",
  "profile": {
    "name": "string",
    "picture": "string (url)"
  },
  "accessToken": "string (encrypted) | null",
  "refreshToken": "string (encrypted) | null",
  "tokenExpiresAt": "datetime | null",
  "connectedAt": "datetime",
  "lastUsedAt": "datetime"
}
```

---

## Summary of New Endpoints Required

| Category | Endpoint Count | Priority |
|----------|---------------|----------|
| Payment Methods | 4 | High |
| Privacy Settings | 2 | Medium |
| Role-Specific Profiles | 6+ | Medium |
| Bank Account Management | 6 | High |
| Payout Management | 4 | High |
| Property Analytics | 4 | Medium |
| Market Trends | 2 | Low |
| User Documents | 4 | High |
| Lease Documents | 3 | Medium |
| Financial Reports | 2 | Medium |
| Session Management | 3 | High |
| Social Account Linking | 3 | Medium |

**Total New Endpoints: ~43**

---

## Implementation Priority

### Phase 1 - Critical (Week 1-2)
1. Payment Methods (CRUD)
2. Bank Account Management
3. Session Management
4. User Documents (basic CRUD)

### Phase 2 - Important (Week 3-4)
1. Payout Management
2. Privacy Settings
3. Role-Specific Profiles
4. Social Account Linking

### Phase 3 - Enhancement (Week 5-6)
1. Property Analytics
2. Market Trends
3. Lease Documents
4. Financial Reports
5. AI Price Optimization

---

> **Note to Backend Team:**  
> This document supplements the existing `BACKEND_README.md`. All endpoints should follow the existing response format, error codes, and authentication patterns already established.
