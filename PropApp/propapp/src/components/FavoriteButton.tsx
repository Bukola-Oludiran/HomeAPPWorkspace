import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { propertyService } from '@/lib/api/services/propertyService';

interface FavoriteButtonProps {
    propertyId: number | string;
    initialFavorited?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'overlay' | 'outline';
    onToggle?: (isFavorited: boolean) => void;
    onAuthRequired?: () => void;
}

export default function FavoriteButton({
    propertyId,
    initialFavorited = false,
    size = 'md',
    variant = 'default',
    onToggle,
    onAuthRequired,
}: FavoriteButtonProps) {
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when initialFavorited prop changes
    useEffect(() => {
        setIsFavorited(initialFavorited);
    }, [initialFavorited]);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check authentication - prompt login if not authenticated
        if (!isAuthenticated) {
            if (onAuthRequired) {
                onAuthRequired();
            }
            return;
        }

        // Prevent double-clicks while loading
        if (isLoading) return;

        setIsAnimating(true);
        setIsLoading(true);
        const newState = !isFavorited;

        // Optimistic update
        setIsFavorited(newState);

        try {
            const propertyIdStr = String(propertyId);
            if (newState) {
                await propertyService.saveToFavorites(propertyIdStr);
            } else {
                await propertyService.removeFromFavorites(propertyIdStr);
            }

            // Call callback on success
            if (onToggle) {
                onToggle(newState);
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsFavorited(!newState);
            console.error('Failed to update favorite status:', error);
        } finally {
            setIsLoading(false);
            // Reset animation
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const sizeClasses = {
        sm: 'size-8 text-[18px]',
        md: 'size-10 text-[22px]',
        lg: 'size-12 text-[26px]',
    };

    const variantClasses = {
        default: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md ${isFavorited
                ? 'text-red-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-red-400'
            }`,
        overlay: `bg-white/60 dark:bg-black/40 backdrop-blur-sm hover:bg-white dark:hover:bg-black ${isFavorited
                ? 'text-red-500'
                : 'text-slate-900 dark:text-white'
            }`,
        outline: `border-2 ${isFavorited
                ? 'border-red-500 text-red-500'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:border-red-400'
            }`,
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`rounded-full flex items-center justify-center transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${isAnimating ? 'scale-125' : 'active:scale-95'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-current">
                    progress_activity
                </span>
            ) : (
                <span
                    className={`material-symbols-outlined ${isAnimating ? 'animate-pulse' : ''} ${isFavorited ? 'icon-filled' : ''
                        }`}
                >
                    {isFavorited ? 'favorite' : 'favorite_border'}
                </span>
            )}
        </button>
    );
}
