import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthModalProps {
    icon?: string;
    iconColor?: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
    showClose?: boolean;
    onClose?: () => void;
    backLink?: {
        to: string;
        label: string;
    };
    stepBadge?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function AuthModal({
    icon,
    iconColor = 'text-brand-ink',
    title,
    subtitle,
    children,
    showClose = false,
    onClose,
    backLink,
    stepBadge,
    maxWidth = 'md'
}: AuthModalProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
    };

    return (
        <div className={`w-full ${maxWidthClasses[maxWidth]} bg-white/10 dark:bg-surface-dark/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-10 flex flex-col items-center relative`}>
            {/* Close Button */}
            {showClose && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 size-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors"
                    type="button"
                >
                    <span className="material-symbols-outlined text-red-500 text-lg">close</span>
                </button>
            )}

            {/* Step Badge */}
            {stepBadge && (
                <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-brand/20 border border-brand/30 text-brand-ink text-xs font-bold uppercase tracking-wider">
                        {stepBadge}
                    </span>
                </div>
            )}

            {/* Icon */}
            {icon && (
                <div className="mb-6 flex justify-center">
                    <div className="size-16 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shadow-inner ring-1 ring-white/5">
                        <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
                    </div>
                </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center">{title}</h1>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-slate-200 dark:text-slate-300 text-sm mb-8 font-normal text-center leading-relaxed">
                    {subtitle}
                </p>
            )}

            {/* Content */}
            {children}

            {/* Back Link */}
            {backLink && (
                <div className="mt-8">
                    <Link
                        to={backLink.to}
                        className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        {backLink.label}
                    </Link>
                </div>
            )}
        </div>
    );
}
