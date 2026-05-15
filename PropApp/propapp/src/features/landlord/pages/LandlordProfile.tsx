import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { userService, landlordService } from '../../../lib/api/services';
import type { UserWithProfile } from '../../../types/auth';
import type { PropertySummary } from '../../../types/property';

// UI types for profile data
interface UIProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    avatarUrl: string;
    memberSince: string;
    stats: {
        properties: number;
        rating: number;
        responseRate: number;
    };
    verifications: Array<{
        id: number;
        name: string;
        status: 'verified' | 'pending';
        icon: string;
    }>;
    properties: Array<{
        id: string;
        name: string;
        location: string;
        status: string;
        image: string;
    }>;
    reviews: {
        total: number;
        average: number;
        breakdown: Array<{
            stars: number;
            count: number;
            percentage: number;
        }>;
    };
}

// Get member since year from createdAt
function getMemberSinceYear(createdAt: string): string {
    return new Date(createdAt).getFullYear().toString();
}

// Get status label from property status
function getPropertyStatusLabel(status: string): string {
    const mapping: Record<string, string> = {
        AVAILABLE: 'Active',
        RENTED: 'Rented',
        PENDING: 'Pending',
        MAINTENANCE: 'Maintenance',
        DRAFT: 'Draft',
    };
    return mapping[status] || status;
}

// Format address for location display
function formatLocation(address: PropertySummary['address']): string {
    if (typeof address === 'object' && address) {
        return [address.city, address.state].filter(Boolean).join(', ');
    }
    return '';
}

// Transform API data to UI format
function transformProfileData(
    user: UserWithProfile,
    properties: PropertySummary[]
): UIProfileData {
    return {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        memberSince: getMemberSinceYear(user.createdAt),
        stats: {
            properties: properties.length,
            rating: 0, // Would come from reviews API
            responseRate: 0, // Would come from analytics API
        },
        verifications: [
            {
                id: 1,
                name: 'Identity Verified',
                status: user.isEmailVerified ? 'verified' : 'pending',
                icon: 'verified_user',
            },
            {
                id: 2,
                name: 'Business Registration',
                status: 'pending',
                icon: 'domain_verification',
            },
        ],
        properties: properties.slice(0, 5).map((p) => ({
            id: p.id,
            name: p.name,
            location: formatLocation(p.address),
            status: getPropertyStatusLabel(p.status),
            image: '',
        })),
        reviews: {
            total: 0,
            average: 0,
            breakdown: [],
        },
    };
}

// Default empty data for loading state
const defaultProfileData: UIProfileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    memberSince: '',
    stats: { properties: 0, rating: 0, responseRate: 0 },
    verifications: [],
    properties: [],
    reviews: { total: 0, average: 0, breakdown: [] },
};

const menuItems = [
    { id: 'personal', icon: 'person', label: 'Personal Info' },
    { id: 'security', icon: 'lock', label: 'Login & Security' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'billing', icon: 'credit_card', label: 'Billing & Payouts' },
    { id: 'privacy', icon: 'shield', label: 'Privacy Settings' },
];

export default function LandlordProfile() {
    const [activeMenu, setActiveMenu] = useState('personal');

    // API data state
    const [profileData, setProfileData] = useState<UIProfileData>(defaultProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state (initialized after data loads)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
    });

    // Fetch profile data
    useEffect(() => {
        async function fetchProfileData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch user profile and properties in parallel
                const [userResponse, propertiesResponse] = await Promise.all([
                    userService.getCurrentUser(),
                    landlordService.getProperties({ limit: 5 }),
                ]);

                const user = userResponse.data;
                const properties = propertiesResponse.data?.data || [];

                if (user) {
                    const transformed = transformProfileData(user, properties);
                    setProfileData(transformed);
                    setFormData({
                        firstName: transformed.firstName,
                        lastName: transformed.lastName,
                        email: transformed.email,
                        phone: transformed.phone,
                        bio: transformed.bio,
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfileData();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    // Loading state
    if (isLoading) {
        return (
            <PageContainer maxWidth="lg">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec] mx-auto mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer maxWidth="lg">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader
                title="Landlord Profile"
                breadcrumb={[
                    { label: 'Account', href: '/landlord/dashboard' },
                    { label: 'Profile' }
                ]}
                actions={
                    <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                        View Public Profile
                    </button>
                }
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-4">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner">
                                <img
                                    alt="Profile Picture"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">photo_camera</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.firstName} {formData.lastName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Landlord since {profileData.memberSince}</p>
                        <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{profileData.stats.properties}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Properties</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{profileData.stats.rating}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rating</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{profileData.stats.responseRate}%</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Response</p>
                            </div>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Verification Status</h3>
                            <Link to="/landlord/verification" className="text-xs font-bold text-[#137fec] hover:underline">View Hub</Link>
                        </div>
                        <div className="space-y-3">
                            {profileData.verifications.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${item.status === 'verified'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 opacity-60'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined ${item.status === 'verified' ? 'icon-filled' : ''}`}>{item.icon}</span>
                                    <span className="text-sm font-semibold">{item.name}</span>
                                    {item.status === 'pending' && (
                                        <span className="ml-auto text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">Pending</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settings Menu */}
                    <SectionCard padding="none">
                        <nav className="flex flex-col">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveMenu(item.id)}
                                    className={`flex items-center justify-between p-4 text-left transition-colors ${activeMenu === item.id
                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-l-4 border-[#137fec] text-slate-900 dark:text-white font-medium'
                                        : 'border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </SectionCard>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Personal Info Form */}
                    <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal & Contact Information</h2>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                Visible to tenants
                            </span>
                        </div>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all text-sm"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all text-sm"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all text-sm"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all text-sm"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* About Me */}
                    <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">About Me</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            This description will appear on your public profile and property listings.
                        </p>
                        <div className="relative">
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all text-sm resize-y"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                            />
                            <button className="absolute bottom-3 right-3 p-1.5 text-[#137fec] hover:bg-blue-50 dark:hover:bg-slate-700 rounded-md transition-colors" title="Use AI to improve bio">
                                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                            </button>
                        </div>
                    </div>

                    {/* Managed Properties */}
                    <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Managed Properties</h2>
                            <Link to="/landlord/properties" className="text-sm font-semibold text-[#137fec] hover:underline">Manage All</Link>
                        </div>
                        <div className="space-y-4">
                            {profileData.properties.map((property) => (
                                <Link
                                    key={property.id}
                                    to={`/landlord/properties/${property.id}`}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                        <img alt={property.name} className="w-full h-full object-cover" src={property.image} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{property.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{property.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${property.status === 'Active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                            }`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <span className="p-2 text-slate-400 hover:text-[#137fec] transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reviews & Ratings</h2>
                            <span className="text-sm text-slate-500">{profileData.reviews.total} Total Reviews</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="text-center md:text-left shrink-0">
                                <div className="text-5xl font-extrabold text-slate-900 dark:text-white">{profileData.reviews.average}</div>
                                <div className="flex items-center gap-1 text-amber-400 my-2 justify-center md:justify-start">
                                    {[1, 2, 3, 4].map((i) => (
                                        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-700" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Overall Rating</p>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {profileData.reviews.breakdown.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-3 text-xs">
                                        <span className="w-8 font-bold text-slate-700 dark:text-slate-300">{item.stars} star</span>
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400" style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                        <span className="w-6 text-right text-slate-500">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
