import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { userService } from '../../lib/api/services/userService';
import Logo from '../../components/common/Logo';

interface LandlordData {
    id: string;
    name: string;
    image: string;
    verified: boolean;
    memberSince: string;
    propertiesCount: number;
    rating: number;
    responseRate: number;
    email: string;
    phone: string;
    location: string;
    languages: string;
    about: string;
    verificationItems: Array<{ name: string; verified: boolean; status?: string }>;
    listings: Array<{ id: string | number; name: string; location: string; price: string; beds: number; baths: number; image: string }>;
    reviews: { total: number; breakdown: Array<{ stars: number; count: number; percentage: number }> };
}

export default function LandlordPublicProfile() {
    const { id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const [landlord, setLandlord] = useState<LandlordData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await userService.getPublicLandlordProfile(id);
                const profileData = response.data;
                const user = profileData.user || { firstName: '', lastName: '', avatarUrl: '' };
                // Cast to access any extra fields the backend may include
                const extra = profileData as unknown as Record<string, unknown>;

                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || profileData.businessName || 'Landlord';

                // Extract listings if the backend includes them in the public profile
                const listings: LandlordData['listings'] = Array.isArray(extra.listings)
                    ? (extra.listings as LandlordData['listings'])
                    : [];

                setLandlord({
                    id: id,
                    name,
                    image: user.avatarUrl || '',
                    verified: (extra.verified as boolean) ?? true,
                    memberSince: extra.createdAt ? new Date(extra.createdAt as string).getFullYear().toString() : '',
                    propertiesCount: (extra.propertiesCount as number) || listings.length || 0,
                    rating: (extra.rating as number) || 0,
                    responseRate: (extra.responseRate as number) || 0,
                    email: profileData.businessEmail || '',
                    phone: (extra.phone as string) || '',
                    location: (extra.location as string) || '',
                    languages: (extra.languages as string) || '',
                    about: (extra.bio as string) || (extra.about as string) || '',
                    verificationItems: Array.isArray(extra.verificationItems)
                        ? (extra.verificationItems as LandlordData['verificationItems'])
                        : [],
                    listings,
                    reviews: (extra.reviews as LandlordData['reviews']) || { total: 0, breakdown: [] },
                });
            } catch (err) {
                console.error('Failed to load landlord profile:', err);
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

    if (error || !landlord) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">error_outline</span>
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
                    <Link to="/" className="flex items-center h-8 hover:opacity-80 transition-opacity">
                        <Logo />
                    </Link>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link to="/search" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-brand-ink transition-colors">Find a Home</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1200px] w-full mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="#" className="hover:text-brand-ink transition-colors">Landlords</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Profile</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Landlord Profile</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner">
                                        <img alt="Profile Picture" className="w-full h-full object-cover" src={landlord.image} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{landlord.name}</h2>
                                    {landlord.verified && (
                                        <span className="material-symbols-outlined icon-filled text-brand-ink text-xl" title="Identity Verified">verified</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Landlord since {landlord.memberSince}</p>
                                <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{landlord.propertiesCount}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Properties</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{landlord.rating}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rating</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{landlord.responseRate}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Response</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Verification Status</h3>
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Good Standing</span>
                                </div>
                                <div className="space-y-3">
                                    {landlord.verificationItems.map((item, index) => (
                                        <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${item.verified ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            <span className={`material-symbols-outlined ${item.verified ? 'icon-filled' : ''}`}>{item.verified ? 'verified_user' : 'domain_verification'}</span>
                                            <span className="text-sm font-semibold">{item.name}</span>
                                            {!item.verified && item.status && (
                                                <span className="ml-auto text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md text-slate-500 dark:text-slate-300">{item.status}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* About */}
                            <div className="bg-white dark:bg-canvas-dark p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {landlord.name.split(' ')[0]}</h2>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">{landlord.about}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white dark:bg-canvas-dark p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Email Address</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-brand-ink">mail</span>
                                            {landlord.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Phone Number</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-brand-ink">call</span>
                                            {landlord.phone}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Office Location</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-brand-ink">location_on</span>
                                            {landlord.location}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Languages</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-brand-ink">translate</span>
                                            {landlord.languages}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Listings */}
                            <div className="bg-white dark:bg-canvas-dark p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Listings</h2>
                                    <Link to="/search" className="text-sm font-semibold text-brand-ink hover:underline">View All Properties</Link>
                                </div>
                                <div className="space-y-4">
                                    {landlord.listings.map((listing) => (
                                        <Link key={listing.id} to={`/property/${listing.id}`} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                                <img alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={listing.image} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{listing.name}</h4>
                                                    <span className="font-bold text-brand-ink">{listing.price}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{listing.location}</p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bed</span> {listing.beds} Beds</span>
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bathtub</span> {listing.baths} Baths</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="bg-white dark:bg-canvas-dark p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reviews & Ratings</h2>
                                    <span className="text-sm text-slate-500">{landlord.reviews.total} Total Reviews</span>
                                </div>
                                <div className="flex flex-col md:flex-row gap-8 items-center pb-6">
                                    <div className="text-center md:text-left shrink-0">
                                        <div className="text-5xl font-extrabold text-slate-900 dark:text-white">{landlord.rating}</div>
                                        <div className="flex items-center gap-1 text-amber-400 my-2 justify-center md:justify-start">
                                            {[1, 2, 3, 4].map((i) => (
                                                <span key={i} className="material-symbols-outlined icon-filled">star</span>
                                            ))}
                                            <span className="material-symbols-outlined icon-filled text-slate-300 dark:text-slate-700">star_half</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Overall Rating</p>
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        {landlord.reviews.breakdown.map((item) => (
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
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
                                        Interested in one of {landlord.name.split(' ')[0]}'s properties?
                                    </div>
                                    <button className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                        <span className="material-symbols-outlined text-[20px]">chat</span>
                                        Contact Landlord
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">forum</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keystead Assistant</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Tenant Helper</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-canvas-dark/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">forum</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I can help you learn more about this landlord. Would you like to check their verification details or see similar properties?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Summarize reviews
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Compare rental prices
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Is this landlord verified?
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-canvas-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about this landlord..." type="text" />
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
                        <span className="text-sm font-bold leading-none">Ask Keystead...</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Tenant Assistant</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
