import React from 'react';

type LogoTone = 'auto' | 'on-dark';
type WordmarkVisibility = 'always' | 'md' | 'never';

interface LogoProps {
    /** 'auto' follows the light/dark theme; 'on-dark' is for photos and Night grounds in either theme */
    tone?: LogoTone;
    /** When to show the wordmark beside the mark; 'md' hides it below the md breakpoint */
    wordmark?: WordmarkVisibility;
    /** Additional className for the lockup */
    className?: string;
}

/**
 * KeyMark - The Keystead house-key mark, from the design system's Logos asset group.
 * Drawn in currentColor so the lockup can switch between brand blue and sky.
 */
export const KeyMark: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg viewBox="2 16 58 31" fill="currentColor" className={className} aria-hidden="true">
        <path
            d="M4 30 L17 19 L30 30 V44 H4 Z M13.5 33 A3.5 3.5 0 1 0 20.5 33 A3.5 3.5 0 1 0 13.5 33 Z M15.6 34 L14.8 39.5 H19.2 L18.4 34 Z"
            fillRule="evenodd"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
        />
        <rect x="29" y="33" width="29" height="5" rx="1" />
        <rect x="46" y="37" width="4" height="8" rx="1" />
        <rect x="53" y="37" width="4" height="6" rx="1" />
    </svg>
);

/**
 * Logo - The Keystead lockup: house-key mark beside the wordmark,
 * "Key" in ink and "stead" in brand blue (white and sky on dark grounds)
 */
const Logo: React.FC<LogoProps> = ({ tone = 'auto', wordmark = 'always', className = '' }) => {
    const onDark = tone === 'on-dark';
    // The logo stays brand blue (it is large enough); small UI text uses brand-ink instead
    const markColor = onDark ? 'text-sky' : 'text-brand dark:text-sky';
    const keyColor = onDark ? 'text-white' : 'text-ink dark:text-white';
    const wordmarkVisibility = wordmark === 'md' ? 'hidden md:inline' : '';

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <KeyMark className={`h-6 w-auto shrink-0 ${markColor}`} />
            {wordmark === 'never' ? (
                <span className="sr-only">Keystead</span>
            ) : (
                <>
                    <span className={`text-xl font-extrabold leading-none tracking-[-0.02em] ${keyColor} ${wordmarkVisibility}`}>
                        Key<span className={onDark ? 'text-sky' : 'text-brand dark:text-sky'}>stead</span>
                    </span>
                    {wordmark === 'md' && <span className="sr-only md:hidden">Keystead</span>}
                </>
            )}
        </span>
    );
};

export default Logo;
