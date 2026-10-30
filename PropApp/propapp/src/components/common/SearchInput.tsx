import React from 'react';

interface SearchInputProps {
    /** Placeholder text */
    placeholder?: string;
    /** Controlled value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Size variant */
    variant?: 'default' | 'compact';
    /** Enable focus glow animation */
    glowOnFocus?: boolean;
    /** Additional className for customization */
    className?: string;
}

/**
 * SearchInput - A reusable search input component with icon
 * Provides consistent styling with dark mode support
 * Supports optional glassmorphism focus glow effect
 */
const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    variant = 'default',
    glowOnFocus = true,
    className = '',
}) => {
    const sizeClasses = variant === 'compact'
        ? 'py-1.5 text-sm pl-9 pr-4'
        : 'py-2.5 text-sm pl-10 pr-4';

    const iconPositionClasses = variant === 'compact'
        ? 'left-2.5 top-2'
        : 'left-3 top-2.5';

    const focusClasses = glowOnFocus
        ? 'focus:ring-2 focus:ring-brand/30 focus:border-brand focus:shadow-lg focus:scale-[1.01] transition-all duration-200'
        : 'focus:ring-brand focus:border-brand transition-colors';

    return (
        <div className={`relative ${className}`}>
            <span className={`material-symbols-outlined absolute ${iconPositionClasses} text-slate-400 text-[20px] pointer-events-none transition-colors peer-focus:text-brand-ink`}>
                search
            </span>
            <input
                type="text"
                className={`peer w-full ${sizeClasses} bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 ${focusClasses}`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchInput;

