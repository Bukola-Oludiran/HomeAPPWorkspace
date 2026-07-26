/**
 * gRPC client to the core-backend mutation surface.
 *
 * Loads .proto files dynamically (no codegen step in v1). Exposes typed
 * service callables. The Bearer JWT is NOT cached on the client — it is
 * injected per-call via Metadata so each tool invocation carries the
 * user's own token, end-to-end.
 */

import path from 'path';
import {
    credentials,
    loadPackageDefinition,
    Metadata,
    type ServiceError,
} from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { env } from '../config/env';

const PROTO_ROOT = path.resolve(__dirname, '../../../proto');

const protoLoaderOptions: protoLoader.Options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

function resolveService(protoFile: string, fqn: string) {
    const definition = protoLoader.loadSync(
        path.join(PROTO_ROOT, protoFile),
        protoLoaderOptions
    );
    const pkg = loadPackageDefinition(definition) as Record<string, unknown>;
    let node: unknown = pkg;
    for (const seg of fqn.split('.')) {
        node = (node as Record<string, unknown>)[seg];
        if (!node) throw new Error(`Failed to resolve ${fqn} in ${protoFile}`);
    }
    return node as new (
        address: string,
        creds: import('@grpc/grpc-js').ChannelCredentials
    ) => any;
}

const target = `${env.CORE_BACKEND_GRPC_HOST}:${env.CORE_BACKEND_GRPC_PORT}`;

const MaintenanceCtor = resolveService(
    'maintenance.proto',
    'homeai.maintenance.v1.MaintenanceService'
);
const maintenanceClient = new MaintenanceCtor(target, credentials.createInsecure());

const MessagingCtor = resolveService(
    'messaging.proto',
    'homeai.messaging.v1.MessagingService'
);
const messagingClient = new MessagingCtor(target, credentials.createInsecure());

const NotificationsCtor = resolveService(
    'notifications.proto',
    'homeai.notifications.v1.NotificationsService'
);
const notificationsClient = new NotificationsCtor(target, credentials.createInsecure());

const ApplicationsCtor = resolveService(
    'applications.proto',
    'homeai.applications.v1.ApplicationsService'
);
const applicationsClient = new ApplicationsCtor(target, credentials.createInsecure());

const TransactionsCtor = resolveService(
    'transactions.proto',
    'homeai.transactions.v1.TransactionsService'
);
const transactionsClient = new TransactionsCtor(target, credentials.createInsecure());

function makeClient(proto: string, fqn: string) {
    const Ctor = resolveService(proto, fqn);
    return new Ctor(target, credentials.createInsecure());
}

const leasesClient = makeClient('leases.proto', 'homeai.leases.v1.LeasesService');
const landlordClient = makeClient('landlord.proto', 'homeai.landlord.v1.LandlordService');
const agentClient = makeClient('agent.proto', 'homeai.agent.v1.AgentService');
const verificationClient = makeClient(
    'verification.proto',
    'homeai.verification.v1.VerificationService'
);
const bankingClient = makeClient('banking.proto', 'homeai.banking.v1.BankingService');
const documentsClient = makeClient('documents.proto', 'homeai.documents.v1.DocumentsService');
const analyticsClient = makeClient('analytics.proto', 'homeai.analytics.v1.AnalyticsService');
const leaseReportsClient = makeClient(
    'lease_reports.proto',
    'homeai.lease_reports.v1.LeaseReportsService'
);

function buildAuthMetadata(jwt: string): Metadata {
    const md = new Metadata();
    md.set('authorization', `Bearer ${jwt}`);
    return md;
}

function unaryCall<TReq, TRes>(
    client: any,
    method: string,
    request: TReq,
    jwt: string
): Promise<TRes> {
    return new Promise((resolve, reject) => {
        client[method](
            request,
            buildAuthMetadata(jwt),
            (err: ServiceError | null, response: TRes) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            }
        );
    });
}

export interface SubmitMaintenanceRequestInput {
    property_id: string;
    category: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    preferred_date?: string;
    preferred_time_slot?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';
    request_id?: string;
}

export interface MaintenanceRequestWire {
    id: string;
    property_id: string;
    tenant_id: string;
    category?: string;
    description?: string;
    priority: string;
    status: string;
    preferred_date?: string;
    preferred_time_slot?: string;
    photos: string[];
    notes?: string;
    resolution?: string;
    cost?: number;
    property: { id: string; name: string; address: string };
    tenant: { id: string; first_name?: string; last_name?: string };
    assigned_agent?: { id: string; first_name?: string; last_name?: string };
    scheduled_date?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================
// Messaging
// ============================================================

export interface CreateConversationInput {
    participant_ids: string[];
    property_id?: string;
    initial_message?: string;
    request_id?: string;
}

export interface ConversationWire {
    id: string;
    type: string;
    property_id?: string;
    participants: { id: string; first_name?: string; last_name?: string }[];
    created_at: string;
    updated_at: string;
}

export interface SendMessageInput {
    conversation_id: string;
    content: string;
    message_type?: 'TEXT' | 'IMAGE' | 'FILE';
    attachment_urls?: string[];
    request_id?: string;
}

export interface MessageWire {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    attachments: string[];
    created_at: string;
}

// ============================================================
// Notifications
// ============================================================

export interface BatchResultWire {
    affected: number;
}

export const grpc = {
    maintenance: {
        submitMaintenanceRequest(
            jwt: string,
            input: SubmitMaintenanceRequestInput
        ): Promise<MaintenanceRequestWire> {
            return unaryCall(
                maintenanceClient,
                'SubmitMaintenanceRequest',
                {
                    ...input,
                    preferred_time_slot:
                        input.preferred_time_slot ?? 'PREFERRED_TIME_SLOT_UNSPECIFIED',
                },
                jwt
            );
        },
    },
    messaging: {
        createConversation(jwt: string, input: CreateConversationInput): Promise<ConversationWire> {
            return unaryCall(messagingClient, 'CreateConversation', input, jwt);
        },
        sendMessage(jwt: string, input: SendMessageInput): Promise<MessageWire> {
            return unaryCall(
                messagingClient,
                'SendMessage',
                {
                    conversation_id: input.conversation_id,
                    content: input.content,
                    message_type: input.message_type ?? 'TEXT',
                    attachment_urls: input.attachment_urls ?? [],
                    request_id: input.request_id,
                },
                jwt
            );
        },
    },
    notifications: {
        markNotificationsRead(jwt: string, ids: string[]): Promise<BatchResultWire> {
            return unaryCall(
                notificationsClient,
                'MarkNotificationsRead',
                { notification_ids: ids },
                jwt
            );
        },
        markAllNotificationsRead(jwt: string): Promise<BatchResultWire> {
            return unaryCall(notificationsClient, 'MarkAllNotificationsRead', {}, jwt);
        },
        deleteNotifications(jwt: string, ids: string[]): Promise<BatchResultWire> {
            return unaryCall(
                notificationsClient,
                'DeleteNotifications',
                { notification_ids: ids },
                jwt
            );
        },
        clearAllNotifications(jwt: string): Promise<BatchResultWire> {
            return unaryCall(notificationsClient, 'ClearAllNotifications', {}, jwt);
        },
    },
    applications: {
        submit(
            jwt: string,
            input: {
                property_id: string;
                move_in_date?: string;
                lease_term_months?: number;
                additional_notes?: string;
            }
        ): Promise<{ application_id: string; message: string }> {
            return unaryCall(applicationsClient, 'SubmitApplication', input, jwt);
        },
        withdraw(jwt: string, applicationId: string): Promise<{ message: string }> {
            return unaryCall(
                applicationsClient,
                'WithdrawApplication',
                { application_id: applicationId },
                jwt
            );
        },
    },
    transactions: {
        initiatePayment(
            jwt: string,
            input: {
                type: string;
                amount: number;
                currency: string;
                lease_id?: string;
                property_id?: string;
                payment_method?: string;
                description?: string;
            }
        ): Promise<{
            transaction_id: string;
            payment_url?: string;
            reference?: string;
            status: string;
        }> {
            return unaryCall(transactionsClient, 'InitiatePayment', input, jwt);
        },
    },
    leases: {
        createLease(
            jwt: string,
            input: {
                property_id: string;
                tenant_id: string;
                start_date: string;
                end_date: string;
                monthly_rent: number;
                security_deposit?: number;
            }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(leasesClient, 'CreateLease', input, jwt);
        },
        updateLease(
            jwt: string,
            input: { id: string; monthly_rent?: number; end_date?: string }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(leasesClient, 'UpdateLease', input, jwt);
        },
        sendRenewalOffer(
            jwt: string,
            input: { id: string; new_end_date: string; new_monthly_rent?: number }
        ): Promise<{ message: string }> {
            return unaryCall(leasesClient, 'SendRenewalOffer', input, jwt);
        },
        respondToRenewal(
            jwt: string,
            input: { id: string; response: 'ACCEPT' | 'DECLINE' }
        ): Promise<{ message: string }> {
            return unaryCall(leasesClient, 'RespondToRenewal', input, jwt);
        },
        signLease(jwt: string, input: { id: string; signature: string }): Promise<{ message: string }> {
            return unaryCall(leasesClient, 'SignLease', input, jwt);
        },
    },
    landlord: {
        approveApplicant(jwt: string, applicationId: string): Promise<{ message: string }> {
            return unaryCall(landlordClient, 'ApproveApplicant', { application_id: applicationId }, jwt);
        },
        rejectApplicant(
            jwt: string,
            applicationId: string,
            reason?: string
        ): Promise<{ message: string }> {
            return unaryCall(
                landlordClient,
                'RejectApplicant',
                { application_id: applicationId, reason },
                jwt
            );
        },
        requestLandlordPayout(
            jwt: string,
            input: { amount: number; bank_account_id?: string }
        ): Promise<{ payout_id: string; status: string }> {
            return unaryCall(landlordClient, 'RequestLandlordPayout', input, jwt);
        },
        createLandlordJob(
            jwt: string,
            input: {
                job_type: string;
                property_id: string;
                scheduled_date?: string;
                payout_amount?: number;
                notes?: string;
            }
        ): Promise<{ job_id: string }> {
            return unaryCall(landlordClient, 'CreateLandlordJob', input, jwt);
        },
    },
    agent: {
        acceptJob(jwt: string, jobId: string, note?: string): Promise<{ message: string }> {
            return unaryCall(agentClient, 'AcceptJob', { job_id: jobId, note }, jwt);
        },
        declineJob(jwt: string, jobId: string, reason: string): Promise<{ message: string }> {
            return unaryCall(agentClient, 'DeclineJob', { job_id: jobId, reason }, jwt);
        },
        completeJob(
            jwt: string,
            jobId: string,
            completionNotes?: string
        ): Promise<{ message: string }> {
            return unaryCall(
                agentClient,
                'CompleteJob',
                { job_id: jobId, completion_notes: completionNotes },
                jwt
            );
        },
        withdrawEarnings(
            jwt: string,
            input: { amount: number; bank_account_id: string }
        ): Promise<{ payout_id: string; status: string }> {
            return unaryCall(agentClient, 'WithdrawEarnings', input, jwt);
        },
    },
    verification: {
        submitIdentity(
            jwt: string,
            input: { document_type: string; document_number: string; document_url?: string }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(verificationClient, 'SubmitIdentityVerification', input, jwt);
        },
        submitAddress(
            jwt: string,
            input: { document_url: string; document_type?: string }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(verificationClient, 'SubmitAddressVerification', input, jwt);
        },
        submitCofo(
            jwt: string,
            input: { property_id: string; document_url: string }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(verificationClient, 'SubmitCofoVerification', input, jwt);
        },
        requestPropertyAudit(
            jwt: string,
            input: { property_id: string; preferred_date?: string; notes?: string }
        ): Promise<{ id: string; status: string }> {
            return unaryCall(verificationClient, 'RequestPropertyVerificationAudit', input, jwt);
        },
    },
    banking: {
        resolve(
            jwt: string,
            input: { bank_code: string; account_number: string }
        ): Promise<{ account_name: string; bank_code: string; account_number: string }> {
            return unaryCall(bankingClient, 'ResolveBankAccount', input, jwt);
        },
        addAccount(
            jwt: string,
            input: { bank_code: string; account_number: string; make_default?: boolean }
        ): Promise<{
            id: string;
            bank_name: string;
            masked_account_number: string;
            account_name: string;
            is_default: boolean;
        }> {
            return unaryCall(bankingClient, 'AddBankAccount', input, jwt);
        },
        setDefault(jwt: string, id: string): Promise<{ message: string }> {
            return unaryCall(bankingClient, 'SetDefaultBankAccount', { id }, jwt);
        },
        deleteAccount(jwt: string, id: string): Promise<{ message: string }> {
            return unaryCall(bankingClient, 'DeleteBankAccount', { id }, jwt);
        },
        requestPayout(
            jwt: string,
            input: { amount: number; bank_account_id?: string }
        ): Promise<{ payout_id: string; status: string }> {
            return unaryCall(bankingClient, 'RequestBankingPayout', input, jwt);
        },
    },
    documents: {
        deleteDocument(jwt: string, id: string): Promise<{ message: string }> {
            return unaryCall(documentsClient, 'DeleteDocument', { id }, jwt);
        },
    },
    analytics: {
        getPriceOptimization(
            jwt: string,
            input: { property_id: string; objective: string; current_price?: number }
        ): Promise<{ recommended_price: number; rationale: string; confidence: number }> {
            return unaryCall(analyticsClient, 'GetPriceOptimization', input, jwt);
        },
    },
    leaseReports: {
        generateLeaseDocument(
            jwt: string,
            input: { lease_id: string; template?: string }
        ): Promise<{ id: string; status: string; download_url?: string }> {
            return unaryCall(leaseReportsClient, 'GenerateLeaseDocument', input, jwt);
        },
        generateFinancialReport(
            jwt: string,
            input: {
                report_type: string;
                start_date: string;
                end_date: string;
                property_id?: string;
            }
        ): Promise<{ id: string; status: string; download_url?: string }> {
            return unaryCall(leaseReportsClient, 'GenerateFinancialReport', input, jwt);
        },
    },
};
