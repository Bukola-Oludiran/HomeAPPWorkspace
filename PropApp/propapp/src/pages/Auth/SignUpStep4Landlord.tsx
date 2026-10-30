import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUpStep4Landlord() {
    const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
    const [role, setRole] = useState<string>('');
    const [listingIntent, setListingIntent] = useState<string>('');
    const [contactPref, setContactPref] = useState<string>('');

    const togglePropertyType = (type: string) => {
        setPropertyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="w-full max-w-3xl bg-white/10 dark:bg-surface-dark/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col my-4 overflow-y-auto max-h-[85vh]">
            {/* Step Badge */}
            <div className="flex items-center justify-center mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-brand-ink text-xs font-bold uppercase tracking-wider">
                    Step 4 of 4
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Start managing your portfolio</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal">
                Help us tailor your dashboard by sharing a few details about your properties.
            </p>

            <form className="w-full flex flex-col gap-8">
                {/* Property Count */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="property-count">How many properties do you currently manage?</label>
                    <div className="relative">
                        <select
                            className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-300 focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors appearance-none"
                            id="property-count"
                            name="property-count"
                        >
                            <option className="bg-slate-800" value="">Select number of properties...</option>
                            <option className="bg-slate-800" value="1">1 property</option>
                            <option className="bg-slate-800" value="2-5">2-5 properties</option>
                            <option className="bg-slate-800" value="6-20">6-20 properties</option>
                            <option className="bg-slate-800" value="21-50">21-50 properties</option>
                            <option className="bg-slate-800" value="50+">50+ properties</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-300">
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                </div>

                {/* Types of Properties */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-slate-200">Types of properties you manage</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { value: 'residential', label: 'Residential' },
                            { value: 'commercial', label: 'Commercial' },
                            { value: 'mixed', label: 'Mixed-use' }
                        ].map((type) => (
                            <label key={type.value} className="cursor-pointer group relative">
                                <input
                                    className="sr-only peer"
                                    name="property_type"
                                    type="checkbox"
                                    value={type.value}
                                    checked={propertyTypes.includes(type.value)}
                                    onChange={() => togglePropertyType(type.value)}
                                />
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 peer-checked:ring-1 peer-checked:ring-brand peer-checked:border-brand peer-checked:bg-brand/10">
                                    <div className={`flex-shrink-0 size-5 rounded border ${propertyTypes.includes(type.value) ? 'bg-brand border-brand' : 'border-slate-500 bg-transparent'} flex items-center justify-center transition-colors`}>
                                        {propertyTypes.includes(type.value) && (
                                            <span className="text-white material-symbols-outlined text-[16px]">check</span>
                                        )}
                                    </div>
                                    <span className="text-white font-medium text-sm">{type.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Role & Listing Intent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your Role */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-slate-200">Your role</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { value: 'owner', label: 'Property owner' },
                                { value: 'manager', label: 'Property manager' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <input
                                        className="w-5 h-5 bg-transparent border-slate-500 focus:ring-brand focus:ring-offset-0 text-sky"
                                        name="role"
                                        type="radio"
                                        value={option.value}
                                        checked={role === option.value}
                                        onChange={() => setRole(option.value)}
                                    />
                                    <span className="text-slate-300 text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Listing Intent */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-slate-200">Are you listing a property soon?</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { value: 'yes', label: 'Yes, within 30 days' },
                                { value: 'no', label: 'No, just exploring' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <input
                                        className="w-5 h-5 bg-transparent border-slate-500 focus:ring-brand focus:ring-offset-0 text-sky"
                                        name="listing_intent"
                                        type="radio"
                                        value={option.value}
                                        checked={listingIntent === option.value}
                                        onChange={() => setListingIntent(option.value)}
                                    />
                                    <span className="text-slate-300 text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preferred Contact Method */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-200">Preferred contact method for tenants</label>
                        <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'chat', icon: 'chat', label: 'App chat' },
                            { value: 'email', icon: 'mail', label: 'Email' },
                            { value: 'phone', icon: 'phone_in_talk', label: 'Phone' }
                        ].map((option) => (
                            <label key={option.value} className="cursor-pointer group relative text-center">
                                <input
                                    className="sr-only peer"
                                    name="contact_pref"
                                    type="radio"
                                    value={option.value}
                                    checked={contactPref === option.value}
                                    onChange={() => setContactPref(option.value)}
                                />
                                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 peer-checked:ring-1 peer-checked:ring-brand peer-checked:bg-brand/10 peer-checked:border-brand">
                                    <span className={`material-symbols-outlined mb-1 ${contactPref === option.value ? 'text-sky' : 'text-slate-300'}`}>
                                        {option.icon}
                                    </span>
                                    <span className={`text-xs font-medium ${contactPref === option.value ? 'text-white' : 'text-slate-300'}`}>
                                        {option.label}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Link
                        to="/landlord/dashboard"
                        className="w-full py-3.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                        Finish setup
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}
