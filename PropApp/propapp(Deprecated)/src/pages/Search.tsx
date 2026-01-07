import { Link, useSearchParams } from 'react-router-dom'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Property } from '@/types'

// Mock search results
const mockProperties: Property[] = [
    {
        id: '1',
        ownerId: 'owner1',
        listingType: 'buy',
        title: 'Modern Family Home',
        description: 'Beautiful 4-bedroom home with large garden',
        address: '1243 Oakwood Avenue',
        city: 'Austin',
        state: 'TX',
        lga: 'Austin',
        price: 850000,
        bedrooms: 4,
        bathrooms: 3,
        size: 2400,
        amenities: ['Pool', 'Garage', 'Garden'],
        photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
        verificationTier: 'gold',
        status: 'active',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        ownerId: 'owner2',
        listingType: 'rent',
        title: 'Luxury Apartment',
        description: 'Modern 2-bedroom apartment in prime location',
        address: '5500 Highland Park',
        city: 'Dallas',
        state: 'TX',
        lga: 'Dallas',
        price: 3200,
        pricePeriod: 'month',
        bedrooms: 2,
        bathrooms: 2,
        size: 1100,
        amenities: ['Gym', 'Parking', 'Security'],
        photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
        verificationTier: 'platinum',
        status: 'active',
        createdAt: new Date().toISOString(),
    },
]

export function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Search Header */}
            <div className="bg-white dark:bg-[#101922] border-b border-slate-100 dark:border-slate-800 py-6 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input
                            icon={<span className="material-symbols-outlined">search</span>}
                            placeholder="Search location, property type..."
                            defaultValue={query}
                            className="flex-1"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                Filters
                            </Button>
                            <Button variant="secondary">
                                <span className="material-symbols-outlined text-[18px]">map</span>
                                Map
                            </Button>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                        {['Price', 'Beds', 'Property Type', 'Verified Only'].map((filter) => (
                            <button
                                key={filter}
                                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="py-8 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1400px] mx-auto">
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        {mockProperties.length} properties found
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {mockProperties.map((property) => (
                            <Link key={property.id} to={`/properties/${property.id}`}>
                                <PropertyCard property={property} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
