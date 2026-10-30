import React from 'react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
    /** Unique property ID */
    id: number | string;
    /** Property title/name */
    title: string;
    /** Property location */
    location: string;
    /** Unit identifier */
    unit?: string;
    /** Property image URL */
    image: string;
    /** Status label (e.g., "Rented", "Active") */
    status?: string;
    /** Status badge color class */
    statusColor?: string;
    /** Number of bedrooms */
    beds?: number;
    /** Number of bathrooms */
    baths?: number;
    /** Square footage */
    sqft?: string;
    /** Price to display */
    price?: string;
    /** Price type suffix (e.g., "/mo", "/yr") */
    priceType?: string;
    /** Property type badge (e.g., "FOR RENT", "FOR SALE") */
    propertyType?: string;
    /** Link destination */
    href?: string;
    /** Display variant */
    variant?: 'grid' | 'list' | 'mini';
    /** Show favorite/save button */
    showFavorite?: boolean;
    /** Is property favorited */
    isFavorited?: boolean;
    /** Favorite toggle handler */
    onFavoriteToggle?: () => void;
    /** Additional className */
    className?: string;
}

/**
 * PropertyCard - A reusable property display component with multiple variants
 * Supports grid, list, and mini display modes
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
    id: _id,
    title,
    location,
    unit,
    image,
    status,
    statusColor = 'bg-green-600',
    beds,
    baths,
    sqft,
    price,
    priceType = '/mo',
    propertyType,
    href,
    variant = 'grid',
    showFavorite = false,
    isFavorited = false,
    onFavoriteToggle,
    className = '',
}) => {
    // Grid variant content
    const renderGridContent = () => (
        <>
            <div className="relative h-48 overflow-hidden">
                <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={image}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    {propertyType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/80 text-white shadow-sm backdrop-blur-md">
                            {propertyType}
                        </span>
                    )}
                    {status && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${statusColor} text-white shadow-sm backdrop-blur-md bg-opacity-90`}>
                            {status}
                        </span>
                    )}
                </div>
                {showFavorite && (
                    <button
                        onClick={(e) => { e.preventDefault(); onFavoriteToggle?.(); }}
                        className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isFavorited ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {location}{unit && ` • ${unit}`}
                        </p>
                    </div>
                </div>
                {(beds !== undefined || baths !== undefined || sqft) && (
                    <div className="flex items-center gap-3 my-3 text-xs text-slate-500 dark:text-slate-400">
                        {beds !== undefined && (
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">bed</span> {beds}
                            </span>
                        )}
                        {baths !== undefined && (
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">bathtub</span> {baths}
                            </span>
                        )}
                        {sqft && (
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">square_foot</span> {sqft}
                            </span>
                        )}
                    </div>
                )}
                {price && (
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {price}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{priceType}</span>
                        </p>
                    </div>
                )}
            </div>
        </>
    );

    // List variant content
    const renderListContent = () => (
        <>
            <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
                <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={image}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    {status && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${statusColor} text-white shadow-sm backdrop-blur-md bg-opacity-95`}>
                            {status}
                        </span>
                    )}
                </div>
                {showFavorite && (
                    <button
                        onClick={(e) => { e.preventDefault(); onFavoriteToggle?.(); }}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-md"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isFavorited ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="mb-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {location}{unit && ` • ${unit}`}
                    </p>
                </div>
                {(beds !== undefined || baths !== undefined || sqft) && (
                    <div className="flex items-center gap-3 my-2 text-xs text-slate-500 dark:text-slate-400">
                        {beds !== undefined && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">bed</span> {beds} Beds
                            </span>
                        )}
                        {baths !== undefined && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">bathtub</span> {baths} Baths
                            </span>
                        )}
                        {sqft && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">square_foot</span> {sqft}
                            </span>
                        )}
                    </div>
                )}
                {price && (
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                        {price}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{priceType}</span>
                    </p>
                )}
            </div>
        </>
    );

    // Mini variant content
    const renderMiniContent = () => (
        <>
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                <img
                    alt={title}
                    className="w-full h-full object-cover"
                    src={image}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{location}</p>
                {price && (
                    <p className="text-sm font-bold text-brand-ink mt-1">
                        {price}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{priceType}</span>
                    </p>
                )}
            </div>
        </>
    );

    const gridClasses = `bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-lg hover:border-brand/30 transition-all flex flex-col ${className}`;
    const listClasses = `bg-white dark:bg-canvas-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-lg hover:border-brand/30 transition-all flex flex-col md:flex-row ${className}`;
    const miniClasses = `bg-white dark:bg-canvas-dark rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all flex gap-3 p-3 ${className}`;

    // Grid variant
    if (variant === 'grid') {
        return href ? (
            <Link to={href} className={gridClasses}>
                {renderGridContent()}
            </Link>
        ) : (
            <div className={gridClasses}>
                {renderGridContent()}
            </div>
        );
    }

    // List variant
    if (variant === 'list') {
        return href ? (
            <Link to={href} className={listClasses}>
                {renderListContent()}
            </Link>
        ) : (
            <div className={listClasses}>
                {renderListContent()}
            </div>
        );
    }

    // Mini variant (for sidebars, previews)
    return href ? (
        <Link to={href} className={miniClasses}>
            {renderMiniContent()}
        </Link>
    ) : (
        <div className={miniClasses}>
            {renderMiniContent()}
        </div>
    );
};

export default PropertyCard;
