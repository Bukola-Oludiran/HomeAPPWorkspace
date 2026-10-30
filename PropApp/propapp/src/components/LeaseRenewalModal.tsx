import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalPortal from './ModalPortal';
import SignLeaseRenewalModal from './SignLeaseRenewalModal';
import RejectOfferModal from './RejectOfferModal';
import DocumentViewerModal from './DocumentViewerModal';
import { formatCurrency } from '@/lib/format';

interface LeaseRenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaseId?: string;
    property?: {
        address: string;
        unit: string;
    };
    offer?: {
        currentRent: number;
        newRent: number;
        duration: string;
        startDate: string;
        endDate: string;
        expiresIn: number;
        expiresDate: string;
    };
}

export default function LeaseRenewalModal({
    isOpen,
    onClose,
    leaseId,
    property = { address: '1243 Oakwood Avenue', unit: 'Unit 4B' },
    offer = {
        currentRent: 2400,
        newRent: 2550,
        duration: '12 Months',
        startDate: 'Sep 1, 2024',
        endDate: 'Aug 31, 2025',
        expiresIn: 5,
        expiresDate: 'October 15, 2023',
    }
}: LeaseRenewalModalProps) {
    const [showSignModal, setShowSignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    if (!isOpen) return null;

    const rentIncrease = ((offer.newRent - offer.currentRent) / offer.currentRent * 100).toFixed(2);

    const handleAccept = () => {
        // Open the sign modal instead of processing directly
        setShowSignModal(true);
    };

    const handleSignComplete = () => {
        setShowSignModal(false);
        onClose();
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Respond to renewal offer</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{property.address} • Lease Renewal</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 md:p-8 space-y-8">
                        {/* Expiration Warning */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4 items-start">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-500 shrink-0">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Offer Expires in {offer.expiresIn} Days</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                    This offer is valid until <span className="font-bold">{offer.expiresDate}</span>. After this date, terms may be subject to change or the property may be listed.
                                </p>
                            </div>
                        </div>

                        {/* Offer Summary Cards */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Offer summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* New Rent */}
                                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-4xl">payments</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">New monthly rent</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(offer.newRent)}</span>
                                        <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                                            <span className="material-symbols-outlined text-[12px] mr-0.5">arrow_upward</span> +{rentIncrease}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Current: ${offer.currentRent.toLocaleString()}/mo</p>
                                </div>

                                {/* Lease Duration */}
                                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Lease duration</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{offer.duration}</span>
                                        <span className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Same</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">End Date: {offer.endDate}</p>
                                </div>

                                {/* New Start Date */}
                                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">New start date</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{offer.startDate.split(',')[0]}</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{offer.startDate.split(',')[1]?.trim() || '2024'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Seamless continuation</p>
                                </div>
                            </div>
                        </div>

                        {/* Changes & Document */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Changes & Additional Terms */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Changes & additional terms</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-brand-ink shrink-0">info</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pet policy update</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                                                Pet rent has been adjusted to standard 2024 rates ($50/pet/month). No changes to deposit.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 shrink-0">check_circle</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Standard clauses</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                                                All other terms and conditions remain consistent with your original lease agreement.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Official Document */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Official document</h3>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Lease_Renewal_2024.pdf</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">14 Pages • 2.4 MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDocumentModal(true)}
                                        className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        View full document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">help</span>
                            Need help?
                        </button>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <Link
                                to="/tenant/messages"
                                onClick={onClose}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                            >
                                Contact landlord
                            </Link>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Reject offer
                            </button>
                            <button
                                onClick={handleAccept}
                                className="w-full sm:w-auto px-6 py-2.5 bg-brand-ink hover:bg-[#0e64bd] text-on-brand font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <span className="material-symbols-outlined text-[18px]">ink_pen</span>
                                Accept & sign
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sign Modal */}
                <SignLeaseRenewalModal
                    isOpen={showSignModal}
                    onClose={() => setShowSignModal(false)}
                    onSign={handleSignComplete}
                    leaseId={leaseId}
                />

                {/* Reject Modal */}
                <RejectOfferModal
                    isOpen={showRejectModal}
                    onClose={() => setShowRejectModal(false)}
                    leaseId={leaseId}
                    onConfirm={onClose}
                    property={property}
                />

                {/* Document Viewer Modal */}
                <DocumentViewerModal
                    isOpen={showDocumentModal}
                    onClose={() => setShowDocumentModal(false)}
                    document={{
                        title: 'Lease_Renewal_2024.pdf',
                        type: 'pdf',
                        property: `${property.address}, ${property.unit}`,
                        modifiedTime: 'Just now',
                        status: 'Review required',
                        totalPages: 14,
                    }}
                />
            </div>
        </ModalPortal>
    );
}
