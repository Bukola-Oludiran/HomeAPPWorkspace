import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
    /** Material icon name */
    icon: string;
    /** Main title text */
    title: string;
    /** Optional description text */
    description?: string;
    /** Optional action button */
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    /** Additional className for customization */
    className?: string;
}

/**
 * EmptyState - A reusable component for empty/no-results states
 * Provides consistent styling with icon, title, description, and optional action
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = '',
}) => {
    return (
        <div
            className={`border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center ${className}`}
        >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            {description && (
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">{description}</p>
            )}
            {action && (
                action.href ? (
                    <Link
                        to={action.href}
                        className="mt-4 px-5 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#0e6bc9] transition-colors"
                    >
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        className="mt-4 px-5 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#0e6bc9] transition-colors"
                    >
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
};

export default EmptyState;
