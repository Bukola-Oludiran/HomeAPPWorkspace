import { Link, Outlet } from 'react-router-dom';

export default function AgentLayout() {
    return (
        <>
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden">
                {/* Logo - positioned top left with Agent branding */}
                <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="size-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-sm">
                            <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <div className="hidden md:flex flex-col">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                                HomeAI
                            </h2>
                            <span className="text-xs text-brand font-semibold">Agent Portal</span>
                        </div>
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
