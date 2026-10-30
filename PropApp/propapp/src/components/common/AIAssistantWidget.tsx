import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

interface AIAssistantWidgetProps {
    /** Custom placeholder text */
    placeholder?: string;
    /**
     * Callback when message is submitted. If omitted, the widget navigates
     * to `/ai-chat?msg=<encoded>` and the chat page auto-submits — this is
     * the default "submit-and-navigate" behavior used everywhere unless a
     * caller wants to keep the user on-page (e.g. an inline panel).
     *
     * The optional `contextSeed` carries propertyId / leaseId / etc. so
     * the chat page opens with the right context — pass it on the
     * caller's `contextSeed` prop and the widget forwards it as URL params.
     */
    onSubmit?: (message: string) => void;
    /** Quick suggestion buttons (optional) */
    suggestions?: string[];
    /** Context seed forwarded to `/ai-chat` when navigating. */
    contextSeed?: {
        propertyId?: string;
        leaseId?: string;
        applicationId?: string;
        conversationId?: string;
        maintenanceRequestId?: string;
    };
}

/**
 * AIAssistantWidget - Floating AI prompt bar with liquid morph animation
 *
 * Single container that morphs and translates:
 * - Collapsed: positioned bottom-right
 * - Expanded: grows and slides to center
 *
 * Default behavior on submit: navigate to /ai-chat?msg=<encoded> (the
 * dedicated chat page auto-submits the message). Callers can override
 * with a custom `onSubmit` handler for inline-mini-chat behavior
 * (planned but not implemented in v1).
 */
const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
    placeholder = 'Ask Keystead anything...',
    onSubmit,
    contextSeed,
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const COLLAPSED_WIDTH = 180;
    const BOTTOM_OFFSET = 24; // bottom-6

    // Calculate positions based on viewport
    const getPositions = useCallback(() => {
        const vw = window.innerWidth;
        const isMobile = vw < 640;

        // Expanded width
        const expandedWidth = isMobile ? vw - 32 : Math.min(576, vw - 64);

        // Collapsed position (right side)
        const collapsedLeft = vw - BOTTOM_OFFSET - COLLAPSED_WIDTH;

        // Expanded position (centered)
        const expandedLeft = (vw - expandedWidth) / 2;

        return { expandedWidth, collapsedLeft, expandedLeft, isMobile };
    }, []);

    // Set initial position on mount
    useEffect(() => {
        if (!containerRef.current) return;
        const { collapsedLeft } = getPositions();
        gsap.set(containerRef.current, { left: collapsedLeft, width: COLLAPSED_WIDTH });
    }, [getPositions]);

    // Handle morph animation
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        if (prefersReducedMotion) {
            const { expandedWidth, collapsedLeft, expandedLeft } = getPositions();
            if (isExpanded) {
                gsap.set(container, { left: expandedLeft, width: expandedWidth });
                setShowInput(true);
            } else {
                gsap.set(container, { left: collapsedLeft, width: COLLAPSED_WIDTH });
                setShowInput(false);
            }
            return;
        }

        if (isExpanded) {
            const { expandedWidth, expandedLeft, isMobile } = getPositions();

            // Morph: grow width and translate left simultaneously
            gsap.timeline({
                defaults: { ease: 'power3.out' },
                onStart: () => setShowInput(true),
            })
                .to(container, {
                    left: expandedLeft,
                    width: expandedWidth,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                    duration: isMobile ? 0.4 : 0.55,
                })
                // Slight elastic overshoot at the end
                .to(container, {
                    scaleX: 1.01,
                    duration: 0.1,
                    ease: 'power2.out',
                })
                .to(container, {
                    scaleX: 1,
                    duration: 0.15,
                    ease: 'power2.inOut',
                });

            setTimeout(() => inputRef.current?.focus(), 250);
        } else {
            const { collapsedLeft } = getPositions();

            // First hide input, then morph back
            setShowInput(false);

            gsap.timeline({ defaults: { ease: 'power3.inOut' } })
                .to(container, {
                    left: collapsedLeft,
                    width: COLLAPSED_WIDTH,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    duration: 0.45,
                });
        }
    }, [isExpanded, prefersReducedMotion, getPositions]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const { expandedWidth, collapsedLeft, expandedLeft } = getPositions();

            gsap.to(containerRef.current, {
                left: isExpanded ? expandedLeft : collapsedLeft,
                width: isExpanded ? expandedWidth : COLLAPSED_WIDTH,
                duration: 0.2,
                ease: 'power2.out',
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded, getPositions]);

    const handleSubmit = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        if (onSubmit) {
            onSubmit(trimmed);
        } else {
            // Default: hand off to the dedicated /ai-chat page which
            // auto-submits the message via the `?msg=` URL param.
            const params = new URLSearchParams({ msg: trimmed });
            if (contextSeed?.propertyId) params.set('propertyId', contextSeed.propertyId);
            if (contextSeed?.leaseId) params.set('leaseId', contextSeed.leaseId);
            if (contextSeed?.applicationId) params.set('applicationId', contextSeed.applicationId);
            if (contextSeed?.conversationId) params.set('conversationId', contextSeed.conversationId);
            if (contextSeed?.maintenanceRequestId)
                params.set('maintenanceRequestId', contextSeed.maintenanceRequestId);
            navigate(`/ai-chat?${params.toString()}`);
        }
        setInputValue('');
        setIsExpanded(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={() => !isExpanded && setIsExpanded(true)}
            className="fixed z-[100] h-14 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 dark:border-slate-700/50 flex items-center overflow-hidden cursor-pointer"
            style={{
                bottom: BOTTOM_OFFSET,
                width: COLLAPSED_WIDTH,
            }}
        >
            {/* AI Icon - Click to toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="shrink-0 size-12 m-1 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md active:scale-95 transition-transform"
                title={isExpanded ? "Minimize" : "Expand"}
            >
                <span className="material-symbols-outlined text-[22px]">forum</span>
            </button>

            {showInput ? (
                /* Expanded: Input Field */
                <>
                    <input
                        ref={inputRef}
                        className="flex-1 min-w-0 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 px-2"
                        placeholder={placeholder}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Send Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit();
                        }}
                        className="shrink-0 size-10 m-1.5 rounded-full bg-brand-ink hover:bg-brand-ink/90 active:scale-95 text-on-brand flex items-center justify-center transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                    </button>
                </>
            ) : (
                /* Collapsed: Label */
                <div className="flex flex-col items-start pl-1 pr-4">
                    <span className="text-sm font-bold leading-none text-slate-900 dark:text-white whitespace-nowrap">Ask Keystead...</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click to chat</span>
                </div>
            )}
        </div>
    );
};

export default AIAssistantWidget;
