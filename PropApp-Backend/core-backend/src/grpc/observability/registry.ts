import type { GrpcServiceRegistry, GrpcMethodComplianceEntry } from '../../common/observability/registry.types';

import agentRegistry from '../handlers/agent.compliance';
import analyticsRegistry from '../handlers/analytics.compliance';
import applicationsRegistry from '../handlers/applications.compliance';
import bankingRegistry from '../handlers/banking.compliance';
import documentsRegistry from '../handlers/documents.compliance';
import landlordRegistry from '../handlers/landlord.compliance';
import leaseReportsRegistry from '../handlers/lease_reports.compliance';
import leasesRegistry from '../handlers/leases.compliance';
import maintenanceRegistry from '../handlers/maintenance.compliance';
import messagingRegistry from '../handlers/messaging.compliance';
import notificationsRegistry from '../handlers/notifications.compliance';
import transactionsRegistry from '../handlers/transactions.compliance';
import verificationRegistry from '../handlers/verification.compliance';

interface ServiceBinding {
    fqn: string;
    registry: GrpcServiceRegistry;
}

const SERVICES: ServiceBinding[] = [
    { fqn: 'homeai.agent.v1.AgentService', registry: agentRegistry },
    { fqn: 'homeai.analytics.v1.AnalyticsService', registry: analyticsRegistry },
    { fqn: 'homeai.applications.v1.ApplicationsService', registry: applicationsRegistry },
    { fqn: 'homeai.banking.v1.BankingService', registry: bankingRegistry },
    { fqn: 'homeai.documents.v1.DocumentsService', registry: documentsRegistry },
    { fqn: 'homeai.landlord.v1.LandlordService', registry: landlordRegistry },
    { fqn: 'homeai.lease_reports.v1.LeaseReportsService', registry: leaseReportsRegistry },
    { fqn: 'homeai.leases.v1.LeasesService', registry: leasesRegistry },
    { fqn: 'homeai.maintenance.v1.MaintenanceService', registry: maintenanceRegistry },
    { fqn: 'homeai.messaging.v1.MessagingService', registry: messagingRegistry },
    { fqn: 'homeai.notifications.v1.NotificationsService', registry: notificationsRegistry },
    { fqn: 'homeai.transactions.v1.TransactionsService', registry: transactionsRegistry },
    { fqn: 'homeai.verification.v1.VerificationService', registry: verificationRegistry },
];

const buildLookup = (): Map<string, GrpcMethodComplianceEntry> => {
    const lookup = new Map<string, GrpcMethodComplianceEntry>();
    for (const { fqn, registry } of SERVICES) {
        for (const [methodOrWildcard, entry] of Object.entries(registry)) {
            lookup.set(`${fqn}/${methodOrWildcard}`, entry);
        }
    }
    return lookup;
};

const lookup = buildLookup();

/**
 * Resolve compliance metadata for a gRPC method invocation.
 * Tries exact `<fqn>/<method>` first, then falls back to `<fqn>/*` wildcard.
 */
export const lookupGrpcCompliance = (
    serviceFqn: string,
    methodName: string,
): GrpcMethodComplianceEntry | undefined => {
    return lookup.get(`${serviceFqn}/${methodName}`) ?? lookup.get(`${serviceFqn}/*`);
};

/** Test-only diagnostic. */
export const mappedGrpcCount = (): number => lookup.size;
