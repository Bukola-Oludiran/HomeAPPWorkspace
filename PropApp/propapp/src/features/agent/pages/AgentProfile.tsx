import { useState, useEffect } from 'react';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../lib/api/services/userService';
import { agentService } from '../../../lib/api/services/agentService';
import { integrationService } from '../../../lib/api/services/integrationService';
import type { AgentProfile as AgentProfileType, AgentCertification } from '../../../types/auth';
import type { AgentEarnings } from '../../../types/dashboard';

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
        title: '',
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
                title: agentProfile?.companyName || 'Property Agent',
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
                companyName: formData.title,
                serviceAreas: locations,
            });
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    // Format wallet balance
    const walletBalance = earnings?.availableBalance
        ? `$${earnings.availableBalance.toLocaleString()}`
        : '$0';

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
        return <PageContainer maxWidth="lg"><p className="py-16 text-center text-slate-500">Loading profile...</p></PageContainer>;
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader
                title="Agent Profile"
                subtitle="Manage your public presence, certifications, and settings."
                actions={
                    <>
                        <button className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                }
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-brand/10 dark:bg-brand/20"></div>
                        <div className="relative z-10 mb-4">
                            <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-white dark:bg-canvas-dark">
                                {user?.avatarUrl ? (
                                    <img
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                        src={user.avatarUrl}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
                                    </div>
                                )}
                                <button className="absolute bottom-1 right-1 p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-full hover:bg-brand transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || 'Agent'}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{formData.title}</p>
                        {isVerified && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                Verified Agent
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                                    <span className="font-bold text-xl">{rating}</span>
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Rating</p>
                            </div>
                            <div className="text-center border-l border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-white mb-1">
                                    <span className="font-bold text-xl">{jobsDone}</span>
                                </div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Jobs Done</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                            Account Settings
                        </div>
                        <div className="flex flex-col">
                            <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-sm group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-brand transition-colors">lock</span>
                                    Change Password
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                            </button>
                            <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-sm group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-brand transition-colors">notifications</span>
                                    Notifications
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                            </button>
                            <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 text-sm group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-brand transition-colors">shield</span>
                                    Privacy & Security
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-black rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-[80px]">account_balance_wallet</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Wallet</p>
                            <h4 className="text-2xl font-bold mb-1">{walletBalance}</h4>
                            <p className="text-sm text-slate-400 mb-4">Available for withdrawal</p>
                            <button className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:text-brand/80 transition-colors">
                                Manage Payment Methods
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-brand">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Update your contact details and public bio.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium outline-none"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium outline-none"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium outline-none"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium outline-none"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Area */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 bg-purple-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined">map</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Area</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Define where you want to receive job alerts.</p>
                            </div>
                        </div>
                        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 opacity-40"></div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="size-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-brand animate-bounce">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                </div>
                                <span className="text-xs font-bold bg-white/80 dark:bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                                    Lekki Phase 1, Lagos
                                </span>
                            </div>
                            <button className="absolute bottom-3 right-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                                Adjust on Map
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Locations</label>
                            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                {locations.map((loc) => (
                                    <div key={loc} className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-sm">
                                        <span className="text-sm font-medium">{loc}</span>
                                        <button
                                            onClick={() => setLocationToRemove(loc)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    className="bg-transparent border-none focus:ring-0 text-sm py-1 px-2 min-w-[120px] outline-none placeholder:text-slate-400"
                                    placeholder="Add location..."
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-orange-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">workspace_premium</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certifications</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your professional credentials.</p>
                                </div>
                            </div>
                            <button className="text-brand font-bold text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add New
                            </button>
                        </div>
                        <div className="space-y-4">
                            {certifications.length === 0 ? (
                                <div className="text-center py-4 text-slate-500">No certifications added yet</div>
                            ) : (
                                certifications.map((cert) => (
                                    <div key={cert.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600 shadow-sm">
                                                <span className="material-symbols-outlined text-green-600">verified</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cert.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Issuer: {cert.issuer} • Exp: {cert.expiryDate || 'Does not expire'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setCertToDelete({ id: cert.id, name: cert.name })}
                                                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 bg-yellow-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-yellow-600">
                                <span className="material-symbols-outlined">reviews</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Reviews</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">What clients are saying about your work.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-1 mb-2 text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className="material-symbols-outlined text-[16px]"
                                                style={{ fontVariationSettings: star <= Math.floor(review.rating) ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                {star <= review.rating ? 'star' : 'star'}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-3">{review.body || 'Rating submitted without a comment.'}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="font-bold">{review.author.firstName} {review.author.lastName}</span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 text-center text-brand text-sm font-bold hover:underline">
                            View all {jobsDone} reviews
                        </button>
                    </div>
                </div>
            </div>

            {/* Remove Location Confirmation Modal */}
            <ConfirmationModal
                isOpen={locationToRemove !== null}
                onClose={() => setLocationToRemove(null)}
                onConfirm={() => { if (locationToRemove) handleRemoveLocation(locationToRemove); }}
                title="Remove Service Area?"
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
                title="Delete Certification?"
                description={`Are you sure you want to delete "${certToDelete?.name}"? This will remove it from your public profile.`}
                confirmText="Delete"
                cancelText="Cancel"
                icon="delete"
                variant="danger"
            />
        </PageContainer>
    );
}
