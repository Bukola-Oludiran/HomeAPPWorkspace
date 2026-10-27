import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUpStep4Tenant() {
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const propertyTypes = [
        { value: 'apartment', icon: 'apartment', label: 'Apartment' },
        { value: 'house', icon: 'house', label: 'House' },
        { value: 'condo', icon: 'location_city', label: 'Condo' },
    ];

    const amenities = [
        'Pet-Friendly', 'Parking', 'Gym', 'In-unit Laundry',
        'Swimming Pool', 'Air Conditioning', 'Balcony'
    ];

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    return (
        <div className="w-full max-w-4xl bg-white/10 dark:bg-surface-dark/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-6 md:p-8 lg:p-10 flex flex-col my-10 overflow-y-auto max-h-[90vh]">
            {/* Step Badge */}
            <div className="flex items-center justify-center mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-brand text-xs font-bold uppercase tracking-wider">
                    Step 4 of 4
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Tell Us Your Home Preferences</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal">
                Help us find your perfect match by setting your preferences.
            </p>

            <form className="w-full flex flex-col gap-6">
                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-200">Preferred Location / Neighborhoods</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300">search</span>
                        </div>
                        <input
                            className="block w-full rounded-xl border-white/10 bg-white/5 pl-10 pr-4 py-3.5 text-white placeholder-slate-300 focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors"
                            placeholder="e.g. Downtown, Brooklyn, 90210"
                            type="text"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300 text-sm">my_location</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        {/* Property Type */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-200">Desired Property Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {propertyTypes.map((type) => (
                                    <label key={type.value} className="cursor-pointer group relative">
                                        <input
                                            className="sr-only peer"
                                            name="property_type"
                                            type="radio"
                                            value={type.value}
                                        />
                                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 h-24 text-center peer-checked:border-brand peer-checked:bg-brand/15">
                                            <span className="material-symbols-outlined text-slate-300 text-2xl mb-2 peer-checked:text-brand transition-colors">
                                                {type.icon}
                                            </span>
                                            <span className="text-white text-xs font-medium">{type.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bedrooms & Bathrooms */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-200">Bedrooms</label>
                                <div className="relative">
                                    <select className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors appearance-none">
                                        <option>Any</option>
                                        <option>Studio</option>
                                        <option>1+</option>
                                        <option>2+</option>
                                        <option>3+</option>
                                        <option>4+</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-300">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-200">Bathrooms</label>
                                <div className="relative">
                                    <select className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors appearance-none">
                                        <option>Any</option>
                                        <option>1+</option>
                                        <option>1.5+</option>
                                        <option>2+</option>
                                        <option>2.5+</option>
                                        <option>3+</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-300">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-200">Monthly Budget</label>
                                <span className="text-brand font-bold text-sm">$1,200 - $3,500</span>
                            </div>
                            <div className="px-2">
                                <input
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    max="10000"
                                    min="500"
                                    step="100"
                                    type="range"
                                    defaultValue="3500"
                                />
                                <div className="flex justify-between text-xs text-slate-300 mt-2">
                                    <span>$500</span>
                                    <span>$10k+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Amenities */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-200">Must-Have Amenities</label>
                            <div className="flex flex-wrap gap-3">
                                {amenities.map((amenity) => (
                                    <label key={amenity} className="cursor-pointer">
                                        <input
                                            className="sr-only"
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => toggleAmenity(amenity)}
                                        />
                                        <div className={`px-4 py-2 rounded-lg border text-sm transition-colors select-none ${selectedAmenities.includes(amenity)
                                            ? 'border-brand bg-brand/15 text-white'
                                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                            }`}>
                                            {amenity}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Move-in Timeline */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-200">Move-in Timeline</label>
                            <div className="space-y-2">
                                {['Immediately (ASAP)', 'Within 1-3 months', '3+ months'].map((timeline) => (
                                    <label key={timeline} className="flex items-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                        <input
                                            className="text-brand bg-transparent border-slate-500 focus:ring-brand focus:ring-offset-0"
                                            name="timeline"
                                            type="radio"
                                        />
                                        <span className="ml-3 text-white text-sm">{timeline}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 mt-2">
                    <Link
                        to="/tenant/dashboard"
                        className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        Finish Setup
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}
