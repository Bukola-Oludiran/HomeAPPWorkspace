/**
 * Bundle registry + role-based filter.
 *
 * To add a new bundle: import it, append to ALL_BUNDLES. The session
 * manager re-checks eligibility defensively in beforeToolCall.
 */

import { agentBundle } from './bundles/agent.bundle';
import { analyticsBundle } from './bundles/analytics.bundle';
import { applicationsBundle } from './bundles/applications.bundle';
import { bankingBundle } from './bundles/banking.bundle';
import { documentsBundle } from './bundles/documents.bundle';
import { landlordBundle } from './bundles/landlord.bundle';
import { leasesBundle } from './bundles/leases.bundle';
import { leaseReportsBundle } from './bundles/lease-reports.bundle';
import { maintenanceBundle } from './bundles/maintenance.bundle';
import { messagingBundle } from './bundles/messaging.bundle';
import { notificationsBundle } from './bundles/notifications.bundle';
import { propertiesBundle } from './bundles/properties.bundle';
import { transactionsBundle } from './bundles/transactions.bundle';
import { uiRenderBundle } from './bundles/ui-render.bundle';
import { verificationBundle } from './bundles/verification.bundle';
import type { Role, Tool, ToolBundle } from './types';

const ALL_BUNDLES: readonly ToolBundle[] = [
    uiRenderBundle,
    propertiesBundle,
    maintenanceBundle,
    leasesBundle,
    applicationsBundle,
    transactionsBundle,
    messagingBundle,
    notificationsBundle,
    landlordBundle,
    agentBundle,
    verificationBundle,
    bankingBundle,
    documentsBundle,
    analyticsBundle,
    leaseReportsBundle,
];

export function listBundles(): readonly ToolBundle[] {
    return ALL_BUNDLES;
}

export function eligibleBundles(role: Role): ToolBundle[] {
    return ALL_BUNDLES.filter((b) => b.eligibleRoles.includes(role));
}

export function collectTools(role: Role): {
    bundles: ToolBundle[];
    tools: Tool[];
    byName: Map<string, { tool: Tool; bundle: ToolBundle }>;
} {
    const bundles = eligibleBundles(role);
    const tools: Tool[] = [];
    const byName = new Map<string, { tool: Tool; bundle: ToolBundle }>();
    for (const b of bundles) {
        for (const t of [...b.readTools, ...b.writeTools]) {
            tools.push(t);
            byName.set(t.name, { tool: t, bundle: b });
        }
    }
    return { bundles, tools, byName };
}
