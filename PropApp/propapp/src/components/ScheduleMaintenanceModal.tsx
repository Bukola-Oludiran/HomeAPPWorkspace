import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface ScheduleMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyAddress?: string;
    onSubmit?: () => void;
}

export default function ScheduleMaintenanceModal({
    isOpen,
    onClose,
    propertyAddress = "1243 Oakwood Avenue, Austin, TX",
    onSubmit
}: ScheduleMaintenanceModalProps) {
    const [urgency, setUrgency] = useState('med');
    const [maintenanceType, setMaintenanceType] = useState('General Repair');
    const [description, setDescription] = useState('');
    const [accessInstructions, setAccessInstructions] = useState('');
    const [contactPerson, setContactPerson] = useState('Michael Scott');
    const [phoneNumber, setPhoneNumber] = useState('(512) 555-0921');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit?.();
        onClose();
    };

    return (
        <ModalPortal>
            <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="dialog">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-canvas-dark text-left shadow-2xl transition-all flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-white dark:bg-canvas-dark">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">Schedule maintenance</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {propertyAddress}
                            </p>
                        </div>
                        <button
                            className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none"
                            type="button"
                            onClick={onClose}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Maintenance Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Maintenance type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium"
                                            value={maintenanceType}
                                            onChange={(e) => setMaintenanceType(e.target.value)}
                                        >
                                            <option>General repair</option>
                                            <option>Plumbing</option>
                                            <option>Electrical</option>
                                            <option>HVAC</option>
                                            <option>Appliance issue</option>
                                            <option>Pest control</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Urgency */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Urgency</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="priority" type="radio" checked={urgency === 'low'} onChange={() => setUrgency('low')} />
                                            <div className="flex h-[46px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 dark:peer-checked:bg-green-900/20 dark:peer-checked:text-green-400 transition-all">
                                                Low
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="priority" type="radio" checked={urgency === 'med'} onChange={() => setUrgency('med')} />
                                            <div className="flex h-[46px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 dark:peer-checked:bg-blue-900/20 dark:peer-checked:text-blue-400 transition-all">
                                                Med
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="priority" type="radio" checked={urgency === 'high'} onChange={() => setUrgency('high')} />
                                            <div className="flex h-[46px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 dark:peer-checked:bg-orange-900/20 dark:peer-checked:text-orange-400 transition-all">
                                                High
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input className="peer sr-only" name="priority" type="radio" checked={urgency === 'emergency'} onChange={() => setUrgency('emergency')} />
                                            <div className="flex h-[46px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 dark:peer-checked:bg-red-900/20 dark:peer-checked:text-red-400 transition-all">
                                                !!
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Description of Issue */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description of issue</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm"
                                    placeholder="Please provide details about the problem..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Date and Time Slot */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Preferred date</label>
                                    <input className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium h-[48px]" type="date" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Time slot</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium">
                                            <option>Anytime (8am - 6pm)</option>
                                            <option>Morning (8am - 12pm)</option>
                                            <option>Afternoon (12pm - 4pm)</option>
                                            <option>Evening (4pm - 8pm)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">schedule</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Access Instructions */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Access instructions</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm"
                                    placeholder="e.g. Gate code is #1234, Key in lockbox..."
                                    rows={2}
                                    value={accessInstructions}
                                    onChange={(e) => setAccessInstructions(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800"></div>

                            {/* Assign to Vendor */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Assign to Vendor (Optional)</label>
                                <div className="relative">
                                    <select className="w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium">
                                        <option value="">Select from Preferred Vendors...</option>
                                        <option>Bob's Plumbing Services (Rated 4.8)</option>
                                        <option>Sparky Electric Co. (Rated 4.9)</option>
                                        <option>GreenThumb Landscaping (Rated 4.5)</option>
                                        <option value="unassigned">Unassigned (Open for Bids)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">engineering</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contact person</label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pl-10 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium"
                                            type="text"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Phone number</label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pl-10 text-slate-900 dark:text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand text-sm font-medium"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">phone</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 bg-slate-50 dark:bg-canvas-dark px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors text-sm"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors text-sm flex items-center justify-center gap-2"
                            type="button"
                            onClick={handleSubmit}
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Schedule request
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
