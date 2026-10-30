import { useState, useEffect } from 'react';
import ModalPortal from '../ModalPortal';

interface SMS2FAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SMS2FAModal({ isOpen, onClose, onSuccess }: SMS2FAModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('(555) 123-4567');
    const [countryCode, setCountryCode] = useState('US +1');
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(272); // 4:32

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = () => {
        if (code.length === 6) {
            console.log('Verifying SMS code:', code);
            onSuccess?.();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700 my-8">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set Up SMS Two-Factor Authentication</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 space-y-6">
                        {/* Info */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-brand-ink">
                                <span className="material-symbols-outlined">sms</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Verify your mobile number</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    We will send a 6-digit verification code to your mobile phone. Entering this code confirms you have access to this device.
                                </p>
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Phone Number</label>
                            <div className="flex gap-3">
                                <div className="relative w-32 flex-shrink-0">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full appearance-none rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 pl-3 pr-8 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
                                    >
                                        <option>US +1</option>
                                        <option>UK +44</option>
                                        <option>NG +234</option>
                                        <option>CA +1</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                    </div>
                                </div>
                                <input
                                    className="flex-1 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
                                    placeholder="(555) 000-0000"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-[#1e293b] px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">Verification</span>
                            </div>
                        </div>

                        {/* Code Input */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter 6-digit code</label>
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-sm icon-filled">timer</span>
                                    Expires in {formatTime(countdown)}
                                </span>
                            </div>
                            <div>
                                <input
                                    className="block w-full text-center tracking-[0.5em] text-xl font-bold rounded-lg border-brand ring-1 ring-brand dark:border-brand bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-3 shadow-sm focus:border-brand focus:ring-brand placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-normal"
                                    maxLength={6}
                                    placeholder="000000"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                    Code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">+1 {phoneNumber}</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-center text-sm pt-2">
                                <button className="font-medium text-brand-ink hover:text-brand-ink/80 flex items-center gap-1 cursor-pointer">
                                    Didn't receive code?
                                </button>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 flex items-start gap-3 border border-slate-100 dark:border-slate-700/50">
                            <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">help</span>
                            <div className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                                <p className="font-medium text-slate-900 dark:text-slate-200 mb-0.5">Having trouble?</p>
                                Check if your phone blocks unknown numbers or <button className="text-brand-ink hover:underline font-medium cursor-pointer">contact support</button> for manual verification.
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-slate-50 dark:bg-[#15202b] border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
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
                            Verify &amp; Enable SMS 2FA
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
