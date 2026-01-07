import { useState } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '@/assets/HeroSectionVideo.mp4';
import FavoriteButton from '@/components/FavoriteButton';
import VoiceInputButton from '@/components/VoiceInputButton';

// Featured properties mock data
const featuredProperties = [
    {
        id: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        alt: 'Modern suburban house with large windows and garden',
        price: '$850,000',
        type: 'For Sale',
        typeColor: 'bg-green-100 text-green-700',
        address: '1243 Oakwood Avenue, Austin, TX',
        beds: 4,
        baths: 3,
        sqft: '2,400',
        verified: 'Verified Owner',
    },
    {
        id: 2,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        alt: 'Modern white two-story residential home with blue sky',
        price: '$3,200',
        priceUnit: '/mo',
        type: 'For Rent',
        typeColor: 'bg-blue-100 text-blue-700',
        address: '5500 Highland Park, Dallas, TX',
        beds: 2,
        baths: 2,
        sqft: '1,100',
        verified: 'Verified',
    },
    {
        id: 3,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        alt: 'Interior view of a modern living room with large windows',
        price: '$5,500',
        priceUnit: '/mo',
        type: 'Short-let',
        typeColor: 'bg-purple-100 text-purple-700',
        address: 'Downtown Loft, Seattle, WA',
        beds: 1,
        baths: 1.5,
        sqft: '850',
        verified: 'Verified Owner',
    },
    {
        id: 4,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        alt: 'Backyard patio of a modern home with pool',
        price: '$1,250,000',
        type: 'For Sale',
        typeColor: 'bg-green-100 text-green-700',
        address: '778 Sunnyvale Drive, Miami, FL',
        beds: 5,
        baths: 4,
        sqft: '3,200',
        verified: 'Verified',
    },
];

type CategoryType = 'Buy' | 'Rent' | 'Short-let' | 'Land';

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState<CategoryType>('Buy');
    const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const categories: CategoryType[] = ['Buy', 'Rent', 'Short-let', 'Land'];

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden relative">
            {/* Logo - positioned above everything */}
            <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                <div className="size-10 bg-[#137fec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
                    <span className="material-symbols-outlined">real_estate_agent</span>
                </div>
                <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    PropertyApp
                </h2>
            </div>


            {/* Navbar is now rendered at App level via UnifiedNavbar */}


            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Hero Section with full-bleed background */}
                <section className="relative w-full min-h-[70vh] px-4 md:px-10 lg:px-20 flex justify-center items-center overflow-hidden">
                    {/* Full-bleed background video extending to top */}
                    <video
                        className="absolute inset-0 z-0 w-full h-full object-cover"
                        src={heroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    {/* Gradient overlay - same white filter as before */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-[#f6f7f8]/70 to-[#f6f7f8] dark:from-black/50 dark:via-[#101922]/70 dark:to-[#101922]"></div>

                    <div className="relative z-10 max-w-4xl w-full flex flex-col items-center mt-24">
                        <div className="text-center mb-10 space-y-4">
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-sm">
                                Find your place <span className="text-[#137fec]">with confidence.</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl font-normal max-w-2xl mx-auto drop-shadow-sm">
                                Browse thousands of verified listings with AI-powered matching to find exactly what
                                you're looking for.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full max-w-3xl bg-white dark:bg-[#1a2632] p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-black/30 border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 h-14 md:h-16">
                                    <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                                    <input
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg w-full p-0"
                                        placeholder="Search by location, price, or property type..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <VoiceInputButton
                                        onResult={(text) => setSearchQuery(text)}
                                        size="sm"
                                    />
                                </div>
                                <button className="h-14 md:h-16 px-8 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>

                        {/* Category Pills and AI Toggle */}
                        <div className="w-full max-w-3xl mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${activeCategory === category
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 shadow-md'
                                            : 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#137fec] hover:text-[#137fec]'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 bg-white dark:bg-[#1a2632] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="material-symbols-outlined text-[#137fec] icon-filled">
                                    smart_toy
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                                        AI Search
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                                        Natural language
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-2">
                                    <input
                                        type="checkbox"
                                        checked={aiSearchEnabled}
                                        onChange={(e) => setAiSearchEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#137fec]"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Properties Section */}
                <section className="flex-1 w-full bg-white dark:bg-[#101922] py-16 px-4 md:px-10 lg:px-20 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                    Featured Verified Properties
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Hand-picked properties with verified ownership status.
                                </p>
                            </div>
                            <Link
                                to="/search"
                                className="hidden md:flex items-center gap-1 text-[#137fec] font-bold hover:underline"
                            >
                                View all{' '}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Property Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {featuredProperties.map((property) => (
                                <Link to={`/property/${property.id}`} key={property.id}>
                                    <article className="group flex flex-col gap-4 cursor-pointer">
                                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200">
                                            <img
                                                alt={property.alt}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                src={property.image}
                                            />
                                            <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm text-[#137fec] text-xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
                                                <span className="material-symbols-outlined text-[16px] icon-filled">
                                                    verified
                                                </span>
                                                {property.verified}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <FavoriteButton
                                                    propertyId={property.id}
                                                    size="sm"
                                                    variant="overlay"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {property.price}
                                                    {property.priceUnit && (
                                                        <span className="text-sm font-normal text-slate-500">
                                                            {property.priceUnit}
                                                        </span>
                                                    )}
                                                </p>
                                                <span
                                                    className={`text-xs font-semibold px-2 py-1 rounded-md ${property.typeColor}`}
                                                >
                                                    {property.type}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-200 text-base font-medium truncate">
                                                {property.address}
                                            </p>
                                            <div className="flex gap-4 mt-3 text-slate-500 dark:text-slate-400 text-sm">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]">bed</span>
                                                    {property.beds} Beds
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]">bathtub</span>
                                                    {property.baths} Baths
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                                    {property.sqft} sqft
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile View All Link */}
                        <div className="mt-8 flex md:hidden justify-center">
                            <Link
                                to="/search"
                                className="flex items-center gap-1 text-[#137fec] font-bold hover:underline"
                            >
                                View all properties{' '}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-10 lg:px-20 text-center">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto text-sm text-slate-500 dark:text-slate-400">
                    <p>© 2024 PropertyApp. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy" className="hover:text-[#137fec] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-[#137fec] transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/support" className="hover:text-[#137fec] transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
