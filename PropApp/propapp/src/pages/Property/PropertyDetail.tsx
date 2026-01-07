import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ScheduleViewingModal from '../../components/ScheduleViewingModal';
import VirtualTourModal from '../../components/VirtualTourModal';
import PhotoGalleryModal from '../../components/PhotoGalleryModal';
import BuyFlowModal from '../../components/BuyFlowModal';
import ShareModal from '../../components/ShareModal';
import ContactAgentModal from '../../components/ContactAgentModal';
import FavoriteButton from '../../components/FavoriteButton';

// Mock property data
const propertyData = {
    id: 1,
    name: 'Modern Oakwood Estate',
    address: '1243 Oakwood Avenue, Austin, TX 78704',
    neighborhood: 'Travis Heights Neighborhood',
    price: '$850,000',
    mortgageEstimate: '$4,800/mo',
    type: 'For Sale',
    listedDays: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    beds: 4,
    baths: 3,
    sqft: '2,400',
    yearBuilt: 2021,
    verified: 'Platinum Verified',
    photoCount: 12,
    description: `Stunning modern estate located in the heart of Austin's most desirable neighborhood. This architectural masterpiece features floor-to-ceiling windows that flood the open-concept living space with natural light. The gourmet kitchen is equipped with top-of-the-line appliances and a massive quartz island, perfect for entertaining.

Retreat to the luxurious primary suite with a spa-like bathroom and walk-in closet. The backyard is a private oasis with a sparkling pool, outdoor kitchen, and manicured landscaping. Smart home technology is integrated throughout, offering convenience and security at your fingertips.`,
    agent: {
        name: 'Sarah Jenkins',
        title: 'Senior Agent @ LuxRealty',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjSrFpmEFzY7DuSYzvGMyJ6_AbhHnvodMyset9lUUft__qqjtpv9mHHcZ_G89QxFqf2R2dKoTB_fJz4U92uCsFUL3184Bj0EySgXTcecuQVsdTPcTR-TEh34WNcFyDdaft0v9SsIZVgNjqHkcAVrUnkmB4ERkwtSLbgbP8lvDFna76LCjamOuHb71kIA10Hd2U-QwIyYE8BfDzezNODnKbjf1aE1aWwURtZm-0bYkj-A3IN-FzxBdGE2Vxyue4rROjFp2w4T6q4RmT',
        verified: true,
        responseRate: '100%',
        responseTime: '1 hr',
    },
    aiInsights: [
        {
            icon: 'trending_up',
            iconColor: 'text-green-500',
            title: 'Great Investment:',
            text: 'This area has seen a 12% property value increase over the last year, outperforming the city average.',
        },
        {
            icon: 'wb_sunny',
            iconColor: 'text-blue-500',
            title: 'Natural Light:',
            text: 'Based on orientation and window placement, this home receives excellent morning sunlight in the kitchen and living areas.',
        },
        {
            icon: 'school',
            iconColor: 'text-orange-500',
            title: 'Top Schools:',
            text: 'Located within the catchment area for 9/10 rated elementary and high schools.',
        },
    ],
};

export default function PropertyDetail() {
    const { id: _id } = useParams();
    const [isFavorited, setIsFavorited] = useState(true);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showViewingModal, setShowViewingModal] = useState(false);
    const [showTourModal, setShowTourModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // In a real app, fetch property data based on id
    const property = propertyData;

    // Mock gallery images
    const galleryImages = [
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
        property.image,
    ];

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Floating Header (No navbar per design) */}
            <header className="fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-none">
                <div className="px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link
                        to="/search"
                        className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors pointer-events-auto text-slate-900 dark:text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">share</span>
                        </button>
                        <FavoriteButton
                            propertyId={property.id}
                            initialFavorited={isFavorited}
                            variant="overlay"
                            onToggle={(favorited) => setIsFavorited(favorited)}
                        />
                    </div>
                </div>
            </header>

            {/* Hero Image Gallery */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <img
                    alt={`${property.name} large windows`}
                    className="w-full h-full object-cover"
                    src={property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
                {/* Image Pagination Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                </div>
                {/* Action Buttons */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                    <button
                        onClick={() => setShowTourModal(true)}
                        className="px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white justify-center"
                    >
                        <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                        3D Tour
                    </button>
                    <button
                        onClick={() => setShowGalleryModal(true)}
                        className="px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white justify-center"
                    >
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                        View all {property.photoCount} photos
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column - Property Details */}
                    <div className="flex-1 min-w-0">
                        {/* Property Header */}
                        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-md">
                                            {property.type}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                                            Listed {property.listedDays} days ago
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {property.name}
                                    </h1>
                                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[20px] mr-1.5">
                                            location_on
                                        </span>
                                        <p className="text-lg">{property.address}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#137fec]">
                                        {property.price}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Est. {property.mortgageEstimate} mortgage
                                    </p>
                                </div>
                            </div>
                            {/* Verification Badges */}
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <div className="group relative cursor-pointer">
                                    <div className="bg-gradient-to-r from-slate-200 via-white to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 text-slate-900 dark:text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-slate-300 dark:border-slate-500">
                                        <span className="material-symbols-outlined text-[20px] icon-filled text-[#137fec]">
                                            verified
                                        </span>
                                        PLATINUM VERIFIED
                                        <span className="material-symbols-outlined text-[16px] text-slate-500 ml-1">
                                            info
                                        </span>
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl">
                                        <p className="font-bold mb-1">Platinum Verification</p>
                                        <p>
                                            This property has passed our most rigorous in-person inspection, legal title
                                            check, and owner identity verification.
                                        </p>
                                        <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                        check_circle
                                    </span>
                                    Title Clear
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                        check_circle
                                    </span>
                                    In-Person Inspection
                                </div>
                            </div>
                        </div>

                        {/* Property Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">bed</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.beds}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Bedrooms</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    bathtub
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.baths}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Bathrooms</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    square_foot
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.sqft}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Sq Ft</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    calendar_month
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.yearBuilt}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Year Built</span>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                About this home
                            </h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                {property.description.split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                            <button className="mt-4 text-[#137fec] font-semibold flex items-center gap-1 hover:underline">
                                Read more{' '}
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                        </div>

                        {/* AI Property Analysis */}
                        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-[#137fec] flex items-center justify-center text-white shadow-lg shadow-[#137fec]/30">
                                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    AI Property Analysis
                                </h3>
                            </div>
                            <ul className="space-y-3">
                                {property.aiInsights.map((insight, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                                    >
                                        <span
                                            className={`material-symbols-outlined ${insight.iconColor} text-[20px] mt-0.5`}
                                        >
                                            {insight.icon}
                                        </span>
                                        <span>
                                            <strong>{insight.title}</strong> {insight.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Location Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Location</h3>
                            <div className="w-full h-64 rounded-xl bg-slate-200 dark:bg-slate-700 relative overflow-hidden group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-300 dark:bg-slate-600">
                                    <div className="absolute top-0 left-0 right-0 h-full w-full opacity-30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500">
                                        map
                                    </span>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 bg-[#137fec]/20 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="size-4 bg-[#137fec] rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-semibold hover:scale-105 transition-transform">
                                    Explore Map
                                </button>
                            </div>
                            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
                                Austin, TX 78704 - {property.neighborhood}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Agent Card (Desktop only) */}
                    <div className="hidden lg:block w-[360px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            alt="Agent Profile"
                                            className="size-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-600"
                                            src={property.agent.image}
                                        />
                                        <span className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                            {property.agent.name}
                                        </h4>
                                        <p className="text-slate-500 text-sm">{property.agent.title}</p>
                                        {property.agent.verified && (
                                            <div className="flex items-center gap-1 text-xs font-semibold text-[#137fec] mt-1">
                                                <span className="material-symbols-outlined text-[14px] icon-filled">
                                                    verified
                                                </span>
                                                Verified Agent
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-3">
                                    Message Host
                                </button>
                                <div className="text-center text-xs text-slate-400">
                                    Response rate: {property.agent.responseRate} • Responds within{' '}
                                    {property.agent.responseTime}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto [box-shadow:0_0_15px_rgba(19,127,236,0.4)] transition-all hover:scale-[1.01]">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Ask me about the neighborhood safety, schools, or financing options...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                            mic
                        </span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                            Price
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {property.price}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowViewingModal(true)}
                            className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border-2 border-[#137fec] text-[#137fec] font-bold hover:bg-blue-50 dark:hover:bg-[#137fec]/10 transition-colors whitespace-nowrap"
                        >
                            Schedule Viewing
                        </button>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-[#137fec] text-white font-bold hover:bg-[#0e64bd] transition-colors shadow-lg shadow-[#137fec]/25 whitespace-nowrap"
                        >
                            Buy Now / Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Buy Flow Modal */}
            <BuyFlowModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                property={{
                    name: property.name,
                    address: property.address,
                    image: property.image,
                    listingPrice: 850000,
                }}
            />

            {/* Schedule Viewing Modal */}
            <ScheduleViewingModal
                isOpen={showViewingModal}
                onClose={() => setShowViewingModal(false)}
                property={{
                    name: property.name,
                    address: property.address,
                    image: property.image,
                }}
            />

            {/* Virtual Tour Modal */}
            <VirtualTourModal
                isOpen={showTourModal}
                onClose={() => setShowTourModal(false)}
                property={{
                    name: property.name,
                    address: property.address,
                    image: property.image,
                }}
                agent={{
                    name: property.agent.name,
                    image: property.agent.image,
                }}
            />

            {/* Photo Gallery Modal */}
            <PhotoGalleryModal
                isOpen={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                property={{
                    name: property.name,
                    address: property.address,
                }}
                images={galleryImages}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={`${property.name} - ${property.beds} bed, ${property.baths} bath • ${property.sqft} sqft • ${property.price}`}
                url={window.location.href}
            />

            {/* Contact Agent Modal */}
            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agent={{
                    name: property.agent.name,
                    title: property.agent.title,
                    image: property.agent.image,
                }}
                property={{
                    name: property.name,
                    address: property.address,
                }}
            />
        </div>
    );
}
