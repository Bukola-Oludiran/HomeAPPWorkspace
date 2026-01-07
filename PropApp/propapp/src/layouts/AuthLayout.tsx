import { Outlet, Link } from 'react-router-dom';
import heroVideo from '@/assets/HeroSectionVideo.mp4';

export default function AuthLayout() {
    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-hidden relative">
            {/* Video Background with blur overlay */}
            <div className="absolute inset-0 z-0">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={heroVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {/* Gradient overlay with blur - very light for maximum brightness */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/20 dark:from-[#101922]/45 dark:via-[#101922]/35 dark:to-[#101922]/25 backdrop-blur-[1px]"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
                {/* PropertyApp Logo - Top Left */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-10 bg-[#137fec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
                            <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">PropertyApp</h2>
                    </Link>
                </div>

                {/* Auth Content (Outlet for nested routes) */}
                <Outlet />

                {/* AI Helper Widget - Bottom Right */}
                <div className="absolute bottom-8 right-6 md:right-10 flex items-center justify-end">
                    <div className="group flex items-center gap-3 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full pl-4 pr-2 py-2 cursor-pointer hover:scale-105 transition-all">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 mr-2">Need help?</span>
                        <div className="size-8 rounded-full bg-[#137fec] flex items-center justify-center text-white shadow-md group-hover:bg-[#137fec]/90">
                            <span className="material-symbols-outlined icon-filled text-[18px]">smart_toy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
