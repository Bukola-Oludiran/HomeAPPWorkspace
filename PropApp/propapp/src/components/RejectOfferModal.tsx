import { useState } from 'react';
import ModalPortal from './ModalPortal';
import { leaseService } from '../lib/api/services/leaseService';

interface RejectOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    leaseId?: string;
    property?: {
        address: string;
        unit: string;
    };
}

export default function RejectOfferModal({
    isOpen,
    onClose,
    onConfirm,
    leaseId,
    property = { address: '1243 Oakwood Avenue', unit: 'Unit 4B' },
}: RejectOfferModalProps) {
    const [reason, setReason] = useState('');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rejectionReasons = [
        { id: 'rent_high', label: 'Rent increase is too high', icon: 'trending_up' },
        { id: 'moving', label: 'Planning to relocate', icon: 'flight' },
        { id: 'term_length', label: 'Lease term doesn\'t work for me', icon: 'event' },
        { id: 'other', label: 'Other reason', icon: 'edit_note' },
    ];

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            let targetLeaseId = leaseId;
            if (!targetLeaseId) {
                const leases = await leaseService.getLeases({ status: 'ACTIVE', limit: 1 });
                targetLeaseId = leases.data?.[0]?.id;
            }
            if (!targetLeaseId) throw new Error('No active renewal offer is available.');
            const selectedLabel = rejectionReasons.find(item => item.id === selectedReason)?.label;
            await leaseService.respondToRenewal(targetLeaseId, { accept: false, message: reason || selectedLabel });
            onConfirm?.();
            onClose();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to decline the renewal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 font-[Manrope,Noto_Sans,sans-serif]">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Modal */}
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                <span className="material-symbols-outlined">close</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Decline Renewal Offer</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{property.address}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                        {/* Warning */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 shrink-0">warning</span>
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Are you sure?</h4>
                                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                    Once you decline, you may not be able to renew at the same terms. The property may be listed for new tenants.
                                </p>
                            </div>
                        </div>

                        {/* Reason Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Please tell us why (optional)
                            </label>
                            <div className="space-y-2">
                                {rejectionReasons.map((reasonOption) => (
                                    <button
                                        key={reasonOption.id}
                                        onClick={() => setSelectedReason(reasonOption.id)}
                                        className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedReason === reasonOption.id
                                            ? 'border-[#137fec] bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined ${selectedReason === reasonOption.id
                                            ? 'text-[#137fec]'
                                            : 'text-slate-400'
                                            }`}>
                                            {reasonOption.icon}
                                        </span>
                                        <span className={`font-medium text-sm ${selectedReason === reasonOption.id
                                            ? 'text-[#137fec]'
                                            : 'text-slate-700 dark:text-slate-200'
                                            }`}>
                                            {reasonOption.label}
                                        </span>
                                        {selectedReason === reasonOption.id && (
                                            <span className="material-symbols-outlined text-[#137fec] ml-auto">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Comments */}
                        {selectedReason === 'other' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Additional Comments
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] focus:border-transparent outline-none transition-all placeholder-slate-400 resize-none"
                                    placeholder="Please share your feedback..."
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Confirm Decline
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
