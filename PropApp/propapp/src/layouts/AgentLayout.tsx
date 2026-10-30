import { Link, Outlet } from 'react-router-dom';
import Logo from '@/components/common/Logo';

export default function AgentLayout() {
    return (
        <>
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden">
                {/* Logo - positioned top left with Agent branding */}
                <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 h-10">
                        <Logo wordmark="md" />
                        <span className="hidden md:inline text-xs font-semibold uppercase tracking-[0.04em] text-brand-ink">Agent</span>
                    </Link>
                </div>

                {/* Navbar is now rendered at App level */}

                {/* Main Content */}
                <main className="flex-1 pt-24 z-[10]">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
