/**
 * Re-export of the SSE event protocol + UI fragment catalogue.
 *
 * The discriminated unions in `@homeai/contracts/ui-fragments` are the
 * source of truth for what a `ui` event can contain. The frontend's
 * FragmentRenderer is type-checked against this union — adding a new
 * fragment type on the server is a single edit there and a new
 * component file here.
 */

export type {
    UiFragment,
    UiFragmentType,
    PropertyCardProps,
    PropertyGridProps,
    PropertyComparisonProps,
    LeaseDetailPanelProps,
    MaintenanceRequestCardProps,
    TransactionListProps,
    PaymentSummaryCardProps,
    PaymentReceiptCardProps,
    ApplicationStatusCardProps,
    MessageThreadPreviewProps,
    JobCardProps,
    FinancialSummaryChartProps,
    VerificationStatusCardProps,
    BankAccountCardProps,
    NotificationListProps,
    QuickActionGroupProps,
    FormProps,
    ConfirmationCardProps,
    ErrorCardProps,
    FragmentAction,
} from '@homeai/contracts/ui-fragments';

/** SSE event shapes mirroring ai-service/src/streaming/sse.ts. */
export type ChatEvent =
    | { type: 'session'; sessionId: string }
    | { type: 'text_delta'; delta: string }
    | {
          type: 'tool_call_start';
          toolCallId: string;
          name: string;
          args: Record<string, unknown>;
      }
    | { type: 'tool_call_result'; toolCallId: string; ok: boolean; summary: unknown }
    | {
          type: 'ui';
          toolCallId?: string;
          fragmentId: string;
          component: import('@homeai/contracts/ui-fragments').UiFragment;
      }
    | {
          type: 'confirm_required';
          toolCallId: string;
          name: string;
          humanSummary: string;
      }
    | { type: 'error'; code: string; message: string }
    | { type: 'done' };

/** Items in the chat timeline displayed in the UI. */
export type TimelineItem =
    | { kind: 'user_message'; id: string; text: string; createdAt: string }
    | { kind: 'text'; id: string; text: string; createdAt: string }
    | {
          kind: 'fragment';
          id: string;
          toolCallId?: string;
          component: import('@homeai/contracts/ui-fragments').UiFragment;
          createdAt: string;
      }
    | { kind: 'error'; id: string; code: string; message: string; createdAt: string };

export interface SessionContextSeed {
    propertyId?: string;
    leaseId?: string;
    applicationId?: string;
    conversationId?: string;
    maintenanceRequestId?: string;
}

export interface SessionSummary {
    id: string;
    title: string;
    contextSeed: Record<string, unknown> | null;
    lastMessageAt: string;
    createdAt: string;
}

export interface UiActionMessage {
    type: 'ui_action';
    fragmentId: string;
    actionId: string;
    payload?: Record<string, unknown>;
}

export interface ConfirmationMessage {
    type: 'confirmation';
    toolCallId: string;
    approved: boolean;
}
