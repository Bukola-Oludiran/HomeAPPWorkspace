import { useState } from 'react';
import { integrationService } from '../lib/api/services/integrationService';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: {
        id: string;
        name: string;
        type: 'landlord' | 'agent' | 'tenant' | 'property';
        image?: string;
    };
    context?: { type: 'LEASE' | 'JOB'; id: string };
}

export default function ReviewModal({ isOpen, onClose, recipient, context }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ratingLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        setError(null);
        try {
            if (!context) throw new Error('A completed lease or job is required to submit a review.');
            await integrationService.createReview({ subjectId: recipient.id, contextType: context.type, contextId: context.id, rating, body: review || undefined });
            setSubmitted(true);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to submit the review.');
        } finally {
            setSubmitting(false);
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
            <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Write a Review</h2>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center">
                        <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Review Submitted!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Thank you for your feedback.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                        {/* Recipient Info */}
                        <div className="flex items-center gap-3 mb-6">
                            {recipient.image ? (
                                <img
                                    src={recipient.image}
                                    alt={recipient.name}
                                    className="size-14 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                                />
                            ) : (
                                <div className="size-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-slate-400">
                                        {recipient.type === 'property' ? 'home' : 'person'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{recipient.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                    Rate your experience with this {recipient.type}
                                </p>
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                Your Rating
                            </label>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform"
                                        >
                                            <span className={`material-symbols-outlined text-4xl ${(hoverRating || rating) >= star
                                                    ? 'text-amber-400 icon-filled'
                                                    : 'text-slate-300 dark:text-slate-600'
                                                }`}>
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {(hoverRating || rating) > 0 && (
                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                        {ratingLabels[(hoverRating || rating) - 1]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                Your Review <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">{review.length}/500</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={rating === 0 || submitting}
                                className="flex-1 py-3 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
