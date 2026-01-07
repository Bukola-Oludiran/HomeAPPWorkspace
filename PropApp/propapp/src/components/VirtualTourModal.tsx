import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface VirtualTourModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        name: string;
        address: string;
        image: string;
        tourImage?: string;
    };
    agent?: {
        name: string;
        image: string;
    };
}

export default function VirtualTourModal({ isOpen, onClose, property, agent }: VirtualTourModalProps) {
    const [activeView, setActiveView] = useState<'tour' | 'dollhouse' | 'floorplan'>('tour');

    if (!isOpen) return null;

    const tourImage = property.tourImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3TgH99u5Zeb3e1MXfDoRdzyoPziNbeeBup5_vcmbfY_tbwAMRRXJ_lRSVukTaatQRd4T2V5mYZqCDynjzP57yxCzLgwm74j3Tfw8LSF-2cOb0aD1_bXTWar8Lv5y0GwXzkIFa2WPoQM-tksIoU4Sm0LcLENNvPcKVQjJH29uiEUHx6_4BGrOHW5aIqPuMj735psbnc6ZcuCOWHHJwzBzZM8ELRCAxONgp6rVFxwIUAVg21KXa6jpq_r5JXwiNJKP4HukzSCsJVpV';

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-6 animate-fade-in">
                <div className="w-full h-full max-w-[1400px] bg-white dark:bg-[#101922] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200 dark:border-slate-800">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922] z-20 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#137fec] text-2xl">view_in_ar</span>
                            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">3D Virtual Tour of {property.address}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 md:size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-xl md:text-2xl">close</span>
                        </button>
                    </div>

                    {/* Tour Content */}
                    <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden group">
                        <img
                            alt="3D Tour Interior View"
                            className="w-full h-full object-cover"
                            src={tourImage}
                        />

                        {/* 360 Indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-white/50 bg-black/20 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                            <span className="material-symbols-outlined text-white text-3xl opacity-80">360</span>
                        </div>

                        {/* Interactive Hotspots */}
                        <div className="absolute top-[60%] left-[30%] size-8 rounded-full bg-white/20 border-2 border-white hover:bg-white/40 cursor-pointer transition-colors shadow-lg shadow-black/20 group/hotspot">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/hotspot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Kitchen</div>
                        </div>
                        <div className="absolute top-[55%] right-[25%] size-8 rounded-full bg-white/20 border-2 border-white hover:bg-white/40 cursor-pointer transition-colors shadow-lg shadow-black/20 group/hotspot">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/hotspot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Living Area</div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 p-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-2xl z-30">
                            <button
                                onClick={() => setActiveView('dollhouse')}
                                className={`p-2 md:p-2.5 rounded-full transition-colors relative group ${activeView === 'dollhouse' ? 'text-white bg-white/30' : 'text-white/90 hover:text-white hover:bg-white/20'}`}
                                title="Dollhouse View"
                            >
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">holiday_village</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dollhouse</span>
                            </button>
                            <button
                                onClick={() => setActiveView('floorplan')}
                                className={`p-2 md:p-2.5 rounded-full transition-colors relative group ${activeView === 'floorplan' ? 'text-white bg-white/30' : 'text-white/90 hover:text-white hover:bg-white/20'}`}
                                title="Floor Plan"
                            >
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">layers</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Floor Plan</span>
                            </button>
                            <button className="p-2 md:p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-colors relative group" title="Measurement">
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">straighten</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Measure</span>
                            </button>
                            <div className="w-px h-6 bg-white/20 mx-1"></div>
                            <button className="p-2 md:p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-colors relative group" title="Share Tour">
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">share</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Share</span>
                            </button>
                            <button className="p-2 md:p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-colors relative group" title="Fullscreen">
                                <span className="material-symbols-outlined text-[20px] md:text-[24px]">fullscreen</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Fullscreen</span>
                            </button>
                        </div>

                        {/* Agent Badge */}
                        {agent && (
                            <div className="absolute bottom-8 left-6 hidden md:flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg z-30">
                                <img
                                    alt={agent.name}
                                    className="size-10 rounded-full object-cover border border-white dark:border-slate-700"
                                    src={agent.image}
                                />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Listing Agent</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{agent.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Mobile Address Badge */}
                        <div className="absolute top-4 left-4 md:hidden bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium z-30">
                            {property.address}
                        </div>
                    </div>
                </div>

                <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
            </div>
        </ModalPortal>
    );
}
