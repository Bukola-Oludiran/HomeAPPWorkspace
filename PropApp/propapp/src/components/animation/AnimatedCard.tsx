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
    duration = 0.6,
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

        // Set initial state
        gsap.set(cardRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.95,
        });

        // Animate to final state
        gsap.to(cardRef.current, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: duration,
            delay: delay,
            ease: 'back.out(1.7)', // Subtle bounce
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
