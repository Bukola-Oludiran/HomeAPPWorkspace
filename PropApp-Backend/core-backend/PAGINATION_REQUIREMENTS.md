# Pagination Requirements

This document lists all endpoints that return bulk data and their pagination status.

---

## Status Legend
- ✅ **Has Pagination** - Returns paginated response with `page`, `limit`, `total`, `totalPages`
- ❌ **Needs Pagination** - Returns all data without pagination, needs to be updated
- 🔸 **Low Priority** - Typically returns small datasets per user

---

## Endpoints WITH Pagination ✅

These endpoints implement proper pagination:

### Properties Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/properties` | GET | `listProperties` |
| `/properties/search` | GET | `searchProperties` |

### Transactions Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/transactions` | GET | `getTransactions` |

### Landlord Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/landlord/properties` | GET | `getMyProperties` ✅ [IMPLEMENTED] |
| `/landlord/applicants` | GET | `getApplicants` |
| `/landlord/financials/transactions` | GET | `getTransactions` |
| `/landlord/alerts` | GET | `getAlerts` ✅ [IMPLEMENTED] |
| `/landlord/jobs` | GET | `getJobs` ✅ [IMPLEMENTED] |

### Tenant Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/tenant/applications` | GET | `getApplications` |
| `/tenant/payments` | GET | `getPayments` |
| `/tenant/saved` | GET | `getSavedProperties` ✅ [IMPLEMENTED] |

### Agent Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/agent/jobs` | GET | `getAvailableJobs` |
| `/agent/jobs/accepted` | GET | `getAcceptedJobs` |
| `/agent/earnings/history` | GET | `getEarningsHistory` ✅ [IMPLEMENTED] |

### Leases Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/leases` | GET | `getUserLeases` ✅ [IMPLEMENTED] |

### Messaging Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/messages/conversations` | GET | `getConversations` |
| `/messages/conversations/:id` | GET | `getMessages` (cursor-based `hasMore`) |

### Notifications Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/notifications` | GET | `getNotifications` |

### Verification Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/verification/properties` | GET | `getPropertyVerifications` |

### Documents Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/users/me/documents` | GET | `getDocuments` |

### Maintenance Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/maintenance` | GET | `getRequests` |

### Banking Module
| Endpoint | Method | Service Function |
|----------|--------|------------------|
| `/users/me/payouts` | GET | `getPayoutHistory` |

---

## Not Paginated (By Design /Low Priority) 🔸

| Endpoint | Method | Service Function | Notes |
|----------|--------|------------------|-------|
| `/agent/schedule` | GET | `getSchedule` | Uses date range filtering |
| `/verification/properties/:id` | GET | `getPropertyVerificationStatus` | Single property scope |
| `/users/me/bank-accounts` | GET | `getBankAccounts` | Users have few accounts |
| `/users/me/payment-methods` | GET | `getPaymentMethods` | Users have few methods |
| `/users/me/connections` | GET | `getConnections` | OAuth connections limited |
| `/notifications/devices` | GET | `getUserDevices` | Device limit ~5 |
| `/auth/sessions` | GET | `getSessions` | Session limit exists |

---

## Pagination Response Format

All paginated endpoints return:

```json
{
  "success": true,
  "data": [...items],
  "pagination": {
    "page": 1,
    "total": 100,
    "totalPages": 5
  }
}
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Current page (1-indexed) |
| `limit` | number | 20 | Items per page (max: 100) |

---

## Implementation Summary

✅ **Completed (January 2026)**

| Endpoint | Files Modified |
|----------|---------------|
| `GET /landlord/properties` | `landlord.dto.ts`, `landlord.service.ts`, `landlord.routes.ts` |
| `GET /landlord/alerts` | `landlord.dto.ts`, `landlord.service.ts`, `landlord.routes.ts` |
| `GET /landlord/jobs` | `landlord.dto.ts`, `landlord.service.ts`, `landlord.routes.ts` |
| `GET /leases` | `leases.dto.ts`, `leases.service.ts`, `leases.routes.ts` |
| `GET /agent/earnings/history` | `agent.dto.ts`, `agent.service.ts`, `agent.routes.ts` |
| `GET /tenant/saved` | `tenant.dto.ts`, `tenant.service.ts`, `tenant.routes.ts` |
