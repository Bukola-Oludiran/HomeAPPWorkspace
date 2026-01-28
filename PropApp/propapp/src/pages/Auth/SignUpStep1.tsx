import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpStep1() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const navigate = useNavigate();
    const { initiateRegistration, isLoading, error, clearError } = useAuth();

    // Password validation
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (!isPasswordValid) {
            return;
        }

        if (!termsAccepted) {
            return;
        }

        try {
            // Initiate registration - email only (role will be selected in Step 3)
            await initiateRegistration({ email, role: 'TENANT' }); // Default role, will be overridden at completion

            // Store password temporarily in sessionStorage for Step 3
            sessionStorage.setItem('signup_password', password);

            // Navigate to Step 2 (email verification)
            navigate('/auth/signup/step2');
        } catch {
            // Error is handled by AuthContext
        }
    };

    return (
        <div className="w-full max-w-lg bg-white/10 dark:bg-[#1a2632]/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            {/* Step Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[#137fec] text-xs font-bold uppercase tracking-wider">
                    Step 1 of 3
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Create Your Account</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal">
                Start your journey to finding the perfect property.
            </p>

            {/* Error Message */}
            {error && (
                <div className="w-full mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error.error.message}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-200" htmlFor="email">Email Address</label>
                    <div className="relative">
                        <input
                            className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-300 focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm shadow-sm transition-colors"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300 text-xl">mail</span>
                        </div>
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-200" htmlFor="password">Password</label>
                    <div className="relative">
                        <input
                            className="block w-full rounded-xl border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-300 focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm shadow-sm transition-colors"
                            id="password"
                            name="password"
                            placeholder="Create a secure password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>

                    {/* Password Requirements - with validation indicators */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasMinLength ? 'text-green-400' : 'text-slate-300'}`}>
                            <span className={`material-symbols-outlined text-[16px] ${hasMinLength ? 'icon-filled' : ''}`}>check_circle</span>
                            <span>8 characters minimum</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasUppercase ? 'text-green-400' : 'text-slate-300'}`}>
                            <span className={`material-symbols-outlined text-[16px] ${hasUppercase ? 'icon-filled' : ''}`}>check_circle</span>
                            <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasNumber ? 'text-green-400' : 'text-slate-300'}`}>
                            <span className={`material-symbols-outlined text-[16px] ${hasNumber ? 'icon-filled' : ''}`}>check_circle</span>
                            <span>One number</span>
                        </div>
                    </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                    <div className="flex h-6 items-center">
                        <input
                            className="h-5 w-5 rounded border-white/20 bg-white/5 text-[#137fec] focus:ring-[#137fec] focus:ring-offset-0 cursor-pointer"
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="text-sm leading-6">
                        <label className="font-medium text-slate-300" htmlFor="terms">
                            I agree to the{' '}
                            <a className="font-semibold text-[#137fec] hover:text-[#137fec]/80 underline decoration-[#137fec]/30 underline-offset-2" href="#">
                                Terms of Service
                            </a>
                            {' '}and{' '}
                            <a className="font-semibold text-[#137fec] hover:text-[#137fec]/80 underline decoration-[#137fec]/30 underline-offset-2" href="#">
                                Privacy Policy
                            </a>.
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid || !termsAccepted || !email}
                    className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending verification...
                        </>
                    ) : (
                        <>
                            Create Account
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>

            <p className="mt-8 text-sm text-slate-300">
                Already have an account?{' '}
                <Link className="font-bold text-white hover:text-[#137fec] transition-colors" to="/auth/login">
                    Log In
                </Link>
            </p>
        </div>
    );
}
