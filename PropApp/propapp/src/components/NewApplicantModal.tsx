import { useEffect, useState } from 'react';
import ModalPortal from './ModalPortal';
import { landlordService } from '../lib/api/services/landlordService';
import { integrationService } from '../lib/api/services/integrationService';
import type { PropertySummary } from '../types/property';

interface NewApplicantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

interface Property {
    id: string;
    name: string;
    address: string;
    icon: string;
    beds: number;
    baths: string;
    sqft: string;
    rent: string;
    status: 'vacant' | 'available' | 'occupied';
    statusLabel: string;
}

export default function NewApplicantModal({ isOpen, onClose, onComplete }: NewApplicantModalProps) {
    const [step, setStep] = useState(1);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        employer: '',
        annualIncome: '',
        jobTitle: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        landlordService.getProperties().then(response => {
            setProperties((response.data as PropertySummary[]).map(property => ({
                id: property.id,
                name: property.name,
                address: [property.address.street, property.address.city, property.address.state].filter(Boolean).join(', '),
                icon: 'apartment',
                beds: property.bedrooms ?? 0,
                baths: String(property.bathrooms ?? 0),
                sqft: String(property.squareFeet ?? 0),
                rent: new Intl.NumberFormat(undefined, { style: 'currency', currency: property.priceUnit === 'PER_MONTH' ? 'CAD' : 'NGN' }).format(property.price),
                status: property.status === 'ACTIVE' ? 'available' : property.status === 'RENTED' ? 'occupied' : 'vacant',
                statusLabel: property.status,
            })));
        }).catch(() => setError('Unable to load properties.'));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = async () => {
        if (step === 1) {
            setStep(2);
        } else {
            if (!selectedProperty) return;
            setSubmitting(true);
            setError(null);
            try {
                await integrationService.createInvitation({
                    propertyId: selectedProperty,
                    email: formData.email,
                    personalInfo: { fullName: formData.fullName, dob: formData.dob, phone: formData.phone, address: formData.address, city: formData.city, state: formData.state, zip: formData.zip },
                    employmentInfo: { employer: formData.employer, annualIncome: formData.annualIncome, jobTitle: formData.jobTitle },
                });
                onComplete?.();
                onClose();
            } catch {
                setError('Unable to send the applicant invitation.');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const handlePrevStep = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'vacant': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
            case 'available': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
            case 'occupied': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-canvas-dark rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
                    {/* Header */}
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-canvas-dark z-10 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {step === 1 ? 'New Applicant Profile' : 'Associate Applicant'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {step === 1
                                    ? 'Create a profile to start the verification process.'
                                    : `Assign ${formData.fullName || 'applicant'} to a property listing.`
                                }
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'thin' }}>
                        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                        {step === 1 ? (
                            <form className="space-y-8">
                                {/* Personal Information */}
                                <section>
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink mb-5">
                                        <span className="material-symbols-outlined text-[18px]">person</span> Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="e.g. John Doe"
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="john@example.com"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="(555) 123-4567"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ID Verification</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <input accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                                                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center gap-3 group-hover:border-brand group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-all">
                                                        <div className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-brand-ink transition-colors">
                                                            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Upload ID Document</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">PDF, JPG, PNG (Max 5MB)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-3 hover:border-brand hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all text-left group" type="button">
                                                    <div className="size-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 text-brand-ink">
                                                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Use Identity Service</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Connect via SecureID</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-brand-ink text-[18px]">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Contact Information */}
                                <section>
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink mb-5">
                                        <span className="material-symbols-outlined text-[18px]">home</span> Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Street Address</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="123 Main St, Apt 4B"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="New York"
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">State</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                >
                                                    <option disabled value="">Select State</option>
                                                    <option>NY</option>
                                                    <option>CA</option>
                                                    <option>TX</option>
                                                    <option>FL</option>
                                                    <option>IL</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Zip Code</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                    placeholder="10001"
                                                    type="text"
                                                    name="zip"
                                                    value={formData.zip}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Employment Details */}
                                <section>
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink mb-5">
                                        <span className="material-symbols-outlined text-[18px]">work</span> Employment Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employer Name</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="Company Inc."
                                                type="text"
                                                name="employer"
                                                value={formData.employer}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Annual Income</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 font-bold">₦</span>
                                                <input
                                                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                    placeholder="0.00"
                                                    type="text"
                                                    name="annualIncome"
                                                    value={formData.annualIncome}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Job Title</label>
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400"
                                                placeholder="e.g. Software Engineer"
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* References */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">group</span> References (Optional)
                                        </h3>
                                        <button className="text-xs font-bold text-brand-ink hover:text-brand-ink/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1" type="button">
                                            <span className="material-symbols-outlined text-[18px]">add</span> Add Reference
                                        </button>
                                    </div>
                                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-2">
                                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-1">
                                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No references added yet.</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">Adding references helps speed up the approval process.</p>
                                    </div>
                                </section>
                            </form>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900/20">
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 dark:text-slate-400 text-[20px]">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-slate-900 dark:text-white"
                                            placeholder="Search address, city, or zip code..."
                                            type="text"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <select className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer">
                                            <option>All Statuses</option>
                                            <option>Vacant</option>
                                            <option>Occupied</option>
                                            <option>Maintenance</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Property Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {properties.map((property) => (
                                        <label key={property.id} className="cursor-pointer relative group">
                                            <input
                                                className="peer sr-only"
                                                name="property_select"
                                                type="radio"
                                                checked={selectedProperty === property.id}
                                                onChange={() => setSelectedProperty(property.id)}
                                            />
                                            <div className={`p-4 rounded-xl bg-white dark:bg-canvas-dark border-2 shadow-sm hover:shadow-md transition-all h-full flex flex-col relative overflow-hidden ${selectedProperty === property.id ? 'border-brand shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-brand/50'}`}>
                                                {selectedProperty === property.id && (
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
                                                )}
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-10 rounded-lg flex items-center justify-center ${selectedProperty === property.id ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-ink' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                            <span className="material-symbols-outlined">{property.icon}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{property.name}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{property.address}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`size-6 rounded-full flex items-center justify-center transition-colors ${selectedProperty === property.id ? 'bg-brand-ink text-on-brand' : 'border border-slate-300 dark:border-slate-600 group-hover:border-brand'}`}>
                                                        {selectedProperty === property.id && (
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">bed</span> {property.beds} Beds</span>
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">bathtub</span> {property.baths} Baths</span>
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">square_foot</span> {property.sqft} sqft</span>
                                                </div>
                                                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{property.rent}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span></span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${getStatusColor(property.status)}`}>{property.statusLabel}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-canvas-dark/95 flex items-center justify-between shrink-0">
                        {step === 1 ? (
                            <>
                                <div></div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="px-6 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2"
                                    >
                                        Create Applicant Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handlePrevStep}
                                    className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Profile
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    disabled={!selectedProperty || submitting}
                                    className="px-6 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Sending Invitation…' : 'Send Invitation'} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
