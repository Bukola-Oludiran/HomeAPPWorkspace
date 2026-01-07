import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex items-center">
                    <div
                        className={`size-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= currentStep
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                    >
                        {i + 1 <= currentStep ? (
                            i + 1 < currentStep ? (
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            ) : (
                                i + 1
                            )
                        ) : (
                            i + 1
                        )}
                    </div>
                    {i < totalSteps - 1 && (
                        <div
                            className={`w-12 h-0.5 mx-1 ${i + 1 < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export function ApplyStep1() {
    const { propertyId } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        moveInDate: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        navigate(`/apply/${propertyId}/step-2`)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to={`/properties/${propertyId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Property
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Apply for Rental</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Complete your application in 4 easy steps
                    </p>
                </div>

                <StepIndicator currentStep={1} totalSteps={4} />

                {/* Property Summary */}
                <Card className="p-4 mb-8 flex gap-4 items-center">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=80"
                        alt="Property"
                        className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">5500 Highland Park, Unit 4B</h3>
                        <p className="text-sm text-slate-500">Dallas, TX 75205</p>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="info">For Rent</Badge>
                            <Badge variant="platinum">Platinum Verified</Badge>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xl font-bold text-primary">$3,200<span className="text-sm font-normal text-slate-400">/mo</span></p>
                    </div>
                </Card>

                {/* Form */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Step 1: Personal Information
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    First Name
                                </label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Last Name
                                </label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                icon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Phone Number
                            </label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+234 801 234 5678"
                                icon={<span className="material-symbols-outlined text-[18px]">phone</span>}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Desired Move-in Date
                            </label>
                            <Input
                                type="date"
                                value={formData.moveInDate}
                                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Continue to Step 2
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export function ApplyStep2() {
    const { propertyId } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        employmentStatus: '',
        employer: '',
        jobTitle: '',
        monthlyIncome: '',
        employmentDuration: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        navigate(`/apply/${propertyId}/step-3`)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Apply for Rental</h1>
                </div>

                <StepIndicator currentStep={2} totalSteps={4} />

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Step 2: Employment Information
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Employment Status
                            </label>
                            <select
                                value={formData.employmentStatus}
                                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Select status</option>
                                <option value="employed">Employed Full-time</option>
                                <option value="part-time">Employed Part-time</option>
                                <option value="self-employed">Self-employed</option>
                                <option value="student">Student</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Employer / Company Name
                            </label>
                            <Input
                                value={formData.employer}
                                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                                placeholder="Acme Corporation"
                                icon={<span className="material-symbols-outlined text-[18px]">business</span>}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Job Title
                            </label>
                            <Input
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                placeholder="Software Engineer"
                                icon={<span className="material-symbols-outlined text-[18px]">work</span>}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Monthly Income (₦)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                    placeholder="500,000"
                                    icon={<span className="material-symbols-outlined text-[18px]">payments</span>}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Time at Current Job
                                </label>
                                <select
                                    value={formData.employmentDuration}
                                    onChange={(e) => setFormData({ ...formData, employmentDuration: e.target.value })}
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select duration</option>
                                    <option value="<1">Less than 1 year</option>
                                    <option value="1-2">1-2 years</option>
                                    <option value="2-5">2-5 years</option>
                                    <option value="5+">5+ years</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </Button>
                            <Button type="submit">
                                Continue to Step 3
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export function ApplyStep3() {
    const { propertyId } = useParams()
    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        navigate(`/apply/${propertyId}/review`)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Apply for Rental</h1>
                </div>

                <StepIndicator currentStep={3} totalSteps={4} />

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Step 3: Required Documents
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Upload the following documents to complete your application
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ID Document */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-primary">badge</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Government ID</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                National ID, Passport, or Driver's License
                            </p>
                            <Button type="button" variant="outline" size="sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Upload Document
                            </Button>
                        </div>

                        {/* Proof of Income */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <div className="size-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-green-600">account_balance</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Proof of Income</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                Bank statement or employment letter (last 3 months)
                            </p>
                            <Button type="button" variant="outline" size="sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Upload Document
                            </Button>
                        </div>

                        {/* Reference Letter */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-purple-600">description</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Reference Letter (Optional)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                Previous landlord or employer reference
                            </p>
                            <Button type="button" variant="outline" size="sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Upload Document
                            </Button>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </Button>
                            <Button type="submit">
                                Review Application
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export function ApplyReview() {
    useParams()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = () => {
        setIsSubmitting(true)
        setTimeout(() => {
            navigate('/tenant/applications')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Apply for Rental</h1>
                </div>

                <StepIndicator currentStep={4} totalSteps={4} />

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Step 4: Review & Submit
                    </h2>

                    {/* Personal Info Summary */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Personal Information</h3>
                            <button className="text-primary text-sm font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                            <p className="text-sm"><span className="text-slate-500">Name:</span> <span className="text-slate-900 dark:text-white font-medium">John Doe</span></p>
                            <p className="text-sm"><span className="text-slate-500">Email:</span> <span className="text-slate-900 dark:text-white font-medium">john@example.com</span></p>
                            <p className="text-sm"><span className="text-slate-500">Phone:</span> <span className="text-slate-900 dark:text-white font-medium">+234 801 234 5678</span></p>
                            <p className="text-sm"><span className="text-slate-500">Move-in Date:</span> <span className="text-slate-900 dark:text-white font-medium">Jan 1, 2025</span></p>
                        </div>
                    </div>

                    {/* Employment Summary */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Employment</h3>
                            <button className="text-primary text-sm font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                            <p className="text-sm"><span className="text-slate-500">Status:</span> <span className="text-slate-900 dark:text-white font-medium">Employed Full-time</span></p>
                            <p className="text-sm"><span className="text-slate-500">Employer:</span> <span className="text-slate-900 dark:text-white font-medium">Acme Corporation</span></p>
                            <p className="text-sm"><span className="text-slate-500">Monthly Income:</span> <span className="text-slate-900 dark:text-white font-medium">₦500,000</span></p>
                        </div>
                    </div>

                    {/* Documents Summary */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white">Documents</h3>
                            <button className="text-primary text-sm font-semibold hover:underline">Edit</button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <span className="text-sm text-slate-900 dark:text-white">Government ID uploaded</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <span className="text-sm text-slate-900 dark:text-white">Proof of income uploaded</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" className="mt-1 size-5 rounded border-slate-300" required />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                I confirm that all information provided is accurate and I agree to the{' '}
                                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                            </span>
                        </label>
                    </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Application
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
