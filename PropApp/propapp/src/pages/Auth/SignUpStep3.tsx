import { useState } from 'react';
import { Link } from 'react-router-dom';

type RoleType = 'tenant' | 'landlord' | 'agent' | 'other' | null;

export default function SignUpStep3() {
    const [selectedRole, setSelectedRole] = useState<RoleType>(null);

    const roles = [
        { value: 'tenant' as const, icon: 'cottage', title: "I'm looking for a home", subtitle: 'Tenant / Buyer' },
        { value: 'landlord' as const, icon: 'domain', title: 'I own properties', subtitle: 'Landlord / Seller' },
        { value: 'agent' as const, icon: 'badge', title: 'I provide services', subtitle: 'Real Estate Agent' },
        { value: 'other' as const, icon: 'layers', title: 'All of the above', subtitle: "Or I'm not sure yet" },
    ];

    const getStep4Route = () => {
        switch (selectedRole) {
            case 'tenant': return '/auth/signup/step4/tenant';
            case 'landlord': return '/auth/signup/step4/landlord';
            case 'agent': return '/auth/signup/step4/agent';
            default: return '/auth/signup/step4/tenant';
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white/10 dark:bg-[#1a2632]/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col">
            {/* Step Badge */}
            <div className="flex items-center justify-center mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[#137fec] text-xs font-bold uppercase tracking-wider">
                    Step 3 of 4
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Tell Us Your Role</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal">
                Select the option that best describes you to personalize your experience.
            </p>

            <form className="w-full flex flex-col gap-6">
                {/* Role Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roles.map((role) => (
                        <label key={role.value} className="cursor-pointer group relative">
                            <input
                                className="sr-only peer"
                                name="role"
                                type="radio"
                                value={role.value}
                                checked={selectedRole === role.value}
                                onChange={() => setSelectedRole(role.value)}
                            />
                            <div className={`flex flex-col h-full p-5 rounded-2xl border transition-all duration-200 ${selectedRole === role.value
                                    ? 'border-[#137fec] bg-[#137fec]/10 ring-1 ring-[#137fec]'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}>
                                <span className={`material-symbols-outlined text-3xl mb-3 transition-colors ${selectedRole === role.value ? 'text-[#137fec] icon-filled' : 'text-slate-300'
                                    }`}>
                                    {role.icon}
                                </span>
                                <span className="text-white font-bold text-base mb-1">{role.title}</span>
                                <span className="text-slate-300 text-xs">{role.subtitle}</span>
                            </div>
                        </label>
                    ))}
                </div>

                {/* Name Fields */}
                <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-200 mb-3">What should we call you?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-300 focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm shadow-sm transition-colors"
                                id="firstname"
                                name="firstname"
                                placeholder="First Name"
                                type="text"
                            />
                        </div>
                        <div className="relative">
                            <input
                                className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-300 focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm shadow-sm transition-colors"
                                id="lastname"
                                name="lastname"
                                placeholder="Last Name"
                                type="text"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <Link
                    to={getStep4Route()}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    Finish Setup
                    <span className="material-symbols-outlined text-xl">check</span>
                </Link>
            </form>
        </div>
    );
}
