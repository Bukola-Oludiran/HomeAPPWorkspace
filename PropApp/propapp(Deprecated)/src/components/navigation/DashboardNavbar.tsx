import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface DashboardNavbarProps {
    variant: 'landlord' | 'tenant' | 'agent'
    user?: {
        name: string
        avatar?: string
    }
}

const navConfigs = {
    landlord: {
        title: 'PropertyApp',
        logoIcon: 'real_estate_agent',
        subtitle: undefined as string | undefined,
        links: [
            { label: 'Dashboard', href: '/landlord', icon: 'dashboard' },
            { label: 'Properties', href: '/landlord/properties', icon: 'apartment' },
            { label: 'Tenants', href: '/landlord/tenants', icon: 'group' },
            { label: 'Financials', href: '/landlord/financials', icon: 'payments' },
            { label: 'Verification Hub', href: '/landlord/verification', icon: 'verified_user' },
        ],
    },
    tenant: {
        title: 'PropertyApp',
        logoIcon: 'real_estate_agent',
        subtitle: undefined as string | undefined,
        links: [
            { label: 'Dashboard', href: '/tenant', icon: 'dashboard' },
            { label: 'My Home', href: '/tenant/home', icon: 'home' },
            { label: 'Applications', href: '/tenant/applications', icon: 'description' },
            { label: 'Saved', href: '/tenant/saved', icon: 'favorite' },
            { label: 'Messages', href: '/messages', icon: 'chat' },
        ],
    },
    agent: {
        title: 'PropertyApp',
        subtitle: 'Agent',
        logoIcon: 'engineering',
        links: [
            { label: 'Job Board', href: '/agent', icon: 'work' },
            { label: 'My Jobs', href: '/agent/jobs', icon: 'assignment' },
            { label: 'Earnings', href: '/agent/earnings', icon: 'payments' },
            { label: 'Schedule', href: '/agent/schedule', icon: 'calendar_month' },
            { label: 'Profile', href: '/agent/profile', icon: 'person' },
        ],
    },
}

export function DashboardNavbar({ variant, user }: DashboardNavbarProps) {
    const location = useLocation()
    const config = navConfigs[variant]

    const isActive = (href: string) => {
        if (href === `/${variant}` && location.pathname === `/${variant}`) {
            return true
        }
        return location.pathname.startsWith(href) && href !== `/${variant}`
    }

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-4 md:px-10 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">
                        {config.logoIcon || 'real_estate_agent'}
                    </span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    {config.title}
                    {config.subtitle && (
                        <span className="text-slate-400 font-medium text-sm ml-1">{config.subtitle}</span>
                    )}
                </h2>
            </Link>

            {/* Nav Links and Actions */}
            <div className="flex flex-1 justify-end gap-8">
                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-9">
                    {config.links.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "text-sm font-medium leading-normal transition-colors",
                                isActive(link.href)
                                    ? "text-primary font-bold"
                                    : "text-slate-900 dark:text-slate-200 hover:text-primary"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="relative flex items-center justify-center overflow-hidden rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                    </button>

                    <button className="flex items-center justify-center overflow-hidden rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined">account_circle</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
