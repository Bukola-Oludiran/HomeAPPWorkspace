import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
    /** Child elements (button content) */
    children: React.ReactNode;
    /** Magnetic pull strength (0-1, default: 0.3) */
    strength?: number;
    /** Additional className for the wrapper */
    className?: string;
    /** Disable magnetic effect */
    disabled?: boolean;
}

/**
 * MagneticButton - Creates a cursor-tracking magnetic effect
 * Button subtly moves toward the cursor when hovering nearby
 * Respects prefers-reduced-motion preference
 */
const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    strength = 0.3,
    className = '',
    disabled = false,
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (disabled || prefersReducedMotion || !buttonRef.current) return;

        const button = buttonRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isHovering) return;

            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(button, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isHovering, strength, disabled, prefersReducedMotion]);

    if (disabled || prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={buttonRef}
            className={`inline-block ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {children}
        </div>
    );
};

export default MagneticButton;
