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

export function BuyStep1() {
    const { propertyId } = useParams()
    const navigate = useNavigate()
    const [selectedIntent, setSelectedIntent] = useState('')

    const handleContinue = () => {
        navigate(`/buy/${propertyId}/step-2`)
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Purchase Property</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Start your secure purchase process
                    </p>
                </div>

                <StepIndicator currentStep={1} totalSteps={3} />

                {/* Property Summary */}
                <Card className="p-4 mb-8 flex gap-4 items-center">
                    <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80"
                        alt="Property"
                        className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">1243 Oakwood Avenue</h3>
                        <p className="text-sm text-slate-500">Austin, TX</p>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="success">For Sale</Badge>
                            <Badge variant="gold">Gold Verified</Badge>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xl font-bold text-primary">$850,000</p>
                    </div>
                </Card>

                {/* Intent Selection */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Step 1: Purchase Intent
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        How do you plan to finance this purchase?
                    </p>

                    <div className="space-y-4">
                        <label
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedIntent === 'cash'
                                ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="intent"
                                value="cash"
                                checked={selectedIntent === 'cash'}
                                onChange={(e) => setSelectedIntent(e.target.value)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Cash Purchase</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pay the full amount directly. Faster processing.
                                </p>
                            </div>
                        </label>

                        <label
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedIntent === 'mortgage'
                                ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="intent"
                                value="mortgage"
                                checked={selectedIntent === 'mortgage'}
                                onChange={(e) => setSelectedIntent(e.target.value)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600">home_work</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Mortgage Financing</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Get pre-approved with our partner banks.
                                </p>
                            </div>
                        </label>

                        <label
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedIntent === 'installment'
                                ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="intent"
                                value="installment"
                                checked={selectedIntent === 'installment'}
                                onChange={(e) => setSelectedIntent(e.target.value)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">calendar_month</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Installment Plan</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Pay in installments over 6-24 months (if available).
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button onClick={handleContinue} disabled={!selectedIntent}>
                            Continue
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export function BuyStep2() {
    const { propertyId } = useParams()
    const navigate = useNavigate()

    const handleContinue = () => {
        navigate(`/buy/${propertyId}/step-3`)
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Purchase Property</h1>
                </div>

                <StepIndicator currentStep={2} totalSteps={3} />

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Step 2: Verification Documents
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Upload required documents for identity and financial verification
                    </p>

                    <div className="space-y-4">
                        {/* Government ID */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">badge</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Government-issued ID</h3>
                                    <p className="text-sm text-slate-500">Valid ID, Passport, or Driver's License</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <span className="material-symbols-outlined text-[16px]">upload</span>
                                    Upload
                                </Button>
                            </div>
                        </div>

                        {/* Proof of Funds */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600">account_balance</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Proof of Funds</h3>
                                    <p className="text-sm text-slate-500">Bank statement showing sufficient balance</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    <span className="material-symbols-outlined text-[16px]">upload</span>
                                    Upload
                                </Button>
                            </div>
                        </div>

                        {/* NIN */}
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-600">fingerprint</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">NIN Verification</h3>
                                    <p className="text-sm text-slate-500">National Identification Number</p>
                                </div>
                                <Input placeholder="Enter 11-digit NIN" className="w-48" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back
                        </Button>
                        <Button onClick={handleContinue}>
                            Proceed to Escrow
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export function BuyStep3() {
    useParams()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleInitiateEscrow = () => {
        setIsProcessing(true)
        setTimeout(() => {
            navigate('/tenant/applications') // Or a success page
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Purchase Property</h1>
                </div>

                <StepIndicator currentStep={3} totalSteps={3} />

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Step 3: Secure Escrow Payment
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Your payment is held securely until title verification is complete
                    </p>

                    {/* Payment Summary */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Payment Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Property Price</span>
                                <span className="font-bold text-slate-900 dark:text-white">$850,000</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Transaction Fee (1%)</span>
                                <span className="font-medium text-slate-900 dark:text-white">$8,500</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Legal & Documentation</span>
                                <span className="font-medium text-slate-900 dark:text-white">$1,500</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                                    <span className="text-xl font-extrabold text-primary">$860,000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-primary">shield</span>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Protected by Escrow</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Funds are held securely and only released after title verification and legal checks are complete.
                                    If any issues arise, you'll receive a full refund.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 size-5 rounded border-slate-300" required />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            I understand that my payment will be held in escrow and agree to the{' '}
                            <a href="#" className="text-primary hover:underline">Purchase Agreement</a> and{' '}
                            <a href="#" className="text-primary hover:underline">Escrow Terms</a>.
                        </span>
                    </label>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </Button>
                    <Button onClick={handleInitiateEscrow} disabled={isProcessing} size="lg">
                        {isProcessing ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                Initiate Escrow - $860,000
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
