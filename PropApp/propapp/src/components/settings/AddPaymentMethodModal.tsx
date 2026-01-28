import { useState } from 'react';
import ModalPortal from '../ModalPortal';

interface AddPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddPaymentMethodModal({ isOpen, onClose }: AddPaymentMethodModalProps) {
    const [activeTab, setActiveTab] = useState<'card' | 'bank'>('card');

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-2xl transform rounded-2xl bg-white dark:bg-[#1a2632] shadow-2xl transition-all flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-5">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Payment Method</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 overflow-y-auto">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
                            <button
                                onClick={() => setActiveTab('card')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'card'
                                        ? 'bg-white dark:bg-slate-600 text-[#137fec] dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'card' ? 'icon-filled' : ''}`}>credit_card</span>
                                Credit/Debit Card
                            </button>
                            <button
                                onClick={() => setActiveTab('bank')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'bank'
                                        ? 'bg-white dark:bg-slate-600 text-[#137fec] dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                Bank Account
                            </button>
                        </div>

                        {activeTab === 'card' ? (
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">credit_card</span>
                                        </span>
                                        <input
                                            className="w-full pl-10 pr-12 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                            placeholder="0000 0000 0000 0000"
                                            type="text"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none opacity-50 grayscale">
                                            <div className="w-6 h-4 bg-slate-300 rounded-sm"></div>
                                            <div className="w-6 h-4 bg-slate-300 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expiration Date</label>
                                        <input
                                            className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                            placeholder="MM / YY"
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CVV / CVC</label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                                placeholder="123"
                                                type="text"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-help hover:text-[#137fec] transition-colors" title="3 digits on back of card">
                                                <span className="material-symbols-outlined text-[20px]">help</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cardholder Name</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                        placeholder="Full name as on card"
                                        type="text"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input defaultChecked className="w-5 h-5 text-[#137fec] border-slate-300 rounded focus:ring-[#137fec] dark:bg-slate-800 dark:border-slate-600 cursor-pointer" type="checkbox" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                            Use profile address as billing address
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <input defaultChecked className="w-5 h-5 text-[#137fec] border-slate-300 rounded focus:ring-[#137fec] dark:bg-slate-800 dark:border-slate-600 cursor-pointer" type="checkbox" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                            Save card for future payments
                                        </span>
                                    </label>
                                </div>

                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3 mt-4">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">verified_user</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        <span className="font-bold block mb-0.5 text-blue-700 dark:text-blue-300">Secure Payment</span>
                                        Your payment details are encrypted using 256-bit SSL. We are PCI DSS compliant and never store your full card number.
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bank Name</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                        placeholder="Enter your bank name"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Account Number</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                        placeholder="Enter your account number"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Routing Number</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-[#137fec] focus:ring-[#137fec] sm:text-sm font-medium placeholder-slate-400"
                                        placeholder="Enter routing number"
                                        type="text"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 dark:border-slate-700 px-6 py-5 flex items-center justify-end gap-3 rounded-b-2xl bg-slate-50 dark:bg-[#15202b]">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-all shadow-sm cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#137fec] hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/25 hover:shadow-[#137fec]/40 transition-all flex items-center gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {activeTab === 'card' ? 'Add Card' : 'Add Bank Account'}
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
