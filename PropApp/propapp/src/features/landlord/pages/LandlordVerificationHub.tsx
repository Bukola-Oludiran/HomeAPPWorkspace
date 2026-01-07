import { useState } from 'react';

// Mock verification data
const verificationSteps = [
    {
        id: 1,
        title: 'Identity Verification',
        level: 'Account Level',
        status: 'completed',
        description: 'Confirmed via Government ID on Oct 12, 2023',
        icon: 'verified_user',
    },
    {
        id: 2,
        title: 'Landlord Address Proof',
        level: 'Account Level',
        status: 'completed',
        description: 'Utility bill verified on Oct 14, 2023',
        icon: 'home',
    },
    {
        id: 3,
        title: 'Certificate of Occupancy (C of O)',
        level: 'Property Level',
        status: 'pending',
        description: 'Please upload the Certificate of Occupancy for this specific property listing. This document must be less than 5 years old.',
        icon: 'description',
    },
    {
        id: 4,
        title: 'Physical Property Audit',
        level: 'Property Level',
        status: 'locked',
        description: 'Unlocks after C of O verification is approved for this unit',
        icon: 'search',
    },
];

const properties = [
    { id: 1, name: 'Highland Heights Apt 4B', address: '123 Highland Ave, Apt 4B' },
    { id: 2, name: 'Sunset Boulevard Retail, Unit 10', address: '456 Sunset Blvd, Unit 10' },
    { id: 3, name: 'Ocean View Villa, Miami', address: '789 Ocean Dr, Miami' },
];

export default function LandlordVerificationHub() {
    const [selectedProperty, setSelectedProperty] = useState(properties[0]);
    const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
    const totalSteps = verificationSteps.length;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                Compliance
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Verification Hub
                        </h1>
                        <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                            Manage compliance documents for your properties to unlock tiers.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            Help Center
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Property Selector */}
                        <div className="bg-white dark:bg-[#101922] rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#137fec] transition-colors">domain</span>
                                </div>
                                <select
                                    value={selectedProperty.id}
                                    onChange={(e) => setSelectedProperty(properties.find(p => p.id === Number(e.target.value)) || properties[0])}
                                    className="w-full appearance-none bg-transparent text-slate-900 dark:text-white py-3 pl-11 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:bg-slate-50 dark:focus:bg-slate-800 font-bold text-sm cursor-pointer transition-colors"
                                >
                                    {properties.map((property) => (
                                        <option key={property.id} value={property.id}>{property.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#101922] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Property Status</h2>

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
                                        className="drop-shadow-lg shadow-blue-500/50"
                                        cx="50"
                                        cy="50"
                                        fill="none"
                                        r="40"
                                        stroke="#137fec"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                                        strokeLinecap="round"
                                        strokeWidth="8"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{progressPercent}%</span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Verified</span>
                                </div>
                            </div>

                            {/* Tier Status */}
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-white dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800/50">
                                            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-0.5">Current Tier</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">Bronze Property</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-orange-300 dark:text-orange-800">check_circle</span>
                                </div>
                                <div className="relative flex items-center justify-between p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 transition-opacity cursor-help">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">military_tech</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Next Tier</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">Silver Property</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">lock</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Tip Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-[#137fec] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">AI Assistant</span>
                                </div>
                                <p className="text-sm text-indigo-100 leading-snug">Based on <strong>Highland Heights</strong>
                                    location, completing C of O increases visibility by 25%.</p>
                            </div>
                            <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-8xl text-white/10 rotate-12">verified</span>
                        </div>
                    </div>

                    {/* Right Content - Verification Steps */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verification Steps</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Requirements for <span className="font-bold text-slate-700 dark:text-slate-200">{selectedProperty.name}</span>.
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
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
                                                ? 'bg-white dark:bg-[#101922] border-l-4 border-amber-500'
                                                : 'bg-white dark:bg-[#101922] hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.status === 'completed'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : step.status === 'pending'
                                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 size-8 shadow-sm ring-4 ring-amber-50 dark:ring-amber-900/10'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
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
                                                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold rounded">
                                                            {step.level}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                                                </div>
                                            </div>
                                            {step.status !== 'locked' && (
                                                <button className="text-slate-400 hover:text-slate-600">
                                                    <span className="material-symbols-outlined">expand_more</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload Section for Pending */}
                                        {step.status === 'pending' && (
                                            <div className="ml-0 sm:ml-12 mt-6">
                                                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-center hover:border-[#137fec] hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer group">
                                                    <div className="size-14 rounded-full bg-white dark:bg-slate-700 shadow-sm mx-auto flex items-center justify-center text-slate-400 group-hover:text-[#137fec] group-hover:scale-110 transition-all duration-300 mb-4 border border-slate-100 dark:border-slate-600">
                                                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                                    </div>
                                                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">Click to upload C of O</h5>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                                        Ensure the address matches: <strong className="text-slate-700 dark:text-slate-300">{selectedProperty.address}</strong>
                                                    </p>
                                                    <button className="px-5 py-2.5 bg-[#137fec] hover:bg-[#137fec]/90 text-white text-sm font-bold rounded-lg shadow-md shadow-[#137fec]/20 transition-all active:scale-95">
                                                        Select Document
                                                    </button>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
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
