import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

export function LandlordApplicants() {
    const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null)

    const applicants = [
        {
            id: '1',
            name: 'James Wilson',
            email: 'james.w@email.com',
            phone: '+234 804 567 8901',
            property: '1243 Oakwood Avenue',
            applied: '2024-10-25',
            income: 650000,
            creditScore: 'Good',
            status: 'pending',
            documents: ['ID Verified', 'Income Verified'],
        },
        {
            id: '2',
            name: 'Lisa Thompson',
            email: 'lisa.t@email.com',
            phone: '+234 805 678 9012',
            property: '1243 Oakwood Avenue',
            applied: '2024-10-24',
            income: 580000,
            creditScore: 'Excellent',
            status: 'pending',
            documents: ['ID Verified', 'Income Verified', 'References'],
        },
        {
            id: '3',
            name: 'David Brown',
            email: 'david.b@email.com',
            phone: '+234 806 789 0123',
            property: 'Sunrise Apartments, Unit 5C',
            applied: '2024-10-23',
            income: 420000,
            creditScore: 'Fair',
            status: 'reviewing',
            documents: ['ID Verified'],
        },
    ]

    const handleApprove = (id: string) => {
        console.log('Approving applicant:', id)
    }

    const handleReject = (id: string) => {
        console.log('Rejecting applicant:', id)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Applicant Manager
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Review and manage {applicants.length} pending applications
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input
                    icon={<span className="material-symbols-outlined text-[18px]">search</span>}
                    placeholder="Search applicants..."
                    className="flex-1"
                />
                <div className="flex gap-2">
                    {['All', 'Pending', 'Reviewing', 'Approved', 'Rejected'].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 1
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Applicants Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {applicants.map((applicant) => (
                    <Card
                        key={applicant.id}
                        className={`p-6 transition-all ${selectedApplicant === applicant.id ? 'ring-2 ring-primary' : ''
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <Avatar fallback={applicant.name} size="lg" />
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{applicant.name}</h3>
                                    <p className="text-sm text-slate-500">{applicant.email}</p>
                                    <p className="text-sm text-slate-500">{applicant.phone}</p>
                                </div>
                            </div>
                            <Badge variant={applicant.status === 'pending' ? 'warning' : 'info'}>
                                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                            </Badge>
                        </div>

                        {/* Property */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Applying For</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{applicant.property}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Applied</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(applicant.applied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Income</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    ₦{applicant.income.toLocaleString()}/mo
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Credit</p>
                                <p className={`text-sm font-medium ${applicant.creditScore === 'Excellent' ? 'text-green-600' :
                                        applicant.creditScore === 'Good' ? 'text-blue-600' : 'text-amber-600'
                                    }`}>
                                    {applicant.creditScore}
                                </p>
                            </div>
                        </div>

                        {/* Verified Documents */}
                        <div className="mb-4">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Verified</p>
                            <div className="flex flex-wrap gap-2">
                                {applicant.documents.map((doc) => (
                                    <span
                                        key={doc}
                                        className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        {doc}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedApplicant(applicant.id)}
                            >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                View Full Application
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleApprove(applicant.id)}
                            >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReject(applicant.id)}
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
