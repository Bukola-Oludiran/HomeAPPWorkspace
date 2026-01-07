import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface SuccessCelebrationProps {
    /** Whether to show the celebration */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Title text */
    title?: string;
    /** Description text */
    description?: string;
    /** Button text */
    buttonText?: string;
    /** Icon to display (material-symbols name) */
    icon?: string;
    /** Disable animations */
    disabled?: boolean;
}

/**
 * SuccessCelebration - A modal component for celebrating successful actions
 * Features button morph animation, checkmark reveal, and confetti burst
 * Respects prefers-reduced-motion preference
 */
const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
    isOpen,
    onClose,
    title = 'Success!',
    description = 'Your action was completed successfully.',
    buttonText = 'Continue',
    icon = 'check_circle',
    disabled = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (!isOpen || hasAnimated || disabled || prefersReducedMotion) return;

        // Trigger confetti burst
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const colors = ['#137fec', '#10b981', '#f59e0b']; // Brand colors: blue, green, amber

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        };

        // Start confetti after a short delay
        setTimeout(frame, 200);

        // Animate icon
        if (iconRef.current) {
            gsap.fromTo(iconRef.current,
                { scale: 0, rotation: -180 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    delay: 0.1,
                }
            );
        }

        // Animate modal
        if (modalRef.current) {
            gsap.fromTo(modalRef.current,
                { scale: 0.8, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                }
            );
        }

        setHasAnimated(true);
    }, [isOpen, hasAnimated, disabled, prefersReducedMotion]);

    // Reset animation state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasAnimated(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
                {/* Success Icon */}
                <div
                    ref={iconRef}
                    className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-[#137fec] to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-[#137fec]/30"
                >
                    <span className="material-symbols-outlined text-white text-[48px]">
                        {icon}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    {description}
                </p>

                {/* Continue Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/25 transition-all"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default SuccessCelebration;
