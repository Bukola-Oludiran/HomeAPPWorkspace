import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '@/components/common/Logo';

export default function TenantLayout() {
    const location = useLocation();

    // Hide logo on detail pages (my-home, lease-details, etc.)
    const isDetailPage = location.pathname === '/tenant/my-home' || location.pathname === '/tenant/lease-details';

    return (
        <>
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden">
                {/* Logo - positioned top left (hidden on detail pages) */}
                {!isDetailPage && (
                    <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                        <Link to="/" className="flex items-center h-10">
                            <Logo wordmark="md" />
                        </Link>
                    </div>
                )}

                {/* Back button - shown on detail pages */}
                {isDetailPage && (
                    <div className="absolute top-6 left-6 md:left-10 z-40">
                        <Link
                            to="/tenant/dashboard"
                            className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                    </div>
                )}

                {/* Navbar is now rendered at App level */}

                {/* Main Content */}
                <main className={`flex-1 ${isDetailPage ? '' : 'pt-24'} z-[10]`}>
                    <Outlet />
                </main>
            </div>
        </>
    );
}
