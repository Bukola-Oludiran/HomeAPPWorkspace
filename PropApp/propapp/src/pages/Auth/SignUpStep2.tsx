import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCodeInput from '@/components/auth/AuthCodeInput';

export default function SignUpStep2() {
    const [code, setCode] = useState('');

    return (
        <div className="w-full max-w-lg bg-white/10 dark:bg-[#1a2632]/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            {/* Step Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[#137fec] text-xs font-bold uppercase tracking-wider">
                    Step 2 of 3
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Verify Your Email</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal leading-relaxed">
                We've sent a 6-digit code to <strong className="text-white font-semibold">your_email@example.com</strong>.<br />Please enter it below.
            </p>

            <form className="w-full">
                {/* 6-digit Code Input (boxes style) */}
                <div className="mb-8">
                    <AuthCodeInput
                        length={6}
                        value={code}
                        onChange={setCode}
                        type="boxes"
                    />
                </div>

                {/* Verify Button */}
                <Link
                    to="/auth/signup/step3"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    Verify
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                </Link>

                {/* Resend Code */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-300">
                        Didn't receive the code?{' '}
                        <button className="font-semibold text-[#137fec] hover:text-[#137fec]/80 transition-colors ml-1" type="button">
                            Resend.
                        </button>
                        <span className="text-slate-300 font-mono text-xs ml-2 tabular-nums">00:45</span>
                    </p>
                </div>
            </form>

            <p className="mt-8 text-sm text-slate-300">
                Entered the wrong email?{' '}
                <Link className="font-bold text-white hover:text-[#137fec] transition-colors ml-1" to="/auth/signup/step1">
                    Change it
                </Link>
            </p>
        </div>
    );
}
