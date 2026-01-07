import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

type SettingsSection = 'profile' | 'security' | 'email' | 'push' | 'privacy' | 'visibility' | 'payment' | 'payout' | 'preferences' | 'help';

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
                        <img alt="Current profile photo" className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50 dark:ring-slate-800" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a" />
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
                        <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="firstName" name="firstName" type="text" defaultValue="Alex" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="lastName">Last Name</label>
                        <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="lastName" name="lastName" type="text" defaultValue="Johnson" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </span>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="email" name="email" type="email" defaultValue="alex.johnson@example.com" />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">This is the email you use to log in.</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">Phone Number</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                            </span>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm" id="phone" name="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Manage Persona Profiles */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Manage Persona Profiles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/settings/tenant-profile" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">vpn_key</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Tenant Profile</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Preferences, search history & applications.</p>
                            </div>
                        </Link>
                        <Link to="/settings/landlord-profile" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] dark:hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined">dashboard</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Landlord Profile</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Properties, listings & verification status.</p>
                            </div>
                        </Link>
                        <Link to="/settings/agent-profile" className="flex items-start gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all opacity-75">
                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-400">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-600 dark:text-slate-300">Become an Agent</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set up your professional profile.</p>
                            </div>
                        </Link>
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
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-all shadow-sm">
                Cancel
            </button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#137fec] hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all">
                Save Changes
            </button>
        </div>
    );
}
