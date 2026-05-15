import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { propertyService } from '../../../lib/api/services/propertyService';
import type { Property } from '../../../types/property';

export default function LandlordEditListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [bedrooms, setBedrooms] = useState(0);
    const [bathrooms, setBathrooms] = useState(0);
    const [squareFeet, setSquareMeters] = useState(0);
    const [price, setPrice] = useState('');

    useEffect(() => {
        async function fetchProperty() {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await propertyService.getPropertyById(id);
                const data = response.data;
                setProperty(data);
                setTitle(data.name || '');
                setDescription(data.description || '');
                setAddress(data.address ? `${data.address.street || ''}, ${data.address.city || ''}, ${data.address.state || ''}` : '');
                setBedrooms(data.bedrooms || 0);
                setBathrooms(data.bathrooms || 0);
                setSquareMeters(data.squareFeet || 0);
                setPrice(data.price?.toString() || '');
                setIsPublished(data.status === 'ACTIVE');
            } catch (err) {
                console.error('Failed to fetch property:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProperty();
    }, [id]);

    async function handleSave() {
        if (!id) return;
        try {
            setIsSaving(true);
            await propertyService.updateProperty(id, {
                name: title,
                description,
                bedrooms,
                bathrooms,
                squareFeet: squareFeet || undefined,
                price: parseFloat(price) || undefined,
            });
            // Status is exposed via /properties/:id/status, not the generic
            // PUT — see contracts/property.contract.ts: updatePropertyStatusSchema.
            await propertyService.updatePropertyStatus(id, isPublished ? 'ACTIVE' : 'DRAFT');
            navigate(`/landlord/properties/${id}`);
        } catch (err) {
            console.error('Failed to save changes:', err);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!id) return;
        try {
            setIsDeleting(true);
            await propertyService.deleteProperty(id);
            navigate('/landlord/dashboard');
        } catch (err) {
            console.error('Failed to delete listing:', err);
            alert('Failed to delete listing. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading property...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Listing?"
                description="Are you sure you want to permanently delete this listing? All associated data including photos, applications, and analytics will be lost forever."
                confirmText="Delete Listing"
                icon="delete"
            />
            {/* Header - Page's own navbar */}
            <header className="fixed top-0 left-0 w-full z-40 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/landlord/properties/${id}`}
                            className="flex items-center justify-center size-10 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Listing</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete Listing
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <Link
                            to={`/landlord/properties/${id}`}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-lg bg-[#137fec] text-white font-semibold hover:bg-[#0e64bd] transition-colors shadow-lg shadow-[#137fec]/25 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1000px] mx-auto px-4 md:px-8 py-8 mt-20">
                {/* Basic Property Information */}
                <section className="mb-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#137fec] text-[22px]">apartment</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Basic Property Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Title</label>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 material-symbols-outlined text-slate-400 text-[20px]">location_on</span>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] pl-11 pr-4 py-3" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Type</label>
                            <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3">
                                <option selected>Single Family Home</option>
                                <option>Apartment</option>
                                <option>Condo</option>
                                <option>Townhouse</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Year Built</label>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3" type="number" defaultValue="2021" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 col-span-1 md:col-span-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bedrooms</label>
                                <div className="relative">
                                    <button className="absolute left-3 top-3 text-slate-400 hover:text-[#137fec] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <input className="w-full text-center rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-8 py-3" type="number" value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value) || 0)} />
                                    <button className="absolute right-3 top-3 text-slate-400 hover:text-[#137fec] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bathrooms</label>
                                <div className="relative">
                                    <button className="absolute left-3 top-3 text-slate-400 hover:text-[#137fec] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <input className="w-full text-center rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-8 py-3" type="number" value={bathrooms} onChange={(e) => setBathrooms(parseInt(e.target.value) || 0)} />
                                    <button className="absolute right-3 top-3 text-slate-400 hover:text-[#137fec] transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Square Footage</label>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3" type="number" value={squareFeet} onChange={(e) => setSquareMeters(parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Images & Media */}
                <section className="mb-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-600 text-[22px]">photo_library</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Images &amp; Media</h2>
                        </div>
                        <button className="text-[#137fec] font-semibold text-sm hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                            Add Photos
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2 row-span-2 relative group rounded-xl overflow-hidden border-2 border-[#137fec] shadow-md">
                            <img alt="Modern Oakwood Estate large windows" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l" />
                            <div className="absolute top-3 left-3 bg-[#137fec] text-white text-xs font-bold px-2 py-1 rounded">FEATURED</div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="size-9 bg-white/90 rounded-full text-slate-900 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="size-9 bg-white/90 rounded-full text-red-600 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-700">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-[40px]">chair</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="size-8 bg-white/90 rounded-full text-slate-900 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                                </button>
                                <button className="size-8 bg-white/90 rounded-full text-red-600 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-700">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-[40px]">kitchen</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="size-8 bg-white/90 rounded-full text-slate-900 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                                </button>
                                <button className="size-8 bg-white/90 rounded-full text-red-600 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-700">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-[40px]">bathtub</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="size-8 bg-white/90 rounded-full text-slate-900 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                                </button>
                                <button className="size-8 bg-white/90 rounded-full text-red-600 hover:bg-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-[#137fec] hover:text-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-[32px] mb-1">add</span>
                            <span className="text-xs font-semibold">Upload</span>
                        </div>
                    </div>
                </section>

                {/* Pricing & Lease Terms */}
                <section className="mb-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 text-[22px]">payments</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pricing &amp; Lease Terms</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monthly Rent</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-bold">$</span>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] pl-8 pr-4 py-3 font-bold text-lg" type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
                                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">/mo</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Security Deposit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-bold">$</span>
                                <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] pl-8 pr-4 py-3 font-bold text-lg" type="text" defaultValue="4,800" />
                                <span className="absolute right-4 top-3.5 text-slate-400 text-sm">USD</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lease Duration</label>
                            <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3">
                                <option selected>12 Months</option>
                                <option>6 Months</option>
                                <option>18 Months</option>
                                <option>24 Months</option>
                                <option>Month-to-Month</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Available Date</label>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3" type="date" defaultValue="2024-12-01" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-[#137fec] mt-0.5">info</span>
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                    <p className="font-bold text-slate-900 dark:text-white mb-1">Market Insight</p>
                                    <p>Properties similar to yours in <strong>78704</strong> are currently renting for <strong>$4,500 - $5,100</strong>. Your price is competitive.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Listing Description */}
                <section className="mb-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-600 text-[22px]">description</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Listing Description</h2>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#137fec] to-blue-500 hover:from-[#0e64bd] hover:to-blue-600 text-white text-sm font-bold rounded-lg shadow-md transition-all">
                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            AI Rewrite
                        </button>
                    </div>
                    <div className="relative">
                        <textarea
                            className="w-full min-h-[200px] rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3 leading-relaxed"
                            placeholder="Describe your property..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                            {description.length} / 2000 characters
                        </div>
                    </div>
                </section>

                {/* Publication Settings */}
                <section className="mb-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[22px]">settings</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Publication Settings</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Listing Visibility</h3>
                                <p className="text-sm text-slate-500">Control whether your property is visible to prospective tenants.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${isPublished ? 'text-green-600' : 'text-slate-500'}`}>
                                    {isPublished ? 'Published' : 'Draft'}
                                </span>
                                <div
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:ring-offset-2 ${isPublished ? 'bg-[#137fec]' : 'bg-slate-300'}`}
                                    role="switch"
                                    onClick={() => setIsPublished(!isPublished)}
                                >
                                    <span aria-hidden="true" className={`${isPublished ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Show Contact Phone</label>
                                <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] px-4 py-3">
                                    <option selected>Yes, show my number</option>
                                    <option>No, use in-app messaging only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Allow Instant Booking for Tours</label>
                                <div className="flex items-center gap-4 mt-3">
                                    <label className="flex items-center cursor-pointer">
                                        <input defaultChecked className="form-radio text-[#137fec] focus:ring-[#137fec] size-5 border-slate-300" name="tours" type="radio" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">Yes</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input className="form-radio text-[#137fec] focus:ring-[#137fec] size-5 border-slate-300" name="tours" type="radio" />
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">No, request only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* AI Assistant Bar */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto transition-all hover:scale-[1.01]" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Help me rewrite the description to emphasize the natural light...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>
        </>
    );
}
