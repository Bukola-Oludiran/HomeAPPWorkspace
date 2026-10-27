/**
 * Protected Route Component
 * Wraps routes that require authentication and optionally specific roles
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole | UserRole[];
    redirectTo?: string;
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * 
 * @param children - The component to render if authenticated
 * @param requiredRole - Optional role(s) required to access the route
 * @param redirectTo - Optional custom redirect path (defaults to /auth/login)
 */
export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/auth/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show nothing while loading auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a1018]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        // Save the attempted location for redirect after login
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role requirements if specified
    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        if (!allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on user's actual role
            const roleRedirectMap: Record<UserRole, string> = {
                TENANT: '/tenant/dashboard',
                LANDLORD: '/landlord/dashboard',
                AGENT: '/agent/jobs',
                ADMIN: '/admin/dashboard',
            };

            return <Navigate to={roleRedirectMap[user.role] || '/'} replace />;
        }
    }

    return <>{children}</>;
}

/**
 * Higher-order component version for class components or more complex scenarios
 */
export function withProtectedRoute<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    requiredRole?: UserRole | UserRole[]
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute requiredRole={requiredRole}>
                <WrappedComponent {...props} />
            </ProtectedRoute>
        );
    };
}

/**
 * Guest-only route - redirects authenticated users to their dashboard
 */
interface GuestRouteProps {
    children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show nothing while loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a1018]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // If authenticated, redirect to intended location or dashboard
    if (isAuthenticated && user) {
        // Check if there's a saved location to redirect to
        const from = location.state?.from?.pathname;

        if (from) {
            return <Navigate to={from} replace />;
        }

        // Otherwise, redirect to role-specific dashboard
        const roleRedirectMap: Record<UserRole, string> = {
            TENANT: '/tenant/dashboard',
            LANDLORD: '/landlord/dashboard',
            AGENT: '/agent/jobs',
            ADMIN: '/admin/dashboard',
        };

        return <Navigate to={roleRedirectMap[user.role] || '/'} replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
