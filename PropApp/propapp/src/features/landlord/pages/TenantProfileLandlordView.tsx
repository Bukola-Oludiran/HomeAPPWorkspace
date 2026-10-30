import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import { userService } from '../../../lib/api/services/userService';
import type { TenantProfile } from '../../../types/auth';
import type { User } from '../../../types/auth';
import { formatCurrency } from '@/lib/format';

type TenantPublicProfile = TenantProfile & { user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'> };

export default function TenantProfileLandlordView() {
    const { id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const [profile, setProfile] = useState<TenantPublicProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await userService.getPublicTenantProfile(id);
                setProfile(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant profile:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, [id]);

    const tenantName = profile?.user
        ? `${profile.user.firstName} ${profile.user.lastName}`
        : 'Tenant';
    const tenantInitials = profile?.user
        ? `${profile.user.firstName?.[0] || ''}${profile.user.lastName?.[0] || ''}`
        : '';

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading tenant profile...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-400 mb-2 font-medium">
                        <Link className="hover:text-brand-ink" to="/landlord/tenants">Applications</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span>Applicant Profile</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tenant Profile</h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">Review applicant details, verification status, and history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Profile Card & Verification */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-brand/10 dark:bg-brand/20"></div>
                        <div className="relative inline-block mx-auto mb-4 mt-8">
                            <div className="size-24 rounded-full bg-brand p-1 shadow-xl">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {profile?.user?.avatarUrl ? (
                                        <img src={profile.user.avatarUrl} alt={tenantName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-brand-ink">{tenantInitials}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tenantName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Applicant since Sep 2024</p>
                        <div className="flex flex-col gap-2 items-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Identity Verified
                            </div>
                        </div>
                    </div>

                    {/* Verification Report */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden p-5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink text-[18px]">gpp_good</span> Verification Report
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Background Check</span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Cleared</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Income Verification</span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Verified</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Credit Score</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">742 <span className="text-green-500 text-xs font-normal">(Excellent)</span></span>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-700" />
                            <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">file_download</span> Download Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {/* Application History */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-ink">history</span> Application History
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1 Active Application</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                <div className="size-12 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                                    <span className="material-symbols-outlined">apartment</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">1243 Oakwood Ave, Apt 4B</h4>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold rounded-full uppercase">Current</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Submitted on Sep 28, 2024 • Lease Start: Nov 1, 2024</p>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1">
                                    <div className="text-right">
                                        <span className="block text-xs text-slate-400 font-medium uppercase">Status</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Review Pending</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 opacity-70">
                                <div className="size-10 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">house</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">880 Fairview Blvd</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Inquired on Aug 12, 2024</p>
                                </div>
                                <span className="px-2 py-1 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-xs font-bold rounded-full">Closed</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal & Contact Details */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-ink">badge</span> Personal &amp; Contact Details
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Full Name</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800">
                                    {tenantName}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Date of Birth</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                                    August 15, 1995 <span className="text-sm font-normal text-slate-500">(29 yrs)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Email Address</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span>sarah.johnson@example.com</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm opacity-0 group-hover:opacity-100">content_copy</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Phone Number</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span>(555) 123-4567</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm opacity-0 group-hover:opacity-100">call</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employment & Financial */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-ink">work</span> Employment &amp; Financial
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Current Employer</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800">
                                    Tech Solutions Inc.
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Job Title</label>
                                <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent dark:border-slate-800">
                                    Senior UX Designer
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Annual Income</label>
                                <div className="text-base font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 px-4 py-3 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">payments</span> 95,000
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Proof of Income</label>
                                <div className="flex items-center gap-2 text-sm text-brand-ink font-medium bg-brand/5 px-4 py-3 rounded-xl border border-brand/10 cursor-pointer hover:bg-brand/10 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                    <span>paystub_sep_2024.pdf</span>
                                    <span className="ml-auto text-xs text-slate-400">Uploaded Sep 28</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tenant Preferences */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-brand-ink">tune</span> Tenant Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Search Criteria</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Desired Bedrooms</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{profile?.preferences?.desiredBedrooms || '—'}</span>
                                    </li>
                                    <li className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Max Budget</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{profile?.preferences?.monthlyBudgetMax ? formatCurrency(profile.preferences.monthlyBudgetMax) : '—'}</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Amenities</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">Gym</span>
                                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">Pool</span>
                                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">Parking</span>
                                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">In-unit Laundry</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                                        Tenant prefers <strong>Email Notifications</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                <div className="max-w-[1400px] mx-auto flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span> Message
                    </button>
                    <button className="px-8 py-3 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">call</span> Contact Tenant
                    </button>
                </div>
            </div>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {/* AI Modal */}
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tenant Evaluator</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">AI Insights</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-canvas-dark/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">Based on my review, {profile?.user?.firstName || 'this tenant'} has an excellent rental history. Their income-to-rent ratio is 3.5x, and they have no late payments on record. I recommend approving.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-canvas-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about this tenant..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Trigger Button */}
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                        <span className="material-symbols-outlined">psychology_alt</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Evaluate Tenant</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">AI Insights</span>
                    </div>
                </button>
            </div>
        </PageContainer>
    );
}
