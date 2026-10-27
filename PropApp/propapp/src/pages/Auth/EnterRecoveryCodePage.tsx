import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function EnterRecoveryCodePage() {
    const [code, setCode] = useState('');

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-surface-dark/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center relative">
            {/* Close Button */}
            <Link
                to="/auth/2fa/methods"
                className="absolute top-6 right-6 text-slate-300 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </Link>

            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="size-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner ring-1 ring-white/5">
                    <span className="material-symbols-outlined text-brand text-3xl">key</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Enter Recovery Code</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                Enter one of your 8-digit recovery codes to log in.
            </p>

            <div className="w-full space-y-6">
                {/* Recovery Code Input */}
                <div className="space-y-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-300 group-focus-within:text-slate-300 transition-colors">lock_open</span>
                        </div>
                        <input
                            aria-label="Recovery Code"
                            className="w-full py-4 pl-12 pr-4 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-600/30 focus:border-slate-500/50 focus:bg-white/10 text-white placeholder-slate-500 outline-none transition-all text-lg tracking-[0.2em] font-medium text-center shadow-inner focus:ring-2 focus:ring-brand"
                            maxLength={8}
                            placeholder="XXXXXXXX"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        />
                    </div>
                    <p className="text-slate-300 text-xs text-center flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Each code can only be used once.
                    </p>
                </div>

                {/* Verify Button */}
                <Link
                    to="/auth/2fa/recovery-success"
                    className="w-full py-4 px-5 rounded-xl bg-brand hover:bg-blue-600 border border-transparent text-white font-bold text-sm shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center"
                >
                    Verify Code
                </Link>
            </div>

            {/* Back Link */}
            <div className="mt-8">
                <Link
                    to="/auth/2fa/methods"
                    className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                    Back to 2FA Options
                </Link>
            </div>
        </div>
    );
}
