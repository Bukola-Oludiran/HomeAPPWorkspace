import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PasswordResetPage() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword, isLoading, error, clearError } = useAuth();

    // Get reset token from URL
    const token = searchParams.get('token');

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            navigate('/auth/forgot-password');
        }
    }, [token, navigate]);

    // Password validation
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (!isPasswordValid || !passwordsMatch || !token) {
            return;
        }

        try {
            await resetPassword(token, newPassword);
            navigate('/auth/reset-password-success');
        } catch {
            // Error is handled by AuthContext
        }
    };

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-surface-dark/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center transition-all duration-300">
            <div className="w-full flex flex-col items-center">
                {/* Icon */}
                <div className="mb-6 bg-white/10 p-4 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-4xl text-sky">lock_reset</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Set new password</h1>
                <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                    Please enter and confirm your new password below.
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
                    {/* New Password */}
                    <div className="space-y-3">
                        <label className="sr-only" htmlFor="new-password">New password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-300 text-[20px] group-focus-within:text-sky transition-colors">lock</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-10 py-3.5 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all sm:text-sm"
                                id="new-password"
                                name="new-password"
                                placeholder="New password"
                                required
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
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
                            <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Password strength</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${hasMinLength ? 'text-green-400' : 'text-slate-300 opacity-70'}`}>
                                    <span className={`material-symbols-outlined text-[16px] ${hasMinLength ? 'icon-filled' : ''}`}>
                                        {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <span>8 characters minimum</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${hasUppercase ? 'text-green-400' : 'text-slate-300 opacity-70'}`}>
                                    <span className={`material-symbols-outlined text-[16px] ${hasUppercase ? 'icon-filled' : ''}`}>
                                        {hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <span>One uppercase letter</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${hasNumber ? 'text-green-400' : 'text-slate-300 opacity-70'}`}>
                                    <span className={`material-symbols-outlined text-[16px] ${hasNumber ? 'icon-filled' : ''}`}>
                                        {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <span>One number</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${hasSpecialChar ? 'text-green-400' : 'text-slate-300 opacity-70'}`}>
                                    <span className={`material-symbols-outlined text-[16px] ${hasSpecialChar ? 'icon-filled' : ''}`}>
                                        {hasSpecialChar ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                    <span>One special character</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                        <label className="sr-only" htmlFor="confirm-password">Confirm new password</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300 text-[20px] group-focus-within:text-sky transition-colors">key</span>
                        </div>
                        <input
                            className={`block w-full pl-10 pr-10 py-3.5 border rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all sm:text-sm ${confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-white/10 dark:border-slate-600'
                                }`}
                            id="confirm-password"
                            name="confirm-password"
                            placeholder="Confirm new password"
                            required
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
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
                    {confirmPassword && !passwordsMatch && (
                        <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordValid || !passwordsMatch}
                        className="w-full py-3.5 px-4 mt-2 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
