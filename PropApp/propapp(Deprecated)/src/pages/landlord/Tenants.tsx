import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

export function LandlordTenants() {
    const tenants = [
        {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+234 801 234 5678',
            property: '5500 Highland Park, Unit 4B',
            rent: 3200,
            leaseEnd: '2025-08-31',
            status: 'active',
            paymentStatus: 'on-time',
        },
        {
            id: '2',
            name: 'Mike Davis',
            email: 'mike.davis@email.com',
            phone: '+234 802 345 6789',
            property: 'Downtown Loft',
            rent: 2800,
            leaseEnd: '2025-03-15',
            status: 'active',
            paymentStatus: 'late',
        },
        {
            id: '3',
            name: 'Emily Chen',
            email: 'emily.chen@email.com',
            phone: '+234 803 456 7890',
            property: 'Sunrise Apartments, Unit 2A',
            rent: 2200,
            leaseEnd: '2024-12-31',
            status: 'ending-soon',
            paymentStatus: 'on-time',
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Tenants
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Manage your {tenants.length} active tenants
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">file_download</span>
                        Export
                    </Button>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                        Message All
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card className="p-4 mb-6">
                <Input
                    icon={<span className="material-symbols-outlined text-[18px]">search</span>}
                    placeholder="Search tenants by name, email, or property..."
                />
            </Card>

            {/* Tenants Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Tenant
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Rent
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Lease Ends
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar fallback={tenant.name} size="md" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{tenant.name}</p>
                                                <p className="text-sm text-slate-500">{tenant.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-900 dark:text-white">{tenant.property}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white">${tenant.rent.toLocaleString()}/mo</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={tenant.paymentStatus === 'on-time' ? 'success' : 'error'}>
                                            {tenant.paymentStatus === 'on-time' ? 'On Time' : 'Late'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-white">
                                                {new Date(tenant.leaseEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {tenant.status === 'ending-soon' && (
                                                <Badge variant="warning">Ending Soon</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm">
                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
