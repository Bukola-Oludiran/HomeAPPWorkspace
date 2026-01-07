import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function TenantApplications() {
    const applications = [
        {
            id: '1',
            property: '5500 Highland Park, Unit 4B',
            location: 'Dallas, TX 75205',
            type: 'rent',
            price: 3200,
            status: 'pending',
            date: '2024-10-28',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
        },
        {
            id: '2',
            property: '1243 Oakwood Avenue',
            location: 'Austin, TX',
            type: 'buy',
            price: 850000,
            status: 'approved',
            date: '2024-10-20',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        },
        {
            id: '3',
            property: 'Lekki Apartments, Unit 12',
            location: 'Lagos, Nigeria',
            type: 'rent',
            price: 500000,
            status: 'rejected',
            date: '2024-10-15',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending Review</Badge>
            case 'approved':
                return <Badge variant="success">Approved</Badge>
            case 'rejected':
                return <Badge variant="error">Not Approved</Badge>
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
                        My Applications
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Track the status of your property applications
                    </p>
                </div>
                <Link to="/search">
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        Browse Properties
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
                {['All', 'Pending', 'Approved', 'Rejected'].map((tab, i) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors ${i === 0
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {applications.map((app) => (
                    <Card key={app.id} className="p-0 overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="md:w-48 h-40 md:h-auto relative">
                                <img
                                    src={app.image}
                                    alt={app.property}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge variant={app.type === 'buy' ? 'success' : 'info'}>
                                        {app.type === 'buy' ? 'Purchase' : 'Rental'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5 flex flex-col md:flex-row justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {app.property}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        {app.location}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(app.status)}
                                        <span className="text-xs text-slate-400">
                                            Applied on {new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex flex-col items-end justify-between">
                                    <p className="text-xl font-bold text-primary">
                                        {app.type === 'buy' ? `$${app.price.toLocaleString()}` : `$${app.price}/mo`}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button variant="outline" size="sm">View Details</Button>
                                        {app.status === 'pending' && (
                                            <Button variant="secondary" size="sm">
                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                                Message
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State (hidden but available) */}
            {applications.length === 0 && (
                <div className="text-center py-16">
                    <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">description</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        No applications yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Start browsing properties to find your next home
                    </p>
                    <Link to="/search">
                        <Button>Browse Properties</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
