import { useState, useRef, useEffect } from 'react';

interface FilterOption {
    id: string;
    label: string;
    icon?: string;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multiple?: boolean;
    showClearButton?: boolean;
}

export default function FilterDropdown({
    label,
    options,
    selected,
    onChange,
    multiple = true,
    showClearButton = true,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        if (multiple) {
            if (selected.includes(id)) {
                onChange(selected.filter(s => s !== id));
            } else {
                onChange([...selected, id]);
            }
        } else {
            onChange([id]);
            setIsOpen(false);
        }
    };

    const clearAll = () => {
        onChange([]);
    };

    const getDisplayLabel = () => {
        if (selected.length === 0) return label;
        if (selected.length === 1) {
            const option = options.find(o => o.id === selected[0]);
            return option?.label || label;
        }
        return `${label} (${selected.length})`;
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold active:scale-95 transition-all ${selected.length > 0
                        ? 'border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec]'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
            >
                {getDisplayLabel()}
                <span className={`material-symbols-outlined text-[18px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                </span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Options */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => toggleOption(option.id)}
                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                {multiple ? (
                                    <span className={`size-5 rounded border flex items-center justify-center transition-colors ${selected.includes(option.id)
                                            ? 'bg-[#137fec] border-[#137fec] text-white'
                                            : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {selected.includes(option.id) && (
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                        )}
                                    </span>
                                ) : (
                                    <span className={`size-4 rounded-full border-2 flex items-center justify-center transition-colors ${selected.includes(option.id)
                                            ? 'border-[#137fec]'
                                            : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {selected.includes(option.id) && (
                                            <span className="size-2 bg-[#137fec] rounded-full"></span>
                                        )}
                                    </span>
                                )}
                                {option.icon && (
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                                        {option.icon}
                                    </span>
                                )}
                                <span className={`text-sm ${selected.includes(option.id) ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    {showClearButton && selected.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 px-4">
                            <button
                                onClick={clearAll}
                                className="text-xs font-semibold text-slate-500 hover:text-[#137fec] transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
