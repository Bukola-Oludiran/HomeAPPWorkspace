import type { AgentJob } from '../../types/dashboard';
import type { Payout } from '../../types/lease';

/** How each job status reads to the agent, and its StatusBadge colour */
export const JOB_STATUS: Record<AgentJob['status'], { label: string; variant: 'success' | 'pending' | 'error' | 'info' }> = {
    Open: { label: 'Open', variant: 'info' },
    Accepted: { label: 'In progress', variant: 'pending' },
    Completed: { label: 'Completed', variant: 'success' },
    Cancelled: { label: 'Cancelled', variant: 'error' },
};

/** How each payout (a withdrawal to the agent's bank) reads, and its StatusBadge colour */
export const PAYOUT_STATUS: Record<Payout['status'], { label: string; variant: 'success' | 'pending' | 'error' }> = {
    COMPLETED: { label: 'Paid out', variant: 'success' },
    PENDING: { label: 'Processing', variant: 'pending' },
    PROCESSING: { label: 'Processing', variant: 'pending' },
    FAILED: { label: 'Failed', variant: 'error' },
};
