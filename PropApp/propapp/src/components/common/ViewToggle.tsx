import React from 'react';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
    /** Current view mode */
    value: ViewMode;
    /** Change handler */
    onChange: (mode: ViewMode) => void;
    /** Additional className for customization */
    className?: string;
}

/**
 * ViewToggle - A reusable grid/list view toggle component
 * Provides consistent styling with dark mode support
 */
const ViewToggle: React.FC<ViewToggleProps> = ({
    value,
    onChange,
    className = '',
}) => {
    const getButtonClasses = (mode: ViewMode) => {
        const isActive = value === mode;
        return `p-1.5 rounded-md transition-colors ${isActive
                ? 'bg-white dark:bg-canvas-dark shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`;
    };

    return (
        <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg ${className}`}>
            <button
                onClick={() => onChange('grid')}
                className={getButtonClasses('grid')}
                title="Grid view"
            >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button
                onClick={() => onChange('list')}
                className={getButtonClasses('list')}
                title="List view"
            >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
        </div>
    );
};

export default ViewToggle;
