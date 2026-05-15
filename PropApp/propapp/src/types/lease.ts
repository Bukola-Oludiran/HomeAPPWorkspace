/**
 * Lease Types
 * Types for leases, transactions, maintenance, and related entities
 */

import type { PropertySummary } from './property';
import type { User } from './auth';
import type { PaginationParams } from './api';

// Lease status — sourced from @homeai/contracts/enums (the canonical
// value list also drives backend zod). Was previously missing DRAFT +
// PENDING_SIGNATURES and had a wrongly-named `PENDING`.
import type { LeaseStatus } from '@homeai/contracts/enums';
export type { LeaseStatus };

// Renewal status
export type RenewalStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'EXPIRED';

// Lease
export interface Lease {
    id: string;
    propertyId: string;
    property?: PropertySummary;
    landlordId: string;
    landlord?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
    tenantId: string;
    tenant?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
    status: LeaseStatus;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    paymentDueDay: number;
    currency: string;
    terms?: string;
    documentUrl?: string;
    signedByLandlord: boolean;
    signedByTenant: boolean;
    landlordSignedAt?: string;
    tenantSignedAt?: string;
    renewalOffer?: RenewalOffer;
    createdAt: string;
    updatedAt: string;
}

// Renewal offer
export interface RenewalOffer {
    id: string;
    leaseId: string;
    newEndDate: string;
    newMonthlyRent: number;
    message?: string;
    status: RenewalStatus;
    createdAt: string;
    respondedAt?: string;
}

// ============================================
// REQUEST TYPES — re-exported from @homeai/contracts
// ============================================
export type {
    CreateLeaseRequest,
    UpdateLeaseRequest,
    UpdateLeaseStatusRequest,
    SendRenewalOfferRequest,
    RespondToRenewalRequest,
    SignLeaseRequest,
    CreateLeaseTermsInput,
    UpdateLeaseTermsInput,
} from '@homeai/contracts/lease.contract';

// Generate lease document request
export interface GenerateLeaseDocumentRequest {
    templateId?: string;
    includeAddendums?: boolean;
}

// ==========================================
// Transaction Types
// ==========================================

// Transaction type
export type TransactionType =
    | 'RENT_PAYMENT'
    | 'SECURITY_DEPOSIT'
    | 'COMMISSION'
    | 'PAYOUT'
    | 'REFUND'
    | 'ESCROW_FUND'
    | 'ESCROW_RELEASE';

// Transaction status
export type TransactionStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUNDED'
    | 'CANCELLED';

// Payment method
export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd' | 'wallet';

// Payment provider
export type PaymentProvider = 'paystack' | 'flutterwave' | 'mono';

// Transaction
export interface Transaction {
    id: string;
    reference: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    paymentMethod?: PaymentMethod;
    provider?: PaymentProvider;
    leaseId?: string;
    lease?: Pick<Lease, 'id' | 'property'>;
    fromUserId?: string;
    fromUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
    toUserId?: string;
    toUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
    description?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    completedAt?: string;
}

// Initiate payment request
export interface InitiatePaymentRequest {
    amount: number;
    currency: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
    leaseId?: string;
    description?: string;
}

// Initiate payment response
export interface InitiatePaymentResponse {
    transactionId: string;
    paymentUrl: string;
    reference: string;
    provider: PaymentProvider;
}

// Verify payment request
export interface VerifyPaymentRequest {
    reference: string;
    provider: PaymentProvider;
}

// Escrow
export interface Escrow {
    id: string;
    amount: number;
    currency: string;
    leaseId: string;
    lease?: Pick<Lease, 'id' | 'property'>;
    status: 'PENDING' | 'FUNDED' | 'RELEASED' | 'REFUNDED';
    description?: string;
    fundedAt?: string;
    releasedAt?: string;
    createdAt: string;
}

// Create escrow request
export interface CreateEscrowRequest {
    amount: number;
    currency: string;
    leaseId: string;
    description?: string;
}

// Release escrow request
export interface ReleaseEscrowRequest {
    amount: number;
    releaseReason: string;
}

// Refund request
export interface RefundRequest {
    amount: number;
    reason: string;
}

// Transaction filters
export interface TransactionFilters extends PaginationParams {
    type?: TransactionType | TransactionType[];
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
}

// ==========================================
// Maintenance Types
// ==========================================

// Maintenance priority
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

// Maintenance status (full lifecycle, matches Prisma enum)
export type MaintenanceStatus =
    | 'PENDING'
    | 'SUBMITTED'
    | 'ACKNOWLEDGED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'ON_HOLD'
    | 'COMPLETED'
    | 'CANCELLED';

// Maintenance category (matches backend zod enum — singular APPLIANCE)
export type MaintenanceCategory =
    | 'PLUMBING'
    | 'ELECTRICAL'
    | 'HVAC'
    | 'APPLIANCE'
    | 'STRUCTURAL'
    | 'PEST_CONTROL'
    | 'CLEANING'
    | 'SECURITY'
    | 'OTHER';

// Maintenance request
export interface MaintenanceRequest {
    id: string;
    leaseId: string;
    lease?: Pick<Lease, 'id' | 'property' | 'tenant' | 'landlord'>;
    title: string;
    description: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    images?: string[];
    assignedAgentId?: string;
    assignedAgent?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'phone'>;
    notes?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Maintenance request shapes are re-exported from @homeai/contracts.
// Wire-shape uses `urgency` + `propertyId`; see contracts/maintenance.contract.ts
// for the in-flight drift notes around `urgency` vs `priority` and casing.
export type {
    CreateMaintenanceRequest,
    UpdateMaintenanceRequest,
    AssignMaintenanceAgentRequest,
    MaintenanceQueryRequest,
} from '@homeai/contracts/maintenance.contract';

// Maintenance filters
export interface MaintenanceFilters extends PaginationParams {
    status?: MaintenanceStatus | MaintenanceStatus[];
    priority?: MaintenancePriority | MaintenancePriority[];
    category?: MaintenanceCategory;
}

// ==========================================
// Application Types
// ==========================================

// Application status
export type ApplicationStatus =
    | 'PENDING'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'WITHDRAWN';

// Employment status
export type EmploymentStatus =
    | 'EMPLOYED'
    | 'SELF_EMPLOYED'
    | 'UNEMPLOYED'
    | 'STUDENT'
    | 'RETIRED';

// Rental application
export interface RentalApplication {
    id: string;
    propertyId: string;
    property?: PropertySummary;
    tenantId: string;
    tenant?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'email' | 'phone'>;
    status: ApplicationStatus;
    message?: string;
    moveInDate: string;
    employmentStatus: EmploymentStatus;
    monthlyIncome: number;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Submit application request
export interface SubmitApplicationRequest {
    propertyId: string;
    message?: string;
    moveInDate: string;
    employmentStatus: EmploymentStatus;
    monthlyIncome: number;
}

// Approve application request
export interface ApproveApplicationRequest {
    moveInDate: string;
    monthlyRent: number;
    securityDeposit: number;
}

// Reject application request
export interface RejectApplicationRequest {
    reason: string;
}

// ==========================================
// Banking & Payout Types
// ==========================================

// Bank
export interface Bank {
    code: string;
    name: string;
    slug: string;
    logoUrl?: string;
}

// Bank account
export interface BankAccount {
    id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    accountType: 'savings' | 'current';
    isDefault: boolean;
    isVerified: boolean;
    createdAt: string;
}

// Banking request shapes are re-exported from @homeai/contracts.
export type {
    AddBankAccountRequest,
    ResolveBankAccountRequest,
    UpdatePayoutSettingsRequest,
    RequestPayoutRequest,
} from '@homeai/contracts/banking.contract';

// Resolve bank account response
export interface ResolveBankAccountResponse {
    accountNumber: string;
    accountName: string;
    bankCode: string;
}

// Payout
export interface Payout {
    id: string;
    amount: number;
    currency: string;
    bankAccountId: string;
    bankAccount?: BankAccount;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    description?: string;
    reference?: string;
    createdAt: string;
    completedAt?: string;
}

// `RequestPayoutRequest` is re-exported above from @homeai/contracts.

// Payout settings
export interface PayoutSettings {
    payoutSchedule: 'manual' | 'weekly' | 'biweekly' | 'monthly';
    minimumPayoutAmount: number;
    autoPayoutEnabled: boolean;
}
