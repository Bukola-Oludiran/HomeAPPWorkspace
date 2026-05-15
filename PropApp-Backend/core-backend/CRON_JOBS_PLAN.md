# Cron Jobs Implementation Plan

This document outlines the scheduled background tasks needed for the HomeAI platform.

---

## Overview

Cron jobs are scheduled tasks that run automatically at specified intervals. They handle time-sensitive operations that shouldn't be triggered by user requests.

### Technology Stack
- **Library**: `node-cron` (lightweight, in-process scheduler)
- **Alternative for Scale**: Bull + Redis (for distributed job queues)
- **Location**: `/src/jobs/`

---

## Scheduled Jobs

### 1. Payment Reminders

**Purpose**: Notify tenants about upcoming rent payments

| Setting | Value |
|---------|-------|
| Schedule | Daily at 9:00 AM |
| Cron Expression | `0 9 * * *` |
| Priority | High |

**Logic**:
```
1. Query leases where next payment due in 5 days
2. For each lease:
   - Check if reminder already sent this cycle
   - Send push notification to tenant
   - Send email reminder
   - Log reminder sent
```

**File**: `src/jobs/payment-reminders.job.ts`

---

### 2. Overdue Payment Alerts

**Purpose**: Flag overdue payments and escalate notifications

| Setting | Value |
|---------|-------|
| Schedule | Daily at 10:00 AM |
| Cron Expression | `0 10 * * *` |
| Priority | High |

**Logic**:
```
1. Query leases with payments overdue > 1 day
2. For each overdue lease:
   - Day 1-3: Reminder to tenant
   - Day 4-7: Escalate to landlord
   - Day 7+: Mark lease as "payment_issue"
   - Create notification for both parties
```

**File**: `src/jobs/overdue-payments.job.ts`

---

### 3. Lease Expiry Notifications

**Purpose**: Alert both parties about expiring leases

| Setting | Value |
|---------|-------|
| Schedule | Daily at 8:00 AM |
| Cron Expression | `0 8 * * *` |
| Priority | Medium |

**Logic**:
```
1. Query leases expiring in 30, 14, 7, 3, 1 days
2. Send appropriate notification based on days remaining:
   - 30 days: "Lease renewal reminder"
   - 14 days: "Lease expiring soon"
   - 7 days: "Urgent: Lease expires in 1 week"
   - 3 days: "Final reminder"
   - 1 day: "Lease expires tomorrow"
3. Notify landlord to send renewal offer if not sent
```

**File**: `src/jobs/lease-expiry.job.ts`

---

### 4. Verification Expiry Check

**Purpose**: Re-verify users whose ID verification is expiring

| Setting | Value |
|---------|-------|
| Schedule | Daily at 2:00 AM |
| Cron Expression | `0 2 * * *` |
| Priority | Medium |

**Logic**:
```
1. Query verifications expiring in 30 days
2. Send re-verification reminder to user
3. For expired verifications:
   - Downgrade user verification level
   - Notify user of downgrade
```

**File**: `src/jobs/verification-expiry.job.ts`

---

### 5. Agent Job Reminders

**Purpose**: Remind agents of upcoming scheduled jobs

| Setting | Value |
|---------|-------|
| Schedule | Every 2 hours |
| Cron Expression | `0 */2 * * *` |
| Priority | Medium |

**Logic**:
```
1. Query agent jobs scheduled in next 24 hours
2. Send reminder 24h, 2h, and 30min before
3. For unassigned jobs:
   - Alert landlord if < 24h to scheduled time
```

**File**: `src/jobs/agent-reminders.job.ts`

---

### 6. Maintenance Request Follow-up

**Purpose**: Follow up on open maintenance requests

| Setting | Value |
|---------|-------|
| Schedule | Daily at 11:00 AM |
| Cron Expression | `0 11 * * *` |
| Priority | Medium |

**Logic**:
```
1. Query maintenance requests:
   - SUBMITTED > 24h: Remind landlord
   - ASSIGNED > 48h: Check status with agent
   - IN_PROGRESS > 7 days: Escalate
2. Send appropriate notifications
```

**File**: `src/jobs/maintenance-followup.job.ts`

---

### 7. Weekly Financial Reports

**Purpose**: Generate and send landlord financial summaries

| Setting | Value |
|---------|-------|
| Schedule | Monday at 6:00 AM |
| Cron Expression | `0 6 * * 1` |
| Priority | Low |

**Logic**:
```
1. For each landlord:
   - Calculate weekly rental income
   - List completed transactions
   - Sum pending payouts
   - Generate PDF report (optional)
   - Send email with summary
```

**File**: `src/jobs/financial-reports.job.ts`

---

### 8. Database Cleanup

**Purpose**: Archive old data and clean up expired records

| Setting | Value |
|---------|-------|
| Schedule | Sunday at 3:00 AM |
| Cron Expression | `0 3 * * 0` |
| Priority | Low |

**Logic**:
```
1. Archive notifications > 90 days old
2. Delete expired refresh tokens
3. Clean up orphaned media files
4. Archive completed transactions > 1 year
5. Vacuum/analyze database tables
```

**File**: `src/jobs/database-cleanup.job.ts`

---

### 9. Analytics Aggregation

**Purpose**: Pre-compute dashboard statistics

| Setting | Value |
|---------|-------|
| Schedule | Nightly at 1:00 AM |
| Cron Expression | `0 1 * * *` |
| Priority | Low |

**Logic**:
```
1. Aggregate daily statistics:
   - New users by role
   - Properties listed/rented
   - Transaction volumes
   - Verification counts
2. Store in analytics table for fast dashboard queries
```

**File**: `src/jobs/analytics-aggregation.job.ts`

---

### 10. Property Status Updates

**Purpose**: Auto-update property statuses based on lease activity

| Setting | Value |
|---------|-------|
| Schedule | Hourly |
| Cron Expression | `0 * * * *` |
| Priority | Medium |

**Logic**:
```
1. Mark properties as RENTED when lease becomes active
2. Mark properties as ACTIVE when lease ends
3. Mark properties as INACTIVE if no activity for 90 days
```

**File**: `src/jobs/property-status.job.ts`

---

## Implementation Structure

```
src/
├── jobs/
│   ├── index.ts                    # Job scheduler initialization
│   ├── payment-reminders.job.ts
│   ├── overdue-payments.job.ts
│   ├── lease-expiry.job.ts
│   ├── verification-expiry.job.ts
│   ├── agent-reminders.job.ts
│   ├── maintenance-followup.job.ts
│   ├── financial-reports.job.ts
│   ├── database-cleanup.job.ts
│   ├── analytics-aggregation.job.ts
│   └── property-status.job.ts
```

### Job Scheduler Entry Point

```typescript
// src/jobs/index.ts
import cron from 'node-cron';
import { logger } from '../common/utils/logger';

// Import all jobs
import { runPaymentReminders } from './payment-reminders.job';
import { runOverduePayments } from './overdue-payments.job';
import { runLeaseExpiryNotifications } from './lease-expiry.job';
// ... other imports

export function initializeJobs() {
    logger.info('Initializing scheduled jobs...');

    // Payment reminders - Daily 9am
    cron.schedule('0 9 * * *', async () => {
        logger.info('[CRON] Running payment reminders');
        await runPaymentReminders();
    });

    // Overdue payments - Daily 10am
    cron.schedule('0 10 * * *', async () => {
        logger.info('[CRON] Running overdue payment checks');
        await runOverduePayments();
    });

    // ... register other jobs

    logger.info('Scheduled jobs initialized');
}
```

### Starting Jobs with Server

```typescript
// src/index.ts
import { initializeJobs } from './jobs';

// After app.listen()
if (env.NODE_ENV === 'production' || env.ENABLE_CRON_JOBS) {
    initializeJobs();
}
```

---

## Environment Configuration

```env
# Enable/disable cron jobs
ENABLE_CRON_JOBS=true

# Timezone for cron schedules
TZ=Africa/Lagos
```

---

## Error Handling

Each job should:
1. Wrap execution in try-catch
2. Log errors with job name and context
3. Send alerts for critical failures
4. Not crash the main application

```typescript
cron.schedule('0 9 * * *', async () => {
    try {
        await runPaymentReminders();
    } catch (error) {
        logger.error('[CRON] Payment reminders failed:', error);
        // Optionally: Send alert to admin
    }
});
```

---

## Monitoring

- Log start and end of each job run
- Track execution duration
- Count records processed
- Alert if job takes too long or fails repeatedly

---

## Implementation Priority

| Priority | Jobs | Phase |
|----------|------|-------|
| **P0** (MVP) | Payment Reminders, Lease Expiry | Phase 1 |
| **P1** (Beta) | Overdue Payments, Agent Reminders, Maintenance | Phase 2 |
| **P2** (Launch) | Financial Reports, Verification Expiry | Phase 3 |
| **P3** (Post-Launch) | Analytics, Cleanup, Property Status | Phase 4 |

---

## Dependencies

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

---

## Testing Cron Jobs

```typescript
// Run job manually for testing
import { runPaymentReminders } from './jobs/payment-reminders.job';

// In a test or script
await runPaymentReminders();
```

---

## Future Considerations

- **Bull + Redis**: For distributed job processing at scale
- **Separate Worker Process**: Run jobs in separate container
- **Job Dashboard**: Admin UI to view job history and status
- **Retry Logic**: Automatic retry with exponential backoff
