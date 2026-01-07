import { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataType?: string;
    onExport?: (format: string, dateRange: { start: string; end: string }) => void;
}

export default function ExportModal({ isOpen, onClose, dataType = 'data', onExport }: ExportModalProps) {
    const [format, setFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: '',
    });
    const [preset, setPreset] = useState<'all' | 'month' | 'quarter' | 'year' | 'custom'>('all');
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const handlePresetChange = (newPreset: typeof preset) => {
        setPreset(newPreset);
        const today = new Date();

        switch (newPreset) {
            case 'month': {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRange({
                    start: start.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                });
                break;
            }
            case 'quarter': {
                const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                setDateRange({
                    start: quarterStart.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                });
                break;
            }
            case 'year': {
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setDateRange({
                    start: yearStart.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                });
                break;
            }
            case 'all':
            case 'custom':
            default:
                setDateRange({ start: '', end: '' });
        }
    };

    const handleExport = async () => {
        setExporting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (onExport) {
            onExport(format, dateRange);
        }

        setExporting(false);
        setExported(true);

        setTimeout(() => {
            setExported(false);
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    const formatOptions = [
        { id: 'csv', label: 'CSV', icon: 'table_view', description: 'Comma-separated values' },
        { id: 'pdf', label: 'PDF', icon: 'picture_as_pdf', description: 'Portable document format' },
        { id: 'xlsx', label: 'Excel', icon: 'grid_on', description: 'Microsoft Excel format' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a2632] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#137fec]/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#137fec]">download</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export {dataType}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {exported ? (
                    <div className="p-8 text-center">
                        <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Export Complete!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Your file is downloading...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Content */}
                        <div className="p-6">
                            {/* Format Selection */}
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                    Export Format
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {formatOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFormat(option.id as typeof format)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${format === option.id
                                                    ? 'border-[#137fec] bg-[#137fec]/5'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl ${format === option.id ? 'text-[#137fec]' : 'text-slate-400'
                                                }`}>
                                                {option.icon}
                                            </span>
                                            <span className={`text-sm font-semibold ${format === option.id ? 'text-[#137fec]' : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="mb-5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                    Date Range
                                </label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {[
                                        { id: 'all', label: 'All Time' },
                                        { id: 'month', label: 'This Month' },
                                        { id: 'quarter', label: 'This Quarter' },
                                        { id: 'year', label: 'This Year' },
                                        { id: 'custom', label: 'Custom' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handlePresetChange(opt.id as typeof preset)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${preset === opt.id
                                                    ? 'bg-[#137fec] text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {preset === 'custom' && (
                                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="px-6 py-2.5 rounded-xl bg-[#137fec] text-white font-bold text-sm hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20 disabled:opacity-70 flex items-center gap-2"
                            >
                                {exporting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Export
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
