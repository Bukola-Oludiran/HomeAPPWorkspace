import { Link } from 'react-router-dom';

export default function UseSecurityKeyPage() {
    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center relative">
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
                    <span className="material-symbols-outlined text-[#137fec] text-3xl">usb</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Use Security Key</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                Insert your security key and follow the prompts to verify your identity.
            </p>

            <div className="w-full space-y-6">
                {/* Instructions */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-20 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700 animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-slate-300">passkey</span>
                        </div>
                        <p className="text-slate-300 text-sm text-center">
                            Insert your security key into a USB port, then touch it when prompted.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        to="/auth/2fa/security-key-success"
                        className="w-full py-3.5 px-5 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold shadow-lg shadow-[#137fec]/25 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Verify</span>
                        <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                    </Link>
                    <Link
                        to="/auth/2fa/methods"
                        className="w-full py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-600/30 hover:border-slate-500/50 text-slate-300 font-semibold transition-all text-center"
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
