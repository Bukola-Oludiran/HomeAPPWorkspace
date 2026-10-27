import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCodeInput from '@/components/auth/AuthCodeInput';

export default function EnterSMSCodePage() {
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
                    <span className="material-symbols-outlined text-brand text-3xl">sms</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Enter SMS Code</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                We've sent a 6-digit code to your mobile number ending in <span className="font-semibold text-white">•••• 1234</span>. Please enter it below.
            </p>

            <div className="w-full space-y-6">
                {/* SMS Code Input - 2FA Default style (single centered input with wide tracking) */}
                <div className="relative w-full">
                    <AuthCodeInput
                        length={6}
                        value={code}
                        onChange={setCode}
                        type="single"
                        placeholder="000000"
                    />
                    <div className="mt-3 flex justify-end">
                        <button className="text-xs text-brand hover:text-brand/80 font-medium transition-colors flex items-center gap-1">
                            Resend Code (30s)
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                    <Link
                        to="/auth/2fa/sms-success"
                        className="w-full py-3.5 px-5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <span>Verify Code</span>
                        <span className="material-symbols-outlined text-[20px]">check</span>
                    </Link>
                    <Link
                        to="/auth/2fa/methods"
                        className="w-full py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-600/30 hover:border-slate-500/50 text-slate-300 font-semibold transition-all"
                    >
                        Cancel
                    </Link>
                </div>
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
