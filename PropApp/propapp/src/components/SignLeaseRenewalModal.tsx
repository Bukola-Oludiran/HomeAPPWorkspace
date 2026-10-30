import { useState } from 'react';
import ModalPortal from './ModalPortal';
import { leaseService } from '../lib/api/services/leaseService';
import { DEFAULT_CURRENCY, formatCurrency } from '@/lib/format';

interface SignLeaseRenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSign?: () => void;
    leaseId?: string;
    property?: {
        address: string;
        unit: string;
    };
    leaseDetails?: {
        landlord: string;
        tenant: string;
        newRent: number;
        rentIncrease: string;
        startDate: string;
        endDate: string;
        duration: string;
    };
}

export default function SignLeaseRenewalModal({
    isOpen,
    onClose,
    onSign,
    leaseId,
    property = { address: '1243 Oakwood Avenue', unit: 'Unit 4B' },
    leaseDetails = {
        landlord: 'LuxRealty Management',
        tenant: 'Alex Morgan',
        newRent: 2550,
        rentIncrease: '6.25%',
        startDate: 'September 1, 2024',
        endDate: 'August 31, 2025',
        duration: '12 Months',
    },
}: SignLeaseRenewalModalProps) {
    const [signatureType, setSignatureType] = useState<'type' | 'draw' | 'mobile'>('type');
    const [fullName, setFullName] = useState(leaseDetails.tenant);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSign = async () => {
        if (!agreedToTerms || !fullName.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            let targetLeaseId = leaseId;
            if (!targetLeaseId) {
                const leases = await leaseService.getLeases({ status: 'ACTIVE', limit: 1 });
                targetLeaseId = leases.data?.[0]?.id;
            }
            if (!targetLeaseId) throw new Error('No active lease is available to sign.');
            await leaseService.respondToRenewal(targetLeaseId, { accept: true });
            await leaseService.signLease(targetLeaseId, { signature: fullName, signedAt: new Date().toISOString() });
            onSign?.();
            onClose();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to sign the renewal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Modal */}
                <div className="relative w-full max-w-6xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                    {error && <p role="alert" className="mx-6 mt-4 text-sm text-red-600">{error}</p>}
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 z-20">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ink_pen</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign lease renewal</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Step 2 of 2 • {property.address}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* PDF Preview Side */}
                        <div className="w-full md:w-3/5 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                            <div className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                    Lease_Renewal_2024.pdf
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Page 1 of 14</span>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">remove</span>
                                        </button>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100 dark:bg-[#0b1116]">
                                <div className="w-full max-w-[600px] bg-white text-slate-900 shadow-xl min-h-[800px] p-12 text-xs sm:text-xs leading-relaxed select-none relative">
                                    <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                                        <div>
                                            <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">RESIDENTIAL LEASE RENEWAL</h1>
                                            <p className="uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Agreement extension</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">Date: Oct 10, 2023</p>
                                            <p>Ref: LRA-2024-8821</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 font-serif text-justify text-slate-700">
                                        <p>
                                            <span className="font-bold text-slate-900">1. PARTIES.</span> This Lease Renewal Agreement ("Agreement") is made effective as of October 10, 2023, by and between{' '}
                                            <span className="font-bold underline">{leaseDetails.landlord}</span> ("Landlord") and{' '}
                                            <span className="font-bold underline">{leaseDetails.tenant}</span> ("Tenant").
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-900">2. PREMISES.</span> The Landlord and Tenant agree to renew the lease for the property located at{' '}
                                            <span className="font-bold underline">{property.address}, {property.unit}, Austin, TX 78704</span>.
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-900">3. TERM.</span> The Lease term shall be extended for a period of{' '}
                                            <span className="font-bold">{leaseDetails.duration}</span>, commencing on{' '}
                                            <span className="font-bold">{leaseDetails.startDate}</span> and ending on{' '}
                                            <span className="font-bold">{leaseDetails.endDate}</span>.
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-900">4. RENT.</span> Tenant agrees to pay Landlord a monthly rent of{' '}
                                            <span className="font-bold">{formatCurrency(leaseDetails.newRent, DEFAULT_CURRENCY, 2)}</span>, representing a {leaseDetails.rentIncrease} increase from the previous term. Rent is due on the 1st day of each month.
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-900">5. PET POLICY.</span> The parties acknowledge the adjustment to the pet rent policy. Tenant agrees to pay an additional $50.00 per month per pet. All other rules regarding pets in the original lease remain in effect.
                                        </p>
                                        <p>
                                            <span className="font-bold text-slate-900">6. CONTINUATION.</span> Except as modified by this Agreement, the Landlord and Tenant agree that all other terms and conditions of the original Lease Agreement dated September 1, 2023, shall remain in full force and effect.
                                        </p>
                                        <div className="my-8 h-px bg-slate-200"></div>
                                        <p className="text-slate-500 dark:text-slate-400 italic">... [Document continues for 13 more pages] ...</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-45">
                                        <span className="text-[120px] font-black uppercase">Official copy</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
                                <button className="text-brand-ink hover:text-[#0e64bd] text-sm font-bold flex items-center justify-center gap-2 mx-auto">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download Full PDF
                                </button>
                            </div>
                        </div>

                        {/* Signature Side */}
                        <div className="w-full md:w-2/5 flex flex-col bg-white dark:bg-slate-950 overflow-y-auto relative">
                            <div className="p-6 md:p-8 space-y-8 flex-1">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create your signature</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Please sign below to accept the renewal offer. This signature will be legally binding.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Signature Type Tabs */}
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                        {(['type', 'draw', 'mobile'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSignatureType(type)}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${signatureType === type
                                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Full Name Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full legal name</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-slate-400"
                                            placeholder="e.g. Alex Morgan"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    {/* Signature Preview */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Signature preview</label>
                                        <div className="h-32 bg-yellow-50 dark:bg-yellow-900/10 border-2 border-dashed border-yellow-200 dark:border-yellow-900/40 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                            <p
                                                className="text-5xl text-slate-800 dark:text-slate-200 relative z-10 transform -rotate-2"
                                                style={{ fontFamily: "'Dancing Script', cursive" }}
                                            >
                                                {fullName || 'Your Name'}
                                            </p>
                                            <div className="absolute bottom-2 right-3 text-xs text-yellow-700 dark:text-yellow-600 font-mono opacity-60">
                                                ID: 8821-secure
                                            </div>
                                            <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/50 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <span className="material-symbols-outlined text-[16px]">refresh</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                            By typing your name, you are creating an electronic signature.
                                        </p>
                                    </div>
                                </div>

                                {/* Terms Agreement */}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            />
                                            <div className="size-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-brand peer-checked:border-brand transition-all"></div>
                                            <span className="material-symbols-outlined text-white absolute inset-0 text-[16px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                                check
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-brand-ink transition-colors">
                                                I agree to the terms of this lease renewal offer.
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                By checking this box and providing my digital signature, I consent to be legally bound by this Agreement and the Electronic Signatures in Global and National Commerce Act.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                                <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <span className="material-symbols-outlined text-brand-ink text-[20px]">verified_user</span>
                                    <p className="text-xs text-blue-800 dark:text-blue-200">Your signature is secured with 256-bit encryption.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Go back
                                    </button>
                                    <button
                                        onClick={handleSign}
                                        disabled={!agreedToTerms || !fullName.trim() || isSubmitting}
                                        className="flex-[2] py-3 px-4 bg-brand-ink hover:bg-[#0e64bd] disabled:bg-slate-300 disabled:cursor-not-allowed text-on-brand rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                                Signing...
                                            </>
                                        ) : (
                                            <>
                                                <span>Digitally sign & accept</span>
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </>
                                        )}
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
