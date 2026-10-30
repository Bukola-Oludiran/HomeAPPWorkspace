// DocumentZoomControls component

interface DocumentZoomControlsProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    minZoom?: number;
    maxZoom?: number;
    step?: number;
    showPercentage?: boolean;
    variant?: 'default' | 'compact';
}

export default function DocumentZoomControls({
    zoom,
    onZoomChange,
    minZoom = 50,
    maxZoom = 200,
    step = 25,
    showPercentage = true,
    variant = 'default',
}: DocumentZoomControlsProps) {
    const zoomIn = () => {
        const newZoom = Math.min(zoom + step, maxZoom);
        onZoomChange(newZoom);
    };

    const zoomOut = () => {
        const newZoom = Math.max(zoom - step, minZoom);
        onZoomChange(newZoom);
    };

    const resetZoom = () => {
        onZoomChange(100);
    };

    const fitToWidth = () => {
        // This would normally calculate based on container width
        // For now, set to a reasonable default
        onZoomChange(100);
    };

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-1">
                <button
                    onClick={zoomOut}
                    disabled={zoom <= minZoom}
                    className="size-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>

                {showPercentage && (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[40px] text-center">
                        {zoom}%
                    </span>
                )}

                <button
                    onClick={zoomIn}
                    disabled={zoom >= maxZoom}
                    className="size-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
                onClick={zoomOut}
                disabled={zoom <= minZoom}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
            >
                <span className="material-symbols-outlined">zoom_out</span>
            </button>

            {showPercentage && (
                <button
                    onClick={resetZoom}
                    className="px-2 py-1 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-[50px]"
                    title="Reset zoom"
                >
                    {zoom}%
                </button>
            )}

            <button
                onClick={zoomIn}
                disabled={zoom >= maxZoom}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
            >
                <span className="material-symbols-outlined">zoom_in</span>
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
                onClick={fitToWidth}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Fit to width"
            >
                <span className="material-symbols-outlined">fit_width</span>
            </button>
        </div>
    );
}
