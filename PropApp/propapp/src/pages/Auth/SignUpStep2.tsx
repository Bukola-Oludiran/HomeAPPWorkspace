import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCodeInput from '@/components/auth/AuthCodeInput';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpStep2() {
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(45);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const { verifyEmail, resendVerificationCode, registrationState, isLoading, error, clearError } = useAuth();

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Redirect if no email in registration state
    useEffect(() => {
        if (!registrationState.email) {
            navigate('/auth/signup/step1');
        }
    }, [registrationState.email, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (code.length !== 6) {
            return;
        }

        try {
            await verifyEmail(code);
            navigate('/auth/signup/step3');
        } catch {
            // Error is handled by AuthContext
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        clearError();
        try {
            await resendVerificationCode();
            setCountdown(45);
            setCanResend(false);
        } catch {
            // Error is handled by AuthContext
        }
    };

    // Format countdown as mm:ss
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-lg bg-white/10 dark:bg-surface-dark/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            {/* Step Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-brand-ink text-xs font-bold uppercase tracking-wider">
                    Step 2 of 3
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 text-center">Verify Your Email</h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 text-center font-normal leading-relaxed">
                We've sent a 6-digit code to <strong className="text-white font-semibold">{registrationState.email || 'your email'}</strong>.<br />Please enter it below.
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

            <form onSubmit={handleSubmit} className="w-full">
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
                <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify
                            <span className="material-symbols-outlined text-xl">check_circle</span>
                        </>
                    )}
                </button>

                {/* Resend Code */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-300">
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || isLoading}
                            className={`font-semibold transition-colors ml-1 ${canResend ? 'text-sky hover:text-sky/80 cursor-pointer' : 'text-slate-500 cursor-not-allowed'}`}
                        >
                            Resend.
                        </button>
                        {!canResend && (
                            <span className="text-slate-300 font-mono text-xs ml-2 tabular-nums">{formatCountdown(countdown)}</span>
                        )}
                    </p>
                </div>
            </form>

            <p className="mt-8 text-sm text-slate-300">
                Entered the wrong email?{' '}
                <Link className="font-bold text-white hover:text-sky transition-colors ml-1" to="/auth/signup/step1">
                    Change it
                </Link>
            </p>
        </div>
    );
}
