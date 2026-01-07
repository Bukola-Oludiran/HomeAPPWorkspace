import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal">
                Log in to your account to continue
            </p>

            <form action="#" method="POST" className="w-full space-y-5">
                {/* Email Input */}
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
                    />
                </div>

                {/* Password Input */}
                <div className="relative">
                    <label className="sr-only" htmlFor="password">Password</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-300 text-[20px]">lock</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-10 py-3.5 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all sm:text-sm"
                        id="password"
                        name="password"
                        placeholder="Password"
                        required
                        type={showPassword ? 'text' : 'password'}
                    />
                    <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-300 hover:text-white transition-colors focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            className="h-4 w-4 text-[#137fec] focus:ring-[#137fec] border-white/20 dark:border-slate-600 rounded bg-white/10 dark:bg-slate-800"
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                        />
                        <label className="ml-2 block text-sm text-slate-300 select-none" htmlFor="remember-me">
                            Remember me
                        </label>
                    </div>
                    <div className="text-sm">
                        <Link className="font-medium text-[#137fec] hover:text-[#137fec]/80 transition-colors" to="/auth/forgot-password">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className="w-full py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5"
                    type="submit"
                >
                    Log In
                </button>
            </form>

            {/* Divider */}
            <div className="relative w-full my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-slate-300 dark:text-slate-300 text-xs uppercase font-medium tracking-wide">Or continue with</span>
                </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-4 w-full">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all font-semibold text-sm">
                    <img
                        alt="Google"
                        className="w-5 h-5"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMIPoePMDajF4AS4iDsM0Vqp3-4XdvoQ1s2-NVjbLkeQBAGxsjW_P-WB1SG7GgqXB7yRG_PIy9GaVZ00B1kRRzJIOqJPn_hCw8_iFvARH3iksBKtAogs5nPEdaM6btjf-E4G-IeXiK9wPplBA0gNP8FL_GoQ8e6eyktTTQ1Mc-MDfjknZise8fPXmSJDro0KOvfoba_KsUs2RnVZye2Jh49rv9W2C_Z74uNOgpKTuPLb3_VZ9yHnEXJngFtac0BQIN62fv0bFWkAMC"
                    />
                    Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white hover:bg-slate-900 border border-slate-800 shadow-sm transition-all font-semibold text-sm">
                    <span className="material-symbols-outlined text-[20px]">ios</span>
                    Apple
                </button>
            </div>

            <p className="mt-8 text-sm text-slate-300">
                Don't have an account?{' '}
                <Link className="text-[#137fec] hover:text-[#137fec]/80 font-bold hover:underline transition-all" to="/auth/signup/step1">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
