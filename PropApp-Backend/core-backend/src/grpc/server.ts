/**
 * gRPC server boot
 *
 * Loads .proto files via @grpc/proto-loader (dynamic — no protoc step) and
 * binds the handler modules. Booted alongside the Express server in
 * src/index.ts so a single backend process serves both transports.
 */

import path from 'path';
import { Server, ServerCredentials, loadPackageDefinition } from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { logger } from '../common/utils/logger';
import { maintenanceHandlers } from './handlers/maintenance.grpc';
import { agentHandlers } from './handlers/agent.grpc';
import { analyticsHandlers } from './handlers/analytics.grpc';
import { applicationsHandlers } from './handlers/applications.grpc';
import { bankingHandlers } from './handlers/banking.grpc';
import { documentsHandlers } from './handlers/documents.grpc';
import { landlordHandlers } from './handlers/landlord.grpc';
import { leasesHandlers } from './handlers/leases.grpc';
import { leaseReportsHandlers } from './handlers/lease_reports.grpc';
import { messagingHandlers } from './handlers/messaging.grpc';
import { notificationsHandlers } from './handlers/notifications.grpc';
import { transactionsHandlers } from './handlers/transactions.grpc';
import { verificationHandlers } from './handlers/verification.grpc';
import { wrapHandlersForCompliance } from './observability/wrap-handlers';

const PROTO_ROOT = path.resolve(__dirname, '../../../../proto');

const protoLoaderOptions: protoLoader.Options = {
    keepCase: true, // preserve snake_case field names from the proto
    longs: String,
    enums: String, // emit enums as their string tokens, not numeric values
    defaults: true,
    oneofs: true,
};

function loadService(protoFileName: string, fqn: string) {
    const definition = protoLoader.loadSync(
        path.join(PROTO_ROOT, protoFileName),
        protoLoaderOptions
    );
    const pkg = loadPackageDefinition(definition) as Record<string, unknown>;
    // Walk dotted fully-qualified name (e.g. "homeai.maintenance.v1.MaintenanceService")
    const segments = fqn.split('.');
    let node: unknown = pkg;
    for (const seg of segments) {
        node = (node as Record<string, unknown>)[seg];
        if (!node) {
            throw new Error(`gRPC: could not resolve ${fqn} in ${protoFileName}`);
        }
    }
    return node as { service: import('@grpc/grpc-js').ServiceDefinition };
}

export function createGrpcServer(): Server {
    const server = new Server();

    const MaintenanceService = loadService(
        'maintenance.proto',
        'homeai.maintenance.v1.MaintenanceService'
    );
    server.addService(
        MaintenanceService.service,
        wrapHandlersForCompliance(
            'homeai.maintenance.v1.MaintenanceService',
            maintenanceHandlers as unknown as Record<
                string,
                import('@grpc/grpc-js').UntypedHandleCall
            >
        )
    );

    const MessagingService = loadService(
        'messaging.proto',
        'homeai.messaging.v1.MessagingService'
    );
    server.addService(
        MessagingService.service,
        wrapHandlersForCompliance(
            'homeai.messaging.v1.MessagingService',
            messagingHandlers as unknown as Record<
                string,
                import('@grpc/grpc-js').UntypedHandleCall
            >
        )
    );

    const NotificationsService = loadService(
        'notifications.proto',
        'homeai.notifications.v1.NotificationsService'
    );
    server.addService(
        NotificationsService.service,
        wrapHandlersForCompliance(
            'homeai.notifications.v1.NotificationsService',
            notificationsHandlers as unknown as Record<
                string,
                import('@grpc/grpc-js').UntypedHandleCall
            >
        )
    );

    const ApplicationsService = loadService(
        'applications.proto',
        'homeai.applications.v1.ApplicationsService'
    );
    server.addService(
        ApplicationsService.service,
        wrapHandlersForCompliance(
            'homeai.applications.v1.ApplicationsService',
            applicationsHandlers as unknown as Record<
                string,
                import('@grpc/grpc-js').UntypedHandleCall
            >
        )
    );

    const TransactionsService = loadService(
        'transactions.proto',
        'homeai.transactions.v1.TransactionsService'
    );
    server.addService(
        TransactionsService.service,
        wrapHandlersForCompliance(
            'homeai.transactions.v1.TransactionsService',
            transactionsHandlers as unknown as Record<
                string,
                import('@grpc/grpc-js').UntypedHandleCall
            >
        )
    );

    type AnyHandlers = Record<string, import('@grpc/grpc-js').UntypedHandleCall>;
    const additional: Array<{ proto: string; fqn: string; handlers: AnyHandlers }> = [
        {
            proto: 'leases.proto',
            fqn: 'homeai.leases.v1.LeasesService',
            handlers: leasesHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'landlord.proto',
            fqn: 'homeai.landlord.v1.LandlordService',
            handlers: landlordHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'agent.proto',
            fqn: 'homeai.agent.v1.AgentService',
            handlers: agentHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'verification.proto',
            fqn: 'homeai.verification.v1.VerificationService',
            handlers: verificationHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'banking.proto',
            fqn: 'homeai.banking.v1.BankingService',
            handlers: bankingHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'documents.proto',
            fqn: 'homeai.documents.v1.DocumentsService',
            handlers: documentsHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'analytics.proto',
            fqn: 'homeai.analytics.v1.AnalyticsService',
            handlers: analyticsHandlers as unknown as AnyHandlers,
        },
        {
            proto: 'lease_reports.proto',
            fqn: 'homeai.lease_reports.v1.LeaseReportsService',
            handlers: leaseReportsHandlers as unknown as AnyHandlers,
        },
    ];
    for (const { proto, fqn, handlers } of additional) {
        const Service = loadService(proto, fqn);
        server.addService(Service.service, wrapHandlersForCompliance(fqn, handlers));
    }

    return server;
}

export function startGrpcServer(port: number): Promise<void> {
    const server = createGrpcServer();
    return new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${port}`,
            ServerCredentials.createInsecure(),
            (err, boundPort) => {
                if (err) {
                    reject(err);
                    return;
                }
                logger.info(`gRPC server listening on port ${boundPort}`);
                resolve();
            }
        );
    });
}
