import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { userService } from '../../../lib/api/services/userService';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { TenantProfile, User } from '../../../types/auth';
import type { RentalApplication } from '../../../types/lease';
import { formatCurrency, formatListingPrice } from '@/lib/format';

type TenantPublicProfile = TenantProfile & { user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'> };

// The left column ends early; a large fragment fills the space below it and reaches under the details
const CONTOUR: ContourFragment[] = [
    "top-[70%] left-[18%] -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[860px] rotate-180",
    "-top-24 -right-48 w-[55vw] max-w-[560px]",
];

const APPLICATION_STATUS: Record<string, { label: string; variant: 'success' | 'pending' | 'error' | 'neutral' }> = {
    PENDING: { label: 'Submitted', variant: 'neutral' },
    UNDER_REVIEW: { label: 'Under review', variant: 'pending' },
    APPROVED: { label: 'Approved', variant: 'success' },
    REJECTED: { label: 'Not successful', variant: 'error' },
    WITHDRAWN: { label: 'Withdrawn', variant: 'neutral' },
};

const EMPLOYMENT: Record<string, string> = {
    EMPLOYED: 'Employed',
    SELF_EMPLOYED: 'Self-employed',
    UNEMPLOYED: 'Not employed',
    STUDENT: 'Student',
    RETIRED: 'Retired',
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
            <div className="text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl">{children}</div>
        </div>
    );
}

/** The landlord's view of an applicant: everything shown comes from the application and the tenant's public profile */
export default function TenantProfileLandlordView() {
    const { id } = useParams();
    const [application, setApplication] = useState<RentalApplication | null>(null);
    const [profile, setProfile] = useState<TenantPublicProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            try {
                setIsLoading(true);
                const appResponse = await landlordService.getApplicantById(id);
                setApplication(appResponse.data);
                if (appResponse.data?.tenantId) {
                    const profileResponse = await userService.getPublicTenantProfile(appResponse.data.tenantId).catch(() => null);
                    setProfile(profileResponse?.data ?? null);
                }
            } catch (err) {
                console.error('Failed to fetch applicant:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const tenant = application?.tenant;
    const tenantName = [tenant?.firstName, tenant?.lastName].filter(Boolean).join(' ') || 'Applicant';
    const initials = tenantName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const status = application ? APPLICATION_STATUS[application.status] : undefined;

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading applicant…</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (!application) {
        return (
            <PageContainer>
                <div className="py-24 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicant not found</h1>
                    <Link to="/landlord/tenants" className="mt-4 inline-block font-semibold text-brand-ink hover:underline">Back to applicants</Link>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer motif={CONTOUR}>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                    <Link className="hover:text-brand-ink" to="/landlord/tenants">Applications</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>Applicant profile</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Applicant profile</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Details from {tenant?.firstName ?? 'this applicant'}'s application and public profile.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Profile Card & Checks */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    <div className="bg-card p-6 rounded-xl border border-border text-center">
                        <div className="mx-auto mb-4 size-24 overflow-hidden rounded-full bg-brand/10 dark:bg-sky/15">
                            {tenant?.avatarUrl ? (
                                <img src={tenant.avatarUrl} alt={tenantName} className="h-full w-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-brand-ink dark:text-sky">{initials}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tenantName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Applied {formatDate(application.createdAt)}</p>
                        <Link to={`/member/${application.tenantId}`} className="text-sm font-semibold text-brand-ink hover:underline">
                            View public profile
                        </Link>
                    </div>

                    {/* Checks: nothing is claimed until it has been run */}
                    <div className="bg-card rounded-xl border border-border p-5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink text-[18px]">gpp_good</span> Checks
                        </h3>
                        <ul className="space-y-3">
                            {['Background check', 'Income verification', 'Rental references'].map((check) => (
                                <li key={check} className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{check}</span>
                                    <StatusBadge status="Not yet checked" variant="neutral" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {/* Application */}
                    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-brand-ink">history</span> Application
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-border p-5">
                            <div className="size-12 bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">apartment</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">{application.property?.name ?? 'Property'}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Submitted {formatDate(application.createdAt)} · Move-in {formatDate(application.moveInDate)}
                                    {application.property && <> · {formatListingPrice(application.property.price, application.property.priceUnit)}</>}
                                </p>
                            </div>
                            {status && <StatusBadge status={status.label} variant={status.variant} />}
                        </div>
                        {application.message && (
                            <p className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">“{application.message}”</p>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-brand-ink">badge</span> Contact details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <Field label="Full name">{tenantName}</Field>
                            <Field label="Email address">{tenant?.email || 'Not provided'}</Field>
                            <Field label="Phone number">{tenant?.phone || 'Not provided'}</Field>
                        </div>
                    </div>

                    {/* Employment & income */}
                    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-brand-ink">work</span> Employment &amp; income
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Employment">{EMPLOYMENT[application.employmentStatus] ?? application.employmentStatus}</Field>
                            <Field label="Monthly income (stated)">{formatCurrency(application.monthlyIncome)}</Field>
                        </div>
                    </div>

                    {/* Preferences, from the public profile */}
                    {profile?.preferences && (
                        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">tune</span> Search preferences
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Desired bedrooms">{profile.preferences.desiredBedrooms || 'Not set'}</Field>
                                <Field label="Monthly budget">{profile.preferences.monthlyBudgetMax ? formatCurrency(profile.preferences.monthlyBudgetMax) : 'Not set'}</Field>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-3">
                        <Link
                            to={`/ai-chat?msg=${encodeURIComponent(`Help me evaluate ${tenantName}'s application for ${application.property?.name ?? 'my property'}`)}`}
                            className="px-6 py-3 rounded-xl border border-border-strong bg-card text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-accent flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">forum</span> Ask Keystead
                        </Link>
                        {tenant?.email && (
                            <a
                                href={`mailto:${tenant.email}`}
                                className="px-6 py-3 rounded-xl border border-border-strong bg-card text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-accent flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">mail</span> Email
                            </a>
                        )}
                        {tenant?.phone && (
                            <a href={`tel:${tenant.phone}`} className="px-8 py-3 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">call</span> Call applicant
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
