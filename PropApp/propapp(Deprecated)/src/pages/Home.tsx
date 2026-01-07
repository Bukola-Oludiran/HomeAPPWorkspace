import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { Button } from '@/components/ui/Button'
import type { Property } from '@/types'

// Mock featured properties data
const featuredProperties: Property[] = [
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
    {
        id: '3',
        ownerId: 'owner3',
        listingType: 'short-let',
        title: 'Downtown Loft',
        description: 'Stylish loft in the heart of downtown',
        address: 'Downtown Loft, Seattle',
        city: 'Seattle',
        state: 'WA',
        lga: 'Seattle',
        price: 5500,
        pricePeriod: 'month',
        bedrooms: 1,
        bathrooms: 1.5,
        size: 850,
        amenities: ['Rooftop', 'City View'],
        photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
        verificationTier: 'silver',
        status: 'active',
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        ownerId: 'owner4',
        listingType: 'buy',
        title: 'Beach Villa',
        description: 'Luxurious 5-bedroom villa with ocean view',
        address: '778 Sunnyvale Drive',
        city: 'Miami',
        state: 'FL',
        lga: 'Miami',
        price: 1250000,
        bedrooms: 5,
        bathrooms: 4,
        size: 3200,
        amenities: ['Pool', 'Beach Access', 'Smart Home'],
        photos: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
        verificationTier: 'platinum',
        status: 'active',
        createdAt: new Date().toISOString(),
    },
]

export function HomePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeType, setActiveType] = useState<'buy' | 'rent' | 'short-let' | 'land'>('buy')
    const [aiModeEnabled, setAiModeEnabled] = useState(false)

    const typeButtons = [
        { id: 'buy' as const, label: 'Buy' },
        { id: 'rent' as const, label: 'Rent' },
        { id: 'short-let' as const, label: 'Short-let' },
        { id: 'land' as const, label: 'Land' },
    ]

    return (
        <>
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-32 px-4 md:px-10 lg:px-20 flex justify-center bg-background-light dark:bg-background-dark overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/hero-bg.jpg')`,
                        filter: 'grayscale(100%)'
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-background-light/50 to-background-light dark:via-background-dark/50 dark:to-background-dark" />

                {/* Content */}
                <div className="relative z-10 max-w-4xl w-full flex flex-col items-center mt-8">
                    {/* Title */}
                    <div className="text-center mb-10 space-y-4">
                        <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                            Find your place <span className="text-primary">with confidence.</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal max-w-2xl mx-auto">
                            Browse thousands of verified listings with AI-powered matching to find exactly what you're looking for.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full max-w-3xl bg-white dark:bg-[#1a2632] p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/30 border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 h-14 md:h-16">
                                <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={aiModeEnabled
                                        ? "Ask me... e.g. Find me a 2-bed in Lekki under ₦1.5M"
                                        : "Search by location, price, or property type..."
                                    }
                                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg w-full p-0"
                                />
                            </div>
                            <Link to={`/search?q=${searchQuery}&type=${activeType}`}>
                                <Button size="lg" className="h-14 md:h-16 px-8 w-full md:w-auto">
                                    Search
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Type Buttons & AI Toggle */}
                    <div className="w-full max-w-3xl mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Type Pills */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                            {typeButtons.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setActiveType(type.id)}
                                    className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${activeType === type.id
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-105'
                                            : 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* AI Toggle */}
                        <div className="flex items-center gap-3 bg-white dark:bg-[#1a2632] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="material-symbols-outlined text-primary icon-filled">smart_toy</span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">AI Search</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">Natural language</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-2">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={aiModeEnabled}
                                    onChange={(e) => setAiModeEnabled(e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="flex-1 w-full bg-white dark:bg-[#101922] py-16 px-4 md:px-10 lg:px-20 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-[1400px] mx-auto">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Featured Verified Properties
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Hand-picked properties with verified ownership status.
                            </p>
                        </div>
                        <Link
                            to="/search"
                            className="hidden md:flex items-center gap-1 text-primary font-bold hover:underline"
                        >
                            View all
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Property Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {featuredProperties.map((property) => (
                            <Link key={property.id} to={`/properties/${property.id}`}>
                                <PropertyCard property={property} />
                            </Link>
                        ))}
                    </div>

                    {/* Mobile View All Link */}
                    <div className="mt-8 flex md:hidden justify-center">
                        <Link
                            to="/search"
                            className="flex items-center gap-1 text-primary font-bold hover:underline"
                        >
                            View all properties
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
