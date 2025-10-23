
import React, { useState } from 'react';
import type { ImageFile, ActiveMode } from '../types';
import { Modal } from './Modal';
import { DownloadIcon, ExpandIcon, PencilIcon, UseAsInputIcon, BrushIcon } from './Icons';

interface ResultViewProps {
    results: ImageFile[];
    isLoading: boolean;
    error: string | null;
    activeMode: ActiveMode;
    onRefine: (index: number, prompt: string) => void;
    refiningIndex: number | null;
    activeImage: ImageFile | null;
    onSetAsActive: (image: ImageFile) => void;
    onInpaint: (image: ImageFile) => void;
}

const ResultImage: React.FC<{
    image: ImageFile;
    index: number;
    onDownload: () => void;
    onExpand: () => void;
    onRefine: (index: number, prompt: string) => void;
    isRefining: boolean;
    onSetAsActive: (image: ImageFile) => void;
    onInpaint: (image: ImageFile) => void;
    isSingle: boolean;
}> = ({ image, index, onDownload, onExpand, onRefine, isRefining, onSetAsActive, onInpaint, isSingle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');

    const handleRefineClick = () => {
        if (refinePrompt.trim()) {
            onRefine(index, refinePrompt);
            setIsEditing(false);
            setRefinePrompt('');
        }
    };

    return (
        <div className={`relative group bg-gray-200 dark:bg-dark-surface rounded-lg overflow-hidden ${isSingle ? 'aspect-video' : 'aspect-square'}`}>
             {isRefining && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20 rounded-lg">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-dathouzz-orange"></div>
                    <p className="mt-3 text-white text-base font-semibold">Đang chỉnh sửa...</p>
                </div>
            )}
            <img src={image.base64} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover"/>
            <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 ${isEditing ? 'opacity-100' : ''}`}>
                 {!isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={onExpand} className="text-white p-3 bg-black/50 rounded-full hover:bg-dathouzz-orange" aria-label="Expand image" title="Phóng to">
                            <ExpandIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onDownload} className="text-white p-3 bg-black/50 rounded-full hover:bg-dathouzz-orange" aria-label="Download image" title="Tải xuống">
                            <DownloadIcon className="w-6 h-6" />
                        </button>
                         <button onClick={() => setIsEditing(true)} className="text-white p-3 bg-black/50 rounded-full hover:bg-dathouzz-orange" aria-label="Refine image" title="Chỉnh sửa bằng văn bản">
                            <PencilIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => onInpaint(image)} className="text-white p-3 bg-black/50 rounded-full hover:bg-dathouzz-orange" aria-label="Chỉnh sửa vùng chọn (Inpaint)" title="Chỉnh sửa bằng cọ vẽ">
                            <BrushIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => onSetAsActive(image)} className="text-white p-3 bg-black/50 rounded-full hover:bg-dathouzz-orange" aria-label="Dùng làm ảnh gốc" title="Dùng làm ảnh gốc">
                            <UseAsInputIcon className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="w-full p-2 flex flex-col gap-2">
                        <textarea
                            value={refinePrompt}
                            onChange={(e) => setRefinePrompt(e.target.value)}
                            placeholder="VD: thay mái ngói thành màu xám..."
                            className="w-full bg-gray-100 dark:bg-[#282828] border border-gray-300 dark:border-dark-border rounded-lg p-2 text-gray-800 dark:text-white text-sm focus:ring-1 focus:ring-dathouzz-orange"
                            rows={3}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleRefineClick} className="flex-grow bg-green-600 text-white text-sm font-bold py-1.5 px-2 rounded hover:bg-green-500">Áp dụng</button>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white text-sm font-bold py-1.5 px-2 rounded hover:bg-gray-500">Hủy</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ResultView: React.FC<ResultViewProps> = ({ results, isLoading, error, activeMode, onRefine, refiningIndex, activeImage, onSetAsActive, onInpaint }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleDownload = (image: ImageFile) => {
        const link = document.createElement('a');
        link.href = image.base64;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAll = () => {
        results.forEach((image) => {
            handleDownload(image);
        });
    };

    const modeTitles: Record<ActiveMode, string> = {
        exterior: "Kết quả Ngoại thất",
        interior: "Kết quả Nội thất",
        planning: "Kết quả Quy hoạch",
        sketch_colorize: "Kết quả Hoàn thiện nét vẽ",
        plan_to_3d: "Kết quả 2D sang 3D",
        plan_to_perspective: "Kết quả 2D sang Phối cảnh",
        gallery: "Thư viện"
    };

    const isSingleResultMode = ['interior', 'sketch_colorize', 'plan_to_3d', 'plan_to_perspective'].includes(activeMode) && results.length === 1;

    return (
        <div className="bg-white dark:bg-dark-bg p-4 md:p-6 rounded-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="w-1/4"></div> {/* Spacer */}
                <h2 className="w-1/2 text-xl font-bold text-center text-gray-800 dark:text-dark-text">{modeTitles[activeMode]}</h2>
                <div className="w-1/4 flex justify-end">
                    {results.length > 1 && (
                        <button 
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 text-sm font-semibold bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Tải tất cả ảnh"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Tải tất cả</span>
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-grow relative">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 rounded-lg">
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-dathouzz-orange"></div>
                        <p className="mt-4 text-gray-800 dark:text-white text-base font-semibold">Đang tạo ảnh, vui lòng chờ...</p>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                         <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300 px-4 py-3 rounded-lg text-center">
                            <p className="font-bold text-base">Lỗi!</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {!isLoading && !error && results.length === 0 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="mt-4 text-lg">Kết quả sẽ xuất hiện ở đây</p>
                    </div>
                )}
                <div className={isSingleResultMode ? "flex justify-center" : "grid grid-cols-2 gap-4 max-w-4xl mx-auto"}>
                    {results.map((image, index) => (
                         <div key={index} className={isSingleResultMode ? "w-full max-w-3xl" : ""}>
                            <ResultImage
                                image={image}
                                index={index}
                                onDownload={() => handleDownload(image)}
                                onExpand={() => setSelectedIndex(index)}
                                onRefine={onRefine}
                                isRefining={refiningIndex === index}
                                onSetAsActive={onSetAsActive}
                                onInpaint={onInpaint}
                                isSingle={isSingleResultMode}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {selectedIndex !== null && <Modal images={results} startIndex={selectedIndex} onClose={() => setSelectedIndex(null)} originalImage={activeImage} />}
        </div>
    );
};


export const GalleryView: React.FC<{ images: ImageFile[] }> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    return (
        <div className="bg-white dark:bg-dark-bg p-4 md:p-6 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-dark-text">Ảnh đã tạo</h2>
             <div className="flex-grow relative overflow-y-auto">
                {images.length === 0 ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <p className="mt-2 text-lg">Chưa có ảnh nào được tạo.</p>
                    </div>
                ) : (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group aspect-square bg-gray-200 dark:bg-dark-surface rounded-lg overflow-hidden" onClick={() => setSelectedIndex(index)}>
                                <img src={image.base64} alt={`Generated ${index}`} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExpandIcon className="w-8 h-8 text-white"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             {selectedIndex !== null && <Modal images={images} startIndex={selectedIndex} onClose={() => setSelectedIndex(null)} originalImage={null} />}
        </div>
    );
}
