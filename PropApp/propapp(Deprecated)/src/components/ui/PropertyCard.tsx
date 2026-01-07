import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge, VerificationBadge } from "./Badge"
import type { Property, ListingType } from "@/types"
import { formatPriceWithPeriod } from "@/utils/format"

export interface PropertyCardProps {
    property: Property
    onFavorite?: (id: string) => void
    isFavorited?: boolean
    className?: string
}

const listingTypeLabels: Record<ListingType, { label: string; variant: 'success' | 'info' | 'warning' }> = {
    buy: { label: 'For Sale', variant: 'success' },
    rent: { label: 'For Rent', variant: 'info' },
    'short-let': { label: 'Short-let', variant: 'warning' },
    land: { label: 'Land', variant: 'success' },
}

const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(
    ({ className, property, onFavorite, isFavorited = false, ...props }, ref) => {
        const listingInfo = listingTypeLabels[property.listingType]

        return (
            <article
                className={cn(
                    "group flex flex-col gap-4 cursor-pointer",
                    className
                )}
                ref={ref}
                {...props}
            >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200">
                    <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Verification Badge */}
                    <div className="absolute top-3 left-3">
                        <VerificationBadge tier={property.verificationTier} />
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onFavorite?.(property.id)
                        }}
                        className="absolute top-3 right-3 bg-white/60 dark:bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-black text-slate-900 dark:text-white transition-colors"
                    >
                        <span className={cn(
                            "material-symbols-outlined text-[20px]",
                            isFavorited && "icon-filled text-red-500"
                        )}>
                            favorite
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatPriceWithPeriod(property.price, property.pricePeriod)}
                        </p>
                        <Badge variant={listingInfo.variant}>
                            {listingInfo.label}
                        </Badge>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 text-base font-medium truncate">
                        {property.address}, {property.city}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mt-3 text-slate-500 dark:text-slate-400 text-sm">
                        {property.bedrooms > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">bed</span>
                                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                            </span>
                        )}
                        {property.bathrooms > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">bathtub</span>
                                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                            </span>
                        )}
                        {property.size > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                {property.size.toLocaleString()} sqft
                            </span>
                        )}
                    </div>
                </div>
            </article>
        )
    }
)
PropertyCard.displayName = "PropertyCard"

export { PropertyCard }
