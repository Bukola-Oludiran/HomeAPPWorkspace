/**
 * Dashboard and Shared Types
 * Types for dashboards, notifications, messages, and other shared entities
 */

import type { PropertySummary } from './property';

// ==========================================
// Landlord Dashboard Types
// ==========================================

export interface LandlordDashboard {
    totalRevenue: number;
    revenueChange: number;
    occupancyRate: number;
    vacantUnits: number;
    activeListings: number;
    pendingListings: number;
    actionRequired: number;
    properties: LandlordPropertySummary[];
    alerts: Alert[];
}

export interface LandlordPropertySummary {
    id: string;
    name: string;
    location: string;
    image: string;
    status: 'Rented' | 'Active' | 'Maintenance' | 'Vacant';
    bedrooms: number;
    leaseEnd?: string;
    views?: number;
    maintenance?: string;
    price: number;
    priceUnit: string;
    paymentStatus: string;
}

export interface LandlordFinancials {
    availableBalance: number;
    pendingBalance: number;
    totalReceived: number;
    totalWithdrawn: number;
    recentTransactions: LandlordTransaction[];
}

export interface LandlordFinancialSummary {
    totalRevenue: number;
    revenueByMonth: Array<{ month: string; amount: number }>;
    revenueByProperty: Array<{ propertyId: string; propertyName: string; amount: number }>;
    expenseBreakdown: Array<{ category: string; amount: number }>;
}

export interface LandlordTransaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    propertyName?: string;
    tenantName?: string;
    createdAt: string;
}

// ==========================================
// Tenant Dashboard Types
// ==========================================

export interface TenantDashboard {
    nextPayment: {
        amount: number;
        dueDate: string;
        status: 'Paid' | 'Due Soon' | 'Overdue';
    };
    lease: {
        remaining: string;
        endDate: string;
        status: 'Active' | 'Expiring Soon' | 'Expired';
    };
    maintenanceRequests: number;
    property?: TenantProperty;
    recentPayments: TenantPayment[];
    maintenanceLog: MaintenanceLogItem[];
    applicationsList: TenantApplicationSummary[];
    savedProperties: SavedPropertySummary[];
}

export interface TenantProperty {
    name: string;
    address: string;
    image: string;
    landlordName: string;
    landlordAvatar?: string;
    landlordPhone?: string;
    leaseStart: string;
    leaseEnd: string;
    monthlyRent: number;
}

export interface TenantPayment {
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    dueDate: string;
    paidDate?: string;
}

export interface MaintenanceLogItem {
    id: string;
    title: string;
    status: string;
    statusColor: string;
    icon: string;
    iconBg: string;
    description: string;
    completed?: boolean;
}

export interface TenantApplicationSummary {
    id: string;
    address: string;
    city: string;
    status: string;
    statusColor: string;
    date: string;
    image: string;
}

export interface SavedPropertySummary {
    id: string;
    address: string;
    city: string;
    price: string;
    image: string;
}

// ==========================================
// Agent Dashboard Types
// ==========================================

export interface AgentDashboard {
    totalEarnings: number;
    earningsChange: number;
    completedJobs: number;
    jobsThisWeek: number;
    rating: number;
    reviewCount: number;
    activeJobs: number;
}

export interface AgentJob {
    id: string;
    type: string;
    property: string;
    city: string;
    clientName: string;
    date: string;
    earnings: number;
    status: 'Open' | 'Accepted' | 'Completed' | 'Cancelled';
    priority: 'low' | 'medium' | 'high';
    description?: string;
    contactPhone?: string;
}

export interface AgentEarnings {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    earningsByMonth: Array<{ month: string; amount: number }>;
}

export interface AgentScheduleItem {
    id: string;
    type: string;
    property: string;
    address: string;
    date: string;
    time: string;
    clientName: string;
    clientPhone?: string;
    status: string;
}

// ==========================================
// Alert Types
// ==========================================

export type AlertType =
    | 'MAINTENANCE_EMERGENCY'
    | 'PAYMENT_OVERDUE'
    | 'LEASE_EXPIRING'
    | 'VERIFICATION_PENDING'
    | 'APPLICATION_NEW'
    | 'MESSAGE_NEW';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    description: string;
    priority: AlertPriority;
    actionUrl?: string;
    actionLabel?: string;
    relatedId?: string;
    createdAt: string;
    isRead: boolean;
}

// ==========================================
// Notification Types
// ==========================================

export type NotificationType =
    | 'PAYMENT'
    | 'MESSAGE'
    | 'APPLICATION'
    | 'LEASE'
    | 'MAINTENANCE'
    | 'VERIFICATION'
    | 'SYSTEM';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationDevice {
    id: string;
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceName?: string;
    createdAt: string;
    lastUsedAt?: string;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    types: {
        payments: boolean;
        messages: boolean;
        marketing: boolean;
    };
}

// ==========================================
// Message Types
// ==========================================

export interface Conversation {
    id: string;
    propertyId?: string;
    property?: Pick<PropertySummary, 'id' | 'name' | 'primaryImage'>;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationParticipant {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export interface StartConversationRequest {
    propertyId?: string;
    recipientId: string;
    initialMessage: string;
}

export interface SendMessageRequest {
    content: string;
}

// ==========================================
// Verification Types
// ==========================================

export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export type IdentityDocumentType = 'NIN' | 'BVN' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD';

export interface UserVerificationStatus {
    identityVerified: boolean;
    identityStatus?: VerificationStatus;
    addressVerified: boolean;
    addressStatus?: VerificationStatus;
    overallLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface PropertyVerificationStatus {
    propertyId: string;
    cofoSubmitted: boolean;
    cofoStatus?: VerificationStatus;
    auditRequested: boolean;
    auditStatus?: VerificationStatus;
    tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface SubmitIdentityRequest {
    type: IdentityDocumentType;
    idNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}

export interface SubmitAddressRequest {
    documentUrl: string;
    type: 'utility_bill' | 'bank_statement' | 'government_letter';
    address: string;
}

export interface SubmitCofoRequest {
    documentUrl: string;
    type: 'certificate_of_occupancy';
}

export interface RequestAuditRequest {
    tier: 'SILVER' | 'GOLD' | 'PLATINUM';
    preferredDate?: string;
}

// ==========================================
// Report Types
// ==========================================

export type ReportType =
    | 'income_statement'
    | 'expense_report'
    | 'property_performance'
    | 'tax_summary';

export type ReportFormat = 'pdf' | 'csv' | 'xlsx';

export interface Report {
    id: string;
    type: ReportType;
    name: string;
    format: ReportFormat;
    downloadUrl: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface GenerateReportRequest {
    reportType: ReportType;
    startDate: string;
    endDate: string;
    format: ReportFormat;
    propertyIds?: string[];
}

// ==========================================
// Analytics Types
// ==========================================

export interface MarketTrends {
    city: string;
    period: string;
    averageRent: number;
    rentChange: number;
    averagePrice: number;
    priceChange: number;
    demandIndex: number;
    topNeighborhoods: Array<{
        name: string;
        averageRent: number;
        demandScore: number;
    }>;
}
