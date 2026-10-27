import { useState } from 'react';
import ModalPortal from './ModalPortal';
import DocumentZoomControls from './DocumentZoomControls';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: {
        title: string;
        type: 'pdf' | 'doc' | 'image';
        property?: string;
        modifiedTime?: string;
        status?: string;
        totalPages?: number;
    };
}

export default function DocumentViewerModal({ isOpen, onClose, document }: DocumentViewerModalProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);
    const totalPages = document.totalPages || 12;

    if (!isOpen) return null;

    const getDocIcon = () => {
        switch (document.type) {
            case 'pdf':
                return { icon: 'picture_as_pdf', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-500/20' };
            case 'doc':
                return { icon: 'description', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20' };
            default:
                return { icon: 'image', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-500/20' };
        }
    };

    const docStyle = getDocIcon();

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] bg-slate-100 dark:bg-[#0B1116] flex flex-col text-slate-900 dark:text-white overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-canvas-dark h-[72px] px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-lg ${docStyle.bg} ${docStyle.text} flex items-center justify-center border ${docStyle.border}`}>
                            <span className="material-symbols-outlined text-[24px]">{docStyle.icon}</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Preview: {document.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                {document.property && <span>{document.property}</span>}
                                {document.property && document.modifiedTime && <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>}
                                {document.modifiedTime && <span>Modified {document.modifiedTime}</span>}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400"
                        title="Close Preview"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </header>

                {/* Toolbar */}
                <div className="bg-white dark:bg-canvas-dark h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 relative">
                    <div className="flex items-center gap-1">
                        <button className="flex items-center justify-center size-9 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Toggle Sidebar">
                            <span className="material-symbols-outlined text-[20px]">thumbnail_bar</span>
                        </button>
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <button className="flex items-center justify-center size-9 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Fit to Width">
                            <span className="material-symbols-outlined text-[20px]">fit_width</span>
                        </button>
                    </div>

                    {/* Page Navigation */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:text-brand transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <div className="px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                            {currentPage} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>

                    {/* Zoom & AI */}
                    <div className="flex items-center gap-3">
                        <DocumentZoomControls
                            zoom={zoom}
                            onZoomChange={setZoom}
                            minZoom={50}
                            maxZoom={200}
                            step={10}
                            variant="compact"
                        />
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-brand hover:bg-brand/5 border border-brand/20 transition-colors text-sm font-semibold">
                            <span className="material-symbols-outlined text-[18px]">forum</span>
                            <span>Analyze</span>
                        </button>
                    </div>
                </div>

                {/* Document Content */}
                <main className="flex-1 bg-slate-100/50 dark:bg-[#0B1116] overflow-auto flex justify-center py-8 px-4 relative">
                    <div
                        className="relative w-full max-w-[850px] bg-white text-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 min-h-[1100px] mx-auto p-12 md:p-16 transition-transform origin-top"
                        style={{ transform: `scale(${zoom / 100})` }}
                    >
                        {/* Sample Document Content */}
                        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-10">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-widest leading-none">
                                    Residential<br />Lease Agreement
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">No. 2023-8492</p>
                                <p className="text-sm text-slate-500 mt-1">Date: Dec 1, 2023</p>
                            </div>
                        </div>

                        <div className="space-y-8 font-serif text-lg leading-relaxed text-slate-800 text-justify">
                            <p>
                                <span className="font-bold uppercase tracking-wide">This Lease Agreement</span> (the "Agreement") is made and entered into this 1st day of December, 2023, by and between:
                            </p>

                            <div className="grid grid-cols-2 gap-8 my-8">
                                <div className="bg-slate-50 p-4 border border-slate-200">
                                    <p className="text-xs font-sans font-bold text-slate-400 uppercase mb-1">Landlord</p>
                                    <p className="font-bold text-slate-900">Oakwood Management Group</p>
                                    <p className="text-sm text-slate-600">400 Management Way, Austin TX</p>
                                </div>
                                <div className="bg-slate-50 p-4 border border-slate-200">
                                    <p className="text-xs font-sans font-bold text-slate-400 uppercase mb-1">Tenant</p>
                                    <p className="font-bold text-slate-900">Mark Anderson</p>
                                    <p className="text-sm text-slate-600">Current Address: 1243 Oakwood Ave</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider mb-2">1. The Premises</h3>
                                <p>
                                    Landlord agrees to lease to Tenant, and Tenant agrees to lease from Landlord, the single-family residence located at <strong>1243 Oakwood Avenue, Austin, TX 78704</strong> (the "Premises"). The Premises shall be used strictly for residential purposes.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider mb-2">2. Lease Term</h3>
                                <p>
                                    The initial term of this Lease shall begin on <strong>December 1, 2023</strong> and end on <strong>November 30, 2024</strong>. Tenant shall vacate the Premises upon termination of the Agreement, unless: (i) the Landlord and Tenant have agreed in writing to extend this Agreement or sign a new lease agreement; (ii) the Landlord accepts Rent from the Tenant (other than past due Rent), in which case a month-to-month tenancy shall be created.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider mb-2">3. Rent & Payments</h3>
                                <p>
                                    Tenant shall pay to Landlord the sum of <strong>$4,800.00</strong> per month as Rent for the Term of the Agreement. The Rent shall be due on the first day of each month.
                                </p>
                            </div>
                        </div>

                        {/* Page Footer */}
                        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-xs font-sans text-slate-400 border-t border-slate-200 pt-4">
                            <span>Initials: ________ / ________</span>
                            <span>Page {currentPage} of {totalPages}</span>
                        </div>
                    </div>
                </main>

                {/* Footer Actions */}
                <footer className="bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shrink-0 z-30">
                    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                Download
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">print</span>
                                Print
                            </button>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {document.status && (
                                <>
                                    <div className="hidden lg:block text-right">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{document.status}</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
                                </>
                            )}
                            <button className="flex-1 md:flex-none bg-brand hover:bg-[#0e64bd] text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                                <span>Proceed to Sign</span>
                                <span className="material-symbols-outlined text-[20px]">ink_pen</span>
                            </button>
                        </div>
                    </div>
                </footer>

                <style>{`
                .doc-scroll::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .doc-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .doc-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 5px;
                }
                .doc-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            </div>
        </ModalPortal>
    );
}
