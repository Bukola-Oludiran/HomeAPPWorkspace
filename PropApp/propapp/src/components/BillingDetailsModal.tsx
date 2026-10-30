import { useEffect, useState } from 'react';
import ModalPortal from './ModalPortal';
import { integrationService } from '../lib/api/services/integrationService';

interface BillingStatement {
    id: string;
    title: string;
    type: 'monthly' | 'quarterly' | 'utilities';
    date: string;
    amount: string;
    status: 'paid' | 'pending';
    icon: string;
    iconBg: string;
    iconColor: string;
}

interface BillingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BillingDetailsModal({ isOpen, onClose }: BillingDetailsModalProps) {
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [statements, setStatements] = useState<BillingStatement[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        integrationService.getBillingStatements().then(response => {
            const items = response.data as Array<{ id: string; period: string; total: number; currency: string }>;
            setStatements(items.map(item => ({
                id: item.id,
                title: `${item.period} Statement`,
                type: 'monthly',
                date: item.period,
                amount: new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(item.total),
                status: 'paid',
                icon: 'description',
                iconBg: 'bg-blue-50 dark:bg-blue-900/20',
                iconColor: 'text-brand-ink',
            })));
            setError(null);
        }).catch(() => setError('Unable to load billing statements.'));
    }, [isOpen]);

    const visibleStatements = statements.filter(statement => statement.date.startsWith(selectedYear) && (selectedPeriod === 'all' || statement.type === selectedPeriod));

    if (!isOpen) return null;

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'monthly': return 'Monthly Rent';
            case 'quarterly': return 'Quarterly';
            case 'utilities': return 'Utilities';
            default: return type;
        }
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Billing Statements</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                View and download your payment history and invoices.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="p-4 flex flex-wrap gap-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/50 cursor-pointer appearance-none outline-none"
                            >
                                {[0, 1, 2].map(offset => {
                                    const year = String(new Date().getFullYear() - offset);
                                    return <option key={year} value={year}>Year: {year}</option>;
                                })}
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/50 cursor-pointer appearance-none outline-none"
                            >
                                <option value="all">All Periods</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px] pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Statements List */}
                    <div className="overflow-y-auto flex-1">
                        {error && <p role="alert" className="p-4 text-sm text-red-600">{error}</p>}
                        {!error && visibleStatements.length === 0 && <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No statements for this period.</p>}
                        {visibleStatements.map((statement) => (
                            <div
                                key={statement.id}
                                className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-12 rounded-xl ${statement.iconBg} ${statement.iconColor} flex items-center justify-center shrink-0`}>
                                        <span className="material-symbols-outlined icon-filled">{statement.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{statement.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-nowrap">
                                                {getTypeLabel(statement.type)}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">• {statement.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block mr-2">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{statement.amount}</p>
                                        <p className={`text-xs font-bold uppercase ${statement.status === 'paid'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-orange-600 dark:text-orange-400'
                                            }`}>
                                            {statement.status}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => void integrationService.exportData({ dataset: 'transactions', format: 'pdf', start: `${statement.id}-01`, end: `${statement.id}-31` })}
                                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-ink hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            title="View"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button
                                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-ink hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            title="Download PDF"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
                        <button className="text-sm font-bold text-brand-ink hover:text-brand-ink/80 transition-colors">
                            Load older statements
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
