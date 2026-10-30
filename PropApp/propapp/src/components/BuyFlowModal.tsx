import { useState } from 'react';
import ModalPortal from './ModalPortal';
import { formatCurrency } from '@/lib/format';

interface BuyFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        name: string;
        address: string;
        image: string;
        listingPrice: number;
    };
}

interface BuyerInfo {
    fullName: string;
    email: string;
    phone: string;
    streetAddress: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
}

interface OfferDetails {
    offerAmount: string;
    expirationDate: string;
    expirationTime: string;
    contingencies: string[];
}

export default function BuyFlowModal({ isOpen, onClose, property }: BuyFlowModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [offerDetails, setOfferDetails] = useState<OfferDetails>({
        offerAmount: property.listingPrice.toLocaleString(),
        expirationDate: '',
        expirationTime: '',
        contingencies: ['financing', 'inspection'],
    });
    const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '(512) 555-0123',
        streetAddress: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    if (!isOpen) return null;

    const earnestMoney = Math.round(parseFloat(offerDetails.offerAmount.replace(/,/g, '')) * 0.01);

    const contingencyOptions = [
        { id: 'financing', label: 'Financing', description: 'Offer depends on securing a loan' },
        { id: 'inspection', label: 'Inspection', description: 'Pending home inspection results' },
        { id: 'appraisal', label: 'Appraisal gap', description: 'You cover difference if appraisal is low' },
        { id: 'homeSale', label: 'Home sale', description: 'Contingent on selling current home' },
    ];

    const toggleContingency = (id: string) => {
        setOfferDetails((prev) => ({
            ...prev,
            contingencies: prev.contingencies.includes(id)
                ? prev.contingencies.filter((c) => c !== id)
                : [...prev.contingencies, id],
        }));
    };

    const renderStepIndicator = () => (
        <div className="flex items-center w-full max-w-3xl mx-auto px-4">
            {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step
                                ? 'bg-green-500 text-white shadow-sm'
                                : currentStep === step
                                    ? 'bg-brand-ink text-on-brand ring-4 ring-white dark:ring-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-2 border-white dark:border-slate-900'
                                }`}
                        >
                            {currentStep > step ? (
                                <span className="material-symbols-outlined text-base">check</span>
                            ) : (
                                step
                            )}
                        </div>
                        <span
                            className={`absolute top-10 text-xs font-bold whitespace-nowrap ${currentStep > step
                                ? 'text-green-600 dark:text-green-500'
                                : currentStep === step
                                    ? 'text-brand-ink'
                                    : 'text-slate-500 dark:text-slate-500'
                                }`}
                        >
                            {step === 1 ? 'Offer details' : step === 2 ? 'Your info' : 'Review'}
                        </span>
                    </div>
                    {index < 2 && (
                        <div
                            className={`flex-1 h-1 mx-2 rounded-full overflow-hidden ${currentStep > step ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="flex-1 space-y-6">
            {/* Offer Amount */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white">Proposed offer amount</label>
                    <span className="text-xs font-medium bg-blue-50 text-brand-ink px-2.5 py-1 rounded-md dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                        Listing Price: ${property.listingPrice.toLocaleString()}
                    </span>
                </div>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg font-bold">₦</span>
                    <input
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-slate-300"
                        type="text"
                        value={offerDetails.offerAmount}
                        onChange={(e) => setOfferDetails({ ...offerDetails, offerAmount: e.target.value })}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    Market Insight: Most offers in this neighborhood are 2-3% above listing.
                </p>
            </div>

            {/* Terms & Contingencies */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">gavel</span>
                    Terms & contingencies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Offer expiration date</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none"
                            type="date"
                            value={offerDetails.expirationDate}
                            onChange={(e) => setOfferDetails({ ...offerDetails, expirationDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Time</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none"
                            type="time"
                            value={offerDetails.expirationTime}
                            onChange={(e) => setOfferDetails({ ...offerDetails, expirationTime: e.target.value })}
                        />
                    </div>
                </div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Select contingencies</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contingencyOptions.map((option) => (
                        <label
                            key={option.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${offerDetails.contingencies.includes(option.id)
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                : 'border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={offerDetails.contingencies.includes(option.id)}
                                onChange={() => toggleContingency(option.id)}
                                className="mt-1 w-4 h-4 text-brand-ink rounded border-gray-300 focus:ring-brand"
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-ink transition-colors">{option.label}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Upload Proof of Funds */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-lg">upload_file</span>
                        Proof of Funds / Pre-Approval
                    </h3>
                    <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded font-bold">REQUIRED</span>
                </div>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group hover:border-brand/50">
                    <div className="size-12 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <span className="material-symbols-outlined text-brand-ink text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-brand-ink transition-colors">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, JPG or PNG (max. 10MB)</p>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex-1 space-y-6">
            {/* Offer Summary */}
            <div className="bg-blue-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="size-10 shrink-0 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-brand-ink border border-slate-100 dark:border-slate-600">
                        <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Offer summary</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-900 dark:text-white">
                            <span>₦{offerDetails.offerAmount}</span>
                            <span className="text-slate-300">•</span>
                            <span>{offerDetails.contingencies.map((c) => contingencyOptions.find((opt) => opt.id === c)?.label).join(', ')}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setCurrentStep(1)} className="text-brand-ink text-sm font-bold hover:underline whitespace-nowrap px-2">Edit details</button>
            </div>

            {/* Buyer Contact Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">person</span>
                        Buyer contact information
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-brand-ink dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Account linked</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 rounded-lg p-4 mb-6 flex gap-3">
                    <span className="material-symbols-outlined text-brand-ink text-sm mt-0.5 shrink-0">info</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        The fields below are automatically populated from your verified account profile. To ensure security, they cannot be edited here.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Full legal name</label>
                        <div className="relative">
                            <input className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed outline-none font-medium" readOnly value={buyerInfo.fullName} />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center"><span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">lock</span></span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Email address</label>
                        <div className="relative">
                            <input className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed outline-none font-medium" readOnly value={buyerInfo.email} />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center"><span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">lock</span></span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Phone number</label>
                        <div className="relative">
                            <input className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed outline-none font-medium" readOnly value={buyerInfo.phone} />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center"><span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">lock</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Address */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">home</span>
                    Current residential address
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Street address</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none placeholder-slate-400"
                            placeholder="e.g. 123 Main St"
                            value={buyerInfo.streetAddress}
                            onChange={(e) => setBuyerInfo({ ...buyerInfo, streetAddress: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Apartment, suite, etc. (optional)</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none placeholder-slate-400"
                            placeholder="e.g. Apt 4B"
                            value={buyerInfo.apartment}
                            onChange={(e) => setBuyerInfo({ ...buyerInfo, apartment: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">City</label>
                            <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none placeholder-slate-400" placeholder="City" value={buyerInfo.city} onChange={(e) => setBuyerInfo({ ...buyerInfo, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">State</label>
                            <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none placeholder-slate-400" placeholder="State" value={buyerInfo.state} onChange={(e) => setBuyerInfo({ ...buyerInfo, state: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Zip code</label>
                            <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand outline-none placeholder-slate-400" placeholder="Zip" value={buyerInfo.zipCode} onChange={(e) => setBuyerInfo({ ...buyerInfo, zipCode: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex-1 space-y-6">
            {/* Offer Details Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">description</span>
                        Offer details summary
                    </h3>
                    <button onClick={() => setCurrentStep(1)} className="text-brand-ink text-sm font-bold hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Offer price</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">₦{offerDetails.offerAmount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Earnest money</p>
                        <p className="text-base font-medium text-slate-900 dark:text-white">{formatCurrency(earnestMoney)} <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">(1%)</span></p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Selected contingencies</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {offerDetails.contingencies.map((c) => (
                                <span key={c} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium border border-blue-100 dark:border-blue-800">
                                    {contingencyOptions.find((opt) => opt.id === c)?.label}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Expiration date</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{offerDetails.expirationDate || 'Not set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Proposed closing</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">30 Days</p>
                    </div>
                </div>
            </div>

            {/* Buyer Info Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">person</span>
                        Buyer contact information
                    </h3>
                    <button onClick={() => setCurrentStep(2)} className="text-brand-ink text-sm font-bold hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Full legal name</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{buyerInfo.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Email address</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{buyerInfo.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Phone number</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{buyerInfo.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Current residential address</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {buyerInfo.streetAddress ? `${buyerInfo.streetAddress}${buyerInfo.apartment ? `, ${buyerInfo.apartment}` : ''}, ${buyerInfo.city}, ${buyerInfo.state} ${buyerInfo.zipCode}` : 'Not provided'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-blue-50/50 dark:bg-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Terms & conditions</h3>
                <label className="flex gap-3 items-start cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-brand-ink focus:ring-brand focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed select-none group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        By submitting this offer, I agree to the platform's <a className="text-brand-ink font-bold hover:underline" href="#">Terms and conditions</a> and understand that this is a <span className="font-bold">legally binding offer</span>. I acknowledge that if accepted, I am obligated to proceed with the purchase according to these terms.
                    </span>
                </label>
            </div>
        </div>
    );

    const renderPropertySidebar = () => (
        <div className="lg:w-[340px] shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden sticky top-0">
                <div className="h-32 bg-slate-200 relative">
                    <img alt="Property Thumbnail" className="w-full h-full object-cover" src={property.image} />
                    <div className="absolute inset-0 bg-black/10"></div>
                    <span className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 px-2 py-0.5 text-xs font-bold rounded text-slate-900 dark:text-white uppercase tracking-wide">For sale</span>
                </div>
                <div className="p-5">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{property.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {property.address}
                    </p>
                    <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Listing price</span>
                            <span className="font-medium text-slate-900 dark:text-white line-through decoration-slate-400 decoration-2">{formatCurrency(property.listingPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-brand-ink font-bold">Your offer</span>
                            <span className="font-bold text-lg text-brand-ink bg-blue-50 dark:bg-blue-900/30 px-2 rounded">₦{offerDetails.offerAmount}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <span>Est. Earnest Money (1%)</span>
                            <span>{formatCurrency(earnestMoney)}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg flex gap-3 mt-2 border border-slate-100 dark:border-slate-700">
                        <span className="material-symbols-outlined text-green-500 text-xl shrink-0 icon-filled">verified_user</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Your offer is secure. We verify your funds instantly via Plaid integration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const aiTips = [
        { step: 1, tip: 'Tip: Sellers often prefer a shorter inspection period (5-7 days).', icon: 'lightbulb' },
        { step: 2, tip: 'Privacy Tip: Your contact info is kept private until you choose to reveal it.', icon: 'lock' },
        { step: 3, tip: 'AI Assistant: I can explain any legal terms or next steps.', icon: 'forum' },
    ];

    const currentTip = aiTips.find((t) => t.step === currentStep);

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-brand-ink text-xl">real_estate_agent</span>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                        {currentStep === 3 ? 'Review & Submit Offer' : 'Make an Offer to Buy'}
                                    </h2>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Proceed for <span className="font-semibold text-slate-800 dark:text-slate-200">{property.address}</span>
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-500 dark:text-slate-400 hover:text-slate-500 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {renderStepIndicator()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {renderPropertySidebar()}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:px-8 flex items-center justify-between z-10 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            {currentStep > 1 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (currentStep < 3) {
                                        setCurrentStep(currentStep + 1);
                                    } else {
                                        // Submit offer logic
                                        onClose();
                                    }
                                }}
                                disabled={currentStep === 3 && !agreedToTerms}
                                className="px-8 py-2.5 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {currentStep === 3 ? 'Submit offer' : 'Next step'}
                                {currentStep < 3 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                            </button>
                        </div>
                    </div>

                    {/* Floating AI Tip */}
                    {currentTip && (
                        <div className="absolute bottom-24 left-0 right-0 flex justify-center z-[70] pointer-events-none px-4">
                            <div className="w-full max-w-xl bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-xl border border-brand/20 shadow-lg rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                                <div className="size-10 rounded-full bg-brand flex items-center justify-center shrink-0 shadow-lg">
                                    <span className="material-symbols-outlined text-white">{currentTip.icon}</span>
                                </div>
                                <div className="flex-1 overflow-hidden h-10 flex items-center">
                                    <p className="text-slate-700 dark:text-slate-200 text-sm truncate font-medium">
                                        <span className="text-brand-ink font-bold">{currentTip.tip.split(':')[0]}:</span>{currentTip.tip.split(':').slice(1).join(':')}
                                    </p>
                                </div>
                                <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}
