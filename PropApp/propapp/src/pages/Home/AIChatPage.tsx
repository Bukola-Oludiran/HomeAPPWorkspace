import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

// Mock chat history data
const chatHistory = {
    today: [
        { id: 1, title: 'Downtown Austin Apt', preview: "I'm looking for a modern 2-bedroom...", time: '10:24 AM', active: true },
        { id: 2, title: 'Lease Documents', preview: 'What documents do I need for...', time: '09:15 AM', active: false },
    ],
    yesterday: [
        { id: 3, title: 'Suburban Homes', preview: 'Show me houses with big backyards...', time: '4:30 PM', active: false },
    ],
    previousWeek: [
        { id: 4, title: 'Mortgage Rates', preview: 'Current 30-year fixed rates in Texas...', time: 'May 12', active: false },
        { id: 5, title: 'Investment ROI', preview: 'Calculate cap rate for a duplex...', time: 'May 10', active: false },
    ],
};

// Mock property cards
const propertyCards = [
    {
        id: 1,
        name: 'The Railyard Condos',
        address: '201 E 4th St, Austin, TX',
        price: '$2,450',
        priceUnit: '/mo',
        beds: 2,
        baths: 2,
        sqft: '1,100',
        badge: 'Verified',
        badgeColor: 'text-[#137fec]',
        badgeIcon: 'verified',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
    },
    {
        id: 2,
        name: 'Seaholm Residences',
        address: '222 West Ave, Austin, TX',
        price: '$2,600',
        priceUnit: '/mo',
        beds: 2,
        baths: 2,
        sqft: '1,250',
        badge: 'Featured',
        badgeColor: 'text-purple-600',
        badgeIcon: 'star',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
    },
];

export default function AIChatPage() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [message, setMessage] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-hidden relative">
            <ConfirmationModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={() => console.log('Conversation cleared')}
                title="Clear Conversation?"
                description="This will delete all messages in this conversation. This action cannot be undone."
                confirmText="Clear All"
                icon="delete"
            />
            {/* Logo */}
            <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3">
                    <div className="size-10 bg-[#137fec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
                        <span className="material-symbols-outlined">real_estate_agent</span>
                    </div>
                    <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                        PropertyApp
                    </h2>
                </Link>
            </div>

            {/* Header Navbar */}
            <header className="fixed top-6 left-0 right-0 z-40 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 rounded-full mx-4">
                    <div className="flex items-center gap-1">
                        <Link to="/" aria-label="Home" className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">home</span>
                        </Link>
                        <Link to="/search?type=buy" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Buy
                        </Link>
                        <Link to="/search?type=rent" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Rent
                        </Link>
                        <Link to="/search?type=sell" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Sell
                        </Link>
                        <Link to="/ai-chat" aria-label="AI Chat" className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </Link>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center justify-center overflow-hidden rounded-full size-10 md:size-11 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:ring-2 hover:ring-[#137fec]/20 transition-all border border-slate-200 dark:border-slate-600"
                            >
                                <span className="material-symbols-outlined">account_circle</span>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 py-2 bg-white dark:bg-slate-800 min-w-[200px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] z-50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Link to="/landlord/dashboard" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            Landlord Dashboard
                                        </div>
                                    </Link>
                                    <Link to="/tenant/dashboard" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">vpn_key</span>
                                            Tenant Dashboard
                                        </div>
                                    </Link>
                                    <Link to="/agent/jobs" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">support_agent</span>
                                            Agent Dashboard
                                        </div>
                                    </Link>
                                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                    <Link to="/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Account Settings
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-24 pb-4 md:pb-6 px-4 md:px-6 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex gap-4 md:gap-6 w-full max-w-[95rem] mx-auto overflow-hidden">
                    {/* Sidebar */}
                    {showSidebar && (
                        <aside className="hidden md:flex w-80 flex-col bg-white dark:bg-[#1a2632] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 animate-fade-in-up">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a2632] z-10">
                                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Chat History</h2>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    title="Close Sidebar"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                {/* Search */}
                                <div className="relative mb-4 px-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none transition-all dark:text-white placeholder:text-slate-400 font-medium"
                                        placeholder="Search chats..."
                                        type="text"
                                    />
                                </div>
                                {/* Today */}
                                <div className="mb-6">
                                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Today</h3>
                                    <div className="space-y-1">
                                        {chatHistory.today.map((chat) => (
                                            <button
                                                key={chat.id}
                                                className={`w-full text-left p-3 rounded-xl transition-all ${chat.active
                                                    ? 'bg-[#137fec] text-white shadow-md shadow-[#137fec]/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-bold text-sm truncate pr-2 ${chat.active ? '' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {chat.title}
                                                    </span>
                                                    <span className={`text-[10px] whitespace-nowrap ${chat.active ? 'opacity-80' : 'text-slate-400'}`}>
                                                        {chat.time}
                                                    </span>
                                                </div>
                                                <p className={`text-xs truncate ${chat.active ? 'opacity-90 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {chat.preview}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Yesterday */}
                                <div className="mb-6">
                                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Yesterday</h3>
                                    <div className="space-y-1">
                                        {chatHistory.yesterday.map((chat) => (
                                            <button
                                                key={chat.id}
                                                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate pr-2">{chat.title}</span>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.preview}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Previous 7 Days */}
                                <div>
                                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Previous 7 Days</h3>
                                    <div className="space-y-1">
                                        {chatHistory.previousWeek.map((chat) => (
                                            <button
                                                key={chat.id}
                                                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate pr-2">{chat.title}</span>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.preview}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Sidebar Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 shrink-0">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                                                <span className="material-symbols-outlined text-lg">psychology</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Persona</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Agent</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                <span className="material-symbols-outlined text-lg">tune</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Context</span>
                                        </div>
                                        <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-emerald-500 focus:outline-none">
                                            <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowClearModal(true)}
                                        className="w-full flex items-center justify-center gap-2 mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                        Clear Conversation
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Chat Container */}
                    <div className={`flex-1 bg-white dark:bg-[#1a2632] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col ${showSidebar ? 'w-full' : 'max-w-5xl mx-auto w-full'} overflow-hidden relative`}>
                        {/* Floating Sidebar Toggle */}
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`absolute top-4 left-4 z-20 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 ${showSidebar
                                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                                }`}
                            title="Toggle Sidebar"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth custom-scrollbar">
                            {/* Date Divider */}
                            <div className="flex justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Today</span>
                            </div>

                            {/* User Message */}
                            <div className="flex justify-end animate-fade-in-up">
                                <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%]">
                                    <div className="bg-[#137fec] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
                                        <p className="text-sm md:text-base leading-relaxed">I'm looking for a modern 2-bedroom apartment in Downtown Austin. Budget is around $2,500/mo.</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mr-1">10:23 AM</span>
                                </div>
                            </div>

                            {/* AI Response with Property Cards */}
                            <div className="flex gap-4 max-w-[95%] md:max-w-[85%] animate-fade-in-up">
                                <div className="size-8 md:size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mt-1">
                                    <span className="material-symbols-outlined text-base md:text-lg icon-filled">smart_toy</span>
                                </div>
                                <div className="flex flex-col gap-1 w-full overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm text-slate-700 dark:text-slate-200">
                                        <p className="text-sm md:text-base leading-relaxed">
                                            I found several verified listings in <span className="font-semibold text-slate-900 dark:text-white">Downtown Austin</span> that match your criteria. Here are the top matches available now:
                                        </p>
                                    </div>
                                    {/* Property Cards */}
                                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-1 px-1 snap-x no-scrollbar">
                                        {propertyCards.map((property) => (
                                            <div key={property.id} className="snap-center shrink-0 w-[280px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                                <div className="h-40 bg-slate-200 relative overflow-hidden">
                                                    <img
                                                        alt={property.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        src={property.image}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                                    <span className={`absolute top-3 left-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold ${property.badgeColor} flex items-center gap-1 shadow-sm`}>
                                                        <span className="material-symbols-outlined text-[12px] icon-filled">{property.badgeIcon}</span>
                                                        {property.badge}
                                                    </span>
                                                    <div className="absolute bottom-3 left-3 text-white">
                                                        <p className="font-bold text-lg">{property.price}<span className="text-xs font-normal opacity-80">{property.priceUnit}</span></p>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{property.name}</h3>
                                                    <p className="text-xs text-slate-500 truncate mb-3">{property.address}</p>
                                                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bed</span> {property.beds} Bed</span>
                                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bathtub</span> {property.baths} Bath</span>
                                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">square_foot</span> {property.sqft}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#137fec] hover:text-[#137fec] transition-colors shadow-sm">
                                            Schedule a viewing
                                        </button>
                                        <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#137fec] hover:text-[#137fec] transition-colors shadow-sm">
                                            Compare amenities
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 ml-1 mt-1">HomeAI Assistant • 10:24 AM</span>
                                </div>
                            </div>

                            {/* User Follow-up */}
                            <div className="flex justify-end animate-fade-in-up">
                                <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%]">
                                    <div className="bg-[#137fec] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
                                        <p className="text-sm md:text-base leading-relaxed">What documents do I need to apply for the Railyard one?</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mr-1">10:25 AM</span>
                                </div>
                            </div>

                            {/* AI Typing Indicator */}
                            <div className="flex gap-4 animate-fade-in-up">
                                <div className="size-8 md:size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mt-1">
                                    <span className="material-symbols-outlined text-base md:text-lg icon-filled">smart_toy</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm h-12 flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Minimal Input Area */}
                        <div className="p-3 md:p-4 bg-white/80 dark:bg-[#1a2632]/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shrink-0 z-20">
                            <div className="relative max-w-3xl mx-auto w-full">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#137fec]/20 focus-within:border-[#137fec] transition-all">
                                    <textarea
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 py-1 resize-none max-h-24 text-sm"
                                        placeholder="Ask anything about properties..."
                                        rows={1}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <button className="p-1.5 text-slate-400 hover:text-[#137fec] transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800" title="Voice Input">
                                        <span className="material-symbols-outlined text-xl">mic</span>
                                    </button>
                                    <button className="p-2 bg-[#137fec] text-white rounded-full shadow-md shadow-[#137fec]/20 hover:bg-[#137fec]/90 transition-all flex items-center justify-center">
                                        <span className="material-symbols-outlined icon-filled text-lg">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
