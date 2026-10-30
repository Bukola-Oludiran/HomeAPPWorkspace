import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface PaymentMethod {
    id: string;
    type: 'card' | 'bank';
    name: string;
    last4: string;
    expiry?: string;
    isPreferred?: boolean;
}

interface MakePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    paymentFor?: string;
    amount?: number;
}

export default function MakePaymentModal({ isOpen, onClose, onSuccess, paymentFor = 'Monthly Rent - Nov', amount = 120000 }: MakePaymentModalProps) {
    const [selectedPaymentFor, setSelectedPaymentFor] = useState(paymentFor);
    const [paymentAmount, setPaymentAmount] = useState(amount.toLocaleString() + '.00');
    const [selectedMethod, setSelectedMethod] = useState('visa');

    const paymentMethods: PaymentMethod[] = [
        { id: 'visa', type: 'card', name: 'Visa Card', last4: '4592', expiry: '12/25', isPreferred: true },
        { id: 'gtbank', type: 'bank', name: 'GTBank', last4: '8821' },
    ];

    const paymentOptions = [
        { value: 'Monthly Rent - Nov', label: 'Monthly Rent - Nov' },
        { value: 'Electricity Bill', label: 'Electricity bill' },
        { value: 'AC Maintenance', label: 'AC Maintenance' },
        { value: 'Other', label: 'Other' },
    ];

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-canvas-dark w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-canvas-dark">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Make payment</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Secure transaction for your property</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Payment For & Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Payment for</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400">home</span>
                                    <select
                                        value={selectedPaymentFor}
                                        onChange={(e) => setSelectedPaymentFor(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand appearance-none"
                                    >
                                        {paymentOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400">₦</span>
                                    <input
                                        type="text"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Select payment method</label>
                                <button className="text-xs font-bold text-brand-ink hover:text-brand-ink/80 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">add</span> Add New
                                </button>
                            </div>

                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === method.id
                                        ? 'border-brand bg-blue-50/50 dark:bg-brand/10'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={method.id}
                                        checked={selectedMethod === method.id}
                                        onChange={() => setSelectedMethod(method.id)}
                                        className="sr-only"
                                    />
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-brand bg-brand' : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {selectedMethod === method.id && <div className="size-2.5 rounded-full bg-white"></div>}
                                    </div>
                                    <div className="size-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">
                                            {method.type === 'card' ? 'credit_card' : 'account_balance'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{method.name}</span>
                                            {method.isPreferred && (
                                                <span className="bg-brand/10 text-brand-ink text-xs font-bold px-2 py-0.5 rounded-full">Preferred</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            **** {method.last4} {method.expiry && `• Expires ${method.expiry}`}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Transaction Summary */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Transaction summary</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Payment for</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPaymentFor}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Payment method</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {paymentMethods.find((m) => m.id === selectedMethod)?.name} (**** {paymentMethods.find((m) => m.id === selectedMethod)?.last4})
                                </span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-slate-900 dark:text-white">Total amount</span>
                                <span className="text-xl font-extrabold text-brand-ink">₦{paymentAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-canvas-dark flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onSuccess?.();
                            }}
                            className="flex-1 px-5 py-3 rounded-xl bg-brand-ink text-on-brand font-bold text-sm hover:bg-brand-ink/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock</span> Confirm Payment
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
