import { useState } from 'react';
import { messageService } from '../lib/api/services/messageService';

interface ContactAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: {
        id: string;
        name: string;
        image?: string;
        title?: string;
    };
    property?: {
        id?: string;
        name: string;
        address?: string;
    };
}

export default function ContactAgentModal({ isOpen, onClose, agent, property }: ContactAgentModalProps) {
    const [subject, setSubject] = useState(property ? `Inquiry about ${property.name}` : '');
    const [message, setMessage] = useState('');
    const [requestCallback, setRequestCallback] = useState(false);
    const [phone, setPhone] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        try {
            await messageService.startConversation({
                recipientId: agent.id,
                propertyId: property?.id,
                initialMessage: `${subject}\n\n${message}`,
                callbackRequest: { requested: requestCallback, phone: requestCallback ? phone : undefined, preferredTime: requestCallback ? preferredTime : undefined },
            });
            setSent(true);
        } catch {
            setError('Unable to send your message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Agent</h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {sent ? (
                    /* Success State */
                    <div className="p-8 text-center">
                        <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Message sent</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {agent.name} will get back to you soon.
                        </p>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                        {/* Agent Info */}
                        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <img
                                src={agent.image || 'https://via.placeholder.com/48'}
                                alt={agent.name}
                                className="size-12 rounded-full object-cover border-2 border-white dark:border-slate-700"
                            />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{agent.name}</p>
                                {agent.title && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{agent.title}</p>
                                )}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What's this about?"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                                required
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
                                required
                            />
                        </div>

                        {/* Request Callback */}
                        <div className="mb-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={requestCallback}
                                    onChange={(e) => setRequestCallback(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-brand-ink focus:ring-brand"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Request a callback
                                </span>
                            </label>
                        </div>

                        {/* Callback Fields */}
                        {requestCallback && (
                            <div className="grid grid-cols-2 gap-4 mb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        Preferred Time
                                    </label>
                                    <select
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                                    >
                                        <option value="">Any time</option>
                                        <option value="morning">Morning (9AM - 12PM)</option>
                                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                                        <option value="evening">Evening (5PM - 8PM)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="flex-1 py-3 rounded-xl bg-brand-ink text-on-brand font-bold text-sm hover:bg-brand-ink/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {sending ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
