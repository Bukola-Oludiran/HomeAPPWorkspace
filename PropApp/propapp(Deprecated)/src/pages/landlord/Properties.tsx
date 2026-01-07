import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function LandlordProperties() {
    const properties = [
        {
            id: '1',
            title: '5500 Highland Park, Unit 4B',
            address: 'Dallas, TX 75205',
            type: 'rent',
            price: 3200,
            status: 'rented',
            verificationTier: 'platinum',
            bedrooms: 2,
            bathrooms: 2,
            tenant: { name: 'Sarah Johnson', avatar: '' },
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
        },
        {
            id: '2',
            title: '1243 Oakwood Avenue',
            address: 'Austin, TX',
            type: 'buy',
            price: 850000,
            status: 'active',
            verificationTier: 'gold',
            bedrooms: 4,
            bathrooms: 3,
            tenant: null,
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        },
        {
            id: '3',
            title: 'Downtown Loft',
            address: 'Houston, TX',
            type: 'rent',
            price: 2800,
            status: 'maintenance',
            verificationTier: 'silver',
            bedrooms: 1,
            bathrooms: 1,
            tenant: { name: 'Mike Davis', avatar: '' },
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'rented':
                return <Badge variant="info">Rented</Badge>
            case 'active':
                return <Badge variant="success">Active Listing</Badge>
            case 'maintenance':
                return <Badge variant="warning">Maintenance</Badge>
            case 'vacant':
                return <Badge variant="default">Vacant</Badge>
            default:
                return <Badge variant="default">{status}</Badge>
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        My Properties
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Manage your {properties.length} properties
                    </p>
                </div>
                <Link to="/landlord/properties/new">
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">add_home</span>
                        Add Property
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                    <Input
                        icon={<span className="material-symbols-outlined text-[18px]">search</span>}
                        placeholder="Search properties..."
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Rented', 'Active', 'Vacant', 'Maintenance'].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:border-primary/50 transition-all group">
                        {/* Image */}
                        <div className="relative h-48">
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                                {getStatusBadge(property.status)}
                            </div>
                            <div className="absolute top-3 right-3">
                                <button className="size-8 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{property.title}</h3>
                                    <p className="text-sm text-slate-500">{property.address}</p>
                                </div>
                                <p className="text-lg font-bold text-primary">
                                    {property.type === 'rent'
                                        ? `$${property.price.toLocaleString()}/mo`
                                        : `$${property.price.toLocaleString()}`}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">bed</span>
                                    {property.bedrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">bathtub</span>
                                    {property.bathrooms}
                                </span>
                            </div>

                            {/* Tenant or Actions */}
                            {property.tenant ? (
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                            {property.tenant.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {property.tenant.name}
                                        </span>
                                    </div>
                                    <Button variant="secondary" size="sm">
                                        <span className="material-symbols-outlined text-[16px]">chat</span>
                                        Message
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <Link to={`/landlord/properties/${property.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">View</Button>
                                    </Link>
                                    <Button variant="secondary" size="sm" className="flex-1">
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
