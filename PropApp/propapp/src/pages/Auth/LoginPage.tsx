import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();

    // Get the redirect path from state or default to role-specific dashboard
    const from = location.state?.from?.pathname;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            const result = await login({ email, password });

            if (result.requires2FA) {
                // Redirect to 2FA page
                navigate('/auth/2fa', { state: { email } });
            } else {
                // Redirect to intended destination or role-specific dashboard
                // The user role will be available after login
                if (from) {
                    navigate(from, { replace: true });
                } else {
                    // Default redirect - AuthContext will handle proper routing
                    navigate('/', { replace: true });
                }
            }
        } catch {
            // Error is handled by AuthContext
        }
    };

    return (
        <div className="w-full max-w-md bg-white/10 dark:bg-[#1a2632]/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal">
                Log in to your account to continue
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

            <form onSubmit={handleSubmit} className="w-full space-y-5">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
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
                    className="w-full py-3.5 px-4 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-lg shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        'Log In'
                    )}
                </button>
            </form>

            <p className="mt-8 text-sm text-slate-300">
                Don't have an account?{' '}
                <Link className="text-[#137fec] hover:text-[#137fec]/80 font-bold hover:underline transition-all" to="/auth/signup/step1">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
