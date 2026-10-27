import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

interface AnimatedCardProps {
    /** Child elements to animate */
    children: React.ReactNode;
    /** Delay before animation starts (useful for staggering multiple cards) */
    delay?: number;
    /** Animation duration in seconds */
    duration?: number;
    /** Additional className */
    className?: string;
    /** Disable animation (respects reduced motion preference) */
    disabled?: boolean;
}

/**
 * AnimatedCard - Wraps content with a spring-up reveal animation
 * Uses GSAP for smooth, GPU-accelerated animations
 * Automatically respects prefers-reduced-motion
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    delay = 0,
    duration = 0.25,
    className = '',
    disabled = false,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useGSAP(() => {
        if (disabled || prefersReducedMotion || !cardRef.current) return;

        gsap.set(cardRef.current, {
            opacity: 0,
            y: 4,
        });

        gsap.to(cardRef.current, {
            opacity: 1,
            y: 0,
            duration: Math.min(duration, 0.3),
            delay: delay,
            ease: 'power2.out',
        });
    }, { scope: cardRef });

    // If reduced motion or disabled, just render children without animation wrapper styles
    if (disabled || prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div ref={cardRef} className={className} style={{ opacity: 0 }}>
            {children}
        </div>
    );
};

export default AnimatedCard;
