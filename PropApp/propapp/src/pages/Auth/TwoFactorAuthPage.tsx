import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCodeInput from '@/components/auth/AuthCodeInput';

export default function TwoFactorAuthPage() {
    const [code, setCode] = useState('');

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-surface-dark/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="size-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner ring-1 ring-white/5">
                    <span className="material-symbols-outlined text-sky text-3xl">lock_person</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Two-Factor Authentication</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                Enter the 6-digit code from your authenticator app or SMS.
            </p>

            <form action="#" method="POST" className="w-full space-y-6">
                {/* 2FA Code Input - Single centered input with wide tracking */}
                <AuthCodeInput
                    length={6}
                    value={code}
                    onChange={setCode}
                    type="single"
                    placeholder="000000"
                />

                {/* Verify Button */}
                <button
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-lg transition-all active:scale-[0.98]"
                    type="submit"
                >
                    Verify
                </button>

                {/* Resend Code */}
                <div className="text-center">
                    <p className="text-sm text-slate-300">
                        Didn't receive a code?{' '}
                        <a className="text-sky hover:text-sky/80 font-bold ml-1 transition-colors hover:underline" href="#">
                            Resend Code
                        </a>
                        <span className="ml-1 text-slate-300 font-mono">(0:28)</span>
                    </p>
                </div>
            </form>

            {/* Divider */}
            <div className="relative w-full my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-transparent text-slate-300 dark:text-slate-300 text-xs font-medium tracking-wide bg-[#15202b] rounded-full">OR</span>
                </div>
            </div>

            {/* Use Another Method */}
            <Link
                to="/auth/2fa/methods"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-transparent hover:bg-white/5 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white transition-all font-semibold text-sm group"
            >
                <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-white transition-colors">phonelink_lock</span>
                Use another method
            </Link>

            {/* Back Link */}
            <div className="mt-6">
                <Link
                    to="/auth/login"
                    className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
