import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../lib/api/services/userService';
import { tenantService } from '../../../lib/api/services/tenantService';

interface ApplicationSummary {
    id: string;
    property: string;
    date: string;
    status: string;
}

const menuItems = [
    { id: 'personal', icon: 'person', label: 'Personal Information' },
    { id: 'security', icon: 'lock', label: 'Password & Security' },
    { id: 'notifications', icon: 'notifications', label: 'Notification Preferences' },
    { id: 'privacy', icon: 'shield', label: 'Privacy Settings' },
];

export default function TenantProfile() {
    const { user } = useAuth();
    const [activeMenu, setActiveMenu] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [applications, setApplications] = useState<ApplicationSummary[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        email: '',
        phone: '',
        employer: '',
        jobTitle: '',
        income: '',
        emailNotifications: true,
        pushAlerts: true,
        bedrooms: '2 Bedrooms',
        maxRent: '2500',
        amenities: '',
    });

    // Load profile data from backend
    useEffect(() => {
        async function loadProfileData() {
            setLoading(true);
            try {
                // Load tenant profile preferences
                const profileResponse = await userService.getTenantProfile();
                if (profileResponse.data) {
                    const prefs = profileResponse.data.preferences;
                    setFormData(prev => ({
                        ...prev,
                        bedrooms: prefs?.desiredBedrooms || prev.bedrooms,
                        maxRent: prefs?.monthlyBudgetMax?.toString() || prev.maxRent,
                    }));
                }

                // Load applications for summary
                const appsResponse = await tenantService.getApplications({ limit: 3 });
                if (appsResponse.data) {
                    setApplications(appsResponse.data.map((app) => ({
                        id: app.id,
                        property: app.property?.name || 'Property',
                        date: new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        status: app.status,
                    })));
                }
            } catch (error) {
                console.error('Failed to load profile data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfileData();
    }, []);

    // Initialize form with user data when available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    // Handle save changes
    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            // Update tenant profile preferences
            await userService.updateTenantProfile({
                preferences: {
                    desiredBedrooms: formData.bedrooms,
                    monthlyBudgetMax: parseInt(formData.maxRent) || undefined,
                },
            });
            // Could also update user profile if name/phone changed
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    // Format join date
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    // Check verification status (user has verificationLevel, BRONZE or above means verified)
    const isVerified = user?.verificationLevel && user.verificationLevel !== 'BRONZE';

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <PageContainer>
            <PageHeader
                title="Tenant Profile"
                subtitle="Manage your personal details, verification status, and preferences."
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-brand/10 dark:bg-brand/20"></div>
                        <div className="relative inline-block mx-auto mb-4 mt-8">
                            <div className="size-24 rounded-full bg-brand p-1 shadow-xl">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={formData.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">person</span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 size-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center transition-transform shadow-lg cursor-pointer">
                                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.fullName || 'User'}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Joined {joinDate}</p>
                        {isVerified && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                Identity Verified
                            </div>
                        )}
                    </div>

                    {/* Settings Menu */}
                    <SectionCard padding="none">
                        <nav className="flex flex-col">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveMenu(item.id)}
                                    className={`flex items-center gap-3 px-5 py-4 text-left text-sm transition-colors border-l-4 ${activeMenu === item.id
                                        ? 'bg-brand/5 dark:bg-brand/10 border-brand text-brand font-bold'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </SectionCard>

                    {/* AI Tip Card */}
                    <div className="bg-brand rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">forum</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Profile AI</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Increase approval odds?</h4>
                            <p className="text-sm text-blue-100 mb-4">Let AI review your profile completeness and suggest improvements.</p>
                            <button className="w-full py-2 bg-white text-brand font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors text-center shadow-md">Run Profile Check</button>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {/* Personal Information */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand">badge</span>
                                Personal & Contact Information
                            </h3>
                            <button className="text-sm text-brand font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Full Name</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Date of Birth</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => handleInputChange('dob', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Email Address</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Phone Number</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment & Financial */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand">work</span>
                                Employment & Financial
                            </h3>
                            <Link to="/tenant/payments" className="text-xs font-bold text-brand hover:underline flex items-center gap-1 px-3 py-1.5 bg-brand/5 rounded-lg">
                                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                                Manage Payment Methods
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Employer</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="text"
                                    value={formData.employer}
                                    onChange={(e) => handleInputChange('employer', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Job Title</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Annual Income</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-slate-500 dark:text-slate-400 font-bold">$</span>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                        type="text"
                                        value={formData.income}
                                        onChange={(e) => handleInputChange('income', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-brand">tune</span>
                            Preferences
                        </h3>
                        <div className="space-y-8">
                            {/* Communication */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Communication</h4>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1 group">
                                        <input
                                            type="checkbox"
                                            checked={formData.emailNotifications}
                                            onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                            className="w-5 h-5 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand focus:ring-2"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand transition-colors">Email Notifications</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1 group">
                                        <input
                                            type="checkbox"
                                            checked={formData.pushAlerts}
                                            onChange={(e) => handleInputChange('pushAlerts', e.target.checked)}
                                            className="w-5 h-5 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand focus:ring-2"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand transition-colors">App Push Alerts</span>
                                    </label>
                                </div>
                            </div>

                            {/* Property Search Defaults */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Property Search Defaults</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Desired Bedrooms</label>
                                        <div className="relative">
                                            <select
                                                value={formData.bedrooms}
                                                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium appearance-none"
                                            >
                                                <option>Studio</option>
                                                <option>1 Bedroom</option>
                                                <option>2 Bedrooms</option>
                                                <option>3+ Bedrooms</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Max Rent Budget</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-slate-500 dark:text-slate-400 font-bold">$</span>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                                type="text"
                                                value={formData.maxRent}
                                                onChange={(e) => handleInputChange('maxRent', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Desired Amenities (Comma separated)</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                                            type="text"
                                            value={formData.amenities}
                                            onChange={(e) => handleInputChange('amenities', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application History Summary */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-brand">history</span>
                            Application History Summary
                        </h3>
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading applications...</div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-4 text-slate-500">No applications yet</div>
                        ) : (
                            applications.map((app) => (
                                <div key={app.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-2">
                                    <div className="size-10 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">apartment</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.property}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Submitted on {app.date}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                        {app.status}
                                    </span>
                                    <Link to="/tenant/applications" className="text-slate-400 hover:text-brand transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </Link>
                                </div>
                            ))
                        )}
                        <Link to="/tenant/applications" className="block text-center text-sm font-bold text-brand mt-4 hover:underline">
                            View All Applications
                        </Link>
                    </div>
                </div>
            </div>

            {/* Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                <div className="max-w-[1400px] mx-auto flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </PageContainer>
    );
}
