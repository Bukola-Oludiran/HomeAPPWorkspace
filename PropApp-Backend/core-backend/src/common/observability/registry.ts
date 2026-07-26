import { env } from '../../config/env';
import type { ModuleComplianceRegistry, RouteComplianceMetadata } from './registry.types';

// Per-module registries. Each is keyed by '<METHOD> <relative-path>',
// where the relative path is what the module's router sees (no API prefix).
import authRegistry from '../../modules/auth/auth.compliance';
import usersRegistry from '../../modules/users/users.compliance';
import propertiesRegistry from '../../modules/properties/properties.compliance';
import landlordRegistry from '../../modules/landlord/landlord.compliance';
import tenantRegistry from '../../modules/tenant/tenant.compliance';
import leasesRegistry from '../../modules/leases/leases.compliance';
import maintenanceRegistry from '../../modules/maintenance/maintenance.compliance';
import agentRegistry from '../../modules/agent/agent.compliance';
import messagingRegistry from '../../modules/messaging/messaging.compliance';
import transactionsRegistry from '../../modules/transactions/transactions.compliance';
import verificationRegistry from '../../modules/verification/verification.compliance';
import notificationsRegistry from '../../modules/notifications/notifications.compliance';

const API_PREFIX = `/api/${env.API_VERSION}`;

const MODULES: Array<{ mount: string; registry: ModuleComplianceRegistry }> = [
    { mount: `${API_PREFIX}/auth`, registry: authRegistry },
    { mount: `${API_PREFIX}/users`, registry: usersRegistry },
    { mount: `${API_PREFIX}/properties`, registry: propertiesRegistry },
    { mount: `${API_PREFIX}/landlord`, registry: landlordRegistry },
    { mount: `${API_PREFIX}/tenant`, registry: tenantRegistry },
    { mount: `${API_PREFIX}/leases`, registry: leasesRegistry },
    { mount: `${API_PREFIX}/maintenance`, registry: maintenanceRegistry },
    { mount: `${API_PREFIX}/agent`, registry: agentRegistry },
    { mount: `${API_PREFIX}/messages`, registry: messagingRegistry },
    { mount: `${API_PREFIX}/transactions`, registry: transactionsRegistry },
    { mount: `${API_PREFIX}/verification`, registry: verificationRegistry },
    { mount: `${API_PREFIX}/notifications`, registry: notificationsRegistry },
];

const buildLookup = (): Map<string, RouteComplianceMetadata> => {
    const lookup = new Map<string, RouteComplianceMetadata>();
    for (const { mount, registry } of MODULES) {
        for (const [key, entry] of Object.entries(registry)) {
            const spaceIdx = key.indexOf(' ');
            if (spaceIdx === -1) continue;
            const method = key.slice(0, spaceIdx).toUpperCase();
            const path = key.slice(spaceIdx + 1);
            const fullPath = path === '/' ? mount : `${mount}${path}`;
            lookup.set(`${method} ${fullPath}`, entry);
        }
    }
    return lookup;
};

const lookup = buildLookup();

/**
 * Look up the compliance metadata for a matched Express route.
 * Returns undefined when no registry entry exists; caller decides what to do.
 */
export const lookupRouteCompliance = (
    method: string,
    fullRoutePath: string,
): RouteComplianceMetadata | undefined => {
    return lookup.get(`${method.toUpperCase()} ${fullRoutePath}`);
};

/** Test-only: visible-for-debug count of mapped routes. */
export const mappedRouteCount = (): number => lookup.size;
