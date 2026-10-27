import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

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
 * SuccessCelebration - Confirmation modal shown after a successful action
 * Fades in briefly; respects prefers-reduced-motion
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
    const [hasAnimated, setHasAnimated] = useState(false);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (!isOpen || hasAnimated || disabled || prefersReducedMotion) return;

        // Quiet entrance: fade the modal in, no confetti or spinning icon
        if (modalRef.current) {
            gsap.fromTo(modalRef.current,
                { y: 8, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.25,
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
                className="relative bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center"
            >
                {/* Success Icon */}
                <div className="mx-auto mb-6 size-16 bg-brand/10 dark:bg-brand/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand text-[36px]">
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
                    className="w-full py-3 px-6 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export default SuccessCelebration;
