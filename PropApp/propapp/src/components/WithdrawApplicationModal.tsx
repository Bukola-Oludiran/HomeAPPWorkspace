import { useState } from 'react';
import ModalPortal from './ModalPortal';
import { tenantService } from '../lib/api/services/tenantService';

interface WithdrawApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    propertyName?: string;
    applicationId?: string;
}

export default function WithdrawApplicationModal({
    isOpen,
    onClose,
    onConfirm,
    propertyName = '1243 Oakwood Ave'
    , applicationId
}: WithdrawApplicationModalProps) {
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setError(null);
        try {
            if (!applicationId) throw new Error('Application details are unavailable.');
            await tenantService.withdrawApplication(applicationId);
            onConfirm?.();
            onClose();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to withdraw the application.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="p-6 text-center">
                        {/* Warning Icon */}
                        <div className="size-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Withdraw application?
                        </h3>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            Are you sure you want to withdraw your application for{' '}
                            <span className="font-bold text-slate-700 dark:text-slate-300">{propertyName}</span>?
                            This action is{' '}
                            <span className="font-bold text-slate-700 dark:text-slate-300">irreversible</span>{' '}
                            and will remove you from consideration for this property.
                        </p>

                        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
