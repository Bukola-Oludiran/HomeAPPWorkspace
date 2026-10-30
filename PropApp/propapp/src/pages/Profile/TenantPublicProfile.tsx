import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { userService } from '../../lib/api/services/userService';
import Logo from '../../components/common/Logo';

interface Contribution {
    type: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    rating?: number;
    time: string;
}

interface TenantData {
    id: string;
    name: string;
    verified: boolean;
    memberSince: string;
    about: string;
    interests: string[];
    lookingFor: { quote: string; unitType: string; area: string; amenities: string };
    contributions: Contribution[];
    lastActive: string;
}

export default function TenantPublicProfile() {
    const { id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const [tenant, setTenant] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await userService.getPublicTenantProfile(id);
                const profileData = response.data;
                const user = profileData.user || { firstName: '', lastName: '', avatarUrl: '' };
                const extra = profileData as unknown as Record<string, unknown>;

                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || profileData.displayName || 'Tenant';
                const prefs = profileData.preferences || {};

                setTenant({
                    id: id,
                    name,
                    verified: (extra.verified as boolean) ?? true,
                    memberSince: extra.createdAt ? new Date(extra.createdAt as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
                    about: profileData.bio || (extra.about as string) || '',
                    interests: Array.isArray(extra.interests) ? (extra.interests as string[]) : [],
                    lookingFor: {
                        quote: (extra.lookingForQuote as string) || '',
                        unitType: prefs.desiredBedrooms ? `${prefs.desiredBedrooms} Bedrooms` : '',
                        area: (extra.preferredArea as string) || '',
                        amenities: (extra.desiredAmenities as string) || '',
                    },
                    contributions: Array.isArray(extra.contributions) ? (extra.contributions as Contribution[]) : [],
                    lastActive: (extra.lastActive as string) || '',
                });
            } catch (err) {
                console.error('Failed to load tenant profile:', err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-400 mb-4">error_outline</span>
                    <p className="text-slate-600 dark:text-slate-400">{error || 'Profile not found'}</p>
                    <Link to="/" className="text-brand-ink font-semibold mt-4 inline-block hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-canvas-dark/90 backdrop-blur-md px-4 md:px-10 py-3">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center h-8">
                        <Logo />
                    </Link>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link to="#" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-brand-ink transition-colors">Community</Link>
                        <Link to="/search" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-brand-ink transition-colors">Listings</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1400px] w-full mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
                                <Link to="#" className="hover:text-brand-ink">Community</Link>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span>Member Profile</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Public Profile</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">View public details and community contributions.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-20 bg-brand/10 dark:bg-brand/20"></div>
                                <div className="relative inline-block mx-auto mb-4 mt-8">
                                    <div className="size-24 rounded-full bg-brand p-1 shadow-xl">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">person</span>
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tenant.name}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Member since {tenant.memberSince}</p>
                                <div className="flex flex-col gap-2 items-center">
                                    {tenant.verified && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                                            <span className="material-symbols-outlined text-[14px] icon-filled">verified</span> Identity Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span> Send Message
                                </button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                            {/* About Me */}
                            <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-ink">face</span> About Me
                                    </h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{tenant.about}</p>
                                <div className="mt-6">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">interests</span> Interests & Lifestyle
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tenant.interests.map((interest, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full border border-slate-200 dark:border-slate-700">{interest}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* What I'm Looking For */}
                            <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-brand-ink">search</span> What I'm Looking For
                                </h3>
                                <div className="p-4 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-slate-700 mb-4">
                                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium italic">{tenant.lookingFor.quote}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined">bedroom_parent</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unit Type</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{tenant.lookingFor.unitType}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined">location_on</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Preferred Area</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{tenant.lookingFor.area}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined">pool</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Desired Amenities</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{tenant.lookingFor.amenities}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Community Contributions */}
                            <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-ink">forum</span> Community Contributions
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Last active {tenant.lastActive}</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {tenant.contributions.map((contribution, index) => (
                                        <div key={index}>
                                            {index > 0 && <hr className="border-slate-50 dark:border-slate-800 my-4" />}
                                            <div className="flex gap-4 items-start">
                                                <div className={`size-10 rounded-full ${contribution.iconBg} ${contribution.iconColor} flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-[20px]">{contribution.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-ink cursor-pointer transition-colors">{contribution.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contribution.description}</p>
                                                    {contribution.rating && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="flex text-yellow-400 text-[14px]">
                                                                {[1, 2, 3, 4, 5].map((i) => (
                                                                    <span key={i} className={`material-symbols-outlined icon-filled ${i <= (contribution.rating ?? 0) ? '' : 'text-slate-300'}`}>star</span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">• {contribution.time}</span>
                                                        </div>
                                                    )}
                                                    {!contribution.rating && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{contribution.time}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 text-sm text-brand-ink font-bold hover:bg-brand/5 rounded-lg transition-colors">
                                    View All Contributions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile CTA */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 z-40 lg:hidden">
                <div className="max-w-[1400px] mx-auto flex justify-end gap-4">
                    <button className="w-full py-3 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span> Send Message
                    </button>
                </div>
            </div>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">forum</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Community Assistant</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Public Insights</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-canvas-dark/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">forum</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{tenant.name.split(' ')[0]} is active in the Hiking and Gardening communities. Would you like me to find local groups that match their interests or show similar public profiles?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Find Local Hiking Groups
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Show Community Guidelines
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-canvas-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about community contributions..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">AI Assistant</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Explore Community</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
