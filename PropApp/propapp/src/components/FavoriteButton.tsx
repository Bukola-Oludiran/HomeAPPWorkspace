import { useState } from 'react';

interface FavoriteButtonProps {
    propertyId: number | string;
    initialFavorited?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'overlay' | 'outline';
    onToggle?: (isFavorited: boolean) => void;
    requiresAuth?: boolean;
    onAuthRequired?: () => void;
}

export default function FavoriteButton({
    propertyId,
    initialFavorited = false,
    size = 'md',
    variant = 'default',
    onToggle,
    requiresAuth = false,
    onAuthRequired,
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (requiresAuth && onAuthRequired) {
            onAuthRequired();
            return;
        }

        setIsAnimating(true);
        const newState = !isFavorited;
        setIsFavorited(newState);

        // Reset animation
        setTimeout(() => setIsAnimating(false), 300);

        // Call callback
        if (onToggle) {
            onToggle(newState);
        }

        // Simulate API call (in real app, this would save to backend)
        console.log(`Property ${propertyId} ${newState ? 'added to' : 'removed from'} favorites`);
    };

    const sizeClasses = {
        sm: 'size-8 text-[18px]',
        md: 'size-10 text-[22px]',
        lg: 'size-12 text-[26px]',
    };

    const variantClasses = {
        default: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md ${isFavorited
                ? 'text-red-500'
                : 'text-slate-400 hover:text-red-400'
            }`,
        overlay: `bg-white/60 dark:bg-black/40 backdrop-blur-sm hover:bg-white dark:hover:bg-black ${isFavorited
                ? 'text-red-500'
                : 'text-slate-900 dark:text-white'
            }`,
        outline: `border-2 ${isFavorited
                ? 'border-red-500 text-red-500'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-400'
            }`,
    };

    return (
        <button
            onClick={handleClick}
            className={`rounded-full flex items-center justify-center transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${isAnimating ? 'scale-125' : 'active:scale-95'
                }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <span
                className={`material-symbols-outlined ${isAnimating ? 'animate-pulse' : ''} ${isFavorited ? 'icon-filled' : ''
                    }`}
            >
                {isFavorited ? 'favorite' : 'favorite_border'}
            </span>
        </button>
    );
}
