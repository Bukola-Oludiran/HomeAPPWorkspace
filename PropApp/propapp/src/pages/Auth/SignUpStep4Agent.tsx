import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineTagInput, SelectableTag } from '@/components/auth/InlineTagInput';

interface SpecialtyOption {
    id: string;
    value: string;
    label: string;
    isCustom?: boolean;
}

export default function SignUpStep4Agent() {
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [customSpecialties, setCustomSpecialties] = useState<SpecialtyOption[]>([]);

    const defaultSpecialtyOptions: SpecialtyOption[] = [
        { id: 'spec-res-sales', value: 'residential-sales', label: 'Residential Sales' },
        { id: 'spec-comm-lease', value: 'commercial-leasing', label: 'Commercial Leasing' },
        { id: 'spec-prop-mgmt', value: 'property-mgmt', label: 'Property Management' },
        { id: 'spec-maintenance', value: 'maintenance', label: 'Property Maintenance' }
    ];

    // Combine default and custom options
    const allSpecialtyOptions = [...defaultSpecialtyOptions, ...customSpecialties];

    const toggleSpecialty = (value: string) => {
        setSpecialties(prev =>
            prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
    };

    const addCustomSpecialty = (label: string) => {
        const value = `custom-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const newOption: SpecialtyOption = {
            id: `spec-custom-${Date.now()}`,
            value,
            label,
            isCustom: true
        };
        setCustomSpecialties(prev => [...prev, newOption]);
        // Auto-select the newly added option
        setSpecialties(prev => [...prev, value]);
    };

    const deleteCustomSpecialty = (value: string) => {
        setCustomSpecialties(prev => prev.filter(opt => opt.value !== value));
        setSpecialties(prev => prev.filter(s => s !== value));
    };

    return (
        <div className="w-full max-w-2xl bg-white/10 dark:bg-surface-dark/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col">
            {/* Step Badge */}
            <div className="flex items-center justify-center mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-brand text-xs font-bold uppercase tracking-wider">
                    Step 4 of 4
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Build Your Agent Profile</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal">
                Tell us about your services to help clients find the right match.
            </p>

            <form className="w-full flex flex-col gap-6">
                {/* Specialties & Services */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">Specialties &amp; Services</label>
                    <div className="flex flex-wrap gap-2">
                        {allSpecialtyOptions.map((specialty) => (
                            <SelectableTag
                                key={specialty.id}
                                label={specialty.label}
                                isSelected={specialties.includes(specialty.value)}
                                onToggle={() => toggleSpecialty(specialty.value)}
                                onDelete={() => deleteCustomSpecialty(specialty.value)}
                                isCustom={specialty.isCustom}
                            />
                        ))}
                        <InlineTagInput
                            onAdd={addCustomSpecialty}
                            placeholder="Enter specialty..."
                        />
                    </div>
                </div>

                {/* Service Area & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Primary Service Area */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-200" htmlFor="service-area">Primary Service Area</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                            </span>
                            <input
                                className="block w-full pl-11 pr-4 py-3.5 rounded-xl border-white/10 bg-white/5 text-white placeholder-slate-300 focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors"
                                id="service-area"
                                name="service-area"
                                placeholder="e.g. New York, NY"
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Years of Experience */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-200" htmlFor="experience">Years of Experience</label>
                        <div className="relative">
                            <select
                                className="block w-full pl-4 pr-10 py-3.5 rounded-xl border-white/10 bg-white/5 text-white focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors appearance-none"
                                id="experience"
                                name="experience"
                            >
                                <option className="text-slate-900 bg-white" value="">Select experience...</option>
                                <option className="text-slate-900 bg-white" value="less_1">Less than 1 year</option>
                                <option className="text-slate-900 bg-white" value="1_3">1-3 years</option>
                                <option className="text-slate-900 bg-white" value="3_5">3-5 years</option>
                                <option className="text-slate-900 bg-white" value="5_plus">5+ years</option>
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none flex items-center">
                                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Certification / License */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-semibold text-slate-200" htmlFor="license">
                            Certification / License <span className="text-slate-300 font-normal ml-1">(Optional)</span>
                        </label>
                        <span className="text-xs text-slate-300">Detailed verification later</span>
                    </div>
                    <div className="relative flex items-center">
                        <input
                            className="block w-full pl-4 pr-32 py-3.5 rounded-xl border-white/10 bg-white/5 text-white placeholder-slate-300 focus:border-brand focus:ring-brand sm:text-sm shadow-sm transition-colors"
                            id="license"
                            name="license"
                            placeholder="License Number or ID"
                            type="text"
                        />
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                            type="button"
                        >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            Upload Doc
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Link
                        to="/agent/jobs"
                        className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        Go to Dashboard
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}
