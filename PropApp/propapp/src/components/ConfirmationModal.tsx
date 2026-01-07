import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    icon?: 'warning' | 'delete' | 'block' | 'cancel';
    variant?: 'danger' | 'warning';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    icon = 'warning',
    variant = 'danger'
}: ConfirmationModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onConfirm?.();
            setIsProcessing(false);
            onClose();
        }, 800);
    };

    const iconMap = {
        warning: 'warning',
        delete: 'delete_forever',
        block: 'block',
        cancel: 'cancel'
    };

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-50 dark:bg-red-900/20',
            iconText: 'text-red-500 dark:text-red-400',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonShadow: 'shadow-red-600/20'
        },
        warning: {
            iconBg: 'bg-amber-50 dark:bg-amber-900/20',
            iconText: 'text-amber-500 dark:text-amber-400',
            buttonBg: 'bg-amber-600 hover:bg-amber-700',
            buttonShadow: 'shadow-amber-600/20'
        }
    };

    const styles = variantStyles[variant];

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="p-6 text-center">
                        {/* Icon */}
                        <div className={`size-14 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 ${styles.iconText}`}>
                            <span className="material-symbols-outlined text-3xl">{iconMap[icon]}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {description}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className={`flex-1 px-4 py-2.5 rounded-lg ${styles.buttonBg} text-white font-bold text-sm shadow-lg ${styles.buttonShadow} transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                            >
                                {isProcessing ? 'Processing...' : confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
