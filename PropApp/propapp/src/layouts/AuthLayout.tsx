import { Outlet, Link } from 'react-router-dom';
import heroVideo from '@/assets/HeroSectionVideo.mp4';
import Logo from '@/components/common/Logo';

export default function AuthLayout() {
    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-hidden relative">
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
                <div className="absolute inset-0 bg-slate-900/30 dark:bg-canvas-dark/35"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
                {/* Logo - Top Left, on a surface badge because it sits over the hero video */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3">
                    <Link to="/" className="flex items-center rounded-lg bg-white/95 dark:bg-surface-dark/95 px-3.5 py-2.5">
                        <Logo />
                    </Link>
                </div>

                {/* Auth Content (Outlet for nested routes) */}
                <Outlet />

                {/* AI Helper Widget - Bottom Right */}
                <div className="absolute bottom-8 right-6 md:right-10 flex items-center justify-end">
                    <div className="group flex items-center gap-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full pl-4 pr-2 py-2 cursor-pointer transition-all">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 mr-2">Need help?</span>
                        <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md group-hover:bg-brand-ink/90">
                            <span className="material-symbols-outlined icon-filled text-[18px]">forum</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
