import { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import NotificationsDropdown from '../NotificationsDropdown';
import { useAuth } from '../../contexts/AuthContext';

export interface NavItem {
    name: string;
    path: string;
    icon?: string;
    iconOnly?: boolean;
}

type DashboardType = 'landlord' | 'tenant' | 'agent' | 'home' | null;

// Define nav items for each dashboard type
const HOME_NAV_ITEMS: NavItem[] = [
    { name: 'Home', path: '/', icon: 'home', iconOnly: true },
    { name: 'Buy', path: '/search?type=buy' },
    { name: 'Rent', path: '/search?type=rent' },
    { name: 'Sell', path: '/search?type=sell' },
    { name: 'AI Chat', path: '/ai-chat', icon: 'forum', iconOnly: true },
];

const LANDLORD_NAV_ITEMS: NavItem[] = [
    { name: 'Dashboard', path: '/landlord/dashboard', icon: 'dashboard' },
    { name: 'Properties', path: '/landlord/properties', icon: 'apartment' },
    { name: 'Tenants', path: '/landlord/tenants', icon: 'group' },
    { name: 'Financials', path: '/landlord/financials', icon: 'account_balance' },
    { name: 'Verification', path: '/landlord/verification', icon: 'verified' },
];

const TENANT_NAV_ITEMS: NavItem[] = [
    { name: 'Dashboard', path: '/tenant/dashboard', icon: 'dashboard' },
    { name: 'My Home', path: '/tenant/my-home', icon: 'home' },
    { name: 'Applications', path: '/tenant/applications', icon: 'description' },
    { name: 'Saved', path: '/tenant/saved', icon: 'favorite' },
    { name: 'Messages', path: '/tenant/messages', icon: 'chat' },
];

const AGENT_NAV_ITEMS: NavItem[] = [
    { name: 'Job Board', path: '/agent/jobs', icon: 'work' },
    { name: 'My Jobs', path: '/agent/my-jobs', icon: 'assignment' },
    { name: 'Earnings', path: '/agent/earnings', icon: 'payments' },
    { name: 'Schedule', path: '/agent/schedule', icon: 'calendar_month' },
    { name: 'Profile', path: '/agent/profile', icon: 'person' },
];

// Dashboard links for switching between dashboards
const getDashboardLinks = (currentType: DashboardType) => {
    const allLinks = [
        { name: 'Landlord Dashboard', path: '/landlord/dashboard', icon: 'dashboard' },
        { name: 'Tenant Dashboard', path: '/tenant/dashboard', icon: 'vpn_key' },
        { name: 'Agent Dashboard', path: '/agent/jobs', icon: 'support_agent' },
    ];

    // Filter out current dashboard
    return allLinks.filter(link => {
        if (currentType === 'landlord') return !link.path.includes('/landlord');
        if (currentType === 'tenant') return !link.path.includes('/tenant');
        if (currentType === 'agent') return !link.path.includes('/agent');
        return true; // Home shows all
    });
};

const PROFILE_PATHS: Record<string, string> = {
    landlord: '/landlord/profile',
    tenant: '/tenant/profile',
    agent: '/agent/profile',
    home: '/settings',
};

// Paths where navbar should be hidden (landlord-specific)
const HIDE_PATHS = ['/tasks', '/edit'];

// Agent dashboard sections; any other /agent/:segment is a public agent profile
const AGENT_DASHBOARD_SECTIONS = ['jobs', 'my-jobs', 'schedule', 'earnings', 'transactions', 'profile'];

/**
 * UnifiedNavbar - Self-contained navbar with animated container width
 */
export default function UnifiedNavbar() {
    const location = useLocation();
    const { user } = useAuth();
    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
        || user?.email?.[0]?.toUpperCase()
        || '';
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [displayedItems, setDisplayedItems] = useState<NavItem[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const navLinksRef = useRef<HTMLDivElement>(null);
    const rightSectionRef = useRef<HTMLDivElement>(null);
    const prevDashboardType = useRef<DashboardType>(null);
    const isFirstRender = useRef(true);

    // Determine current dashboard type from pathname
    const dashboardType: DashboardType = useMemo(() => {
        const path = location.pathname;
        // Public profiles come first: /landlord-profile/:id and /agent/:id would otherwise match the dashboards
        const agentSection = path.match(/^\/agent\/([^/]+)$/)?.[1];
        const isPublicProfile =
            path.startsWith('/landlord-profile') ||
            path.startsWith('/member') ||
            (agentSection !== undefined && !AGENT_DASHBOARD_SECTIONS.includes(agentSection));
        if (isPublicProfile) return 'home';
        if (path.startsWith('/landlord')) return 'landlord';
        if (path.startsWith('/tenant')) return 'tenant';
        if (path.startsWith('/agent')) return 'agent';
        // Home pages: /, /search, /property/:id, /ai-chat, /settings
        if (path === '/' ||
            path.startsWith('/search') ||
            path.startsWith('/property') ||
            path === '/ai-chat' ||
            path === '/settings') {
            return 'home';
        }
        return null;
    }, [location.pathname]);

    // Get nav items for current dashboard
    const navItems = useMemo(() => {
        switch (dashboardType) {
            case 'home': return HOME_NAV_ITEMS;
            case 'landlord': return LANDLORD_NAV_ITEMS;
            case 'tenant': return TENANT_NAV_ITEMS;
            case 'agent': return AGENT_NAV_ITEMS;
            default: return [];
        }
    }, [dashboardType]);

    // Check if navbar should be hidden
    const shouldHide = useMemo(() => {
        // Hide on auth pages
        if (location.pathname.startsWith('/auth')) return true;
        if (!dashboardType) return true;
        // Only landlord has hide paths
        if (dashboardType === 'landlord') {
            return HIDE_PATHS.some(path => location.pathname.includes(path));
        }
        return false;
    }, [dashboardType, location.pathname]);

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(path.split('?')[0]);
    };

    // Animate container width when dashboard type changes
    useLayoutEffect(() => {
        if (!containerRef.current || !navLinksRef.current || !rightSectionRef.current || !dashboardType) return;

        const prevType = prevDashboardType.current;
        const currentType = dashboardType;

        // On first render, just set items without animation
        if (isFirstRender.current) {
            setDisplayedItems(navItems);
            prevDashboardType.current = currentType;
            isFirstRender.current = false;
            return;
        }

        // Animate if dashboard type changed
        if (prevType !== currentType && prevType !== null) {
            const container = containerRef.current;
            const navLinks = navLinksRef.current;
            const rightSection = rightSectionRef.current;

            // Kill any existing animations
            gsap.killTweensOf([container, navLinks, rightSection]);

            // Get current width
            const currentWidth = container.offsetWidth;

            // Measure target width using a hidden clone
            const measureTarget = () => {
                // Create hidden clone of container
                const clone = container.cloneNode(true) as HTMLDivElement;
                clone.style.position = 'absolute';
                clone.style.visibility = 'hidden';
                clone.style.width = 'auto';
                clone.style.left = '-9999px';

                // Find nav links in clone and replace with new items
                const cloneNavLinks = clone.querySelector('[data-nav-links]') as HTMLDivElement;
                if (cloneNavLinks) {
                    cloneNavLinks.innerHTML = navItems.map(item => {
                        if (item.iconOnly) {
                            return `<div class="flex items-center justify-center size-9 sm:size-10 md:size-11 rounded-full"><span class="material-symbols-outlined text-[20px] sm:text-[24px]">${item.icon}</span></div>`;
                        }
                        return `<div class="px-2.5 sm:px-3 md:px-4 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-1.5">${item.icon ? `<span class="material-symbols-outlined text-[18px]">${item.icon}</span>` : ''}<span class="hidden sm:inline">${item.name}</span></div>`;
                    }).join('');
                }

                document.body.appendChild(clone);
                const targetWidth = clone.offsetWidth;
                document.body.removeChild(clone);

                return targetWidth;
            };

            const targetWidth = measureTarget();

            // Lock container width for animation
            container.style.width = `${currentWidth}px`;

            // Create animation timeline
            const tl = gsap.timeline();

            // Phase 1: Shrink ALL elements to nothing (scale 0, fade out)
            // Nav links and right section (avatar, notifications) animate together
            tl.to([navLinks, rightSection], {
                opacity: 0,
                scale: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    // Swap to new items while fully hidden
                    setDisplayedItems(navItems);
                    // Ensure all elements start hidden
                    gsap.set([navLinks, rightSection], { scale: 0, opacity: 0 });
                }
            });

            // Phase 2: Animate container width from current to target
            tl.to(container, {
                width: targetWidth,
                duration: 0.3,
                ease: 'power2.inOut',
            }, '-=0.05');

            // Phase 3: Expand ALL elements from nothing
            tl.to([navLinks, rightSection], {
                opacity: 1,
                scale: 1,
                duration: 0.25,
                ease: 'back.out(1.4)',
            }, '-=0.1');

            // Reset container to auto width
            tl.set(container, { width: 'auto' });

            prevDashboardType.current = currentType;
        } else if (prevType === null) {
            setDisplayedItems(navItems);
            prevDashboardType.current = currentType;
        }
    }, [dashboardType, navItems]);

    // Don't render if should be hidden
    if (shouldHide || !dashboardType) return null;

    const dashboardLinks = getDashboardLinks(dashboardType);
    const profilePath = PROFILE_PATHS[dashboardType] || '/settings';

    return (
        <header className="fixed top-6 left-0 right-0 z-30 flex justify-center w-full pointer-events-none">
            <div
                ref={containerRef}
                className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 md:gap-2 px-2 sm:px-3 py-2 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 rounded-full mx-4"
            >
                {/* Nav Links */}
                <div ref={navLinksRef} data-nav-links className="flex items-center gap-0.5 sm:gap-1 origin-center">
                    {displayedItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${item.iconOnly
                                ? 'flex items-center justify-center size-9 sm:size-10 md:size-11 rounded-full'
                                : 'px-2.5 sm:px-3 md:px-4 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-1.5'
                                } transition-all ${isActive(item.path)
                                    ? 'bg-brand-ink text-on-brand'
                                    : 'text-slate-600 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                }`}
                            title={item.name}
                        >
                            {item.icon && (
                                <span className={`material-symbols-outlined ${item.iconOnly ? 'text-[20px] sm:text-[24px]' : 'text-[18px]'}`}>
                                    {item.icon}
                                </span>
                            )}
                            {!item.iconOnly && <span className="hidden sm:inline whitespace-nowrap">{item.name}</span>}
                            {!item.iconOnly && !item.icon && <span className="sm:hidden">{item.name}</span>}
                        </Link>
                    ))}
                </div>

                {/* Right section: Divider + Notifications + Avatar */}
                <div ref={rightSectionRef} className="flex items-center gap-0.5 sm:gap-1 md:gap-2 origin-center">
                    {/* Divider */}
                    <div className="w-px h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1"></div>
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="flex items-center justify-center size-9 sm:size-10 md:size-11 rounded-full text-slate-500 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all relative"
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">notifications</span>
                            {dashboardType !== 'home' && (
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                        <NotificationsDropdown
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>

                    {/* Avatar Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            aria-label="Account menu"
                            className="flex items-center justify-center overflow-hidden rounded-full size-9 sm:size-10 md:size-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:ring-2 hover:ring-brand/20 transition-all border border-slate-200 dark:border-slate-600"
                        >
                            {user?.avatarUrl ? (
                                <img alt="" className="w-full h-full object-cover" src={user.avatarUrl} />
                            ) : initials ? (
                                initials
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">person</span>
                            )}
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 py-2 bg-white dark:bg-slate-800 min-w-[200px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] z-50 rounded-xl border border-slate-200 dark:border-slate-700">
                                {dashboardType !== 'home' && (
                                    <Link
                                        to="/"
                                        onClick={() => setShowDropdown(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">home</span>
                                            Back to home
                                        </div>
                                    </Link>
                                )}
                                {dashboardLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setShowDropdown(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">{link.icon}</span>
                                            {link.name}
                                        </div>
                                    </Link>
                                ))}
                                <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                <Link
                                    to={profilePath}
                                    onClick={() => setShowDropdown(false)}
                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">{dashboardType === 'home' ? 'settings' : 'person'}</span>
                                        {dashboardType === 'home' ? 'Account Settings' : 'My Profile'}
                                    </div>
                                </Link>
                                <button className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        Sign out
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
