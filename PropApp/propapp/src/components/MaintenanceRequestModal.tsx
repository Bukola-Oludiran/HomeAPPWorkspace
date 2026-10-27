import { useState } from 'react';
import ModalPortal from './ModalPortal';
import { maintenanceService } from '../lib/api/services/maintenanceService';
import { leaseService } from '../lib/api/services/leaseService';

interface MaintenanceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: MaintenanceRequestData) => void;
    propertyId?: string;
    propertyManager?: {
        name: string;
    };
}

interface MaintenanceRequestData {
    category: string;
    urgency: 'low' | 'medium' | 'high';
    description: string;
}

export default function MaintenanceRequestModal({
    isOpen,
    onClose,
    onSubmit,
    propertyId,
    propertyManager = { name: 'Robert Johnson' }
}: MaintenanceRequestModalProps) {
    const [category, setCategory] = useState('Plumbing');
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            let targetPropertyId = propertyId;
            if (!targetPropertyId) {
                const leases = await leaseService.getLeases({ status: 'ACTIVE', limit: 1 });
                targetPropertyId = leases.data?.[0]?.propertyId;
            }
            if (!targetPropertyId) throw new Error('No active property is available for this request.');
            await maintenanceService.createMaintenanceRequest({
                propertyId: targetPropertyId,
                category: (category === 'General' ? 'OTHER' : category.toUpperCase()) as 'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'HVAC' | 'OTHER',
                description,
                priority: urgency.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
            });
            onSubmit?.({ category, urgency, description });
            onClose();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to submit the request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalPortal>
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
                {/* Floating Panel - No Backdrop */}
                <div className="w-[360px] md:w-[480px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[80vh] flex flex-col transform transition-all duration-300 origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md">
                                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Request</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">AI Assisted Flow</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
                        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                        {/* AI Message */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-2xl rounded-tl-sm flex gap-3 items-start border border-blue-100 dark:border-blue-800 shadow-sm">
                            <span className="material-symbols-outlined text-[#137fec] text-xl mt-0.5">smart_toy</span>
                            <div className="text-sm">
                                <p className="text-slate-900 dark:text-white font-medium leading-relaxed">What issue would you like to report?</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">Please describe your maintenance issue and I'll help you submit a request to your property manager.</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Category
                                    <span className="text-[#137fec] normal-case font-normal ml-1 text-[10px] bg-[#137fec]/10 border border-[#137fec]/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Suggested
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none appearance-none font-medium cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-slate-600"
                                    >
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                        <option>Appliance</option>
                                        <option>HVAC</option>
                                        <option>General</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Urgency
                                    <span className="text-[#137fec] normal-case font-normal ml-1 text-[10px] bg-[#137fec]/10 border border-[#137fec]/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Suggested
                                    </span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['low', 'medium', 'high'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setUrgency(level)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-colors ${urgency === level
                                                ? 'border-2 border-[#137fec] bg-[#137fec]/5 text-[#137fec] font-bold shadow-sm'
                                                : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue in detail..."
                                    className="w-full p-3 bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none min-h-[100px] resize-none leading-relaxed transition-colors hover:border-slate-300 dark:hover:border-slate-600"
                                />
                            </div>

                            {/* Photos Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Photos / Video</label>
                                <button className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">add_a_photo</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#137fec]">Add Photos</span>
                                    <span className="text-xs text-slate-400 mt-1">or drag and drop here</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#101922]/50 flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !description.trim()}
                            className="flex-1 py-3 bg-[#137fec] hover:bg-[#0e64bd] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#137fec]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : `Send Request to ${propertyManager.name}`}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-sm font-bold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
