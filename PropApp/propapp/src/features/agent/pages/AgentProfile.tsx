import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../lib/api/services/userService';
import { agentService } from '../../../lib/api/services/agentService';
import { integrationService } from '../../../lib/api/services/integrationService';
import type { AgentProfile as AgentProfileType, AgentCertification } from '../../../types/auth';
import type { AgentEarnings } from '../../../types/dashboard';
import { formatCurrency, formatDate } from '@/lib/format';

// The left column ends early; a large fragment fills the space below it and reaches under the details
const CONTOUR: ContourFragment[] = [
    'top-[76%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[860px] rotate-180',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

const SECTION_ICON = 'size-10 bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky rounded-full flex items-center justify-center';
const READONLY_INPUT = 'w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-slate-700 dark:text-slate-300 text-sm font-medium outline-none cursor-default';

interface ReviewItem {
    id: string;
    rating: number;
    body?: string;
    createdAt: string;
    author: { firstName: string; lastName: string };
}

export default function AgentProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agentProfile, setAgentProfile] = useState<AgentProfileType | null>(null);
    const [earnings, setEarnings] = useState<AgentEarnings | null>(null);
    const [certifications, setCertifications] = useState<AgentCertification[]>([]);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [rating, setRating] = useState(0);
    const [jobsDone, setJobsDone] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
    });
    const [locations, setLocations] = useState<string[]>([]);

    // Load profile data from backend
    useEffect(() => {
        async function loadProfileData() {
            setLoading(true);
            try {
                // Load agent profile
                const profileResponse = await userService.getAgentProfile();
                if (profileResponse.data) {
                    setAgentProfile(profileResponse.data);
                    setLocations(profileResponse.data.serviceAreas || []);
                    setCertifications((profileResponse.data as AgentProfileType & { certifications?: AgentCertification[] }).certifications || []);
                }

                // Load earnings for wallet balance
                const earningsResponse = await agentService.getEarnings();
                if (earningsResponse.data) {
                    setEarnings(earningsResponse.data);
                }

                if (user?.id) {
                    const [reviewResponse, jobsResponse] = await Promise.all([
                        integrationService.getReviews(user.id),
                        agentService.getAcceptedJobs({ status: 'COMPLETED' }),
                    ]);
                    const reviewData = reviewResponse.data as { reviews?: ReviewItem[]; averageRating?: number };
                    setReviews(reviewData.reviews || []);
                    setRating(reviewData.averageRating || 0);
                    setJobsDone(jobsResponse.data?.length || 0);
                }
            } catch (error) {
                console.error('Failed to load agent profile:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfileData();
    }, [user?.id]);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                company: agentProfile?.companyName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user, agentProfile]);

    // Handle save changes
    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            await userService.updateAgentProfile({
                companyName: formData.company,
                serviceAreas: locations,
            });
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const walletBalance = formatCurrency(earnings?.availableBalance || 0);
    const initials = formData.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

    // Check verification status
    const isVerified = user?.verificationLevel && user.verificationLevel !== 'BRONZE';

    const [newLocation, setNewLocation] = useState('');
    const [locationToRemove, setLocationToRemove] = useState<string | null>(null);
    const [certToDelete, setCertToDelete] = useState<{ id: string; name: string } | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleRemoveLocation = (locationToRemove: string) => {
        setLocations(locations.filter(loc => loc !== locationToRemove));
        setLocationToRemove(null);
    };

    const handleAddLocation = () => {
        if (newLocation.trim() && !locations.includes(newLocation.trim())) {
            setLocations([...locations, newLocation.trim()]);
            setNewLocation('');
        }
    };

    const handleDeleteCertification = async () => {
        if (!certToDelete) return;
        await userService.deleteAgentCertification(certToDelete.id);
        setCertifications(current => current.filter(cert => cert.id !== certToDelete.id));
        setCertToDelete(null);
    };

    if (loading) {
        return <PageContainer maxWidth="lg"><p className="py-16 text-center text-slate-500 dark:text-slate-400">Loading profile...</p></PageContainer>;
    }

    return (
        <PageContainer maxWidth="lg" motif={CONTOUR}>
            <PageHeader
                title="Agent profile"
                subtitle="Manage your public presence, certifications, and settings."
                actions={
                    <>
                        <button className="px-5 py-2.5 rounded-lg border border-border-strong text-slate-700 dark:text-slate-300 font-bold text-sm bg-card hover:bg-accent transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </>
                }
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-card rounded-2xl border border-border p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-brand/10 dark:bg-sky/10"></div>
                        <div className="relative z-10 mb-4">
                            <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-card">
                                {user?.avatarUrl ? (
                                    <img
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                        src={user.avatarUrl}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-brand/10 dark:bg-sky/15 flex items-center justify-center">
                                        <span className="text-4xl font-extrabold text-brand-ink dark:text-sky">{initials || '?'}</span>
                                    </div>
                                )}
                                <button className="absolute bottom-1 right-1 p-2 bg-brand-ink text-on-brand rounded-full hover:bg-brand-ink/90 transition-colors shadow-md" title="Change photo">
                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || 'Agent'}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{formData.company || 'Property agent'}</p>
                        {isVerified && (
                            <div className="mb-6">
                                <StatusBadge status="Verified agent" variant="success" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                            <div className="text-center">
                                {reviews.length > 0 ? (
                                    <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white mb-1">
                                        <span className="font-bold text-xl">{rating.toFixed(1)}</span>
                                        <span className="material-symbols-outlined text-[20px] text-pending" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </div>
                                ) : (
                                    <p className="font-bold text-xl text-slate-400 dark:text-slate-500 mb-1">—</p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide">
                                    {reviews.length > 0 ? 'Rating' : 'No ratings yet'}
                                </p>
                            </div>
                            <div className="text-center border-l border-border">
                                <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-white mb-1">
                                    <span className="font-bold text-xl">{jobsDone}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wide">Jobs done</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border font-bold text-slate-900 dark:text-white">
                            Account settings
                        </div>
                        <div className="flex flex-col divide-y divide-border">
                            {[
                                { icon: 'lock', label: 'Change password' },
                                { icon: 'notifications', label: 'Notifications' },
                                { icon: 'shield', label: 'Privacy & security' },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to="/settings"
                                    className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-slate-600 dark:text-slate-300 text-sm group"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-brand-ink transition-colors">{item.icon}</span>
                                        {item.label}
                                    </span>
                                    <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">chevron_right</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Available balance</p>
                        <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4 whitespace-nowrap">{walletBalance}</h4>
                        <Link to="/agent/earnings" className="inline-flex items-center gap-2 text-brand-ink dark:text-sky font-bold text-sm hover:underline">
                            Earnings and payouts
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={SECTION_ICON}>
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal information</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your name, email and phone come from your account. <Link to="/settings" className="font-semibold text-brand-ink dark:text-sky hover:underline">Change them in Settings</Link>.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
                                <input className={READONLY_INPUT} type="text" value={formData.name} readOnly />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="agent-company">Company</label>
                                <input
                                    id="agent-company"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-strong bg-card text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium outline-none"
                                    type="text"
                                    placeholder="Your agency, if you work for one"
                                    value={formData.company}
                                    onChange={(e) => handleInputChange('company', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
                                <input className={READONLY_INPUT} type="email" value={formData.email} readOnly />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone number</label>
                                <input className={READONLY_INPUT} type="tel" value={formData.phone || 'Not added'} readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Service Area */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={SECTION_ICON}>
                                <span className="material-symbols-outlined">map</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service area</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Define where you want to receive job alerts.</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Areas you cover</label>
                            <div className="flex flex-wrap gap-2 p-2 bg-card rounded-xl border border-border-strong">
                                {locations.map((loc) => (
                                    <div key={loc} className="flex items-center gap-1 bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky px-3 py-1.5 rounded-lg">
                                        <span className="text-sm font-semibold">{loc}</span>
                                        <button
                                            onClick={() => setLocationToRemove(loc)}
                                            className="opacity-70 hover:opacity-100 transition-opacity"
                                            title={`Remove ${loc}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 min-w-[200px] outline-none placeholder:text-slate-400"
                                    placeholder="Add an area and press Enter"
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={SECTION_ICON}>
                                    <span className="material-symbols-outlined">workspace_premium</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certifications</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your professional credentials.</p>
                                </div>
                            </div>
                            <button className="text-brand-ink dark:text-sky font-bold text-sm flex items-center gap-1 hover:bg-accent px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add new
                            </button>
                        </div>
                        <div className="space-y-4">
                            {certifications.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 dark:text-slate-400">No certifications added yet</div>
                            ) : (
                                certifications.map((cert) => (
                                    <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-neutral-bg flex items-center justify-center">
                                                <span className="material-symbols-outlined text-muted-foreground">workspace_premium</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cert.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{cert.issuer} · {cert.expiryDate ? `Expires ${formatDate(cert.expiryDate)}` : 'Does not expire'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setCertToDelete({ id: cert.id, name: cert.name })}
                                                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={SECTION_ICON}>
                                <span className="material-symbols-outlined">reviews</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent reviews</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">What clients are saying about your work.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet.</p>}
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4 rounded-xl border border-border">
                                    <div className="flex items-center gap-1 mb-2 text-pending">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className="material-symbols-outlined text-[16px]"
                                                style={{ fontVariationSettings: star <= Math.floor(review.rating) ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-3">{review.body || 'Rating submitted without a comment.'}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span className="font-bold">{review.author.firstName} {review.author.lastName}</span>
                                        <span>{formatDate(review.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove Location Confirmation Modal */}
            <ConfirmationModal
                isOpen={locationToRemove !== null}
                onClose={() => setLocationToRemove(null)}
                onConfirm={() => { if (locationToRemove) handleRemoveLocation(locationToRemove); }}
                title="Remove service area?"
                description={`Are you sure you want to remove "${locationToRemove}" from your service areas? You can add it back later.`}
                confirmText="Remove"
                cancelText="Cancel"
                icon="delete"
                variant="danger"
            />

            {/* Delete Certification Confirmation Modal */}
            <ConfirmationModal
                isOpen={certToDelete !== null}
                onClose={() => setCertToDelete(null)}
                onConfirm={handleDeleteCertification}
                title="Delete certification?"
                description={`Are you sure you want to delete "${certToDelete?.name}"? This will remove it from your public profile.`}
                confirmText="Delete"
                cancelText="Cancel"
                icon="delete"
                variant="danger"
            />
        </PageContainer>
    );
}
