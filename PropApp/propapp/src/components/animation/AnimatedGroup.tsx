import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

interface AnimatedGroupProps {
    /** Child elements to stagger animate */
    children: React.ReactNode;
    /** Delay between each child animation */
    stagger?: number;
    /** Animation duration for each child */
    duration?: number;
    /** Initial delay before first child animates */
    delay?: number;
    /** Additional className for the container */
    className?: string;
    /** Selector for children to animate (default: direct children) */
    childSelector?: string;
    /** Disable animation */
    disabled?: boolean;
}

/**
 * AnimatedGroup - Staggers animation across multiple children
 * Perfect for grids, lists, and bento layouts
 * Uses GSAP stagger for choreographed reveals
 */
const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
    children,
    stagger = 0.03,
    duration = 0.25,
    delay = 0,
    className = '',
    disabled = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useGSAP(() => {
        if (disabled || prefersReducedMotion || !containerRef.current) return;

        const children = containerRef.current.querySelectorAll(':scope > *');
        if (children.length === 0) return;

        // Quiet fade-in; stagger is capped so long lists don't take seconds to settle
        gsap.set(children, {
            opacity: 0,
            y: 4,
        });

        gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: Math.min(duration, 0.3),
            delay: delay,
            stagger: Math.min(stagger, 0.03),
            ease: 'power2.out',
        });
    }, { scope: containerRef });

    if (disabled || prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default AnimatedGroup;
