import { Link, Outlet, useLocation } from 'react-router-dom';

export default function LandlordLayout() {
    const location = useLocation();

    // Hide logo on detail pages (property detail, lease agreement, applicant detail, etc.)
    const isDetailPage = location.pathname.includes('/landlord/properties/') ||
        location.pathname.includes('/landlord/leases/') ||
        location.pathname.includes('/landlord/applicants/');

    // Hide navbar padding on pages that have their own header (tasks, edit listing, edit lease)
    const hasOwnHeader = location.pathname.includes('/tasks') ||
        location.pathname.includes('/edit') ||
        (location.pathname.includes('/leases/') && location.pathname.endsWith('/edit'));

    return (
        <>
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden">
                {/* Logo - positioned top left (hidden on detail pages and pages with own header) */}
                {!isDetailPage && !hasOwnHeader && (
                    <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="size-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-sm">
                                <span className="material-symbols-outlined">real_estate_agent</span>
                            </div>
                            <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                                HomeAI
                            </h2>
                        </Link>
                    </div>
                )}

                {/* Back button - shown on detail pages but not on pages with own headers */}
                {isDetailPage && !hasOwnHeader && (
                    <div className="absolute top-6 left-6 md:left-10 z-40">
                        <Link
                            to="/landlord/dashboard"
                            className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                    </div>
                )}

                {/* Navbar is now rendered at App level */}

                {/* Main Content */}
                <main className={`flex-1 ${isDetailPage && !hasOwnHeader ? '' : hasOwnHeader ? '' : 'pt-24'} z-[10]`}>
                    <Outlet />
                </main>
            </div>
        </>
    );
}
