import { Link } from 'react-router-dom';

export default function TwoFactorMethodsPage() {
    const methods = [
        {
            icon: 'verified_user',
            title: 'Authenticator App',
            subtitle: 'Use a generated code from your app',
            to: '/auth/2fa'
        },
        {
            icon: 'sms',
            title: 'Text Message (SMS)',
            subtitle: 'Send a code to ••• ••• ••89',
            to: '/auth/2fa/sms'
        },
        {
            icon: 'usb',
            title: 'Security Key',
            subtitle: 'Use your physical security key',
            to: '/auth/2fa/security-key'
        },
        {
            icon: 'key',
            title: 'Recovery Code',
            subtitle: 'Use a saved emergency code',
            to: '/auth/2fa/recovery'
        },
    ];

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center relative">
            {/* Close Button */}
            <Link
                to="/auth/2fa"
                className="absolute top-6 right-6 text-slate-300 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </Link>

            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="size-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner ring-1 ring-white/5">
                    <span className="material-symbols-outlined text-[#137fec] text-3xl">phonelink_lock</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">Use another method</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                Choose an alternative way to verify your identity securely.
            </p>

            {/* Method Options */}
            <div className="w-full space-y-4">
                {methods.map((method) => (
                    <Link
                        key={method.title}
                        to={method.to}
                        className="w-full flex items-center gap-4 py-4 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-600/30 hover:border-slate-500/50 transition-all group text-left"
                    >
                        <div className="size-10 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700 group-hover:border-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-slate-300">{method.icon}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">{method.title}</span>
                            <span className="text-slate-300 text-xs">{method.subtitle}</span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-slate-300">chevron_right</span>
                    </Link>
                ))}
            </div>

            {/* Back Link */}
            <div className="mt-8">
                <Link
                    to="/auth/2fa"
                    className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                    Back to Verification
                </Link>
            </div>
        </div>
    );
}
