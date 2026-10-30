import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MagneticButton, SuccessCelebration } from '../../components/animation';
import { propertyService } from '../../lib/api/services/propertyService';
import { userService } from '../../lib/api/services/userService';
import { tenantService } from '../../lib/api/services/tenantService';

interface ApplicationFormData {
    leaseDuration: string;
    moveInDate: string;
    occupants: number;
    hasPets: boolean;
    employerName: string;
    monthlyIncome: string;
    currentAddress: string;
    reasonForMoving: string;
}

interface PropertyInfo {
    id: string;
    name: string;
    address: string;
    neighborhood: string;
    image: string;
    beds: number;
    baths: number;
    sqft: string;
    rent: string;
    status: string;
}

interface ApplicantInfo {
    name: string;
    email: string;
    phone: string;
}

export default function RentalApplicationWizard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const totalSteps = 4;

    const [propertyData, setPropertyData] = useState<PropertyInfo>({
        id: id || '', name: '', address: '', neighborhood: '', image: '', beds: 0, baths: 0, sqft: '0', rent: '$0', status: '',
    });
    const [applicantData, setApplicantData] = useState<ApplicantInfo>({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [propRes, userRes] = await Promise.all([
                    id ? propertyService.getPropertyById(id) : Promise.resolve(null),
                    userService.getCurrentUser(),
                ]);

                if (propRes?.data) {
                    const p = propRes.data;
                    const addr = p.address || {};
                    const sqm = p.squareFeet || 0;
                    setPropertyData({
                        id: p.id || id || '',
                        name: p.name || '',
                        address: [addr.street, addr.city, addr.state].filter(Boolean).join(', '),
                        neighborhood: addr.neighborhood || '',
                        image: (p.media?.[0]?.url) || '',
                        beds: p.bedrooms || 0,
                        baths: p.bathrooms || 0,
                        sqft: sqm > 1000 ? `${(sqm / 1000).toFixed(1)}k` : `${sqm}`,
                        rent: `$${Number(p.price || 0).toLocaleString()}`,
                        status: p.status || 'AVAILABLE',
                    });
                }

                if (userRes?.data) {
                    const u = userRes.data;
                    setApplicantData({
                        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                        email: u.email || '',
                        phone: u.phone || '',
                    });
                }
            } catch (err) {
                console.error('Failed to load application data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleSubmit = async () => {
        if (!id) return;
        try {
            setSubmitting(true);
            await tenantService.submitApplication({
                propertyId: id,
                moveInDate: formData.moveInDate,
                employmentStatus: 'EMPLOYED' as const,
                monthlyIncome: Number(formData.monthlyIncome) || 0,
                message: formData.reasonForMoving || undefined,
            });
            setIsSuccessOpen(true);
        } catch (err) {
            console.error('Failed to submit application:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const [formData, setFormData] = useState<ApplicationFormData>({
        leaseDuration: '12',
        moveInDate: '',
        occupants: 1,
        hasPets: false,
        employerName: '',
        monthlyIncome: '',
        currentAddress: '',
        reasonForMoving: '',
    });

    const stepTitles = [
        'Initial Details',
        'Employment & Income',
        'Documents & Verification',
        'Review & Submit',
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        {/* Applicant Information */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">person</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-ink">badge</span>
                                        Applicant Information
                                    </h2>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand text-brand-ink text-sm font-semibold hover:bg-blue-50 dark:hover:bg-brand/10 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                                        Link Saved Tenant Profile
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed focus:ring-0 focus:border-slate-200"
                                                readOnly
                                                type="text"
                                                value={applicantData.name}
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-hover:text-brand-ink transition-colors">lock</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <div className="relative group">
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed focus:ring-0 focus:border-slate-200"
                                                readOnly
                                                type="email"
                                                value={applicantData.email}
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-hover:text-brand-ink transition-colors">lock</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                        <div className="relative group">
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed focus:ring-0 focus:border-slate-200"
                                                readOnly
                                                type="tel"
                                                value={applicantData.phone}
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-hover:text-brand-ink transition-colors">lock</span>
                                        </div>
                                        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px] text-brand-ink" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                                            These details are verified and linked to your main profile. <Link to="/tenant/profile" className="text-brand-ink hover:underline font-semibold">Edit in Profile Settings</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Desired Lease Terms */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">calendar_clock</span>
                                Desired Lease Terms
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Lease Duration</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { value: '12', label: '12 Months', sublabel: 'Standard Lease', icon: 'event_note' },
                                            { value: '6', label: '6 Months', sublabel: '+ Short term fee', icon: 'date_range' },
                                            { value: 'monthly', label: 'Month-to-Month', sublabel: 'Maximum flexibility', icon: 'change_circle' },
                                        ].map((option) => (
                                            <label key={option.value} className="cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="lease_duration"
                                                    className="peer sr-only"
                                                    checked={formData.leaseDuration === option.value}
                                                    onChange={() => setFormData({ ...formData, leaseDuration: option.value })}
                                                />
                                                <div className="h-full rounded-xl border-2 border-slate-200 dark:border-slate-600 p-4 text-center hover:border-brand peer-checked:border-brand peer-checked:bg-blue-50 dark:peer-checked:bg-brand/10 transition-all shadow-sm">
                                                    <div className="mb-1 text-slate-400 group-hover:text-brand-ink peer-checked:text-brand-ink transition-colors">
                                                        <span className="material-symbols-outlined">{option.icon}</span>
                                                    </div>
                                                    <span className="block font-bold text-slate-900 dark:text-white">{option.label}</span>
                                                    <span className="text-xs text-slate-500">{option.sublabel}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Preferred Move-in Date</label>
                                    <div className="relative max-w-sm">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                                            type="date"
                                            value={formData.moveInDate}
                                            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Household Details */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">family_restroom</span>
                                Household Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Number of Occupants</label>
                                    <div className="flex items-center">
                                        <button
                                            className="size-11 rounded-l-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                            type="button"
                                            onClick={() => setFormData({ ...formData, occupants: Math.max(1, formData.occupants - 1) })}
                                        >
                                            <span className="material-symbols-outlined">remove</span>
                                        </button>
                                        <input
                                            className="w-20 h-11 border-y border-x-0 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-center font-bold text-lg text-slate-900 dark:text-white focus:ring-0"
                                            min="1"
                                            type="number"
                                            value={formData.occupants}
                                            readOnly
                                        />
                                        <button
                                            className="size-11 rounded-r-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                                            type="button"
                                            onClick={() => setFormData({ ...formData, occupants: formData.occupants + 1 })}
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">Total adults and children living in the unit.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Do you have pets?</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="pets"
                                                className="peer sr-only"
                                                checked={formData.hasPets}
                                                onChange={() => setFormData({ ...formData, hasPets: true })}
                                            />
                                            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 peer-checked:bg-brand peer-checked:border-brand peer-checked:text-white text-slate-700 dark:text-slate-300 font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
                                                <span className="material-symbols-outlined text-[20px]">check</span> Yes
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="pets"
                                                className="peer sr-only"
                                                checked={!formData.hasPets}
                                                onChange={() => setFormData({ ...formData, hasPets: false })}
                                            />
                                            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 peer-checked:bg-brand peer-checked:border-brand peer-checked:text-white text-slate-700 dark:text-slate-300 font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
                                                <span className="material-symbols-outlined text-[20px]">close</span> No
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Upcoming Requirements Notice */}
                        <div className="bg-blue-50/50 dark:bg-slate-800 rounded-2xl p-6 border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                            <div className="absolute -right-6 -bottom-6 size-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl"></div>
                            <div className="shrink-0 relative z-10">
                                <div className="size-14 rounded-2xl bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 flex items-center justify-center text-brand-ink">
                                    <span className="material-symbols-outlined text-3xl">folder_shared</span>
                                </div>
                            </div>
                            <div className="relative z-10 flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upcoming Requirements</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                    To ensure a smooth verification process, please have the following documents ready for the next steps. <span className="font-semibold text-slate-900 dark:text-white">You do not need to upload them right now.</span>
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Proof of Income', 'Valid ID Verification', 'Rental History', 'Personal References'].map((item) => (
                                        <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[14px] font-bold">check</span>
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8">
                        {/* Employment Information */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">work</span>
                                Employment Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Employer Name</label>
                                    <input
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                                        type="text"
                                        placeholder="e.g. TechCorp Inc."
                                        value={formData.employerName}
                                        onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monthly Income</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.monthlyIncome}
                                            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Rental History */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">home</span>
                                Rental History
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Address</label>
                                    <input
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                                        type="text"
                                        placeholder="Enter your current address"
                                        value={formData.currentAddress}
                                        onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Reason for Moving</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent font-medium resize-none"
                                        rows={3}
                                        placeholder="e.g. Job relocation, looking for more space..."
                                        value={formData.reasonForMoving}
                                        onChange={(e) => setFormData({ ...formData, reasonForMoving: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-8">
                        {/* Document Upload */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">upload_file</span>
                                Required Documents
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { name: 'Proof of Income', desc: 'Pay stubs, bank statements, or tax returns', icon: 'receipt_long' },
                                    { name: 'Valid ID', desc: 'Driver\'s license, passport, or state ID', icon: 'id_card' },
                                    { name: 'Rental History Reference', desc: 'Previous landlord contact information', icon: 'contact_phone' },
                                ].map((doc) => (
                                    <div key={doc.name} className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-5 hover:border-brand transition-colors group cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-ink transition-colors">
                                                <span className="material-symbols-outlined text-2xl">{doc.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{doc.desc}</p>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg bg-brand/10 text-brand-ink text-sm font-bold hover:bg-brand/20 transition-colors">
                                                Upload
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Background Check Authorization */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">verified_user</span>
                                Background Check Authorization
                            </h2>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                    By submitting this application, you authorize the landlord to conduct a background check including credit history, criminal records, and employment verification.
                                </p>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-brand-ink focus:ring-brand" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        I authorize background check and agree to the <Link to="#" className="text-brand-ink hover:underline">Terms & Conditions</Link>
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-8">
                        {/* Review Summary */}
                        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-ink">checklist</span>
                                Review Your Application
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lease Duration</h4>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {formData.leaseDuration === '12' ? '12 Months' : formData.leaseDuration === '6' ? '6 Months' : 'Month-to-Month'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Move-in Date</h4>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formData.moveInDate || 'Not specified'}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Occupants</h4>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formData.occupants}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pets</h4>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formData.hasPets ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Application Fee */}
                        <section className="bg-green-50/50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined text-2xl">payments</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Application Fee</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Non-refundable processing fee</p>
                                    <p className="text-2xl font-extrabold text-green-600">$35.00</p>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading application...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-[100px]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-canvas-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={`/property/${id || 1}`} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div className="hidden md:block">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Application In Progress</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                            Save & Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Progress Header */}
                <div className="mb-10 max-w-4xl">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                        Submit Rental Application for {propertyData.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{propertyData.address} • {propertyData.neighborhood}</p>
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-3 w-full max-w-lg relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-brand rounded-full shadow-[0_0_10px_rgba(19,127,236,0.5)] transition-all duration-500"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full max-w-lg mt-2 text-xs font-bold uppercase tracking-wider text-brand-ink">
                        <span>Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Form Content */}
                    <div className="lg:col-span-8">
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className={`px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 ${currentStep === 1 ? 'invisible' : ''}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                            </button>
                            <div className="flex gap-3 md:gap-4">
                                <Link to={`/property/${id || 1}`} className="px-4 md:px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors">
                                    Cancel
                                </Link>
                                {currentStep < totalSteps ? (
                                    <button
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        className="px-6 md:px-8 py-3 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors flex items-center gap-2"
                                    >
                                        Next Step <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                ) : (
                                    <MagneticButton>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="px-6 md:px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 flex items-center gap-2 disabled:opacity-60"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{submitting ? 'hourglass_empty' : 'send'}</span> {submitting ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </MagneticButton>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Property Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700">
                                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Applying For</h3>
                                </div>
                                <div className="p-4 flex gap-4 items-start">
                                    <div className="w-24 h-24 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                        <img alt="Property" className="w-full h-full object-cover" src={propertyData.image} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{propertyData.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{propertyData.address}</p>
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">{propertyData.status}</span>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-center">
                                            <span className="block font-bold text-slate-900 dark:text-white">{propertyData.beds}</span>
                                            <span className="text-xs text-slate-500 uppercase">Beds</span>
                                        </div>
                                        <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                            <span className="block font-bold text-slate-900 dark:text-white">{propertyData.baths}</span>
                                            <span className="text-xs text-slate-500 uppercase">Baths</span>
                                        </div>
                                        <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                            <span className="block font-bold text-slate-900 dark:text-white">{propertyData.sqft}</span>
                                            <span className="text-xs text-slate-500 uppercase">Sq Ft</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Rent</span>
                                        <span className="text-xl font-extrabold text-brand-ink">{propertyData.rent}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-green-500">gpp_good</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Secure Application</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                                    Your data is encrypted and securely transmitted. We only share details with verified landlords once you approve.
                                </p>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg p-2 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">256-bit Encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-xl border border-brand/20 shadow-lg rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto transition-all hover:scale-[1.01] group" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                    <div className="size-10 rounded-full bg-brand flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white">forum</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate group-hover:text-brand-ink transition-colors">
                            Ask about lease term flexibility, pet deposits, or document checklist...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-brand hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Application Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => {
                    setIsSuccessOpen(false);
                    navigate('/tenant/applications');
                }}
                title="Application submitted"
                description="Your rental application has been received. The landlord will review it and get back to you within 2-3 business days."
                buttonText="View My Applications"
                icon="send"
            />
        </div>
    );
}
