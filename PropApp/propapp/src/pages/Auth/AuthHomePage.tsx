import { Link } from 'react-router-dom';

export default function AuthHomePage() {
    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-surface-dark/40 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Welcome home</h1>
            <p className="text-slate-200 dark:text-slate-300 text-base md:text-lg mb-8 font-normal">
                Your journey to finding the perfect property starts here.
            </p>

            <div className="w-full space-y-4">
                <Link
                    to="/auth/login"
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-lg transition-all flex items-center justify-center"
                >
                    Log in
                </Link>
                <Link
                    to="/auth/signup/step1"
                    className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-lg backdrop-blur-sm transition-all flex items-center justify-center"
                >
                    Sign up
                </Link>
            </div>

            {/* Divider */}
            <div className="relative w-full my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-slate-300 dark:text-slate-300 font-medium">Or continue with</span>
                </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-4 w-full">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all font-semibold text-sm">
                    <img
                        alt="Google"
                        className="w-5 h-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMIPoePMDajF4AS4iDsM0Vqp3-4XdvoQ1s2-NVjbLkeQBAGxsjW_P-WB1SG7GgqXB7yRG_PIy9GaVZ00B1kRRzJIOqJPn_hCw8_iFvARH3iksBKtAogs5nPEdaM6btjf-E4G-IeXiK9wPplBA0gNP8FL_GoQ8e6eyktTTQ1Mc-MDfjknZise8fPXmSJDro0KOvfoba_KsUs2RnVZye2Jh49rv9W2C_Z74uNOgpKTuPLb3_VZ9yHnEXJngFtac0BQIN62fv0bFWkAMC"
                    />
                    Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white hover:bg-slate-900 border border-slate-800 transition-all font-semibold text-sm">
                    <span className="material-symbols-outlined text-[20px]">ios</span>
                    Apple
                </button>
            </div>

            <p className="mt-8 text-xs text-slate-300">
                By continuing, you agree to our{' '}
                <a className="text-sky hover:text-sky/80 underline" href="#">Terms of service</a>
                {' '}and{' '}
                <a className="text-sky hover:text-sky/80 underline" href="#">Privacy policy</a>.
            </p>
        </div>
    );
}
