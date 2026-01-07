import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center transition-all duration-300">
                <div className="mb-6 bg-green-500/20 p-4 rounded-full border border-green-500/30">
                    <span className="material-symbols-outlined text-4xl text-green-400">mark_email_read</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Check your email!</h1>
                <p className="text-slate-200 dark:text-slate-300 text-sm mb-6 font-normal text-center leading-relaxed">
                    We've sent a password reset link to <strong className="text-white">{email}</strong>.
                </p>
                <div className="bg-white/5 dark:bg-slate-900/30 rounded-xl p-4 w-full mb-8 border border-white/10 dark:border-slate-700/50">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-amber-400 shrink-0">info</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Please check your spam folder if you don't see it within a few minutes. The link will expire in 24 hours.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-base transition-all mb-4"
                >
                    Resend Link
                </button>
                <Link
                    to="/auth/login"
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mt-2 group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center transition-all duration-300">
            <div className="mb-6 bg-white/10 p-4 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-4xl text-[#137fec]">lock_reset</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Reset Password</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                Enter your registered email address below, and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="relative">
                    <label className="sr-only" htmlFor="email">Email address</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-300 text-[20px]">mail</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-3.5 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all sm:text-sm"
                        id="email"
                        name="email"
                        placeholder="Email address"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button
                    className="w-full py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    type="submit"
                >
                    Send Reset Link
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 w-full flex justify-center">
                <Link
                    to="/auth/login"
                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
