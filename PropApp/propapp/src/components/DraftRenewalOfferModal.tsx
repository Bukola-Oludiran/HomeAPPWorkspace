import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface DraftRenewalOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyAddress?: string;
    leaseId?: string;
    currentRent?: string;
    expiryDate?: string;
    onSubmit?: () => void;
}

export default function DraftRenewalOfferModal({
    isOpen,
    onClose,
    propertyAddress = "1243 Oakwood Avenue",
    leaseId = "#L-2023-8492",
    currentRent = "₦7,200,000",
    expiryDate = "Nov 30, 2024",
    onSubmit
}: DraftRenewalOfferModalProps) {
    const [newRent, setNewRent] = useState('5,050');
    const [startDate, setStartDate] = useState('2024-12-01');
    const [duration, setDuration] = useState('12');
    const [additionalTerms, setAdditionalTerms] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit?.();
        onClose();
    };

    return (
        <ModalPortal>
            <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-[200]" role="dialog">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="fixed inset-0 z-[200] w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform rounded-2xl bg-white dark:bg-[#151f2b] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                                <div>
                                    <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white" id="modal-title">Draft renewal offer</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">For Lease {leaseId} <span className="mx-1.5 text-slate-300 dark:text-slate-600">•</span> {propertyAddress}</p>
                                </div>
                                <button
                                    className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none"
                                    type="button"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="px-6 py-6 space-y-6">
                                {/* Current Lease Info */}
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-brand-ink">
                                            <span className="material-symbols-outlined text-[18px]">history</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current rent</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{currentRent}/mo</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Expires</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{expiryDate}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                            Market +4.5%
                                        </span>
                                    </div>
                                </div>

                                {/* New Rent and Start Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white" htmlFor="rent">
                                            New monthly rent
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">₦</span>
                                            </div>
                                            <input
                                                className="block w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-3 pl-8 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm sm:leading-6 font-semibold shadow-sm"
                                                id="rent"
                                                name="rent"
                                                placeholder="0.00"
                                                type="text"
                                                value={newRent}
                                                onChange={(e) => setNewRent(e.target.value)}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">USD</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="material-symbols-outlined text-[16px] text-brand-ink">forum</span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">AI suggested based on local comps</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white" htmlFor="date">
                                            New lease start date
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="block w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-3 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm sm:leading-6 shadow-sm font-medium"
                                                id="date"
                                                name="date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Duration */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-900 dark:text-white">New lease duration</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label className={`cursor-pointer group relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${duration === '12' ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <input className="sr-only" name="duration" type="radio" value="12" checked={duration === '12'} onChange={() => setDuration('12')} />
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <span className={`font-bold text-sm ${duration === '12' ? 'text-brand-ink' : 'text-slate-700 dark:text-slate-200'}`}>12 Months</span>
                                                <span className={`size-4 rounded-full border ${duration === '12' ? 'border-[5px] border-brand bg-white dark:bg-slate-900' : 'border border-slate-300 dark:border-slate-600 bg-transparent'}`}></span>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard term</span>
                                        </label>
                                        <label className={`cursor-pointer group relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${duration === '6' ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <input className="sr-only" name="duration" type="radio" value="6" checked={duration === '6'} onChange={() => setDuration('6')} />
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <span className={`font-bold text-sm ${duration === '6' ? 'text-brand-ink' : 'text-slate-700 dark:text-slate-200'}`}>6 Months</span>
                                                <span className={`size-4 rounded-full border ${duration === '6' ? 'border-[5px] border-brand bg-white dark:bg-slate-900' : 'border border-slate-300 dark:border-slate-600 bg-transparent'}`}></span>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Short term</span>
                                        </label>
                                        <label className={`cursor-pointer group relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${duration === 'mtm' ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <input className="sr-only" name="duration" type="radio" value="mtm" checked={duration === 'mtm'} onChange={() => setDuration('mtm')} />
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <span className={`font-bold text-sm ${duration === 'mtm' ? 'text-brand-ink' : 'text-slate-700 dark:text-slate-200'}`}>Month-to-Month</span>
                                                <span className={`size-4 rounded-full border ${duration === 'mtm' ? 'border-[5px] border-brand bg-white dark:bg-slate-900' : 'border border-slate-300 dark:border-slate-600 bg-transparent'}`}></span>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flexible</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Additional Terms */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white" htmlFor="terms">Additional Terms / Changes <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">(Optional)</span></label>
                                        <button className="text-xs font-semibold text-brand-ink hover:text-[#0e64bd] flex items-center gap-1 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">magic_button</span>
                                            AI Enhancement
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            className="block w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-3 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm shadow-sm resize-none"
                                            id="terms"
                                            name="terms"
                                            placeholder="e.g. Pet policy update: No pets over 50lbs..."
                                            rows={3}
                                            value={additionalTerms}
                                            onChange={(e) => setAdditionalTerms(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 rounded-b-2xl">
                                <button className="group flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-ink dark:hover:text-brand-ink transition-colors" type="button">
                                    <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-slate-400 group-hover:text-brand-ink transition-colors">visibility</span>
                                    Preview document
                                </button>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-700 transition-colors text-sm"
                                        type="button"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-ink hover:bg-[#0e64bd] text-on-brand font-bold transition-all text-sm flex items-center justify-center gap-2 transform active:scale-95"
                                        type="button"
                                        onClick={handleSubmit}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Send offer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
