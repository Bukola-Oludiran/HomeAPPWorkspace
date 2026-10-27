import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface PhotoGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        name: string;
        address: string;
    };
    images: string[];
    initialIndex?: number;
}

export default function PhotoGalleryModal({ isOpen, onClose, property, images, initialIndex = 0 }: PhotoGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!isOpen) return null;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') onClose();
    };

    return (
        <ModalPortal>
            <div
                className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm"
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 md:px-6 bg-black/40 backdrop-blur-md absolute top-0 left-0 right-0 z-30">
                    <h3 className="text-white font-bold text-base md:text-lg tracking-tight font-display truncate pr-4">
                        Property Photos of {property.address}
                    </h3>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className="hidden md:flex items-center text-slate-300 text-sm font-medium mr-2">
                            {currentIndex + 1} of {images.length}
                        </div>
                        <button className="text-white hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-white/10 hidden sm:flex" title="Download">
                            <span className="material-symbols-outlined">download</span>
                        </button>
                        <button className="text-white hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-white/10 hidden sm:flex" title="Share">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-white/10 ml-0 md:ml-2"
                            title="Close"
                        >
                            <span className="material-symbols-outlined text-2xl md:text-3xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Main Image Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden group w-full h-full pt-16 pb-24 md:pb-28">
                    {/* Previous Button */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 md:left-6 z-20 p-2 md:p-4 rounded-full bg-black/40 text-white hover:bg-white/20 hover:backdrop-blur-md transition-all md:opacity-0 md:group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                    </button>

                    {/* Image */}
                    <img
                        alt={`Gallery View - ${currentIndex + 1}`}
                        className="max-h-full max-w-full object-contain shadow-2xl px-2 md:px-12"
                        src={images[currentIndex]}
                    />

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        className="absolute right-2 md:right-6 z-20 p-2 md:p-4 rounded-full bg-black/40 text-white hover:bg-white/20 hover:backdrop-blur-md transition-all md:opacity-0 md:group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                    </button>
                </div>

                {/* Thumbnail Strip */}
                <div className="h-24 md:h-28 bg-black/80 z-30 flex flex-col justify-center px-4 absolute bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar py-2 h-full">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${index === currentIndex
                                    ? 'border-brand ring-2 ring-brand/30 opacity-100 scale-105'
                                    : 'border-transparent hover:border-slate-500 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-full h-full object-cover ${index === currentIndex ? '' : 'grayscale brightness-75'
                                        }`}
                                    src={image}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="md:hidden text-center text-slate-400 text-xs pb-2 font-medium">
                        {currentIndex + 1} of {images.length}
                    </div>
                </div>

                <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            </div>
        </ModalPortal>
    );
}
