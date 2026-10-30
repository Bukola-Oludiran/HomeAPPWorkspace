import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';

interface CounterProps {
    /** End value to count to */
    end: number;
    /** Start value (default: 0) */
    start?: number;
    /** Duration of count animation in seconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** Prefix string (e.g., "₦") */
    prefix?: string;
    /** Suffix string (e.g., "/mo", "%") */
    suffix?: string;
    /** Number of decimal places */
    decimals?: number;
    /** Thousand separator */
    separator?: string;
    /** Disable animation */
    disabled?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * Counter - Animated rolling number display
 * Uses react-countup for smooth number transitions
 * Perfect for stats, financial figures, and metrics
 */
const Counter: React.FC<CounterProps> = ({
    end,
    start = 0,
    duration = 1.5,
    delay = 0,
    prefix = '',
    suffix = '',
    decimals = 0,
    separator = ',',
    disabled = false,
    className = '',
}) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (!disabled && !prefersReducedMotion) {
            const timer = setTimeout(() => setShouldAnimate(true), delay * 1000);
            return () => clearTimeout(timer);
        }
    }, [delay, disabled, prefersReducedMotion]);

    // If disabled or reduced motion, show static value
    if (disabled || prefersReducedMotion) {
        return (
            <span className={`font-mono tabular-nums ${className}`}>
                {prefix}{end.toLocaleString()}{suffix}
            </span>
        );
    }

    return (
        <span className={`font-mono tabular-nums ${className}`}>
            {shouldAnimate ? (
                <CountUp
                    start={start}
                    end={end}
                    duration={duration}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={decimals}
                    separator={separator}
                />
            ) : (
                `${prefix}${start}${suffix}`
            )}
        </span>
    );
};

export default Counter;
