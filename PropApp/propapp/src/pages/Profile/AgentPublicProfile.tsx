import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShareModal from '../../components/ShareModal';
import ContactAgentModal from '../../components/ContactAgentModal';
import ReviewModal from '../../components/ReviewModal';

// Mock agent data
const agentData = {
    id: 'agent-1',
    name: 'Alex Johnson',
    title: 'Senior Maintenance Agent',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqXdl37sfEazlyxSBTV5lF8kGRieE_SYwtDyVySc1aWbjBke5mu8mh567-fZNihR7nyy7Nfe4SYcazxMiKGgNKSeL-pK6TTSI0rcTQ7dbJIQKnzeNyA5B8mtOx-6qYJZAofjSjdD8ldObnUD1GG6Bhtge7vN74aD4o-lYTQsnW57HV4JVB1KwsSZjj0-u_ihV37S1T2wUzJ4OUpL_J-KaQoB-x1dKtj4hswAcNfkWRrd6qvgWhIynlCNRWBdnV8D3xputK0iKXBrm9',
    verified: true,
    rating: 4.9,
    jobsDone: 124,
    email: 'alex.j@propertyapp.com',
    phone: '+234 801 234 5678',
    available: true,
    about: `I am a dedicated Senior Maintenance Agent specializing in residential and commercial property upkeep. With over 8 years of experience in HVAC systems, electrical troubleshooting, and general facility repairs, I ensure that all maintenance requests are handled promptly and professionally. 
    
My goal is to provide peace of mind to landlords and tenants alike through reliable service, transparent communication, and high-quality workmanship. I am fully licensed and insured, committed to safety standards and efficient problem-solving.`,
    certifications: [
        { name: 'HVAC Technician License', issuer: 'State Board', status: 'Active', expiry: 'Oct 2025' },
        { name: 'Certified Property Manager', issuer: 'National Assoc.', status: 'Active', expiry: 'No Expiration' },
    ],
    serviceAreas: ['Lekki Phase 1', 'Victoria Island', 'Ikoyi'],
    baseLocation: 'Lekki Phase 1',
    reviews: [
        {
            initials: 'EO',
            name: 'Emeka O.',
            date: '2 days ago',
            rating: 5,
            text: '"Alex was very professional and fixed the AC leak quickly. He explained what went wrong and how to prevent it. Highly recommended!"',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            initials: 'SK',
            name: 'Sarah K.',
            date: '1 week ago',
            rating: 4.5,
            text: '"Great service overall, arrived a bit late but did a fantastic job with the inspection. Very thorough report."',
            color: 'bg-pink-100 text-pink-600',
        },
    ],
};

export default function AgentPublicProfile() {
    const { id: _id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const agent = agentData;

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(<span key={i} className="material-symbols-outlined text-[16px] icon-filled">star</span>);
            } else if (i - rating < 1 && i - rating > 0) {
                stars.push(<span key={i} className="material-symbols-outlined text-[16px] icon-filled">star_half</span>);
            } else {
                stars.push(<span key={i} className="material-symbols-outlined text-[16px]">star</span>);
            }
        }
        return stars;
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-4 md:px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <Link to="/" className="size-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">engineering</span>
                    </Link>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                        PropertyApp <span className="text-slate-400 font-medium text-sm ml-1">Connect</span>
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link to="/search" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors">Find Agents</Link>
                        <Link to="/search" className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors">Properties</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1200px] w-full mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Agent Profile</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">View professional details, certifications, and reviews.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">share</span>
                                Share
                            </button>
                            <button
                                onClick={() => setShowContactModal(true)}
                                className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm transition-all shadow-lg shadow-[#137fec]/25 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Contact Agent
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#137fec]/10 to-blue-500/10 dark:from-[#137fec]/20 dark:to-blue-500/20"></div>
                                <div className="relative z-10 mb-4">
                                    <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-white dark:bg-[#101922]">
                                        <img alt="Profile" className="w-full h-full object-cover rounded-full" src={agent.image} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{agent.title}</p>
                                {agent.verified && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                        <span className="material-symbols-outlined text-[16px]">verified</span> Verified Agent
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                                            <span className="font-bold text-xl">{agent.rating}</span>
                                            <span className="material-symbols-outlined text-[20px] icon-filled">star</span>
                                        </div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Rating</p>
                                    </div>
                                    <div className="text-center border-l border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-white mb-1">
                                            <span className="font-bold text-xl">{agent.jobsDone}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">Jobs Done</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact Information</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{agent.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">phone</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{agent.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Availability</p>
                                            <p className={`text-sm font-medium ${agent.available ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                {agent.available ? 'Available for new jobs' : 'Currently busy'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                        Call Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* About */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">About {agent.name.split(' ')[0]}</h3>
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                    {agent.about}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 bg-orange-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-orange-600">
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certifications & Qualifications</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Verified credentials and licenses.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agent.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                                            <div className="size-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600 shadow-sm shrink-0">
                                                <span className="material-symbols-outlined text-green-600">verified</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cert.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issuing Authority: {cert.issuer}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{cert.status}</span>
                                                    <span className="text-[10px] text-slate-400">Exp: {cert.expiry}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Area */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 bg-purple-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined">map</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Area</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Locations covered by this agent.</p>
                                    </div>
                                </div>
                                <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <div className="size-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-[#137fec]">
                                            <span className="material-symbols-outlined icon-filled text-[20px]">location_on</span>
                                        </div>
                                        <span className="text-xs font-bold bg-white/90 dark:bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-600">Base: {agent.baseLocation}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Primary Locations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.serviceAreas.map((area, index) => (
                                            <div key={index} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
                                                <span className="material-symbols-outlined text-[16px] text-slate-400">near_me</span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{area}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-yellow-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-yellow-600">
                                            <span className="material-symbols-outlined">reviews</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Client Reviews</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Recent feedback from verified clients.</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{agent.rating}<span className="text-slate-400 text-lg font-normal">/5</span></div>
                                        <p className="text-xs text-slate-500">Based on {agent.jobsDone} reviews</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agent.reviews.map((review, index) => (
                                        <div key={index} className="p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-8 rounded-full ${review.color} flex items-center justify-center font-bold text-xs`}>{review.initials}</div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{review.name}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">{review.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2 text-yellow-500">
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Write a review
                                </button>
                                <button className="w-full mt-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    Read all {agent.jobsDone} reviews
                                </button>
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
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Agent Evaluator</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Assistant</p>
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
                                    <p className="text-sm text-slate-700 dark:text-slate-300">Hi! I can help you evaluate {agent.name}. Would you like to know if their certifications are valid for your specific maintenance needs or compare their ratings to other agents?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested questions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Compare ratings
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Verify license
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Check availability
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#101922] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about this agent..." type="text" />
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
                        <span className="text-sm font-bold leading-none">Agent Assistant...</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click for insights</span>
                    </div>
                </button>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={`${agent.name} - ${agent.title} | PropertyApp`}
                url={window.location.href}
            />

            {/* Contact Agent Modal */}
            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agent={{
                    name: agent.name,
                    title: agent.title,
                    image: agent.image,
                }}
            />

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                recipient={{
                    name: agent.name,
                    type: 'agent',
                    image: agent.image,
                }}
            />
        </div>
    );
}
