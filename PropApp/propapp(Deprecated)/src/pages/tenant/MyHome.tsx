import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'

export function TenantMyHome() {
    const property = {
        id: '1',
        title: '5500 Highland Park, Unit 4B',
        address: 'Dallas, TX 75205',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        rent: 2450,
        leaseStart: '2024-09-01',
        leaseEnd: '2025-08-31',
        landlord: {
            name: 'Robert Johnson',
            phone: '+234 801 234 5678',
            email: 'robert.j@email.com',
        },
        amenities: ['Pool', 'Gym', 'Parking', 'Security', 'Laundry'],
        utilities: [
            { name: 'Electricity', status: 'included', provider: 'Included in rent' },
            { name: 'Water', status: 'included', provider: 'Included in rent' },
            { name: 'Internet', status: 'tenant', provider: 'AT&T - $65/mo' },
            { name: 'Gas', status: 'tenant', provider: 'Texas Gas - $45/mo' },
        ],
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        My Home
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Everything about your current rental
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                        View Lease
                    </Button>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[20px]">build</span>
                        Request Maintenance
                    </Button>
                </div>
            </div>

            {/* Property Hero */}
            <Card className="overflow-hidden mb-8">
                <div className="relative h-64 md:h-80">
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge variant="success" className="mb-3">Active Lease</Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{property.title}</h2>
                        <p className="text-white/80">{property.address}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Lease Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">contract</span>
                            Lease Details
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Monthly Rent</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">${property.rent.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Lease Start</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {new Date(property.leaseStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Lease End</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {new Date(property.leaseEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Remaining</p>
                                <p className="text-lg font-semibold text-primary">11 months</p>
                            </div>
                        </div>
                    </Card>

                    {/* Amenities */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">star</span>
                            Amenities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {property.amenities.map((amenity) => (
                                <span
                                    key={amenity}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Utilities */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            Utilities
                        </h3>
                        <div className="space-y-3">
                            {property.utilities.map((utility) => (
                                <div
                                    key={utility.name}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">
                                            {utility.name === 'Electricity' ? 'electric_bolt' :
                                                utility.name === 'Water' ? 'water_drop' :
                                                    utility.name === 'Internet' ? 'wifi' : 'local_fire_department'}
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">{utility.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={utility.status === 'included' ? 'success' : 'default'}>
                                            {utility.status === 'included' ? 'Included' : 'Tenant'}
                                        </Badge>
                                        <p className="text-xs text-slate-500 mt-1">{utility.provider}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Landlord Contact */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Property Manager</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar fallback={property.landlord.name} size="lg" />
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{property.landlord.name}</p>
                                <p className="text-sm text-slate-500">Landlord</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full">
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Send Message
                            </Button>
                            <Button variant="outline" className="w-full">
                                <span className="material-symbols-outlined text-[18px]">call</span>
                                {property.landlord.phone}
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/tenant" className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                    Pay Rent
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">build</span>
                                Report Issue
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">history</span>
                                Payment History
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">autorenew</span>
                                Renew Lease
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
