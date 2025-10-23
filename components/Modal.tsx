import React, { useEffect, useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SliderHandleIcon } from './Icons';

interface ModalProps {
    images: ImageFile[];
    startIndex: number;
    onClose: () => void;
    originalImage: ImageFile | null;
}

export const Modal: React.FC<ModalProps> = ({ images, startIndex, onClose, originalImage }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [sliderPosition, setSliderPosition] = useState(50);

    const goToPrevious = useCallback(() => {
        const isFirstImage = currentIndex === 0;
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    const goToNext = useCallback(() => {
        const isLastImage = currentIndex === images.length - 1;
        const newIndex = isLastImage ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);
    
    useEffect(() => {
        setSliderPosition(50);
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowLeft') {
                goToPrevious();
            } else if (event.key === 'ArrowRight') {
                goToNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, goToPrevious, goToNext]);

    if (!images || images.length === 0) {
        return null;
    }
    
    const currentImage = images[currentIndex];

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="relative max-w-screen-xl max-h-screen-xl w-auto h-auto flex items-center justify-center" onClick={e => e.stopPropagation()}>
                 {originalImage ? (
                    <div className="relative w-full h-full" style={{ userSelect: 'none' }}>
                        {/* Bottom image (original) */}
                        <img 
                            src={originalImage.base64} 
                            alt="Ảnh gốc" 
                            className="object-contain max-w-full max-h-[90vh] block rounded-lg shadow-2xl" 
                        />

                        {/* Top image (result) with clipper */}
                        <div 
                            className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden rounded-lg"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <img 
                                src={currentImage.base64} 
                                alt={`Xem chi tiết ${currentIndex + 1}`} 
                                className="object-contain max-w-full max-h-[90vh] block w-full h-full"
                                style={{
                                    width: originalImage ? '100%' : 'auto',
                                    height: originalImage ? '100%' : 'auto'
                                }}
                                />
                        </div>
                        
                        {/* Slider handle */}
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize flex items-center justify-center pointer-events-none"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="bg-white/90 rounded-full h-10 w-10 flex items-center justify-center shadow-lg ring-2 ring-gray-300">
                                <SliderHandleIcon className="w-6 h-6 text-black" />
                            </div>
                        </div>

                        {/* Slider input */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPosition}
                            onChange={(e) => setSliderPosition(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0"
                            aria-label="So sánh ảnh"
                        />
                    </div>
                ) : (
                    <img src={currentImage.base64} alt={`Xem chi tiết ${currentIndex + 1}`} className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                )}
                
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 z-10"
                    aria-label="Đóng"
                >
                    &times;
                </button>


                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"
                            aria-label="Ảnh trước"
                        >
                            <ChevronLeftIcon className="w-8 h-8" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"
                            aria-label="Ảnh sau"
                        >
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};