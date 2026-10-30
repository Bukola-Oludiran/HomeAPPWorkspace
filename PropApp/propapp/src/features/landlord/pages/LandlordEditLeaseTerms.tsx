import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { leaseService } from '../../../lib/api/services/leaseService';
import type { Lease } from '../../../types/lease';

export default function LandlordEditLeaseTerms() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lease, setLease] = useState<Lease | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [monthlyRent, setMonthlyRent] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [duration, setDuration] = useState('12');
    const [leaseStart, setLeaseStart] = useState('');
    const [leaseEnd, setLeaseEnd] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [additionalTerms, setAdditionalTerms] = useState('');

    useEffect(() => {
        async function fetchLease() {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await leaseService.getLeaseById(id);
                const data = response.data;
                setLease(data);
                setMonthlyRent(data.monthlyRent?.toString() || '');
                setSecurityDeposit(data.securityDeposit?.toString() || '');
                setLeaseStart(data.startDate?.split('T')[0] || '');
                setLeaseEnd(data.endDate?.split('T')[0] || '');
                setAdditionalTerms(data.terms || '');
                if (data.startDate && data.endDate) {
                    const start = new Date(data.startDate);
                    const end = new Date(data.endDate);
                    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
                    if (months <= 1) setDuration('mtm');
                    else if (months <= 6) setDuration('6');
                    else if (months <= 12) setDuration('12');
                    else setDuration('24');
                }
            } catch (err) {
                console.error('Failed to fetch lease:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLease();
    }, [id]);

    async function handleSave() {
        if (!id) return;
        try {
            setIsSaving(true);
            await leaseService.updateLease(id, {
                monthlyRent: parseFloat(monthlyRent) || undefined,
                endDate: leaseEnd || undefined,
                terms: additionalTerms ? { additionalTerms } : undefined,
            });
            navigate(`/landlord/leases/${id}`);
        } catch (err) {
            console.error('Failed to save lease changes:', err);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    const tenantName = lease?.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'the tenant';
    const propertyAddress = lease?.property ? `${lease.property.address?.street || ''}, ${lease.property.address?.city || ''}, ${lease.property.address?.state || ''}`.trim() : '';
    const leaseIdDisplay = lease?.id ? `#${lease.id.slice(0, 12).toUpperCase()}` : '';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading lease details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-none">
                <div className="px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link to={`/landlord/leases/${id}`} className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors pointer-events-auto text-slate-800 dark:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-sm font-semibold text-slate-700 dark:text-slate-200 border border-white/20">
                            Saving draft...
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative w-full h-[25vh] md:h-[30vh] bg-slate-200 overflow-hidden">
                <img
                    alt="Modern Oakwood Estate large windows"
                    className="w-full h-full object-cover grayscale opacity-50"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas dark:from-canvas-dark via-canvas/60 dark:via-canvas-dark/60 to-transparent"></div>
                <div className="absolute bottom-6 left-4 md:left-8 max-w-[1200px] w-full mx-auto px-4 md:px-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-amber-500/90 text-white text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">edit</span> Edit Mode
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{leaseIdDisplay}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Edit Lease Terms</h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{propertyAddress || lease?.property?.name || ''}</p>
                </div>
            </div>

            {/* Main Form */}
            <main className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-8">
                {/* Warning Banner */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex gap-4">
                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-500">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">Important: Tenant Notification Required</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Saving these changes will generate a lease amendment. The tenant, <span className="font-semibold text-slate-900 dark:text-white">{tenantName}</span>, will be notified to review and digitally sign the updated terms.
                        </p>
                    </div>
                </div>

                <form className="space-y-6">
                    {/* Financials & Duration Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">payments</span> Financials &amp; Duration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Rent</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
                                    <input
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow font-medium"
                                        type="number"
                                        value={monthlyRent}
                                        onChange={(e) => setMonthlyRent(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Current market avg: $4,950 - $5,200</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Security Deposit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
                                    <input
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow font-medium"
                                        type="number"
                                        value={securityDeposit}
                                        onChange={(e) => setSecurityDeposit(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lease Duration</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <label className="cursor-pointer">
                                        <input className="peer sr-only" name="duration" type="radio" value="mtm" checked={duration === 'mtm'} onChange={() => setDuration('mtm')} />
                                        <div className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-center font-medium peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:text-brand-ink transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                                            Month-to-Month
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input className="peer sr-only" name="duration" type="radio" value="6" checked={duration === '6'} onChange={() => setDuration('6')} />
                                        <div className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-center font-medium peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:text-brand-ink transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                                            6 Months
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input className="peer sr-only" name="duration" type="radio" value="12" checked={duration === '12'} onChange={() => setDuration('12')} />
                                        <div className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-center font-medium peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:text-brand-ink transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                                            12 Months
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input className="peer sr-only" name="duration" type="radio" value="24" checked={duration === '24'} onChange={() => setDuration('24')} />
                                        <div className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-center font-medium peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:text-brand-ink transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                                            24 Months
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Key Dates Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">calendar_month</span> Key Dates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lease Start Date</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow"
                                    type="date"
                                    value={leaseStart}
                                    onChange={(e) => setLeaseStart(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lease End Date</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow"
                                    type="date"
                                    value={leaseEnd}
                                    onChange={(e) => setLeaseEnd(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Effective Date of Changes
                                    <span className="material-symbols-outlined text-[16px] text-slate-400 cursor-help" title="When do these new terms apply?">help</span>
                                </label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-brand dark:border-brand bg-blue-50/50 dark:bg-brand/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow"
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                />
                                <span className="text-xs text-brand-ink font-medium absolute -bottom-5 right-0">Changes apply next month</span>
                            </div>
                        </div>
                    </section>

                    {/* Clauses & Addendums Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-ink">gavel</span> Clauses &amp; Addendums
                            </h2>
                            <button className="text-sm font-bold text-brand-ink hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1" type="button">
                                <span className="material-symbols-outlined text-[18px]">add</span> Add Clause
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* Pet Policy Addendum */}
                            <div className="group bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                                <div className="size-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                                    <span className="material-symbols-outlined">pets</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pet Policy Addendum</h4>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-brand-ink transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-600 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-1">Permits 1 dog under 40lbs. Non-refundable fee of $250 applied.</p>
                                </div>
                            </div>

                            {/* No Smoking Clause */}
                            <div className="group bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                                <div className="size-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                                    <span className="material-symbols-outlined">smoking_rooms</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Smoking Clause</h4>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-brand-ink transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-600 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-1">Strict no-smoking policy within the premises and 20ft perimeter.</p>
                                </div>
                            </div>

                            {/* Custom Notes */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Custom Notes / Additional Terms</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand transition-shadow text-sm"
                                    placeholder="Enter any additional terms here..."
                                    rows={3}
                                    value={additionalTerms}
                                    onChange={(e) => setAdditionalTerms(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </section>
                </form>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-xl border border-brand/20 shadow-lg rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                    <div className="size-10 rounded-full bg-brand flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">forum</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Are these rent changes compliant with local rent control laws?
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-brand hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <button className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-ink transition-colors font-bold text-sm" type="button">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                        Preview Changes
                    </button>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link
                            to={`/landlord/leases/${id}`}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
