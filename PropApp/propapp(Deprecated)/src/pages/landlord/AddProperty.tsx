import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

// Step indicator
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    const steps = ['Basic Info', 'Details', 'Photos', 'Verification']
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, i) => (
                <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`size-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${i + 1 <= currentStep
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}
                        >
                            {i + 1 < currentStep ? (
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            ) : (
                                i + 1
                            )}
                        </div>
                        <span className={`text-xs font-medium ${i + 1 <= currentStep ? 'text-primary' : 'text-slate-400'
                            }`}>
                            {step}
                        </span>
                    </div>
                    {i < totalSteps - 1 && (
                        <div className={`w-16 md:w-24 h-0.5 mx-2 mb-6 ${i + 1 < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    )
}

export function AddPropertyWizard() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        title: '',
        listingType: 'rent',
        price: '',
        pricePeriod: 'month',
        address: '',
        city: '',
        state: '',
        // Step 2: Details
        bedrooms: '',
        bathrooms: '',
        size: '',
        description: '',
        amenities: [] as string[],
        // Step 3: Photos
        photos: [] as File[],
        // Step 4: Verification
        verificationTier: 'bronze',
    })

    const amenitiesList = [
        'Pool', 'Gym', 'Parking', 'Security', 'Laundry', 'AC',
        'Balcony', 'Garden', 'Pet Friendly', 'Furnished'
    ]

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        } else {
            // Submit
            navigate('/landlord/properties')
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        } else {
            navigate('/landlord/properties')
        }
    }

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }))
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/landlord/properties')} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Properties
                </button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add New Property</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    List your property in 4 easy steps
                </p>
            </div>

            <StepIndicator currentStep={currentStep} totalSteps={4} />

            <Card className="p-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Basic Information
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Property Title
                            </label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Modern 3BR Apartment in Lekki"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Listing Type
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['rent', 'buy', 'short-let', 'land'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, listingType: type })}
                                        className={`p-3 rounded-xl border-2 font-medium capitalize transition-all ${formData.listingType === type
                                                ? 'border-primary bg-blue-50 dark:bg-blue-900/10 text-primary'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {type === 'short-let' ? 'Short-let' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Price
                                </label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="5,000,000"
                                    icon={<span className="text-slate-400">₦</span>}
                                />
                            </div>
                            {formData.listingType === 'rent' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Period
                                    </label>
                                    <select
                                        value={formData.pricePeriod}
                                        onChange={(e) => setFormData({ ...formData, pricePeriod: e.target.value })}
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 text-slate-900 dark:text-white"
                                    >
                                        <option value="month">Per Month</option>
                                        <option value="year">Per Year</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Address
                            </label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street address"
                                icon={<span className="material-symbols-outlined text-[18px]">location_on</span>}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    City
                                </label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Lagos"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    State
                                </label>
                                <Input
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="Lagos State"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Property Details
                        </h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Bedrooms
                                </label>
                                <Input
                                    type="number"
                                    value={formData.bedrooms}
                                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                    placeholder="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Bathrooms
                                </label>
                                <Input
                                    type="number"
                                    value={formData.bathrooms}
                                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                    placeholder="2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Size (sqft)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    placeholder="1500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your property..."
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Amenities
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {amenitiesList.map((amenity) => (
                                    <button
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${formData.amenities.includes(amenity)
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Photos */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Property Photos
                        </h2>

                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <div className="size-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">add_photo_alternate</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Upload Property Photos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Drag and drop or click to upload (max 10 photos)
                            </p>
                            <Button variant="outline">
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Select Files
                            </Button>
                        </div>

                        {/* Photo preview grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                                    <img
                                        src={`https://images.unsplash.com/photo-160058515434${i}-be6161a56a0c?w=400&q=80`}
                                        alt={`Preview ${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Verification */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Verification Tier
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Choose a verification level to increase trust with potential tenants
                        </p>

                        <div className="space-y-4">
                            {[
                                { tier: 'bronze', title: 'Bronze', price: 'Free', features: ['Basic listing', 'Standard search placement'] },
                                { tier: 'silver', title: 'Silver', price: '₦5,000', features: ['ID verification', 'Featured in category', 'Priority support'] },
                                { tier: 'gold', title: 'Gold', price: '₦15,000', features: ['Property inspection', 'Document verification', 'Top search placement', 'Trust badge'] },
                                { tier: 'platinum', title: 'Platinum', price: '₦30,000', features: ['Full legal verification', 'Professional photography', 'Dedicated agent', 'Premium badge', 'Promoted listings'] },
                            ].map((option) => (
                                <label
                                    key={option.tier}
                                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${formData.verificationTier === option.tier
                                            ? 'border-primary bg-blue-50 dark:bg-blue-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tier"
                                        value={option.tier}
                                        checked={formData.verificationTier === option.tier}
                                        onChange={(e) => setFormData({ ...formData, verificationTier: e.target.value })}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{option.title}</h3>
                                            <span className={`font-bold ${option.tier === 'bronze' ? 'text-green-600' : 'text-primary'}`}>
                                                {option.price}
                                            </span>
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {option.features.map((feature) => (
                                                <li key={feature} className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-green-500 text-[16px]">check</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="outline" onClick={handleBack}>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button onClick={handleNext}>
                        {currentStep === 4 ? (
                            <>
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Publish Listing
                            </>
                        ) : (
                            <>
                                Continue
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
