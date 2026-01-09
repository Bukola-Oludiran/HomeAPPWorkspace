# IDOR (Insecure Direct Object Reference) Security Audit

**Audit Date:** January 9, 2024  
**Auditor:** Automated Security Review  
**Scope:** All service files in `/src/modules/`

---

## Executive Summary

The HomeAI backend demonstrates **strong IDOR protection** across most services. Ownership and authorization checks are consistently implemented before accessing or modifying resources.

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Secure | 9 | Proper ownership/access verification |
| ⚠️ Warning | 1 | Admin endpoints need role verification |
| ❌ Critical | 0 | No critical IDOR vulnerabilities found |

---

## Audit Findings by Service

### ✅ Transactions Service
**File:** `src/modules/transactions/transactions.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// getTransactionById (lines 139-145)
if (transaction.payerId !== userId && transaction.payeeId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') {
        throw new ValidationError('Access denied', [...]);
    }
}
```
✅ Verifies user is payer, payee, or admin before returning transaction details.

---

### ✅ Leases Service
**File:** `src/modules/leases/leases.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// getLeaseById (lines 127-136)
if (lease.tenantId !== userId && lease.landlordId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') {
        throw new ValidationError('Access denied', [...]);
    }
}
```
✅ Verifies user is tenant, landlord, or admin.

**Additional checks:**
- `updateLease`: Filters by `landlordId`
- `signLease`: Verifies tenant or landlord
- `respondToRenewal`: Filters by `tenantId` or `landlordId`

---

### ✅ Maintenance Service
**File:** `src/modules/maintenance/maintenance.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// getRequestById (lines 192-200)
const hasAccess =
    request.tenantId === userId ||
    request.property.ownerId === userId ||
    request.assignedAgentId === userId;

if (!hasAccess) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') {
        throw new ValidationError('Access denied', [...]);
    }
}
```
✅ Verifies user is tenant, property owner, assigned agent, or admin.

---

### ✅ Messaging Service
**File:** `src/modules/messaging/messaging.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// sendMessage (lines 212-219)
const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: senderId },
});

if (!participant) {
    throw new ValidationError('Access denied', [
        { field: 'conversationId', message: 'You are not a participant of this conversation' },
    ]);
}
```
✅ Verifies user is a participant before sending messages or viewing conversation.

---

### ✅ Notifications Service
**File:** `src/modules/notifications/notifications.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// getNotifications (line 65)
const where: Record<string, unknown> = { userId };

// markAsRead (lines 127-132)
const result = await prisma.notification.updateMany({
    where: {
        id: { in: notificationIds },
        userId,  // ← Only marks user's own notifications
    },
    data: { read: true },
});
```
✅ All queries filter by `userId`, preventing access to other users' notifications.

---

### ✅ Properties Service
**File:** `src/modules/properties/properties.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// Uses dedicated verifyOwnership helper method
async updateProperty(propertyId: string, ownerId: string, data: UpdatePropertyDto) {
    await this.verifyOwnership(propertyId, ownerId);  // ←
    // ... update logic
}

async deleteProperty(propertyId: string, ownerId: string) {
    await this.verifyOwnership(propertyId, ownerId);  // ←
    // ... delete logic
}
```
✅ Consistent use of `verifyOwnership()` helper for all mutation operations.

---

### ✅ Landlord Service
**File:** `src/modules/landlord/landlord.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// approveApplicant (lines 358-364)
const application = await prisma.application.findFirst({
    where: {
        id: applicationId,
        property: { ownerId: landlordId },  // ← Verifies ownership
        status: 'PENDING',
    },
});

// getApplicants (lines 249-251)
const where: Record<string, unknown> = {
    property: { ownerId: landlordId },  // ← Only landlord's properties
};
```
✅ All operations filter by `landlordId` through property ownership.

---

### ✅ Tenant Service
**File:** `src/modules/tenant/tenant.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// getApplications (line 258)
const where: Record<string, unknown> = { tenantId };

// getPayments (line 309)
const where: Record<string, unknown> = { payerId: tenantId };
```
✅ All queries filter by tenant's own ID.

---

### ✅ Agent Service
**File:** `src/modules/agent/agent.service.ts`

**Finding:** SECURE  
**Evidence:**
```typescript
// completeJob (lines 235-241)
const job = await prisma.agentJob.findFirst({
    where: {
        id: jobId,
        assignedAgentId: agentId,  // ← Only assigned agent can complete
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
    },
});
```
✅ All job operations verify agent assignment.

---

### ⚠️ Verification Service
**File:** `src/modules/verification/verification.service.ts`

**Finding:** WARNING - Admin role check may be insufficient  
**Evidence:**
```typescript
// approveVerification (lines 429-436)
async approveVerification(
    verificationId: string,
    adminId: string,  // ← Receives adminId but doesn't verify ADMIN role
    result: SubmitPropertyVerificationResultDto
): Promise<{ message: string }> {
    const verification = await prisma.verification.findUnique({
        where: { id: verificationId },
    });
    // No check that adminId is actually an ADMIN!
    // ...
}
```

**Risk:** If the controller doesn't verify admin role, any user could potentially approve verifications.

**Recommendation:**
```typescript
async approveVerification(
    verificationId: string,
    adminId: string,
    result: SubmitPropertyVerificationResultDto
): Promise<{ message: string }> {
    // Add admin role verification
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (admin?.role !== 'ADMIN') {
        throw new ValidationError('Access denied', [
            { field: 'adminId', message: 'Only admins can approve verifications' },
        ]);
    }
    // ... rest of method
}
```

---

## Recommendations

### 1. Fix Verification Admin Check
Add explicit admin role verification in `approveVerification` and `rejectVerification` methods.

### 2. Add Controller-Level Guards
Ensure routes call role-checking middleware:
```typescript
router.post(
    '/admin/:id/approve',
    authenticate,
    requireRole('ADMIN'),  // ← Middleware guard
    verificationController.approve
);
```

### 3. Add Audit Logging
Log all access to sensitive resources:
```typescript
logger.info(`User ${userId} accessed transaction ${transactionId}`, {
    action: 'VIEW_TRANSACTION',
    userId,
    resourceId: transactionId,
    authorized: true,
});
```

### 4. Implement Rate Limiting on ID Enumeration
Prevent attackers from brute-forcing UUIDs:
```typescript
rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for resource endpoints
});
```

### 5. Use UUIDs Consistently
✅ Already implemented - all IDs are UUIDs, making enumeration attacks impractical.

---

## Files to Update

| File | Action | Priority |
|------|--------|----------|
| `verification.service.ts` | Add admin role check in approve/reject | High |
| `verification.controller.ts` | Add requireRole('ADMIN') middleware | High |
| All services | Add audit logging for resource access | Medium |
| Route files | Add rate limiting | Medium |

---

## Conclusion

The HomeAI backend has **good IDOR protection** overall. The main finding is a potential missing admin role verification in the verification service's approve/reject methods. This should be fixed before production deployment.

All other services correctly implement ownership verification patterns:
- Checking user is payer/payee for transactions
- Checking user is tenant/landlord for leases
- Checking property ownership for landlord operations
- Checking conversation participation for messaging
- Filtering by userId for notifications
