import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';

// Mock profile data
const profileData = {
    name: 'Sarah Johnson',
    joinDate: 'September 2024',
    verified: true,
    personal: {
        fullName: 'Sarah Johnson',
        dob: '1995-08-15',
        email: 'sarah.johnson@example.com',
        phone: '(555) 123-4567',
    },
    employment: {
        employer: 'Tech Solutions Inc.',
        jobTitle: 'Senior UX Designer',
        income: '95,000',
    },
    preferences: {
        emailNotifications: true,
        pushAlerts: true,
        bedrooms: '2 Bedrooms',
        maxRent: '3,500',
        amenities: 'Gym, Pool, Parking, In-unit Laundry',
    },
    applications: [
        { id: 1, property: '1243 Oakwood Ave', date: 'Sep 28, 2024', status: 'Pending' },
    ],
};

const menuItems = [
    { id: 'personal', icon: 'person', label: 'Personal Information' },
    { id: 'security', icon: 'lock', label: 'Password & Security' },
    { id: 'notifications', icon: 'notifications', label: 'Notification Preferences' },
    { id: 'privacy', icon: 'shield', label: 'Privacy Settings' },
];

export default function TenantProfile() {
    const [activeMenu, setActiveMenu] = useState('personal');
    const [formData, setFormData] = useState({
        fullName: profileData.personal.fullName,
        dob: profileData.personal.dob,
        email: profileData.personal.email,
        phone: profileData.personal.phone,
        employer: profileData.employment.employer,
        jobTitle: profileData.employment.jobTitle,
        income: profileData.employment.income,
        emailNotifications: profileData.preferences.emailNotifications,
        pushAlerts: profileData.preferences.pushAlerts,
        bedrooms: profileData.preferences.bedrooms,
        maxRent: profileData.preferences.maxRent,
        amenities: profileData.preferences.amenities,
    });

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
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#137fec]/10 to-blue-400/10"></div>
                        <div className="relative inline-block mx-auto mb-4 mt-8">
                            <div className="size-24 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-300 p-1 shadow-xl">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">person</span>
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 size-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer">
                                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Joined {profileData.joinDate}</p>
                        {profileData.verified && (
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
                                        ? 'bg-[#137fec]/5 dark:bg-[#137fec]/10 border-[#137fec] text-[#137fec] font-bold'
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
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">assistant</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Profile AI</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Increase approval odds?</h4>
                            <p className="text-sm text-indigo-100 mb-4">Let AI review your profile completeness and suggest improvements.</p>
                            <button className="w-full py-2 bg-white text-indigo-600 font-bold text-sm rounded-lg hover:bg-indigo-50 transition-colors text-center shadow-md">Run Profile Check</button>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                    {/* Personal Information */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">badge</span>
                                Personal & Contact Information
                            </h3>
                            <button className="text-sm text-[#137fec] font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Full Name</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Date of Birth</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => handleInputChange('dob', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Email Address</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Phone Number</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment & Financial */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">work</span>
                                Employment & Financial
                            </h3>
                            <Link to="/tenant/payments" className="text-xs font-bold text-[#137fec] hover:underline flex items-center gap-1 px-3 py-1.5 bg-[#137fec]/5 rounded-lg">
                                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                                Manage Payment Methods
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Employer</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                    type="text"
                                    value={formData.employer}
                                    onChange={(e) => handleInputChange('employer', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Job Title</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
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
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                        type="text"
                                        value={formData.income}
                                        onChange={(e) => handleInputChange('income', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-[#137fec]">tune</span>
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
                                            className="w-5 h-5 text-[#137fec] bg-slate-100 border-slate-300 rounded focus:ring-[#137fec] focus:ring-2"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#137fec] transition-colors">Email Notifications</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1 group">
                                        <input
                                            type="checkbox"
                                            checked={formData.pushAlerts}
                                            onChange={(e) => handleInputChange('pushAlerts', e.target.checked)}
                                            className="w-5 h-5 text-[#137fec] bg-slate-100 border-slate-300 rounded focus:ring-[#137fec] focus:ring-2"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#137fec] transition-colors">App Push Alerts</span>
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
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium appearance-none"
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
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
                                                type="text"
                                                value={formData.maxRent}
                                                onChange={(e) => handleInputChange('maxRent', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Desired Amenities (Comma separated)</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all font-medium"
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
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#137fec]">history</span>
                            Application History Summary
                        </h3>
                        {profileData.applications.map((app) => (
                            <div key={app.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="size-10 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">apartment</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.property}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Submitted on {app.date}</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                    {app.status}
                                </span>
                                <Link to="/tenant/applications" className="text-slate-400 hover:text-[#137fec] transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </Link>
                            </div>
                        ))}
                        <Link to="/tenant/applications" className="block text-center text-sm font-bold text-[#137fec] mt-4 hover:underline">
                            View All Applications
                        </Link>
                    </div>
                </div>
            </div>

            {/* Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                <div className="max-w-[1400px] mx-auto flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button className="px-8 py-3 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save Changes
                    </button>
                </div>
            </div>
        </PageContainer>
    );
}
