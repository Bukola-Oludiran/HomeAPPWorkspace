import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

export function PropertyDetailPage() {
    const { id } = useParams()

    // Mock property data
    const property = {
        id: id,
        title: '5500 Highland Park, Unit 4B',
        address: 'Dallas, TX 75205',
        price: 3200,
        pricePeriod: 'month' as const,
        beds: 2,
        baths: 2,
        size: 1100,
        verificationTier: 'platinum' as const,
        description: 'Beautifully renovated 2-bedroom apartment in the heart of Highland Park. This unit features modern finishes, stainless steel appliances, hardwood floors throughout, and an open floor plan perfect for entertaining. Building amenities include a fitness center, pool, and 24-hour security.',
        amenities: ['Pool', 'Gym', 'Parking', 'Security', 'Laundry', 'Central AC'],
        photos: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        ],
        landlord: {
            name: 'Robert Johnson',
            avatar: '',
            joinDate: 'Jan 2022',
            verified: true,
        },
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Image */}
            <div className="relative h-64 md:h-96 w-full">
                <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                    <VerificationBadge tier={property.verificationTier} />
                </div>
                <Link
                    to="/search"
                    className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur p-2 rounded-full"
                >
                    <span className="material-symbols-outlined">close</span>
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title Section */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{property.title}</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{property.address}</p>

                            {/* Stats */}
                            <div className="flex gap-6 mt-4 text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">bed</span>
                                    {property.beds} Beds
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">bathtub</span>
                                    {property.baths} Baths
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">square_foot</span>
                                    {property.size.toLocaleString()} sqft
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Description</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Amenities</h2>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity) => (
                                    <Badge key={amenity} variant="default">{amenity}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <div className="text-3xl font-extrabold text-primary mb-4">
                                ${property.price.toLocaleString()}
                                <span className="text-base font-normal text-slate-400">/{property.pricePeriod}</span>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full">Apply Now</Button>
                                <Button variant="outline" className="w-full">
                                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                    Schedule Viewing
                                </Button>
                            </div>
                        </div>

                        {/* Landlord Card */}
                        <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                                Property Manager
                            </h3>
                            <div className="flex items-center gap-3">
                                <Avatar fallback={property.landlord.name} size="lg" />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{property.landlord.name}</p>
                                    <p className="text-xs text-slate-500">Member since {property.landlord.joinDate}</p>
                                </div>
                                {property.landlord.verified && (
                                    <span className="material-symbols-outlined text-primary icon-filled">verified</span>
                                )}
                            </div>
                            <Button variant="secondary" className="w-full mt-4">
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Contact
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
