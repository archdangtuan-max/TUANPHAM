
import React, { useCallback, useState } from 'react';
import { MaskIcon } from './Icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    activeImage: string | null;
    onStartMasking: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, activeImage, onStartMasking }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onImageUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [onImageUpload]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onImageUpload(e.target.files[0]);
        }
    };
    
    const triggerFileInput = () => {
        document.getElementById('file-input')?.click();
    }

    return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-4 rounded-xl shadow-lg">
             <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-dark-text">Ảnh Gốc</h2>
            <div
                className={`relative w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isDragging ? 'border-dathouzz-orange bg-gray-200 dark:bg-dark-bg' : 'border-gray-400 dark:border-[#444444]'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {activeImage ? (
                     <div className="relative w-full h-full group">
                        <img src={activeImage} alt="Ảnh render gốc" className="object-contain w-full h-full rounded-md" />
                        <div 
                            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity rounded-lg"
                        >
                            <button 
                                type="button"
                                onClick={triggerFileInput}
                                className="text-sm bg-gray-200/90 text-black px-4 py-2 rounded-full hover:bg-white transition-all font-semibold mb-2"
                                aria-label="Thay đổi ảnh gốc"
                            >
                                Thay đổi ảnh
                            </button>
                             <button 
                                type="button"
                                onClick={onStartMasking}
                                className="text-sm bg-blue-500/90 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-all font-semibold flex items-center"
                                aria-label="Chỉnh sửa vùng chọn (Inpaint)"
                            >
                                <MaskIcon className="w-4 h-4 mr-1.5"/>
                                Inpaint
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-4 cursor-pointer" onClick={triggerFileInput}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mt-2 text-sm font-semibold">Kéo thả hoặc bấm để tải ảnh</p>
                        <p className="text-xs text-dathouzz-orange hover:text-orange-400 font-bold">Chọn file</p>
                    </div>
                )}
                 <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    );
};