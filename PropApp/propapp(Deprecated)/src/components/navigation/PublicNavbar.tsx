import { Link } from 'react-router-dom'

interface PublicNavbarProps {
    user?: {
        name: string
        avatar?: string
    }
}

export function PublicNavbar({ user }: PublicNavbarProps) {

    const navItems = [
        { label: 'Buy', href: '/search?type=buy' },
        { label: 'Rent', href: '/search?type=rent' },
        { label: 'Sell', href: '/landlord/properties/new' },
    ]

    return (
        <>
            {/* Logo - Fixed top left */}
            <div className="fixed top-6 left-6 md:left-10 z-50 flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">real_estate_agent</span>
                    </div>
                    <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                        PropertyApp
                    </h2>
                </Link>
            </div>

            {/* Floating Nav Pill */}
            <header className="fixed top-6 left-0 right-0 z-40 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 rounded-full mx-4">
                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        <Link
                            to="/"
                            aria-label="Home"
                            className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">home</span>
                        </Link>

                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            to="/agents"
                            aria-label="Agents"
                            className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">group</span>
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <button className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>

                        {/* User dropdown */}
                        <div className="relative group">
                            <button className="flex items-center justify-center overflow-hidden rounded-full size-10 md:size-11 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:ring-2 hover:ring-primary/20 transition-all border border-slate-200 dark:border-slate-600">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined">account_circle</span>
                                )}
                            </button>

                            {/* Dropdown */}
                            <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-[200px] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                <Link
                                    to="/landlord"
                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">dashboard</span>
                                        Landlord Dashboard
                                    </div>
                                </Link>
                                <Link
                                    to="/tenant"
                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">vpn_key</span>
                                        Tenant Dashboard
                                    </div>
                                </Link>
                                <Link
                                    to="/agent"
                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">support_agent</span>
                                        Agent Dashboard
                                    </div>
                                </Link>
                                <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                <Link
                                    to="/settings"
                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">settings</span>
                                        Account Settings
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
