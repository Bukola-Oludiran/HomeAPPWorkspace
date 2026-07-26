/**
 * FragmentRenderer — switches on `fragment.type` against the component
 * registry. The switch is exhaustive against the `UiFragment` discriminated
 * union exported from `@homeai/contracts/ui-fragments`; if a new fragment
 * type is added there but not handled here, the `_exhaustive: never`
 * assignment in the default branch trips a compile error.
 */

import type { UiFragment } from '../types';
import { ApplicationStatusCard } from './fragments/ApplicationStatusCard';
import { BankAccountCard } from './fragments/BankAccountCard';
import { ConfirmationCard } from './fragments/ConfirmationCard';
import { ErrorCard } from './fragments/ErrorCard';
import { FinancialSummaryChart } from './fragments/FinancialSummaryChart';
import { Form } from './fragments/Form';
import { JobCard } from './fragments/JobCard';
import { LeaseDetailPanel } from './fragments/LeaseDetailPanel';
import { MaintenanceRequestCard } from './fragments/MaintenanceRequestCard';
import { MessageThreadPreview } from './fragments/MessageThreadPreview';
import { NotificationList } from './fragments/NotificationList';
import { PaymentReceiptCard } from './fragments/PaymentReceiptCard';
import { PaymentSummaryCard } from './fragments/PaymentSummaryCard';
import { PropertyCard } from './fragments/PropertyCard';
import { PropertyComparison } from './fragments/PropertyComparison';
import { PropertyGrid } from './fragments/PropertyGrid';
import { QuickActionGroup } from './fragments/QuickActionGroup';
import { TransactionList } from './fragments/TransactionList';
import { VerificationStatusCard } from './fragments/VerificationStatusCard';

interface Props {
    fragment: UiFragment;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function FragmentRenderer({ fragment, onAction }: Props) {
    switch (fragment.type) {
        case 'PropertyCard':
            return <PropertyCard props={fragment.props} onAction={onAction} />;
        case 'PropertyGrid':
            return <PropertyGrid props={fragment.props} onAction={onAction} />;
        case 'PropertyComparison':
            return <PropertyComparison props={fragment.props} onAction={onAction} />;
        case 'LeaseDetailPanel':
            return <LeaseDetailPanel props={fragment.props} onAction={onAction} />;
        case 'MaintenanceRequestCard':
            return <MaintenanceRequestCard props={fragment.props} onAction={onAction} />;
        case 'TransactionList':
            return <TransactionList props={fragment.props} onAction={onAction} />;
        case 'PaymentSummaryCard':
            return <PaymentSummaryCard props={fragment.props} onAction={onAction} />;
        case 'PaymentReceiptCard':
            return <PaymentReceiptCard props={fragment.props} onAction={onAction} />;
        case 'ApplicationStatusCard':
            return <ApplicationStatusCard props={fragment.props} onAction={onAction} />;
        case 'MessageThreadPreview':
            return <MessageThreadPreview props={fragment.props} onAction={onAction} />;
        case 'JobCard':
            return <JobCard props={fragment.props} onAction={onAction} />;
        case 'FinancialSummaryChart':
            return <FinancialSummaryChart props={fragment.props} onAction={onAction} />;
        case 'VerificationStatusCard':
            return <VerificationStatusCard props={fragment.props} onAction={onAction} />;
        case 'BankAccountCard':
            return <BankAccountCard props={fragment.props} onAction={onAction} />;
        case 'NotificationList':
            return <NotificationList props={fragment.props} onAction={onAction} />;
        case 'QuickActionGroup':
            return <QuickActionGroup props={fragment.props} onAction={onAction} />;
        case 'Form':
            return <Form props={fragment.props} onAction={onAction} />;
        case 'ConfirmationCard':
            return <ConfirmationCard props={fragment.props} onAction={onAction} />;
        case 'ErrorCard':
            return <ErrorCard props={fragment.props} onAction={onAction} />;
        default: {
            // Exhaustive-check guard: if a new fragment type is added to the
            // contract but not handled here, TypeScript flags this branch.
            const _exhaustive: never = fragment;
            console.debug('[chat] unhandled fragment', _exhaustive);
            return null;
        }
    }
}
