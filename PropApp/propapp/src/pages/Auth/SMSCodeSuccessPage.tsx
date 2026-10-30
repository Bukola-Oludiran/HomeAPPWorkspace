import { Link } from 'react-router-dom';

export default function SMSCodeSuccessPage() {
    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-surface-dark/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center relative">
            {/* Close Button */}
            <Link
                to="/auth/login"
                className="absolute top-6 right-6 text-slate-300 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </Link>

            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
                <div className="size-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner ring-1 ring-white/5">
                    <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">SMS code accepted</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-6 font-normal text-center leading-relaxed">
                Your SMS verification was successful. You can now proceed to access your account securely.
            </p>

            <div className="w-full space-y-6">
                {/* Info Message */}
                <div className="px-2">
                    <p className="text-slate-300 text-xs text-center flex items-start justify-center gap-1.5 leading-relaxed">
                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                        For enhanced security, consider enabling additional 2FA methods in your account settings.
                    </p>
                </div>

                {/* Continue Button */}
                <Link
                    to="/tenant/dashboard"
                    className="w-full py-4 px-5 rounded-xl bg-brand-ink hover:bg-brand-ink/90 border border-transparent text-on-brand font-bold text-sm transition-all transform active:scale-[0.98] flex items-center justify-center"
                >
                    Continue to Dashboard
                </Link>
            </div>
        </div>
    );
}
