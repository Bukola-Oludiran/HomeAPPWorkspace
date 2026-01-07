import { useState, useRef, useEffect } from 'react';

interface InlineTagInputProps {
    onAdd: (value: string) => void;
    placeholder?: string;
}

/**
 * A button that converts to an input field when clicked.
 * - Click "Add custom" → shows input
 * - Enter or blur with text → saves and calls onAdd
 * - Escape or empty blur → cancels
 */
export function InlineTagInput({ onAdd, placeholder = 'Type and press Enter...' }: InlineTagInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        const trimmed = value.trim();
        if (trimmed) {
            onAdd(trimmed);
        }
        setValue('');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue('');
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handleBlur = () => {
        // Small delay to allow for any click events to fire first
        setTimeout(() => {
            if (value.trim()) {
                handleSave();
            } else {
                handleCancel();
            }
        }, 100);
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="px-4 py-2 rounded-xl border border-dashed border-[#137fec]/50 bg-white/5 text-white placeholder-slate-300 text-sm font-medium focus:outline-none focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] transition-all min-w-[120px]"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 rounded-xl border border-dashed border-white/20 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white transition-all text-sm font-medium flex items-center gap-1"
        >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add custom
        </button>
    );
}

interface CustomTagProps {
    label: string;
    isSelected: boolean;
    onToggle: () => void;
    onDelete: () => void;
    isCustom?: boolean;
}

/**
 * A tag that can be selected/deselected.
 * Custom tags show a delete X on hover.
 */
export function SelectableTag({ label, isSelected, onToggle, onDelete, isCustom = false }: CustomTagProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                type="button"
                onClick={onToggle}
                className={`cursor-pointer px-4 py-2 rounded-xl border transition-all text-sm font-medium select-none inline-block ${isSelected
                    ? 'bg-[#137fec]/20 border-[#137fec] text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
            >
                {label}
            </button>

            {/* Delete button for custom tags */}
            {isCustom && isHovered && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-white hover:bg-slate-100 text-red-500 flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                    title="Remove custom option"
                >
                    <span className="text-[18px] font-bold leading-none">×</span>
                </button>
            )}
        </div>
    );
}
