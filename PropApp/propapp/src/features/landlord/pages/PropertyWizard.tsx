import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../../lib/api/services/propertyService';
import { formatListingPrice } from '@/lib/format';

// Step components
const StepOne = ({ formData, setFormData }: { formData: WizardFormData; setFormData: React.Dispatch<React.SetStateAction<WizardFormData>> }) => {
    const amenities = [
        { id: 'ac', icon: 'ac_unit', label: 'Air conditioning' },
        { id: 'washer', icon: 'local_laundry_service', label: 'Washer/Dryer' },
        { id: 'parking', icon: 'directions_car', label: 'Parking' },
        { id: 'gym', icon: 'fitness_center', label: 'Gym' },
    ];

    return (
        <>
            {/* AI Auto-fill Section */}
            <div className="bg-blue-50 dark:bg-surface-dark border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 p-4 opacity-5 dark:opacity-10 pointer-events-none transform rotate-12">
                    <span className="material-symbols-outlined text-9xl text-brand-ink">forum</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-brand-ink shadow-sm">
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Property Assistant</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-fill details in seconds</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-xl p-1 focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand transition-all duration-300">
                        <textarea
                            className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none p-4 min-h-[100px] outline-none"
                            placeholder="Paste a description here (e.g., 'Modern 2-bedroom apartment with hardwood floors, newly renovated kitchen, and balcony overlooking the park...'), or upload a video tour to let Keystead extract the details automatically."
                        ></textarea>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                            <button className="text-slate-500 hover:text-brand-ink dark:text-slate-400 dark:hover:text-brand-ink flex items-center gap-2 text-xs font-bold transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined text-[18px]">videocam</span> Upload Video Tour
                            </button>
                            <button className="w-full sm:w-auto bg-brand-ink hover:bg-brand-ink/90 text-on-brand px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">forum</span> Auto-fill Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <div className="md:col-span-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Listing title</label>
                    <input
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 px-4 shadow-sm"
                        placeholder="e.g. Spacious Downtown Loft with City Views"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Property type</label>
                    <select
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 px-4 shadow-sm"
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    >
                        <option>Apartment</option>
                        <option>House</option>
                        <option>Condo</option>
                        <option>Townhouse</option>
                    </select>
                </div>
                <div className="md:col-span-12">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400 material-symbols-outlined text-[20px]">location_on</span>
                        <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 pl-11 pr-4 shadow-sm"
                            placeholder="Enter property address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Beds</label>
                    <div className="relative">
                        <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 px-4 shadow-sm"
                            placeholder="0"
                            type="number"
                            value={formData.beds}
                            onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                        />
                        <span className="absolute right-4 top-3.5 text-slate-500 dark:text-slate-400 text-xs font-bold pointer-events-none">BDS</span>
                    </div>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Baths</label>
                    <div className="relative">
                        <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 px-4 shadow-sm"
                            placeholder="0"
                            type="number"
                            value={formData.baths}
                            onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                        />
                        <span className="absolute right-4 top-3.5 text-slate-500 dark:text-slate-400 text-xs font-bold pointer-events-none">BA</span>
                    </div>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sq ft</label>
                    <input
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 px-4 shadow-sm"
                        placeholder="0"
                        type="number"
                        value={formData.sqft}
                        onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rent {formData.leaseDuration.toLowerCase()}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-500 dark:text-slate-400 font-bold">₦</span>
                        <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white focus:border-brand focus:ring-brand h-12 pl-8 pr-4 shadow-sm"
                            placeholder="0.00"
                            type="number"
                            value={formData.rent}
                            onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Amenities</label>
                <div className="flex flex-wrap gap-3">
                    {amenities.map((amenity) => (
                        <label
                            key={amenity.id}
                            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors select-none ${formData.amenities.includes(amenity.id)
                                ? 'border-brand bg-blue-50 dark:bg-brand/10 text-brand-ink'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand-ink'
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.amenities.includes(amenity.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData({ ...formData, amenities: [...formData.amenities, amenity.id] });
                                    } else {
                                        setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity.id) });
                                    }
                                }}
                            />
                            <span className="material-symbols-outlined text-[18px]">{amenity.icon}</span>
                            <span className="text-sm font-medium">{amenity.label}</span>
                        </label>
                    ))}
                    <button className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-brand hover:text-brand-ink transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">add</span> Add more
                    </button>
                </div>
            </div>

            {/* Gold Badge CTA */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 dark:from-yellow-700 dark:via-yellow-500 dark:to-yellow-700 p-0.5 shadow-lg group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                <div className="bg-white/95 dark:bg-canvas-dark/90 backdrop-blur-sm rounded-[10px] p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="size-14 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center text-white shadow-md shrink-0 border-2 border-white dark:border-slate-800">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg flex flex-wrap items-center gap-2">
                                Boost your listing
                                <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-300 to-amber-400 text-white text-xs uppercase font-black tracking-wider shadow-sm">Gold badge</span>
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Upload your Certificate of Occupancy (C of O) now to get verified status immediately.</p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span> Upload C of O
                    </button>
                </div>
            </div>
        </>
    );
};

const StepTwo = () => {
    const [photos] = useState([
        { id: 1, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbG43-7WHVVjkaoRHGRC4F0QMbFQL-mE-qAhKDwIq9YgBHJR9uCBLjlBjz0McDwqFYth7Tgr7W7oRkvJKNwuLnXjfPH29fU3p82yB2i3rYIddo0zRE4FRKmeUbuO24qZwFbjFe2_8Fmi_YM_gGy-de7f9C2uxH0A4ywm9PniZ4RmO66-tDbg5StAB0cxZnlbLrHVHtlf7v1tMkvVzejLvBOhwhr6tCaXSZWvWHBRARqoR7JsNKzqd5bgseRWpvxY1vZbSjhdKUO5W-', isCover: true },
        { id: 2, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAraLcVVDVmYfRHOmOjxzsyXkMzQWtAbIW3C1r08WVl68EaJ_Vh9rql59GWxMAi3Bx6AITv3dxbNyQhiCySccE88wXhe26DuyZdN4FNumwOyTigtkq5dtXaWSGj21JdZinCQL2btIg5bulPPUgt2yfcUHFVzCDuuYdHlkRLBM8CbGHnzevaSZbIx7S94uf79IgrnUY_2yNcfymFev3mMnse7p-I1mchSTxMQLm7B8EUCzA5FMxbspD9ODoKEgWQgxDpSCrTY9LgknfV', isCover: false },
        { id: 3, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTTRItxU1e95xP_0_0zMofzkL__1MMUynCKXSKe7s4j3ozNf5dka8XEJzOgxa9pwtdlPPhUxPtsGn6eD8D5V7SGsLo-b1y9q9IYG_3NuASYZQClws74SWc6mz6wj5b0vFeLKUeYmIWvuXOjO-gZUcNf9S7zSLwBRI-VRMBB9BWn_wWO8kzkFSr8o5ojl16YBzR9Q7KVud41sBlJMg3_FwV1IpptdH_KtF5wDzZ5OHQjQ6Mu-4NDuawZYDVU48VroLph-_ZTaSZaFa9', isCover: false },
    ]);

    return (
        <>
            {/* Upload Zone */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 mb-8">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-canvas-dark/50 hover:bg-slate-100 dark:hover:bg-canvas-dark transition-colors cursor-pointer group flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="size-20 bg-blue-100 dark:bg-blue-900/20 text-brand-ink rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-[40px]">add_photo_alternate</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Drag & drop photos here</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-sm">
                        Upload high-quality images to attract more tenants. <br />
                        <span className="text-xs mt-2 block opacity-70">Accepted: JPG, PNG, WEBP (Max 10MB)</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button className="bg-brand-ink hover:bg-brand-ink/90 text-on-brand px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">upload_file</span> Browse Files
                        </button>
                        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                        <button className="text-slate-700 dark:text-slate-300 hover:text-brand-ink dark:hover:text-brand-ink font-bold text-sm px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">add_a_photo</span> Take Photo
                        </button>
                    </div>
                </div>
            </div>

            {/* Uploaded Photos */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        Uploaded Photos <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{photos.length}</span>
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">drag_indicator</span> Drag to reorder
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-slate-800 hover:border-brand/50 transition-colors ${photo.isCover ? 'border-2 border-brand shadow-md' : 'border border-slate-200 dark:border-slate-700'}`}>
                            <img
                                alt="Property"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                src={photo.url}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {photo.isCover && (
                                <span className="absolute top-3 left-3 bg-brand-ink text-on-brand text-xs uppercase font-bold px-2 py-1 rounded z-10">Cover photo</span>
                            )}
                            <button className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            {!photo.isCover && (
                                <button className="absolute top-2 left-2 p-1.5 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-brand-ink rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10 text-xs font-bold px-2">
                                    Set as Cover
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3D Tour Upload */}
            <div className="mb-10">
                <div className="flex items-end justify-between mb-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Upload 3D Tour Files</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Provide an immersive experience with a 3D virtual tour.</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-canvas-dark/50 hover:bg-slate-100 dark:hover:bg-canvas-dark transition-colors cursor-pointer group flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="size-16 bg-blue-100 dark:bg-blue-900/20 text-brand-ink rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[32px]">view_in_ar</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drag & drop 3D files here</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
                            Supported formats: OBJ, FBX, GLB (Max 50MB). <br />
                            <span className="opacity-80 block mt-1">Or embed a tour from Matterport, Sketchfab, etc.</span>
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button className="bg-brand-ink hover:bg-brand-ink/90 text-on-brand px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">upload_file</span> Browse Files
                            </button>
                            <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                            <button className="text-slate-700 dark:text-slate-300 hover:text-brand-ink dark:hover:text-brand-ink font-bold text-sm px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">link</span> Link from 3D Tour Provider
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const StepThree = ({ formData, setFormData }: { formData: WizardFormData; setFormData: React.Dispatch<React.SetStateAction<WizardFormData>> }) => {
    const leaseDurations = ['Per Year', 'Per Month', 'Short Let', 'Per Week'];
    const amenitiesWithDesc = [
        { id: 'electricity', label: '24/7 Electricity', desc: 'Reliable power supply' },
        { id: 'security', label: 'Security', desc: 'Gated security and CCTV' },
        { id: 'pool', label: 'Swimming pool', desc: 'Shared or private pool' },
        { id: 'parking', label: 'Parking space', desc: 'Designated parking areas' },
        { id: 'gym', label: 'Gym', desc: 'Fitness center access' },
        { id: 'internet', label: 'Internet', desc: 'Fiber optics or WiFi' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Pricing */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <span className="material-symbols-outlined text-brand-ink text-2xl">payments</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pricing & lease terms</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="NGN">NGN (₦) - Nigerian Naira</option>
                                <option value="USD">USD ($) - US Dollar</option>
                                <option value="GBP">GBP (£) - British Pound</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rental price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400 font-bold">₦</span>
                                <input
                                    className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                                    placeholder="0.00"
                                    type="number"
                                    value={formData.rent}
                                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lease duration</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {leaseDurations.map((duration) => (
                                <label key={duration} className="cursor-pointer relative">
                                    <input
                                        type="radio"
                                        name="lease_term"
                                        className="peer sr-only"
                                        checked={formData.leaseDuration === duration}
                                        onChange={() => setFormData({ ...formData, leaseDuration: duration })}
                                    />
                                    <div className="w-full p-3 bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg peer-checked:border-brand peer-checked:bg-blue-50 dark:peer-checked:bg-brand/10 peer-checked:text-brand-ink text-center transition-all">
                                        <span className="block text-sm font-bold">{duration}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer w-max">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-brand-ink focus:ring-brand"
                            checked={formData.negotiable}
                            onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Price is negotiable</span>
                    </label>
                </div>

                {/* Property Details */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-ink text-2xl">info</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Property details</h3>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-brand-ink text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">forum</span>
                            AI Auto-filled
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bedrooms</label>
                            <div className="flex items-center">
                                <button
                                    className="size-10 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
                                    onClick={() => setFormData({ ...formData, beds: String(Math.max(0, parseInt(formData.beds || '0') - 1)) })}
                                >
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <input
                                    className="w-full text-center bg-white dark:bg-[#1e293b] border-y border-slate-200 dark:border-slate-700 py-2 text-slate-900 dark:text-white font-bold outline-none"
                                    readOnly
                                    type="number"
                                    value={formData.beds}
                                />
                                <button
                                    className="size-10 rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
                                    onClick={() => setFormData({ ...formData, beds: String(parseInt(formData.beds || '0') + 1) })}
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bathrooms</label>
                            <div className="flex items-center">
                                <button
                                    className="size-10 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
                                    onClick={() => setFormData({ ...formData, baths: String(Math.max(0, parseInt(formData.baths || '0') - 1)) })}
                                >
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <input
                                    className="w-full text-center bg-white dark:bg-[#1e293b] border-y border-slate-200 dark:border-slate-700 py-2 text-slate-900 dark:text-white font-bold outline-none"
                                    readOnly
                                    type="number"
                                    value={formData.baths}
                                />
                                <button
                                    className="size-10 rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
                                    onClick={() => setFormData({ ...formData, baths: String(parseInt(formData.baths || '0') + 1) })}
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Toilets</label>
                            <div className="flex items-center">
                                <button className="size-10 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <input
                                    className="w-full text-center bg-white dark:bg-[#1e293b] border-y border-slate-200 dark:border-slate-700 py-2 text-slate-900 dark:text-white font-bold outline-none"
                                    readOnly
                                    type="number"
                                    value="3"
                                />
                                <button className="size-10 rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-canvas-dark hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Property Size (sqft)</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                                placeholder="e.g. 1500"
                                type="number"
                                value={formData.sqft}
                                onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Furnishing state</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                                value={formData.furnishing}
                                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                            >
                                <option value="">Select option</option>
                                <option value="furnished">Fully furnished</option>
                                <option value="semi-furnished">Semi-Furnished</option>
                                <option value="unfurnished">Unfurnished</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amenities Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <span className="material-symbols-outlined text-brand-ink text-2xl">wifi</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Amenities</h3>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {amenitiesWithDesc.map((amenity) => (
                            <label key={amenity.id} className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={formData.selectedAmenities.includes(amenity.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, selectedAmenities: [...formData.selectedAmenities, amenity.id] });
                                            } else {
                                                setFormData({ ...formData, selectedAmenities: formData.selectedAmenities.filter(a => a !== amenity.id) });
                                            }
                                        }}
                                    />
                                    <div className="size-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-canvas-dark peer-checked:bg-brand peer-checked:border-brand transition-all"></div>
                                    <span className="material-symbols-outlined text-white text-[14px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-ink transition-colors">{amenity.label}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{amenity.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepFour = () => (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <span className="material-symbols-outlined text-brand-ink text-2xl">description</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Property description</h3>
        </div>
        <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
                className="w-full min-h-[200px] bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none resize-none"
                placeholder="Describe your property in detail. Highlight unique features, nearby amenities, and what makes it special..."
            ></textarea>
            <div className="flex justify-between mt-2">
                <button className="text-brand-ink text-sm font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[18px]">forum</span> Improve with AI
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">0/2000 characters</span>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Move-in Date</label>
                <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Application deadline</label>
                <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white outline-none font-medium"
                />
            </div>
        </div>
    </div>
);

const StepFive = ({ formData }: { formData: WizardFormData }) => (
    <div className="space-y-8">
        {/* Success Preview */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-8 text-center">
            <div className="size-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Almost there</h2>
            <p className="text-slate-600 dark:text-slate-300">Review your listing before publishing.</p>
        </div>

        {/* Preview Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbG43-7WHVVjkaoRHGRC4F0QMbFQL-mE-qAhKDwIq9YgBHJR9uCBLjlBjz0McDwqFYth7Tgr7W7oRkvJKNwuLnXjfPH29fU3p82yB2i3rYIddo0zRE4FRKmeUbuO24qZwFbjFe2_8Fmi_YM_gGy-de7f9C2uxH0A4ywm9PniZ4RmO66-tDbg5StAB0cxZnlbLrHVHtlf7v1tMkvVzejLvBOhwhr6tCaXSZWvWHBRARqoR7JsNKzqd5bgseRWpvxY1vZbSjhdKUO5W-"
                    alt="Property"
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-brand-ink text-on-brand text-xs font-bold uppercase rounded-full">
                    Preview
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{formData.title || 'Your Property Title'}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {formData.address || 'Property Address'}
                </p>
                <div className="flex gap-4 mb-4">
                    <span className="text-sm"><strong>{formData.beds || '0'}</strong> Beds</span>
                    <span className="text-sm"><strong>{formData.baths || '0'}</strong> Baths</span>
                    <span className="text-sm"><strong>{formData.sqft || '0'}</strong> sqft</span>
                </div>
                <div className="text-2xl font-extrabold text-brand-ink">{formatListingPrice(Number(formData.rent || 0), formData.leaseDuration === 'Per Year' ? 'PER_YEAR' : 'PER_MONTH', formData.currency)}</div>
            </div>
        </div>
    </div>
);

// Types
interface WizardFormData {
    title: string;
    propertyType: string;
    address: string;
    beds: string;
    baths: string;
    sqft: string;
    rent: string;
    amenities: string[];
    currency: string;
    leaseDuration: string;
    negotiable: boolean;
    furnishing: string;
    selectedAmenities: string[];
}

// Main Wizard Component
export default function PropertyWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;
    const [draftId, setDraftId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [formData, setFormData] = useState<WizardFormData>({
        title: '',
        propertyType: 'Apartment',
        address: '',
        beds: '3',
        baths: '2',
        sqft: '',
        rent: '',
        amenities: ['washer'],
        currency: 'NGN',
        leaseDuration: 'Per Year',
        negotiable: false,
        furnishing: '',
        selectedAmenities: ['electricity', 'security'],
    });

    function buildPropertyPayload() {
        const propertyTypeMap: Record<string, 'APARTMENT' | 'HOUSE' | 'DUPLEX' | 'STUDIO' | 'TOWNHOUSE'> = {
            'Apartment': 'APARTMENT',
            'House': 'HOUSE',
            'Condo': 'APARTMENT',
            'Townhouse': 'TOWNHOUSE',
        };
        const priceUnitMap: Record<string, 'PER_YEAR' | 'PER_MONTH' | 'TOTAL'> = {
            'Per Year': 'PER_YEAR',
            'Per Month': 'PER_MONTH',
            'Short Let': 'PER_MONTH',
            'Per Week': 'PER_MONTH',
        };
        return {
            name: formData.title,
            propertyType: propertyTypeMap[formData.propertyType] || 'APARTMENT' as const,
            listingType: 'RENT' as const,
            price: parseFloat(formData.rent) || 0,
            priceUnit: priceUnitMap[formData.leaseDuration] || 'PER_YEAR' as const,
            bedrooms: parseInt(formData.beds) || 0,
            bathrooms: parseInt(formData.baths) || 0,
            squareFeet: parseFloat(formData.sqft) || undefined,
            addressStreet: formData.address,
            addressCity: '',
            addressState: '',
        };
    }

    async function handleSaveDraft() {
        try {
            setIsSaving(true);
            const payload = buildPropertyPayload();
            if (draftId) {
                await propertyService.updatePropertyDraft(draftId, payload);
            } else {
                const response = await propertyService.createPropertyDraft(payload);
                setDraftId(response.data.id);
            }
        } catch (err) {
            console.error('Failed to save draft:', err);
            alert('Failed to save draft. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handlePublish() {
        try {
            setIsPublishing(true);
            if (draftId) {
                await propertyService.publishPropertyDraft(draftId);
            } else {
                const payload = buildPropertyPayload();
                await propertyService.createProperty(payload as Parameters<typeof propertyService.createProperty>[0]);
            }
            navigate('/landlord/dashboard');
        } catch (err) {
            console.error('Failed to publish listing:', err);
            alert('Failed to publish listing. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    }

    const stepTitles = [
        { title: 'List your property', subtitle: "Let's start with the basics." },
        { title: 'Upload property photos', subtitle: 'Showcase your property with high-quality images.' },
        { title: 'Pricing & details', subtitle: "Set your property's pricing structure and key features." },
        { title: 'Property description', subtitle: 'Add details to attract the right tenants.' },
        { title: 'Review & publish', subtitle: 'Review your listing before going live.' },
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <StepOne formData={formData} setFormData={setFormData} />;
            case 2: return <StepTwo />;
            case 3: return <StepThree formData={formData} setFormData={setFormData} />;
            case 4: return <StepFour />;
            case 5: return <StepFive formData={formData} />;
            default: return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 pb-32">
            <div className="max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stepTitles[currentStep - 1].title}</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{stepTitles[currentStep - 1].subtitle}</p>
                        </div>
                        <span className="text-sm font-bold text-brand-ink bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">Step {currentStep} of {totalSteps}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand rounded-full shadow-[0_0_10px_rgba(19,127,236,0.5)] transition-all duration-500"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step Content */}
                {renderStep()}

                {/* Navigation */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800 mt-10 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="w-full md:w-auto text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-brand-ink dark:hover:text-brand-ink transition-colors flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Previous Step
                            </button>
                        )}
                        <Link to="/landlord/dashboard" className="w-full md:w-auto text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-brand-ink dark:hover:text-brand-ink transition-colors flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined text-[20px]">visibility</span> See how your listing looks
                        </Link>
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="w-full md:w-auto px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save draft'}
                        </button>
                        {currentStep < totalSteps ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="w-full md:w-auto bg-brand-ink hover:bg-brand-ink/90 text-on-brand px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                Next Step <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">publish</span> {isPublishing ? 'Publishing...' : 'Publish listing'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
