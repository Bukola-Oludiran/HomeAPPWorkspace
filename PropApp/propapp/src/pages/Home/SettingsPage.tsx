import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { userService } from '../../lib/api/services/userService';
import type { UserWithProfile, TenantProfile, LandlordProfile, AgentProfile } from '../../types/auth';

type SettingsSection = 'profile' | 'security' | 'email' | 'push' | 'privacy' | 'visibility' | 'payment' | 'payout' | 'preferences' | 'help' | 'tenant-profile' | 'landlord-profile' | 'agent-profile';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const navItems = [
        {
            section: 'Account', items: [
                { id: 'profile' as SettingsSection, icon: 'person', label: 'Profile Information' },
                { id: 'security' as SettingsSection, icon: 'lock', label: 'Login & Security' },
            ]
        },
        {
            section: 'My Profiles', items: [
                { id: 'tenant-profile' as SettingsSection, icon: 'vpn_key', label: 'Tenant Profile' },
                { id: 'landlord-profile' as SettingsSection, icon: 'apartment', label: 'Landlord Profile' },
                { id: 'agent-profile' as SettingsSection, icon: 'support_agent', label: 'Agent Profile' },
            ]
        },
        {
            section: 'Notifications', items: [
                { id: 'email' as SettingsSection, icon: 'mail', label: 'Email Preferences' },
                { id: 'push' as SettingsSection, icon: 'notifications_active', label: 'App Push Alerts' },
            ]
        },
        {
            section: 'Privacy', items: [
                { id: 'privacy' as SettingsSection, icon: 'security', label: 'Data Privacy' },
                { id: 'visibility' as SettingsSection, icon: 'visibility', label: 'Public Profile Visibility' },
            ]
        },
        {
            section: 'Payments', items: [
                { id: 'payment' as SettingsSection, icon: 'credit_card', label: 'Payment Methods' },
                { id: 'payout' as SettingsSection, icon: 'account_balance', label: 'Payout Preferences' },
            ]
        },
        {
            section: 'Preferences', items: [
                { id: 'preferences' as SettingsSection, icon: 'tune', label: 'General Preferences' },
            ]
        },
    ];

    const handleSectionClick = (id: SettingsSection) => {
        setActiveSection(id);
        setSidebarOpen(false); // Close sidebar on mobile when selecting
    };

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden relative">
            {/* Logo */}
            <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                <div className="size-10 bg-[#137fec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20">
                    <span className="material-symbols-outlined">real_estate_agent</span>
                </div>
                <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">PropertyApp</h2>
            </div>

            {/* Header/Navbar */}
            <header className="fixed top-6 left-0 right-0 z-40 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 rounded-full mx-4">
                    <div className="flex items-center gap-1">
                        <Link to="/" aria-label="Home" className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">home</span>
                        </Link>
                        <Link to="/search?type=buy" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Buy
                        </Link>
                        <Link to="/search?type=rent" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Rent
                        </Link>
                        <Link to="/search?type=sell" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Sell
                        </Link>
                        <Link to="/ai-chat" aria-label="AI Chat" className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </Link>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-[#137fec] hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all cursor-pointer">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center justify-center overflow-hidden rounded-full size-10 md:size-11 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:ring-2 hover:ring-[#137fec]/20 transition-all border border-slate-200 dark:border-slate-600 cursor-pointer"
                            >
                                <img
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a"
                                />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 py-2 bg-white dark:bg-slate-800 min-w-[200px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] z-50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Link
                                        to="/landlord/dashboard"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            Landlord Dashboard
                                        </div>
                                    </Link>
                                    <Link
                                        to="/tenant/dashboard"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">vpn_key</span>
                                            Tenant Dashboard
                                        </div>
                                    </Link>
                                    <Link
                                        to="/agent/jobs"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">support_agent</span>
                                            Agent Dashboard
                                        </div>
                                    </Link>
                                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Account Settings
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col pt-28 pb-10 px-4 md:px-10 lg:px-20 w-full">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Global Settings</h1>
                        <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">Manage your account, preferences, and privacy across all your personas.</p>
                    </div>
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center size-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">menu</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full">
                    {/* Sidebar - Hidden on mobile, slides in from left when open */}
                    <aside className={`
                        fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
                        w-72 flex-shrink-0 
                        bg-[#f6f7f8] dark:bg-[#101922] lg:bg-transparent
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        lg:sticky lg:top-32 
                        space-y-8 sidebar-scroll overflow-y-auto 
                        max-h-screen lg:max-h-[calc(100vh-10rem)]
                        p-6 lg:p-0
                        pt-24 lg:pt-0
                    `}>
                        {/* Mobile close button */}
                        <div className="lg:hidden flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings Menu</h3>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {navItems.map((group) => (
                            <div key={group.section} className="space-y-2">
                                <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{group.section}</h3>
                                <nav className="space-y-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSectionClick(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeSection === item.id
                                                ? 'bg-white dark:bg-slate-800 text-[#137fec] shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-[20px] ${activeSection === item.id ? 'icon-filled' : ''}`}>{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        ))}

                        {/* Help & Support */}
                        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <nav className="space-y-1">
                                <button
                                    onClick={() => handleSectionClick('help')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeSection === 'help'
                                        ? 'bg-white dark:bg-slate-800 text-[#137fec] shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeSection === 'help' ? 'icon-filled' : ''}`}>help</span>
                                    Help & Support
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Panel */}
                    <div className="flex-1 w-full bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col">
                        {activeSection === 'profile' && <ProfileContent />}
                        {activeSection === 'security' && <SecurityContent />}
                        {activeSection === 'email' && <EmailPreferencesContent />}
                        {activeSection === 'push' && <PushAlertsContent />}
                        {activeSection === 'privacy' && <PrivacyContent />}
                        {activeSection === 'visibility' && <VisibilityContent />}
                        {activeSection === 'payment' && <PaymentMethodsContent />}
                        {activeSection === 'payout' && <PayoutPreferencesContent />}
                        {activeSection === 'preferences' && <GeneralPreferencesContent />}
                        {activeSection === 'help' && <HelpSupportContent />}
                        {activeSection === 'tenant-profile' && <TenantProfileContent />}
                        {activeSection === 'landlord-profile' && <LandlordProfileContent />}
                        {activeSection === 'agent-profile' && <AgentProfileContent />}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-10 lg:px-20 text-center mt-auto">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto text-sm text-slate-500 dark:text-slate-400">
                    <p>© 2024 PropertyApp. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy" className="hover:text-[#137fec] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-[#137fec] transition-colors">Terms of Service</Link>
                        <Link to="/support" className="hover:text-[#137fec] transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Profile Information Content
function ProfileContent() {
    const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);
    const [user, setUser] = useState<UserWithProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                setIsLoading(true);
                const response = await userService.getCurrentUser();
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ConfirmationModal
                isOpen={showRemovePhotoModal}
                onClose={() => setShowRemovePhotoModal(false)}
                onConfirm={() => console.log('Photo removed')}
                title="Remove Profile Photo?"
                description="Are you sure you want to remove your profile photo? Your profile will show a default avatar instead."
                confirmText="Remove Photo"
                icon="delete"
            />
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your photo and personal details here.</p>
                </div>
                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-100 dark:border-green-800">
                    <span className="block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Verified Account
                </span>
            </div>
            <div className="p-6 md:p-8 space-y-8 flex-1">
                {/* Profile Photo */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group">
                        {user?.avatarUrl ? (
                            <img alt="Current profile photo" className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-800" src={user.avatarUrl} />
                        ) : (
                            <div className="w-24 h-24 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 bg-[#137fec]/10 flex items-center justify-center text-2xl font-bold text-[#137fec]">
                                {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : ''}
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 text-slate-600 dark:text-white p-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Profile Photo</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">This will be displayed on your profile.</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Change Photo</button>
                            <button
                                onClick={() => setShowRemovePhotoModal(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firstName">First Name</label>
                        <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="firstName" name="firstName" type="text" defaultValue={user?.firstName || ''} />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="lastName">Last Name</label>
                        <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="lastName" name="lastName" type="text" defaultValue={user?.lastName || ''} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </span>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="email" name="email" type="email" defaultValue={user?.email || ''} />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">This is the email you use to log in.</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">Phone Number</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                            </span>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="phone" name="phone" type="tel" defaultValue={user?.phone || ''} />
                        </div>
                    </div>
                </div>

            </div>
            <SettingsFooter />
        </>
    );
}

// Login & Security Content
function SecurityContent() {
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    return (
        <>
            <ConfirmationModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={() => console.log('Account deactivated')}
                title="Deactivate Account?"
                description="Are you sure you want to deactivate your account? Your profile and listings will be hidden, but you can reactivate anytime by logging back in."
                confirmText="Deactivate"
                icon="block"
                variant="warning"
            />
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Login & Security</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your password and security preferences.</p>
            </div>
            <div className="p-6 md:p-8 space-y-8 flex-1">
                {/* Password Management */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Password Management</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" placeholder="••••••••" type="password" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" placeholder="••••••••" type="password" />
                                <div className="mt-2 flex gap-1 h-1.5">
                                    <div className="flex-1 bg-green-500 rounded-full"></div>
                                    <div className="flex-1 bg-green-500 rounded-full"></div>
                                    <div className="flex-1 bg-green-500 rounded-full"></div>
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">Strong password</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" placeholder="••••••••" type="password" />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* 2FA */}
                <div>
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add an extra layer of security to your account.</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-100 dark:border-green-800">
                            <span className="block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Enabled
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-lg shadow-sm text-[#137fec] ring-1 ring-slate-100 dark:ring-slate-600">
                                    <span className="material-symbols-outlined">qr_code_2</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Authenticator App</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Google Authenticator, Authy, etc.</p>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#137fec] dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Manage</button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined">sms</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Text Message (SMS)</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use your mobile phone number.</p>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-[#137fec] hover:text-[#137fec]/80 px-3 py-1.5">Set up</button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined">usb</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Security Key</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">YubiKey, Titan Security Key, etc.</p>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-[#137fec] hover:text-[#137fec]/80 px-3 py-1.5">Add Key</button>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Recent Activity */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Device</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr>
                                    <td className="px-4 py-3 text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">laptop_mac</span>
                                        Chrome on macOS
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">San Francisco, US</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> Active now
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">smartphone</span>
                                        App on iPhone 13
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">San Francisco, US</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Deactivate Account */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Deactivate Account</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Temporarily disable your account. You can reactivate it anytime.</p>
                    </div>
                    <button
                        onClick={() => setShowDeactivateModal(true)}
                        className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-colors cursor-pointer"
                    >
                        Deactivate Account
                    </button>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

// Placeholder components for other sections
function EmailPreferencesContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email Preferences</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage what emails you receive from us.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <ToggleSetting title="Property Alerts" description="Get notified when new properties match your search criteria." defaultChecked={true} />
                    <ToggleSetting title="Application Updates" description="Receive updates on your rental applications." defaultChecked={true} />
                    <ToggleSetting title="Messages" description="Email notifications for new messages." defaultChecked={true} />
                    <ToggleSetting title="Marketing Emails" description="Promotional content and special offers." defaultChecked={false} />
                    <ToggleSetting title="Newsletter" description="Weekly digest of market trends and tips." defaultChecked={false} />
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function PushAlertsContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Push Alerts</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure mobile and browser push notifications.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <ToggleSetting title="New Messages" description="Instant alerts for incoming messages." defaultChecked={true} />
                    <ToggleSetting title="Property Matches" description="Push notifications for matching properties." defaultChecked={true} />
                    <ToggleSetting title="Payment Reminders" description="Get reminded before payment deadlines." defaultChecked={true} />
                    <ToggleSetting title="Viewing Reminders" description="Reminders for scheduled property viewings." defaultChecked={true} />
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function PrivacyContent() {
    const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);

    return (
        <>
            <ConfirmationModal
                isOpen={showDeleteDataModal}
                onClose={() => setShowDeleteDataModal(false)}
                onConfirm={() => console.log('Data deleted')}
                title="Delete All Your Data?"
                description="This action is permanent and cannot be undone. All your personal data, preferences, saved properties, and account history will be permanently deleted."
                confirmText="Delete All Data"
                icon="delete"
            />
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data Privacy</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control how your data is used and shared.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <ToggleSetting title="Personalized Recommendations" description="Allow us to suggest properties based on your activity." defaultChecked={true} />
                    <ToggleSetting title="Analytics & Improvement" description="Help us improve by sharing usage data." defaultChecked={true} />
                    <ToggleSetting title="Third-Party Sharing" description="Share data with trusted partners for better services." defaultChecked={false} />
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Data Management</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">Download My Data</button>
                        <button
                            onClick={() => setShowDeleteDataModal(true)}
                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        >
                            Delete My Data
                        </button>
                    </div>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function VisibilityContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Public Profile Visibility</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control what others can see about you.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <ToggleSetting title="Show Profile Photo" description="Display your photo on your public profile." defaultChecked={true} />
                    <ToggleSetting title="Show Contact Info" description="Allow verified users to see your contact details." defaultChecked={false} />
                    <ToggleSetting title="Show Activity Status" description="Let others see when you're online." defaultChecked={true} />
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function PaymentMethodsContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your saved payment methods.</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add New
                </button>
            </div>
            <div className="p-6 md:p-8 space-y-4 flex-1">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">credit_card</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Visa ending in 4242</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Expires 12/25</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Default</span>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Bank Account ****1234</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chase Bank</p>
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function PayoutPreferencesContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payout Preferences</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure how you receive payments.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payout Schedule</label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm">
                            <option>Monthly</option>
                            <option>Bi-weekly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum Payout Amount</label>
                        <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="text" defaultValue="$100.00" />
                    </div>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function GeneralPreferencesContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Preferences</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your app experience.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm">
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                            <option>NGN (₦)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date Format</label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm">
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

function HelpSupportContent() {
    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get help with your account and find answers to common questions.</p>
            </div>
            <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="#" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">help</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Help Center</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse FAQs and guides.</p>
                        </div>
                    </a>
                    <a href="#" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined">chat</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Live Chat</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chat with our support team.</p>
                        </div>
                    </a>
                    <a href="#" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Email Support</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">support@propertyapp.com</p>
                        </div>
                    </a>
                    <a href="#" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Submit a Ticket</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Report an issue or request.</p>
                        </div>
                    </a>
                </div>
            </div>
        </>
    );
}

// Reusable toggle setting component
function ToggleSetting({ title, description, defaultChecked }: { title: string; description: string; defaultChecked: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#137fec]"></div>
            </label>
        </div>
    );
}

// Shared footer for save/cancel
function SettingsFooter() {
    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-[#15202b] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-all shadow-sm cursor-pointer">
                Cancel
            </button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#137fec] hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all cursor-pointer">
                Save Changes
            </button>
        </div>
    );
}

// Tenant Profile Content
function TenantProfileContent() {
    const [checked, setChecked] = useState({ laundry: true, petFriendly: true, parking: false, gym: false });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null);

    useEffect(() => {
        async function fetchTenantProfile() {
            try {
                const response = await userService.getTenantProfile();
                setTenantProfile(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant profile:', err);
            }
        }
        fetchTenantProfile();
    }, []);

    const rentalHistory = [
        { address: '123 Oak Street, Apt 4B', landlord: 'Jane Smith', period: 'Jan 2021 - Dec 2022', rating: 'Excellent' },
        { address: '456 Maple Ave, Unit 12', landlord: 'Bob Johnson', period: 'Mar 2019 - Dec 2020', rating: 'Good' },
        { address: '789 Pine Road, Suite 3', landlord: 'Mary Davis', period: 'Jun 2017 - Feb 2019', rating: 'Excellent' },
    ];

    return (
        <>
            {/* Rental History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHistoryModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rental History</h3>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-96">
                            {rentalHistory.map((rental, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="font-semibold text-slate-900 dark:text-white">{rental.address}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Landlord: {rental.landlord}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{rental.period}</p>
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded">{rental.rating}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Modal */}
            {showDocumentsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDocumentsModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Documents</h3>
                            <button onClick={() => setShowDocumentsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">verified_user</span>
                                    <span className="text-slate-900 dark:text-white">Identity Verification</span>
                                </div>
                                <span className="text-xs text-green-600">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-orange-500">attach_money</span>
                                    <span className="text-slate-900 dark:text-white">Proof of Income</span>
                                </div>
                                <button className="text-xs text-[#137fec] hover:underline cursor-pointer">Upload New</button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-500">description</span>
                                    <span className="text-slate-900 dark:text-white">Credit Report</span>
                                </div>
                                <button className="text-xs text-[#137fec] hover:underline cursor-pointer">Upload</button>
                            </div>
                            <button className="w-full mt-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90 cursor-pointer">
                                Upload New Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#137fec] uppercase tracking-wide">Global Settings</span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Profiles</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Tenant Profile</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your Tenant Profile Settings: Personal details, preferences, and verified documents.</p>
                </div>
            </div>
            <div className="p-6 md:p-8 space-y-10 flex-1">
                {/* Personal Details */}
                <section>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">badge</span> Personal Details
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                        <div className="relative group">
                            <img alt="Tenant profile photo" className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-800" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a" />
                            <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 text-slate-600 dark:text-white p-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </div>
                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display Name</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="text" defaultValue={tenantProfile?.displayName || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Phone</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="tel" defaultValue="+1 (555) 123-4567" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Short Bio (Visible to Landlords)</label>
                                <textarea className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" rows={2} defaultValue={tenantProfile?.bio || ''} />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Application Preferences */}
                <section>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">tune</span> Application Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Desired Bedrooms</label>
                            <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm">
                                <option>Studio</option>
                                <option>1 Bedroom</option>
                                <option>2 Bedrooms</option>
                                <option>3+ Bedrooms</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Budget (Max)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-7 shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="number" defaultValue={tenantProfile?.preferences?.monthlyBudgetMax || ''} />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desired Amenities</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'laundry', label: 'In-unit Laundry' },
                                    { key: 'petFriendly', label: 'Pet Friendly' },
                                    { key: 'parking', label: 'Parking Spot' },
                                    { key: 'gym', label: 'Gym / Fitness' }
                                ].map(amenity => (
                                    <label key={amenity.key} className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <input
                                            checked={checked[amenity.key as keyof typeof checked]}
                                            onChange={(e) => setChecked({ ...checked, [amenity.key]: e.target.checked })}
                                            className="form-checkbox h-4 w-4 text-[#137fec] rounded border-slate-300 focus:ring-[#137fec]"
                                            type="checkbox"
                                        />
                                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{amenity.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Rental History Summary */}
                <section>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">history</span> Rental History Summary
                    </h3>
                    <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg text-[#137fec] shadow-sm">
                                <span className="material-symbols-outlined">apartment</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Excellent Rental Track Record</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 Verified past rentals • No reported disputes • 5 Years history</p>
                            </div>
                        </div>
                        <button onClick={() => setShowHistoryModal(true)} className="text-sm font-medium text-[#137fec] hover:text-[#137fec]/80 whitespace-nowrap flex items-center gap-1 cursor-pointer">
                            View Full History <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Linked Documents */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">folder_shared</span> Linked Documents
                        </h3>
                        <button onClick={() => setShowDocumentsModal(true)} className="text-xs font-semibold text-[#137fec] hover:underline cursor-pointer">Manage Tenant Documents</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Identity Verification</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Verified on Oct 12, 2023</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">check_circle</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">attach_money</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Proof of Income</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">Update needed (Older than 3 months)</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDocumentsModal(true)} className="text-xs font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-[#137fec] cursor-pointer">Update</button>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Privacy Settings */}
                <section>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">lock</span> Tenant Privacy Settings
                    </h3>
                    <div className="space-y-4">
                        <ToggleSetting title="Allow landlords to search my profile" description="Your profile will appear in tenant search results." defaultChecked={false} />
                        <ToggleSetting title="Show income verification badge" description="Increase trust by showing you have verified income." defaultChecked={true} />
                    </div>
                </section>
            </div>
            <SettingsFooter />
        </>
    );
}

// Landlord Profile Content
function LandlordProfileContent() {
    const [landlordProfile, setLandlordProfile] = useState<LandlordProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        async function fetchLandlordProfile() {
            try {
                setIsLoadingProfile(true);
                const response = await userService.getLandlordProfile();
                setLandlordProfile(response.data);
            } catch (err) {
                console.error('Failed to fetch landlord profile:', err);
            } finally {
                setIsLoadingProfile(false);
            }
        }
        fetchLandlordProfile();
    }, []);

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading landlord profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Manage Landlord Profile
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your landlord details, business info, and verification status.</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold border border-yellow-100 dark:border-yellow-800">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        Identity Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                        Public Profile Active
                    </span>
                </div>
            </div>
            <div className="p-6 md:p-8 space-y-8 flex-1">
                {/* Verification Status */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-5 border border-blue-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px] text-blue-500">verified</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">shield_person</span>
                            Landlord Verification Status
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">Identity:</span> <span className="text-green-600 dark:text-green-400 font-bold">Verified</span>
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">Business Registration:</span> <span className="text-slate-500 dark:text-slate-400 italic">Not Submitted</span>
                                </p>
                            </div>
                            <Link to="/landlord/verification" className="shrink-0 px-4 py-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm dark:bg-slate-700 dark:text-blue-300 dark:border-slate-600 dark:hover:bg-slate-600">
                                Manage Verification Documents
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Personal and Business Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Personal Details</h3>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <img alt="Landlord profile photo" className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a" />
                                <button className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-white p-1 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:text-[#137fec] transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                </button>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Display Photo</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Visible to tenants.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Display Name</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] text-sm" type="text" defaultValue={landlordProfile?.businessName || ''} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Contact Email</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] text-sm" type="email" defaultValue={landlordProfile?.businessEmail || ''} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Contact Phone</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] text-sm" type="tel" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            Business Information
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase">Optional</span>
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Company / Business Name</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] text-sm" placeholder="e.g. Johnson Properties LLC" type="text" defaultValue={landlordProfile?.businessName || ''} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Registration / Tax ID</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] text-sm" placeholder="e.g. 12-3456789" type="text" />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Managed Properties Overview */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Managed Properties Overview</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                <span className="material-symbols-outlined">apartment</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Properties Managed</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-6 hidden sm:block"></div>
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Active Listings</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white text-center sm:text-left">3</p>
                            </div>
                        </div>
                        <Link to="/landlord/properties" className="ml-auto text-sm font-medium text-[#137fec] hover:text-[#137fec]/80 flex items-center gap-1 group">
                            View All Properties <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Public Profile Visibility */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">visibility</span>
                        Public Profile Visibility
                    </h3>
                    <div className="space-y-4">
                        <ToggleSetting title="Show Contact Phone to Public" description="Allows potential tenants to see your number on listings." defaultChecked={false} />
                        <ToggleSetting title="Show Business Address" description="Display your registered business address on your profile." defaultChecked={true} />
                        <ToggleSetting title="Show Verification Badge" description="Increase trust by showing your verified status." defaultChecked={true} />
                    </div>
                </div>
            </div>
            <SettingsFooter />
        </>
    );
}

// Agent Profile Content
function AgentProfileContent() {
    const [certifications, setCertifications] = useState([
        { id: 1, name: 'Real Estate Broker License', issuer: 'State Board of Realtors', expiry: 'Dec 2025', icon: 'workspace_premium', color: 'yellow' },
        { id: 2, name: 'Green Property Specialist', issuer: 'EcoHomes Certified', expiry: 'Never', icon: 'eco', color: 'green' },
    ]);
    const [regions, setRegions] = useState(['Downtown', 'Westside']);
    const [specialties, setSpecialties] = useState(['Residential Sales', 'Commercial Leasing']);
    const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);

    useEffect(() => {
        async function fetchAgentProfile() {
            try {
                const response = await userService.getAgentProfile();
                setAgentProfile(response.data);
                if (response.data.specialties?.length) {
                    setSpecialties(response.data.specialties);
                }
            } catch (err) {
                console.error('Failed to fetch agent profile:', err);
            }
        }
        fetchAgentProfile();
    }, []);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [showCertModal, setShowCertModal] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [showAddAreaModal, setShowAddAreaModal] = useState(false);
    const [newArea, setNewArea] = useState('');
    const [certMenuOpen, setCertMenuOpen] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: string; id?: number; name?: string } | null>(null);

    const handleAddSpecialty = () => {
        if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
            setSpecialties([...specialties, newSpecialty.trim()]);
            setNewSpecialty('');
        }
    };

    const handleAddArea = () => {
        if (newArea.trim() && !regions.includes(newArea.trim())) {
            setRegions([...regions, newArea.trim()]);
            setNewArea('');
            setShowAddAreaModal(false);
        }
    };

    const handleDeleteCert = (id: number) => {
        setCertifications(certifications.filter(c => c.id !== id));
        setShowDeleteConfirm(null);
        setCertMenuOpen(null);
    };

    const handleRemoveRegion = (region: string) => {
        setRegions(regions.filter(r => r !== region));
        setShowDeleteConfirm(null);
    };

    const reviews = [
        { author: 'Sarah M.', rating: 5, text: 'Alex was incredibly helpful and professional throughout the entire process.', date: 'Dec 2024' },
        { author: 'John D.', rating: 5, text: 'Found us the perfect home within our budget. Highly recommend!', date: 'Nov 2024' },
        { author: 'Lisa K.', rating: 4, text: 'Great communication and market knowledge.', date: 'Oct 2024' },
    ];

    return (
        <>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <span className="material-symbols-outlined text-red-600">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Delete</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to remove "{showDeleteConfirm.name}"?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
                            <button
                                onClick={() => {
                                    if (showDeleteConfirm.type === 'cert' && showDeleteConfirm.id) {
                                        handleDeleteCert(showDeleteConfirm.id);
                                    } else if (showDeleteConfirm.type === 'region' && showDeleteConfirm.name) {
                                        handleRemoveRegion(showDeleteConfirm.name);
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                            >Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Certification Modal */}
            {showCertModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCertModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Certification</h3>
                            <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Certification Name</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="text" placeholder="e.g. Certified Property Manager" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Issuing Authority</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="text" placeholder="e.g. National Association of Realtors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expiration Date</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="date" />
                            </div>
                            <button
                                onClick={() => {
                                    setCertifications([...certifications, { id: Date.now(), name: 'New Certification', issuer: 'Issuing Authority', expiry: 'TBD', icon: 'verified', color: 'blue' }]);
                                    setShowCertModal(false);
                                }}
                                className="w-full py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90 cursor-pointer"
                            >
                                Add Certification
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Area Modal */}
            {showAddAreaModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddAreaModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Service Area</h3>
                        <input
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm mb-4"
                            type="text"
                            placeholder="e.g. Northside"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowAddAreaModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">Cancel</button>
                            <button onClick={handleAddArea} className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-[#137fec]/90 cursor-pointer">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            {showReviewsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReviewsModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Reviews</h3>
                            <button onClick={() => setShowReviewsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-96">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">{review.author}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[14px] icon-filled">star</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500">{review.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Agent Profile</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control your professional presence, service areas, and qualifications.</p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Verified Agent
                    </span>
                </div>
            </div>
            <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
                {/* Professional Details */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">id_card</span> Professional Details
                    </h3>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                            <div className="relative group cursor-pointer">
                                <img alt="Agent Profile Photo" className="w-32 h-32 rounded-xl object-cover ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a" />
                                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-[#137fec] hover:text-[#137fec]/80 transition-colors cursor-pointer">Update Photo</button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Professional Name</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="text" defaultValue={agentProfile?.companyName || ''} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Email</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="email" placeholder="agent@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Phone</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" type="tel" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Certifications */}
                <section>
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec]">verified_user</span> Certifications
                        </h3>
                        <button onClick={() => setShowCertModal(true)} className="text-sm font-semibold text-[#137fec] hover:text-[#137fec]/80 flex items-center gap-1 cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">add</span> Add New
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certifications.map(cert => (
                            <div key={cert.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative">
                                <div className={`bg-white dark:bg-slate-700 p-2 rounded-lg text-${cert.color}-600 shadow-sm`}>
                                    <span className="material-symbols-outlined">{cert.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{cert.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cert.issuer} • Exp: {cert.expiry}</p>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setCertMenuOpen(certMenuOpen === cert.id ? null : cert.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                    {certMenuOpen === cert.id && (
                                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">Edit</button>
                                            <button onClick={() => setShowDeleteConfirm({ type: 'cert', id: cert.id, name: cert.name })} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">Delete</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Service Area */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">location_on</span> Service Area
                    </h3>
                    <div className="space-y-4">
                        <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button onClick={() => alert('Map feature coming soon!')} className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg shadow-sm font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer">
                                    Open Interactive Map
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Active Regions</label>
                            <div className="flex flex-wrap gap-2">
                                {regions.map(region => (
                                    <span key={region} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                                        {region}
                                        <button onClick={() => setShowDeleteConfirm({ type: 'region', name: region })} className="hover:text-red-500 cursor-pointer">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                                <button onClick={() => setShowAddAreaModal(true)} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-[#137fec] hover:border-[#137fec] transition-colors text-sm cursor-pointer">
                                    <span className="material-symbols-outlined text-[14px]">add</span> Add Area
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Specialties */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">label</span> Specialties
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Select the tags that best describe your expertise to help clients find you.</p>
                        <div className="flex flex-wrap gap-2">
                            {['Residential Sales', 'Commercial Leasing', 'Property Management', 'Luxury Homes'].map((specialty) => (
                                <label key={specialty} className="cursor-pointer select-none">
                                    <input
                                        checked={specialties.includes(specialty)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSpecialties([...specialties, specialty]);
                                            } else {
                                                setSpecialties(specialties.filter(s => s !== specialty));
                                            }
                                        }}
                                        className="peer sr-only"
                                        type="checkbox"
                                    />
                                    <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm peer-checked:bg-[#137fec]/10 peer-checked:text-[#137fec] peer-checked:border-[#137fec] transition-all">
                                        {specialty}
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newSpecialty}
                                onChange={(e) => setNewSpecialty(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()}
                                className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                placeholder="Add custom tag..."
                                type="text"
                            />
                            <button onClick={handleAddSpecialty} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer">Add</button>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Public Visibility */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">visibility</span> Public Visibility
                    </h3>
                    <div className="space-y-4">
                        <ToggleSetting title="Show Contact Email" description="Allow public users to see your email address" defaultChecked={true} />
                        <ToggleSetting title="Show Phone Number" description="Display your business phone on your profile" defaultChecked={true} />
                        <ToggleSetting title="Profile Searchable" description="Appear in 'Find an Agent' search results" defaultChecked={true} />
                    </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Reviews & Ratings */}
                <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#137fec]">star</span> Reviews & Ratings
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-700 w-24">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">4.8</span>
                                <div className="flex text-yellow-400 text-xs mt-1">
                                    <span className="material-symbols-outlined text-[14px] icon-filled">star</span>
                                    <span className="material-symbols-outlined text-[14px] icon-filled">star</span>
                                    <span className="material-symbols-outlined text-[14px] icon-filled">star</span>
                                    <span className="material-symbols-outlined text-[14px] icon-filled">star</span>
                                    <span className="material-symbols-outlined text-[14px] icon-filled">star_half</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Excellent Reputation</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on <span className="font-bold text-slate-700 dark:text-slate-300">124 verified reviews</span></p>
                            </div>
                        </div>
                        <button onClick={() => setShowReviewsModal(true)} className="w-full mt-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            View All Reviews
                        </button>
                    </div>
                </section>
            </div>
            <SettingsFooter />
        </>
    );
}

