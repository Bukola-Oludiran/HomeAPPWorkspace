import { useState, useEffect } from 'react';
import { verificationService } from '../../../lib/api/services/verificationService';
import { landlordService } from '../../../lib/api/services/landlordService';
import ContourMotif, { type ContourFragment } from '../../../components/common/ContourMotif';

const CONTOUR: ContourFragment[] = [
    'top-[88%] left-[28%] -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[820px] rotate-180',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

interface VerificationStep {
    id: number;
    title: string;
    level: string;
    status: string;
    description: string;
    icon: string;
}

interface PropertyOption {
    id: string;
    name: string;
    address: string;
}

export default function LandlordVerificationHub() {
    const [properties, setProperties] = useState<PropertyOption[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<PropertyOption>({ id: '', name: '', address: '' });
    const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
    const [currentTier, setCurrentTier] = useState<string>('BRONZE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch landlord's properties and verification status in parallel
                const [propsRes, verStatusRes] = await Promise.all([
                    landlordService.getProperties({ limit: 50 }),
                    verificationService.getVerificationStatus(),
                ]);

                // Map properties (backend returns flat address fields)
                const propsList: PropertyOption[] = (propsRes.data || []).map((p) => {
                    const extra = p as unknown as Record<string, unknown>;
                    const neighborhood = (extra.addressNeighborhood as string) || '';
                    const city = (extra.addressCity as string) || '';
                    const state = (extra.addressState as string) || '';
                    return {
                        id: p.id,
                        name: p.name,
                        address: [neighborhood, city, state].filter(Boolean).join(', ') || '',
                    };
                });

                if (propsList.length > 0) {
                    setProperties(propsList);
                    setSelectedProperty(propsList[0]);
                }

                // Build verification steps from API status
                const vs = verStatusRes.data;
                const steps: VerificationStep[] = [
                    {
                        id: 1,
                        title: 'Identity verification',
                        level: 'Account Level',
                        status: vs.identityVerified ? 'completed' : 'pending',
                        description: vs.identityVerified ? 'Identity verified' : 'Please complete identity verification',
                        icon: 'verified_user',
                    },
                    {
                        id: 2,
                        title: 'Landlord address proof',
                        level: 'Account Level',
                        status: vs.addressVerified ? 'completed' : (vs.identityVerified ? 'pending' : 'locked'),
                        description: vs.addressVerified ? 'Address verified' : 'Upload a utility bill or official document',
                        icon: 'home',
                    },
                    {
                        id: 3,
                        title: 'Certificate of Occupancy (C of O)',
                        level: 'Property Level',
                        status: vs.addressVerified ? 'pending' : 'locked',
                        description: vs.addressVerified
                            ? 'Please upload the Certificate of Occupancy for this specific property listing. This document must be less than 5 years old.'
                            : 'Unlocks after address verification',
                        icon: 'description',
                    },
                    {
                        id: 4,
                        title: 'Physical property audit',
                        level: 'Property Level',
                        status: 'locked',
                        description: 'Unlocks after C of O verification is approved for this unit',
                        icon: 'search',
                    },
                ];

                // Try to get property-specific verification if properties exist
                if (propsList.length > 0) {
                    try {
                        const propVerRes = await verificationService.getPropertyVerificationStatus(propsList[0].id);
                        const propVer = propVerRes.data;
                        if (propVer) {
                            if (propVer.tier) setCurrentTier(propVer.tier);
                            const cofo = propVer.verifications?.find(v => v.type === 'COFO');
                            if (cofo?.status === 'APPROVED') {
                                steps[2].status = 'completed';
                                steps[2].description = 'Certificate of Occupancy verified';
                                steps[3].status = 'pending';
                                steps[3].description = 'Request a physical property audit to unlock higher tiers';
                            } else if (cofo?.status === 'PENDING') {
                                steps[2].status = 'pending';
                                steps[2].description = 'Your Certificate of Occupancy is under review';
                            }
                            const audit = propVer.verifications?.find(v => v.type === 'AUDIT');
                            if (audit?.status === 'APPROVED') {
                                steps[3].status = 'completed';
                                steps[3].description = 'Physical property audit completed';
                            } else if (audit?.status === 'PENDING') {
                                steps[3].status = 'pending';
                                steps[3].description = 'Physical property audit is in progress';
                            }
                        }
                    } catch {
                        setCurrentTier('BRONZE');
                    }
                }

                setVerificationSteps(steps);
            } catch (err) {
                console.error('Failed to load verification data:', err);
                // Set default steps on error
                setVerificationSteps([
                    { id: 1, title: 'Identity verification', level: 'Account Level', status: 'pending', description: 'Please complete identity verification', icon: 'verified_user' },
                    { id: 2, title: 'Landlord address proof', level: 'Account Level', status: 'locked', description: 'Upload a utility bill or official document', icon: 'home' },
                    { id: 3, title: 'Certificate of Occupancy (C of O)', level: 'Property Level', status: 'locked', description: 'Unlocks after address verification', icon: 'description' },
                    { id: 4, title: 'Physical property audit', level: 'Property Level', status: 'locked', description: 'Unlocks after C of O verification', icon: 'search' },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Refetch property verification when selected property changes
    useEffect(() => {
        if (!selectedProperty.id) return;
        async function fetchPropertyVerification() {
            try {
                const propVerRes = await verificationService.getPropertyVerificationStatus(selectedProperty.id);
                const propVer = propVerRes.data;
                if (propVer?.tier) setCurrentTier(propVer.tier);
                const cofo = propVer?.verifications?.find(v => v.type === 'COFO');
                const audit = propVer?.verifications?.find(v => v.type === 'AUDIT');
                setVerificationSteps(prev => prev.map(step => {
                    if (step.id === 3) {
                        if (cofo?.status === 'APPROVED') {
                            return { ...step, status: 'completed', description: 'Certificate of Occupancy verified' };
                        } else if (cofo?.status === 'PENDING') {
                            return { ...step, status: 'pending', description: 'Your Certificate of Occupancy is under review' };
                        }
                        return { ...step, status: 'pending', description: 'Please upload the Certificate of Occupancy for this specific property listing.' };
                    }
                    if (step.id === 4) {
                        if (audit?.status === 'APPROVED') {
                            return { ...step, status: 'completed', description: 'Physical property audit completed' };
                        } else if (audit?.status === 'PENDING') {
                            return { ...step, status: 'pending', description: 'Physical property audit is in progress' };
                        }
                        const cofoApproved = cofo?.status === 'APPROVED';
                        return {
                            ...step,
                            status: cofoApproved ? 'pending' : 'locked',
                            description: cofoApproved ? 'Request a physical property audit' : 'Unlocks after C of O verification is approved',
                        };
                    }
                    return step;
                }));
            } catch {
                // No property verification found — reset property-level steps
                setCurrentTier('BRONZE');
                setVerificationSteps(prev => prev.map(step => {
                    if (step.id === 3) {
                        const addressDone = prev.find(s => s.id === 2)?.status === 'completed';
                        return { ...step, status: addressDone ? 'pending' : 'locked', description: addressDone ? 'Please upload the Certificate of Occupancy for this specific property listing.' : 'Unlocks after address verification' };
                    }
                    if (step.id === 4) {
                        return { ...step, status: 'locked', description: 'Unlocks after C of O verification is approved for this unit' };
                    }
                    return step;
                }));
            }
        }
        fetchPropertyVerification();
    }, [selectedProperty.id]);

    const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
    const totalSteps = verificationSteps.length || 4;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const;
    const tierIndex = tierOrder.indexOf(currentTier.toUpperCase() as typeof tierOrder[number]);
    const nextTier = tierIndex < tierOrder.length - 1 ? tierOrder[tierIndex + 1] : null;

    const tierConfig: Record<string, { label: string; icon: string; bgClass: string; iconBg: string; textColor: string; iconColor: string; checkColor: string }> = {
        BRONZE: { label: 'Bronze property', icon: 'workspace_premium', bgClass: 'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30', iconBg: 'bg-white dark:bg-orange-900/40 border-orange-100 dark:border-orange-800/50', textColor: 'text-orange-600 dark:text-orange-400', iconColor: 'text-orange-600 dark:text-orange-400', checkColor: 'text-orange-300 dark:text-orange-800' },
        SILVER: { label: 'Silver property', icon: 'military_tech', bgClass: 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700', iconBg: 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600', textColor: 'text-slate-500 dark:text-slate-400', iconColor: 'text-slate-500 dark:text-slate-400', checkColor: 'text-slate-300 dark:text-slate-600' },
        GOLD: { label: 'Gold property', icon: 'emoji_events', bgClass: 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30', iconBg: 'bg-white dark:bg-yellow-900/40 border-yellow-100 dark:border-yellow-800/50', textColor: 'text-yellow-600 dark:text-yellow-500', iconColor: 'text-yellow-600 dark:text-yellow-500', checkColor: 'text-yellow-300 dark:text-yellow-800' },
        PLATINUM: { label: 'Platinum property', icon: 'diamond', bgClass: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30', iconBg: 'bg-white dark:bg-indigo-900/40 border-indigo-100 dark:border-indigo-800/50', textColor: 'text-indigo-600 dark:text-indigo-400', iconColor: 'text-indigo-600 dark:text-indigo-400', checkColor: 'text-indigo-300 dark:text-indigo-800' },
    };
    const currentTierConfig = tierConfig[currentTier.toUpperCase()] || tierConfig.BRONZE;
    const nextTierConfig = nextTier ? tierConfig[nextTier] : null;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading verification data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 min-h-[calc(100vh-6rem)]">
            {/* Keystead contour map: the left column ends early, so a fragment fills the space below it */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 overflow-hidden">
                <ContourMotif fragments={CONTOUR} />
            </div>
            <div className="relative max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                Compliance
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Verification hub
                        </h1>
                        <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                            Manage compliance documents for your properties to unlock tiers.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            Help center
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Property Selector */}
                        <div className="bg-white dark:bg-canvas-dark rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-focus-within:text-brand-ink transition-colors">domain</span>
                                </div>
                                <select
                                    value={selectedProperty.id}
                                    onChange={(e) => setSelectedProperty(properties.find(p => p.id === e.target.value) || properties[0])}
                                    className="w-full appearance-none bg-transparent text-slate-900 dark:text-white py-3 pl-11 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-slate-50 dark:focus:bg-slate-800 font-bold text-sm cursor-pointer transition-colors"
                                >
                                    {properties.map((property) => (
                                        <option key={property.id} value={property.id}>{property.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white dark:bg-canvas-dark rounded-2xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Property status</h2>

                            {/* Progress Circle */}
                            <div className="relative size-48 mb-8">
                                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        className="dark:stroke-slate-800"
                                        cx="50"
                                        cy="50"
                                        fill="none"
                                        r="40"
                                        stroke="#f1f5f9"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        className="stroke-brand"
                                        cx="50"
                                        cy="50"
                                        fill="none"
                                        r="40"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                                        strokeLinecap="round"
                                        strokeWidth="8"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{progressPercent}%</span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Verified</span>
                                </div>
                            </div>

                            {/* Tier Status */}
                            <div className="w-full space-y-4">
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${currentTierConfig.bgClass}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${currentTierConfig.iconColor} border ${currentTierConfig.iconBg}`}>
                                            <span className="material-symbols-outlined text-[20px]">{currentTierConfig.icon}</span>
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs ${currentTierConfig.textColor} font-bold uppercase tracking-wider mb-0.5`}>Current tier</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{currentTierConfig.label}</p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined ${currentTierConfig.checkColor}`}>check_circle</span>
                                </div>
                                {nextTierConfig ? (
                                <div className="relative flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 transition-opacity cursor-help">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">{nextTierConfig.icon}</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Next tier</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{nextTierConfig.label}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">lock</span>
                                </div>
                                ) : (
                                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${currentTierConfig.bgClass}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${currentTierConfig.iconColor} border ${currentTierConfig.iconBg}`}>
                                            <span className="material-symbols-outlined text-[20px]">verified</span>
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs ${currentTierConfig.textColor} font-bold uppercase tracking-wider mb-0.5`}>Max tier</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">Fully verified</p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined ${currentTierConfig.checkColor}`}>check_circle</span>
                                </div>
                                )}
                            </div>
                        </div>

                        {/* AI Tip Card */}
                        <div className="bg-brand-ink rounded-2xl p-5 text-on-brand shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[18px]">forum</span>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">AI Assistant</span>
                                </div>
                                <p className="text-sm text-blue-100 leading-snug">Uploading the C of O for <strong>{selectedProperty.name || 'your property'}</strong>{' '}
                                    is the quickest route to a Gold badge.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Verification Steps */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verification steps</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Requirements for <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProperty.name}</span>.
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {completedSteps} / {totalSteps} Completed
                                </span>
                            </div>

                            {/* Steps List */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {verificationSteps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`p-5 transition-colors ${step.status === 'locked'
                                            ? 'bg-slate-50 dark:bg-[#0d141c] opacity-70 cursor-not-allowed'
                                            : step.status === 'pending'
                                                ? 'bg-pending-bg/50'
                                                : 'bg-white dark:bg-canvas-dark hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.status === 'completed'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : step.status === 'pending'
                                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 size-8 shadow-sm ring-4 ring-amber-50 dark:ring-amber-900/10'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    <span className={`material-symbols-outlined ${step.status === 'pending' ? 'text-[20px]' : 'text-[16px]'}`}>
                                                        {step.status === 'completed' ? 'check' : step.status === 'locked' ? 'lock' : 'schedule'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`font-bold text-sm ${step.status === 'locked' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {step.title}
                                                        </h4>
                                                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold rounded">
                                                            {step.level}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.description}</p>
                                                </div>
                                            </div>
                                            {step.status !== 'locked' && (
                                                <button className="text-slate-500 dark:text-slate-400 hover:text-slate-600">
                                                    <span className="material-symbols-outlined">expand_more</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload Section for Pending */}
                                        {step.status === 'pending' && (
                                            <div className="ml-0 sm:ml-12 mt-6">
                                                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-center hover:border-brand hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                                                    <div className="size-14 rounded-full bg-white dark:bg-slate-700 mx-auto flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-brand-ink group-hover:scale-110 transition-all duration-300 mb-4 border border-slate-100 dark:border-slate-600">
                                                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                                    </div>
                                                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">Click to upload C of O</h5>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                                        Ensure the address matches: <strong className="text-slate-700 dark:text-slate-300">{selectedProperty.address}</strong>
                                                    </p>
                                                    <button className="px-5 py-2.5 bg-brand-ink hover:bg-brand-ink/90 text-on-brand text-sm font-bold rounded-lg transition-all active:scale-95">
                                                        Select document
                                                    </button>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                                        <span>Documents are securely linked to this listing</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
