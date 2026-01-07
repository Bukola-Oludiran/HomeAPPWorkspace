import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PropertyCard } from '@/components/ui/PropertyCard'
import type { Property } from '@/types'

export function TenantSavedProperties() {
    const savedProperties: Property[] = [
        {
            id: '1',
            ownerId: 'owner1',
            listingType: 'rent',
            title: 'Luxury Penthouse',
            description: 'Stunning penthouse with panoramic views',
            address: '123 Skyline Drive',
            city: 'Houston',
            state: 'TX',
            lga: 'Houston',
            price: 4500,
            pricePeriod: 'month',
            bedrooms: 3,
            bathrooms: 2,
            size: 2200,
            amenities: ['Pool', 'Gym', 'Concierge'],
            photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
            verificationTier: 'platinum',
            status: 'active',
            createdAt: new Date().toISOString(),
        },
        {
            id: '2',
            ownerId: 'owner2',
            listingType: 'buy',
            title: 'Modern Family Home',
            description: 'Perfect for growing families',
            address: '456 Oak Street',
            city: 'Austin',
            state: 'TX',
            lga: 'Austin',
            price: 650000,
            bedrooms: 4,
            bathrooms: 3,
            size: 2800,
            amenities: ['Garden', 'Garage', 'Solar'],
            photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
            verificationTier: 'gold',
            status: 'active',
            createdAt: new Date().toISOString(),
        },
        {
            id: '3',
            ownerId: 'owner3',
            listingType: 'rent',
            title: 'Cozy Studio',
            description: 'Perfect starter apartment',
            address: '789 Downtown Ave',
            city: 'Dallas',
            state: 'TX',
            lga: 'Dallas',
            price: 1200,
            pricePeriod: 'month',
            bedrooms: 0,
            bathrooms: 1,
            size: 450,
            amenities: ['Gym', 'Laundry'],
            photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
            verificationTier: 'silver',
            status: 'active',
            createdAt: new Date().toISOString(),
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Saved Properties
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        {savedProperties.length} properties saved for later
                    </p>
                </div>
                <Link to="/search">
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        Browse More
                    </Button>
                </Link>
            </div>

            {/* Filter Tabs */}
            <Card className="p-3 mb-6 flex gap-2 overflow-x-auto">
                {['All', 'For Rent', 'For Sale', 'Short-let'].map((filter, i) => (
                    <button
                        key={filter}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i === 0
                            ? 'bg-primary text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </Card>

            {/* Properties Grid */}
            {savedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                        <div key={property.id} className="relative group">
                            <Link to={`/properties/${property.id}`}>
                                <PropertyCard property={property} isFavorited={true} />
                            </Link>
                            {/* Quick Actions Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <Link to={property.listingType === 'buy' ? `/buy/${property.id}` : `/apply/${property.id}`} className="flex-1">
                                        <Button size="sm" className="w-full">
                                            {property.listingType === 'buy' ? 'Buy Now' : 'Apply'}
                                        </Button>
                                    </Link>
                                    <Button variant="secondary" size="sm">
                                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <Card className="p-12 text-center">
                    <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">favorite</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        No saved properties yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                        Start browsing and save properties you're interested in to compare them later
                    </p>
                    <Link to="/search">
                        <Button>
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            Browse Properties
                        </Button>
                    </Link>
                </Card>
            )}

            {/* Comparison Banner */}
            {savedProperties.length >= 2 && (
                <Card className="mt-8 p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">compare</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Compare Properties</h4>
                            <p className="text-sm text-slate-500">Select up to 3 properties to compare side by side</p>
                        </div>
                    </div>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                        Compare ({Math.min(savedProperties.length, 3)})
                    </Button>
                </Card>
            )}
        </div>
    )
}
