import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import ViewToggle from '../../../components/common/ViewToggle';
import { AnimatedGroup } from '../../../components/animation';

// Mock saved properties data
const savedPropertiesData = [
    {
        id: 1,
        title: '778 Sunnyvale Dr, Unit 12',
        location: 'Miami, FL 33101',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        price: '$3,200',
        period: '/mo',
        type: 'FOR RENT',
        beds: '2 Beds',
        baths: '2 Baths',
        sqft: '1,150 sqft',
        isVerified: true,
        availability: 'Available Now',
    },
    {
        id: 2,
        title: '1243 Oakwood Ave',
        location: 'Austin, TX 78704',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        price: '$2,850',
        period: '/mo',
        type: 'FOR RENT',
        beds: '3 Beds',
        baths: '2.5 Baths',
        sqft: '1,800 sqft',
        isVerified: true,
        availability: 'Available Now',
    },
    {
        id: 3,
        title: 'The Lofts at 4th',
        location: 'Seattle, WA 98101',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        price: '$1,950',
        period: '/mo',
        type: 'FOR RENT',
        beds: 'Studio',
        baths: '1 Bath',
        sqft: '650 sqft',
        isVerified: false,
        availability: 'Available Now',
    },
    {
        id: 4,
        title: '5500 Highland Park, Unit 4B',
        location: 'Dallas, TX 75205',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        price: '$4,100',
        period: '/mo',
        type: 'FOR RENT',
        beds: '2 Beds',
        baths: '2 Baths',
        sqft: '1,420 sqft',
        isVerified: true,
        availability: 'Available Now',
    },
];

type ViewMode = 'grid' | 'list';

export default function TenantSavedProperties() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [savedProperties, setSavedProperties] = useState(savedPropertiesData);
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('price-low');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setShowTypeDropdown(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRemove = (id: number) => {
        setSavedProperties(savedProperties.filter(p => p.id !== id));
    };

    return (
        <PageContainer maxWidth="lg">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Saved Properties
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                        You have {savedProperties.length} saved homes.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Filter: Type */}
                    <div className="relative group" ref={typeDropdownRef}>
                        <button
                            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            Type: {typeFilter === 'all' ? 'All' : typeFilter}
                            <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                        </button>
                        {showTypeDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {['all', 'FOR RENT', 'FOR SALE'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(type);
                                            setShowTypeDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${typeFilter === type ? 'text-[#137fec] font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {type === 'all' ? 'All Types' : type}
                                        {typeFilter === type && (
                                            <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Sort */}
                    <div className="relative group" ref={sortDropdownRef}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            Sort: {sortBy === 'price-low' ? 'Price (Low to High)' : sortBy === 'price-high' ? 'Price (High to Low)' : 'Newest'}
                            <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                        </button>
                        {showSortDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {[{ id: 'price-low', label: 'Price (Low to High)' }, { id: 'price-high', label: 'Price (High to Low)' }, { id: 'newest', label: 'Newest' }].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${sortBy === option.id ? 'text-[#137fec] font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {option.label}
                                        {sortBy === option.id && (
                                            <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
                    {/* View Toggle */}
                    <ViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* Conditional Content Based on View Mode */}
            {
                viewMode === 'grid' ? (
                    /* ===== GRID VIEW ===== */
                    <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" stagger={0.06}>
                        {savedProperties.map((property) => (
                            <div key={property.id} className="group bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-[#137fec]/30 transition-all duration-300 flex flex-col">
                                {/* Image with overlays */}
                                <div className="relative w-full h-48 shrink-0 overflow-hidden">
                                    <img
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={property.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                    {/* Verified Badge */}
                                    {property.isVerified && (
                                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            Verified
                                        </div>
                                    )}
                                    {/* Favorite Button */}
                                    <button className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur size-9 rounded-full text-red-500 hover:bg-white transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                    </button>
                                    {/* Type Badge and Price Overlay */}
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <p className="text-[10px] font-bold bg-[#137fec]/90 px-2 py-0.5 rounded mb-1 w-fit">{property.type}</p>
                                        <h3 className="text-lg font-bold text-white shadow-sm">{property.price}<span className="text-xs font-normal opacity-90 ml-1">{property.period}</span></h3>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="mb-2">
                                        <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{property.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {property.location}
                                        </p>
                                    </div>
                                    {/* Property Specs */}
                                    <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 font-medium py-2 border-t border-slate-100 dark:border-slate-800 w-full mb-2">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[16px]">bed</span>
                                            <span>{property.beds}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[16px]">bathtub</span>
                                            <span>{property.baths}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[16px]">square_foot</span>
                                            <span>{property.sqft}</span>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="mt-auto flex gap-2">
                                        <Link
                                            to={`/property/${property.id}`}
                                            className="flex-1 py-1.5 bg-[#137fec]/10 hover:bg-[#137fec]/20 text-[#137fec] rounded-lg font-semibold text-sm transition-colors text-center"
                                        >
                                            View Details
                                        </Link>
                                        <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-[#137fec] hover:border-[#137fec] transition-colors" title="Share">
                                            <span className="material-symbols-outlined text-[18px]">share</span>
                                        </button>
                                        <button
                                            onClick={() => handleRemove(property.id)}
                                            className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / CTA Card - Grid */}
                        <Link
                            to="/search"
                            className="group bg-slate-50 dark:bg-[#101922]/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#137fec]/50 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-4 min-h-[380px] h-full"
                        >
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shrink-0">
                                <span className="material-symbols-outlined text-3xl">add_home</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Looking for more?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-[200px] mx-auto">Continue your search to find the perfect verified rental property.</p>
                                <span className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[#137fec] text-sm font-bold shadow-sm hover:shadow-md transition-all">
                                    Explore Properties
                                </span>
                            </div>
                        </Link>
                    </AnimatedGroup>
                ) : (
                    /* ===== LIST VIEW ===== */
                    <AnimatedGroup className="flex flex-col gap-4" stagger={0.05}>
                        {savedProperties.map((property) => (
                            <div key={property.id} className="group bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-[#137fec]/30 transition-all duration-300 flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="relative w-full md:w-80 h-56 md:h-auto shrink-0 overflow-hidden">
                                    <img
                                        alt={property.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={property.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                                    {/* Verified Badge */}
                                    {property.isVerified && (
                                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            Verified
                                        </div>
                                    )}
                                    {/* Type Badge */}
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-[10px] font-bold bg-[#137fec]/90 text-white px-2 py-0.5 rounded shadow-sm">{property.type}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                                    <div className="mb-3">
                                        <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-1 line-clamp-1">{property.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            {property.location}
                                        </p>
                                    </div>
                                    {/* Property Specs - Pill Style */}
                                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">bed</span>
                                            <span>{property.beds}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">bathtub</span>
                                            <span>{property.baths}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">square_foot</span>
                                            <span>{property.sqft}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Panel */}
                                <div className="p-5 md:p-6 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 min-w-[240px] bg-slate-50/30 dark:bg-slate-800/20">
                                    <div className="text-right">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{property.price}<span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">{property.period}</span></h3>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{property.availability}</p>
                                    </div>
                                    <div className="flex items-center gap-2 md:mt-auto">
                                        <Link
                                            to={`/property/${property.id}`}
                                            className="px-4 py-2 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                                        >
                                            View Details
                                        </Link>
                                        <div className="flex items-center gap-1">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Share">
                                                <span className="material-symbols-outlined text-[20px]">share</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemove(property.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / CTA Card - List */}
                        <Link
                            to="/search"
                            className="group bg-slate-50 dark:bg-[#101922]/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#137fec]/50 transition-all duration-300 flex flex-col md:flex-row items-center justify-between p-6 gap-6"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shrink-0">
                                    <span className="material-symbols-outlined text-3xl">add_home</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Looking for more?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[300px]">Continue your search to find the perfect verified rental property.</p>
                                </div>
                            </div>
                            <span className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[#137fec] text-sm font-bold shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                Explore Properties
                            </span>
                        </Link>
                    </AnimatedGroup>
                )
            }
        </PageContainer >
    );
}
