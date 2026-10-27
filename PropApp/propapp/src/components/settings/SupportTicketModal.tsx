import { useState } from 'react';
import ModalPortal from '../ModalPortal';

interface SupportTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: TicketData) => void;
}

interface TicketData {
    topic: string;
    priority: string;
    subject: string;
    description: string;
}

export default function SupportTicketModal({ isOpen, onClose, onSubmit }: SupportTicketModalProps) {
    const [topic, setTopic] = useState('');
    const [priority, setPriority] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({ topic, priority, subject, description });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-2xl transform rounded-2xl bg-white dark:bg-surface-dark p-6 text-left shadow-2xl sm:p-8 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submit a Support Ticket</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Describe your issue and we'll get back to you shortly.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Pre-filled user info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                                <input
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-sm text-sm py-2.5"
                                    readOnly
                                    type="text"
                                    value="Alex Morgan"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                <input
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-sm text-sm py-2.5"
                                    readOnly
                                    type="email"
                                    value="alex.morgan@example.com"
                                />
                            </div>
                        </div>

                        {/* Info banner */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-xs flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                            <p>Contact details are linked to your account. To update them, please visit your Profile Settings.</p>
                        </div>

                        {/* Topic and Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Topic</label>
                                <select
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm text-sm py-2.5 focus:ring-brand focus:border-brand"
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="billing">Billing Issue</option>
                                    <option value="technical">Technical Problem</option>
                                    <option value="listing">Property Listing Inquiry</option>
                                    <option value="access">Account Access</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority (Optional)</label>
                                <div className="flex gap-3">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <label key={p} className="flex-1 cursor-pointer">
                                            <input
                                                className="peer sr-only"
                                                type="radio"
                                                name="priority"
                                                value={p}
                                                checked={priority === p}
                                                onChange={(e) => setPriority(e.target.value)}
                                            />
                                            <div className={`text-center py-2 px-3 rounded-lg border text-sm transition-all ${priority === p
                                                    ? p === 'low'
                                                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                                        : p === 'medium'
                                                            ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400'
                                                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}>
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                            <input
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm text-sm py-2.5 focus:ring-brand focus:border-brand"
                                placeholder="Brief summary of the issue"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                            <textarea
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm text-sm p-3 focus:ring-brand focus:border-brand resize-y"
                                placeholder="Please provide specific details about the issue..."
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                            ></textarea>
                            <p className="text-xs text-slate-400 text-right">{description.length}/1000 characters</p>
                        </div>

                        {/* Attachments */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attachments (Optional)</label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand/90 shadow-sm transition-all cursor-pointer"
                            >
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
}
