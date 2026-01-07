import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// Mock landlord data from design
const landlordData = {
    id: 'landlord-1',
    name: 'James Anderson',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
    verified: true,
    memberSince: '2018',
    propertiesCount: 12,
    rating: 4.8,
    responseRate: 98,
    email: 'james.anderson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Austin, TX',
    languages: 'English, Spanish',
    about: "Hi, I'm James! I've been managing properties in the greater metro area for over 5 years. I pride myself on quick responses and well-maintained homes. My goal is to provide a comfortable and hassle-free living experience for all my tenants. I specialize in urban lofts and family homes near downtown.",
    verificationItems: [
        { name: 'Identity Verified', verified: true },
        { name: 'Business Registration', verified: false, status: 'Pending' },
    ],
    listings: [
        {
            id: 1,
            name: '1243 Oakwood Avenue',
            location: 'Austin, TX',
            price: '$2,400/mo',
            beds: 3,
            baths: 2,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        },
        {
            id: 2,
            name: 'Downtown Loft',
            location: 'Seattle, WA',
            price: '$1,850/mo',
            beds: 1,
            baths: 1,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        },
    ],
    reviews: {
        total: 24,
        breakdown: [
            { stars: 5, count: 19, percentage: 80 },
            { stars: 4, count: 4, percentage: 15 },
            { stars: 3, count: 1, percentage: 5 },
        ],
    },
};

export default function LandlordPublicProfile() {
    const { id: _id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const landlord = landlordData;

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-4 md:px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="size-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">PropertyApp</h2>
                    </Link>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link to="/search" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors">Find a Home</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1200px] w-full mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="#" className="hover:text-[#137fec] transition-colors">Landlords</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Profile</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">Landlord Profile</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner">
                                        <img alt="Profile Picture" className="w-full h-full object-cover" src={landlord.image} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{landlord.name}</h2>
                                    {landlord.verified && (
                                        <span className="material-symbols-outlined icon-filled text-[#137fec] text-xl" title="Identity Verified">verified</span>
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
                            <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
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
                            <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About {landlord.name.split(' ')[0]}</h2>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">{landlord.about}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Email Address</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-[#137fec]">mail</span>
                                            {landlord.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Phone Number</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-[#137fec]">call</span>
                                            {landlord.phone}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Office Location</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-[#137fec]">location_on</span>
                                            {landlord.location}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Languages</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                            <span className="material-symbols-outlined text-[18px] text-[#137fec]">translate</span>
                                            {landlord.languages}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Listings */}
                            <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Listings</h2>
                                    <Link to="/search" className="text-sm font-semibold text-[#137fec] hover:underline">View All Properties</Link>
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
                                                    <span className="font-bold text-[#137fec]">{listing.price}</span>
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
                            <div className="bg-white dark:bg-[#101922] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
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
                                    <button className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2 transform active:scale-95">
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
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">HomeAI Assistant</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Tenant Helper</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-[#101922]/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I can help you learn more about this landlord. Would you like to check their verification details or see similar properties?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Summarize reviews
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Compare rental prices
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Is this landlord verified?
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#101922] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about this landlord..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Ask HomeAI...</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Tenant Assistant</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
