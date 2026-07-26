/**
 * Generative UI fragment catalogue — shared between the AI service
 * (emitter) and the frontend chat (renderer).
 *
 * Pattern mirrors the rest of the contracts package: a zod schema per
 * component's props, then a discriminated union `UiFragment` over the
 * full catalogue. The AI service emits these as `ui` SSE events; the
 * frontend chat looks up the `type` in its component registry and
 * renders the React component with the validated props.
 *
 * Trust model: the LLM never authors fragment props. Tools produce the
 * fragments deterministically from validated tool results (read-tool
 * Prisma rows → `toUiFragment()` projections; write-tool gRPC responses
 * → same). The LLM only decides *which* tool to call. Both ends
 * `UiFragment.parse(...)` so a malformed fragment never reaches a
 * React render path.
 *
 * V1 catalogue. Each component is intentionally minimal — visual polish
 * lives in the frontend renderer, not the schema. Add components by
 * adding a `*Props` schema and extending the `UiFragment` union.
 */

import { z } from 'zod';
import {
    ApplicationStatusValues,
    LeaseStatusValues,
    ListingTypeValues,
    MaintenancePriorityValues,
    MaintenanceStatusValues,
    PropertyTypeValues,
    VerificationTierValues,
} from './enums';

// ============================================
// Shared sub-schemas
// ============================================

/** Inline action a fragment surfaces to the user (button, link, etc). */
export const FragmentAction = z.object({
    /** Stable id the frontend posts back as `actionId` in ui_action. */
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    kind: z.enum(['primary', 'secondary', 'danger', 'subtle']).default('secondary'),
    /** Optional payload preview the renderer can pre-fill into ui_action. */
    payload: z.record(z.unknown()).optional(),
});
export type FragmentAction = z.infer<typeof FragmentAction>;

/** Naira-denominated money, exposed as a plain number for renderer math. */
export const Money = z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3).default('NGN'),
});
export type Money = z.infer<typeof Money>;

// ============================================
// PropertyCard / PropertyGrid / PropertyComparison
// ============================================

export const PropertyCardProps = z.object({
    propertyId: z.string().uuid(),
    title: z.string(),
    propertyType: z.enum(PropertyTypeValues),
    listingType: z.enum(ListingTypeValues),
    city: z.string(),
    area: z.string().optional(),
    price: Money,
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    heroImageUrl: z.string().url().nullable().optional(),
    verificationTier: z.enum(VerificationTierValues).optional(),
    actions: z.array(FragmentAction).default([]),
});
export type PropertyCardProps = z.infer<typeof PropertyCardProps>;

export const PropertyGridProps = z.object({
    items: z.array(PropertyCardProps),
    total: z.number().int().nonnegative().optional(),
    note: z.string().optional(),
});
export type PropertyGridProps = z.infer<typeof PropertyGridProps>;

export const PropertyComparisonProps = z.object({
    items: z.array(PropertyCardProps).min(2).max(4),
});
export type PropertyComparisonProps = z.infer<typeof PropertyComparisonProps>;

// ============================================
// LeaseDetailPanel
// ============================================

export const LeaseDetailPanelProps = z.object({
    leaseId: z.string().uuid(),
    propertyTitle: z.string(),
    status: z.enum(LeaseStatusValues),
    monthlyRent: Money.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    nextPaymentDue: z.string().optional(),
    actions: z.array(FragmentAction).default([]),
});
export type LeaseDetailPanelProps = z.infer<typeof LeaseDetailPanelProps>;

// ============================================
// MaintenanceRequestCard
// ============================================

export const MaintenanceRequestCardProps = z.object({
    requestId: z.string().uuid(),
    propertyTitle: z.string(),
    category: z.string().optional(),
    priority: z.enum(MaintenancePriorityValues),
    status: z.enum(MaintenanceStatusValues),
    description: z.string().optional(),
    createdAt: z.string(),
    assignedAgentName: z.string().optional(),
    actions: z.array(FragmentAction).default([]),
});
export type MaintenanceRequestCardProps = z.infer<typeof MaintenanceRequestCardProps>;

// ============================================
// Transactions
// ============================================

export const TransactionListItem = z.object({
    transactionId: z.string().uuid(),
    kind: z.string(),
    amount: Money,
    status: z.string(),
    createdAt: z.string(),
    counterpartyName: z.string().optional(),
});
export type TransactionListItem = z.infer<typeof TransactionListItem>;

export const TransactionListProps = z.object({
    items: z.array(TransactionListItem),
    total: z.number().int().nonnegative().optional(),
});
export type TransactionListProps = z.infer<typeof TransactionListProps>;

export const PaymentSummaryCardProps = z.object({
    purpose: z.string(),
    amount: Money,
    recipientName: z.string(),
    dueDate: z.string().optional(),
    actions: z.array(FragmentAction).default([]),
});
export type PaymentSummaryCardProps = z.infer<typeof PaymentSummaryCardProps>;

export const PaymentReceiptCardProps = z.object({
    transactionId: z.string().uuid(),
    amount: Money,
    purpose: z.string(),
    recipientName: z.string(),
    paidAt: z.string(),
    reference: z.string(),
});
export type PaymentReceiptCardProps = z.infer<typeof PaymentReceiptCardProps>;

// ============================================
// ApplicationStatusCard
// ============================================

export const ApplicationStatusCardProps = z.object({
    applicationId: z.string().uuid(),
    propertyTitle: z.string(),
    status: z.enum(ApplicationStatusValues),
    submittedAt: z.string(),
    landlordName: z.string().optional(),
    actions: z.array(FragmentAction).default([]),
});
export type ApplicationStatusCardProps = z.infer<typeof ApplicationStatusCardProps>;

// ============================================
// Messaging / Agent / Analytics / Verification / Banking / Notifications
// ============================================

export const MessageThreadPreviewProps = z.object({
    conversationId: z.string().uuid(),
    counterpartyName: z.string(),
    lastMessage: z.string(),
    lastMessageAt: z.string(),
    unreadCount: z.number().int().nonnegative().default(0),
    actions: z.array(FragmentAction).default([]),
});
export type MessageThreadPreviewProps = z.infer<typeof MessageThreadPreviewProps>;

export const JobCardProps = z.object({
    jobId: z.string().uuid(),
    jobType: z.string(),
    propertyTitle: z.string().optional(),
    scheduledAt: z.string().optional(),
    payout: Money.optional(),
    status: z.string(),
    actions: z.array(FragmentAction).default([]),
});
export type JobCardProps = z.infer<typeof JobCardProps>;

export const FinancialSummaryChartProps = z.object({
    period: z.string(),
    series: z.array(
        z.object({
            label: z.string(),
            points: z.array(z.object({ x: z.string(), y: z.number() })),
        })
    ),
    totals: z.array(z.object({ label: z.string(), value: Money })),
});
export type FinancialSummaryChartProps = z.infer<typeof FinancialSummaryChartProps>;

export const VerificationStatusCardProps = z.object({
    tier: z.enum(VerificationTierValues),
    stepsComplete: z.array(z.string()),
    stepsPending: z.array(z.string()),
    actions: z.array(FragmentAction).default([]),
});
export type VerificationStatusCardProps = z.infer<typeof VerificationStatusCardProps>;

export const BankAccountCardProps = z.object({
    accountId: z.string().uuid(),
    bankName: z.string(),
    maskedAccountNumber: z.string(),
    accountName: z.string(),
    isDefault: z.boolean(),
    actions: z.array(FragmentAction).default([]),
});
export type BankAccountCardProps = z.infer<typeof BankAccountCardProps>;

export const NotificationListItem = z.object({
    notificationId: z.string().uuid(),
    title: z.string(),
    body: z.string(),
    createdAt: z.string(),
    isRead: z.boolean(),
});
export type NotificationListItem = z.infer<typeof NotificationListItem>;

export const NotificationListProps = z.object({
    items: z.array(NotificationListItem),
    unreadCount: z.number().int().nonnegative(),
});
export type NotificationListProps = z.infer<typeof NotificationListProps>;

// ============================================
// Interactive helpers — QuickActionGroup / Form / ConfirmationCard / ErrorCard
// ============================================

export const QuickActionGroupProps = z.object({
    prompt: z.string(),
    actions: z.array(FragmentAction).min(1),
});
export type QuickActionGroupProps = z.infer<typeof QuickActionGroupProps>;

export const FormField = z.object({
    id: z.string().min(1).max(64),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox']),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    /** For type=select. */
    options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
});
export type FormField = z.infer<typeof FormField>;

export const FormProps = z.object({
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(FormField).min(1),
    submitAction: FragmentAction,
    cancelAction: FragmentAction.optional(),
});
export type FormProps = z.infer<typeof FormProps>;

export const ConfirmationCardProps = z.object({
    title: z.string(),
    humanSummary: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']).default('medium'),
    confirmAction: FragmentAction,
    cancelAction: FragmentAction,
});
export type ConfirmationCardProps = z.infer<typeof ConfirmationCardProps>;

export const ErrorCardProps = z.object({
    title: z.string().default('Something went wrong'),
    message: z.string(),
    code: z.string().optional(),
    retryAction: FragmentAction.optional(),
});
export type ErrorCardProps = z.infer<typeof ErrorCardProps>;

// ============================================
// Discriminated union — the canonical UiFragment shape
// ============================================

export const UiFragment = z.discriminatedUnion('type', [
    z.object({ type: z.literal('PropertyCard'), props: PropertyCardProps }),
    z.object({ type: z.literal('PropertyGrid'), props: PropertyGridProps }),
    z.object({ type: z.literal('PropertyComparison'), props: PropertyComparisonProps }),
    z.object({ type: z.literal('LeaseDetailPanel'), props: LeaseDetailPanelProps }),
    z.object({ type: z.literal('MaintenanceRequestCard'), props: MaintenanceRequestCardProps }),
    z.object({ type: z.literal('TransactionList'), props: TransactionListProps }),
    z.object({ type: z.literal('PaymentSummaryCard'), props: PaymentSummaryCardProps }),
    z.object({ type: z.literal('PaymentReceiptCard'), props: PaymentReceiptCardProps }),
    z.object({ type: z.literal('ApplicationStatusCard'), props: ApplicationStatusCardProps }),
    z.object({ type: z.literal('MessageThreadPreview'), props: MessageThreadPreviewProps }),
    z.object({ type: z.literal('JobCard'), props: JobCardProps }),
    z.object({ type: z.literal('FinancialSummaryChart'), props: FinancialSummaryChartProps }),
    z.object({ type: z.literal('VerificationStatusCard'), props: VerificationStatusCardProps }),
    z.object({ type: z.literal('BankAccountCard'), props: BankAccountCardProps }),
    z.object({ type: z.literal('NotificationList'), props: NotificationListProps }),
    z.object({ type: z.literal('QuickActionGroup'), props: QuickActionGroupProps }),
    z.object({ type: z.literal('Form'), props: FormProps }),
    z.object({ type: z.literal('ConfirmationCard'), props: ConfirmationCardProps }),
    z.object({ type: z.literal('ErrorCard'), props: ErrorCardProps }),
]);
export type UiFragment = z.infer<typeof UiFragment>;
export type UiFragmentType = UiFragment['type'];
