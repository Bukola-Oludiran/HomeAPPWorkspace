import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PasswordResetPage() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center transition-all duration-300">
            <div className="w-full flex flex-col items-center">
                {/* Icon */}
                <div className="mb-6 bg-white/10 p-4 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-4xl text-[#137fec]">lock_reset</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Set New Password</h1>
                <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                    Please enter and confirm your new password below.
                </p>

                <form className="w-full space-y-5" onSubmit={(e) => e.preventDefault()}>
                    {/* New Password */}
                    <div className="space-y-3">
                        <label className="sr-only" htmlFor="new-password">New Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-300 text-[20px] group-focus-within:text-[#137fec] transition-colors">lock</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-10 py-3.5 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all sm:text-sm"
                                id="new-password"
                                name="new-password"
                                placeholder="New Password"
                                required
                                type={showNewPassword ? 'text' : 'password'}
                            />
                            <button
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showNewPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>

                        {/* Password Strength */}
                        <div className="bg-white/5 dark:bg-slate-900/30 rounded-lg p-3 border border-white/5">
                            <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-2">Password Strength</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                <div className="flex items-center gap-2 text-xs text-green-400 font-medium transition-colors">
                                    <span className="material-symbols-outlined text-[16px] icon-filled">check_circle</span>
                                    <span>8 characters minimum</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium transition-colors opacity-70">
                                    <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                                    <span>One uppercase letter</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium transition-colors opacity-70">
                                    <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                                    <span>One number</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium transition-colors opacity-70">
                                    <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                                    <span>One special character</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                        <label className="sr-only" htmlFor="confirm-password">Confirm New Password</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300 text-[20px] group-focus-within:text-[#137fec] transition-colors">key</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-10 py-3.5 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all sm:text-sm"
                            id="confirm-password"
                            name="confirm-password"
                            placeholder="Confirm New Password"
                            required
                            type={showConfirmPassword ? 'text' : 'password'}
                        />
                        <button
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showConfirmPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>

                    {/* Submit Button */}
                    <Link
                        to="/auth/reset-password-success"
                        className="w-full py-3.5 px-4 mt-2 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        Reset Password
                    </Link>
                </form>
            </div>
        </div>
    );
}
