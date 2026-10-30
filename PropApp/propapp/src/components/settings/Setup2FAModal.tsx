import { useState, useEffect } from 'react';
import ModalPortal from '../ModalPortal';

interface Setup2FAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function Setup2FAModal({ isOpen, onClose, onSuccess }: Setup2FAModalProps) {
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 30));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const handleVerify = () => {
        if (code.length === 6) {
            console.log('Verifying 2FA code:', code);
            onSuccess?.();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-3xl bg-white dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-1 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full cursor-pointer"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set Up Authenticator App</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add a new device for 2-step verification.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto">
                        <div className="max-w-xl mx-auto space-y-8">
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">1</div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Download an authenticator app</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        If you haven't already, download an app like <strong>Google Authenticator</strong> or <strong>Authy</strong> from your phone's app store.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 - QR Code */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">2</div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Scan the QR code</h3>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center text-center">
                                        <div className="bg-white p-2 rounded-lg border border-slate-100 mb-4">
                                            {/* Placeholder QR Code */}
                                            <div className="size-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-slate-500 dark:text-slate-400">qr_code_2</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            Open your authenticator app and scan this code.
                                        </p>
                                        <div className="w-full max-w-sm">
                                            <div className="relative">
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 text-left uppercase tracking-wider">Manual Entry Key</label>
                                                <div className="flex">
                                                    <code className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-l-lg text-sm font-mono text-slate-700 dark:text-slate-300 tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                        JBSW Y3DP EHPK 3PXP
                                                    </code>
                                                    <button
                                                        className="px-3 bg-slate-100 dark:bg-slate-700 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-600 dark:text-slate-300 hover:text-brand-ink dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center cursor-pointer"
                                                        title="Copy to clipboard"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <button className="text-xs font-medium text-brand-ink hover:text-brand-ink/80 flex items-center justify-center gap-1 cursor-pointer">
                                                    <span className="material-symbols-outlined text-[14px]">help</span>
                                                    Trouble scanning?
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verify */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-center max-w-sm mx-auto">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Verify setup</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter the 6-digit code generated by your app to confirm setup.</p>
                                    <div className="relative">
                                        <input
                                            className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold py-3 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-brand focus:ring-brand placeholder-slate-300 dark:placeholder-slate-600"
                                            maxLength={6}
                                            placeholder="000000"
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                        <span className="material-symbols-outlined text-[14px]">timer</span>
                                        <span>Code expires in {countdown}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-[#15202b] rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={code.length !== 6}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-on-brand bg-brand-ink transition-all ${code.length === 6 ? 'hover:bg-brand-ink/90 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            Verify &amp; Enable
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
