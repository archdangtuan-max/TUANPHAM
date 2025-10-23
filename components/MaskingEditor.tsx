import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import * as Icons from './Icons';

interface MaskingEditorProps {
    image: ImageFile;
    onApply: (maskImage: ImageFile, prompt: string, referenceImage: ImageFile | null) => void;
    onClose: () => void;
    isProcessing: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


export const MaskingEditor: React.FC<MaskingEditorProps> = ({ image, onApply, onClose, isProcessing }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(40);
    const [isErasing, setIsErasing] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);

    const imageRef = useRef(new Image());
    imageRef.current.src = image.base64;

    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const img = imageRef.current;
        const container = canvas.parentElement;
        if(!container) return;

        const containerRatio = container.clientWidth / container.clientHeight;
        const imgRatio = img.naturalWidth / img.naturalHeight;

        let canvasWidth, canvasHeight;
        if (containerRatio > imgRatio) {
            canvasHeight = container.clientHeight;
            canvasWidth = canvasHeight * imgRatio;
        } else {
            canvasWidth = container.clientWidth;
            canvasHeight = canvasWidth / imgRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over'; // Default
        contextRef.current = context;
    }, []);

    useEffect(() => {
        const img = imageRef.current;
        const handleResize = () => setupCanvas();

        img.onload = handleResize;
        window.addEventListener('resize', handleResize);
        
        if (img.src !== image.base64) {
            img.src = image.base64;
        } else if (img.complete) {
            handleResize();
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [setupCanvas, image.base64]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent): {x: number, y: number} => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const context = contextRef.current;
        if (!context) return;
        const {x, y} = getCoords(e);
        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
    };

    const finishDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const context = contextRef.current;
        if (!context) return;
        context.closePath();
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const context = contextRef.current;
        if (!context) return;
        const {x, y} = getCoords(e);

        context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = brushSize;

        context.strokeStyle = 'rgba(255, 102, 0, 0.7)'; // Dathouzz Orange
        context.lineTo(x, y);
        context.stroke();
    };

    const handleApply = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = imageRef.current.naturalWidth;
        maskCanvas.height = imageRef.current.naturalHeight;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;

        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        maskCtx.globalCompositeOperation = 'source-over';
        maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);

        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 0) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
            }
        }
        maskCtx.putImageData(imageData, 0, 0);

        const maskBase64 = maskCanvas.toDataURL('image/png');
        const maskFile: ImageFile = {
            base64: maskBase64,
            mimeType: 'image/png',
            name: 'mask.png'
        };
        onApply(maskFile, prompt, referenceImage);
    };

    const handleReferenceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setReferenceImage({ base64, mimeType: file.type, name: file.name });
        }
    };
    
    const triggerFileInput = (id: string) => document.getElementById(id)?.click();


    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] p-4 flex" onClick={onClose}>
            <div className="w-full h-full bg-white dark:bg-dark-bg flex flex-col md:flex-row gap-4 p-4 rounded-xl" onClick={e => e.stopPropagation()}>
                {/* Main canvas area */}
                <div className="flex-grow h-full relative flex justify-center items-center bg-gray-100 dark:bg-dark-surface rounded-lg overflow-hidden">
                     <img src={image.base64} alt="background" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain" />
                     <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseLeave={finishDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={finishDrawing}
                        onTouchMove={draw}
                        className="cursor-crosshair z-10"
                    />
                </div>
                {/* Control Panel */}
                <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-gray-50 dark:bg-dark-surface p-4 rounded-lg flex flex-col gap-4 overflow-y-auto">
                    <h2 className="text-xl font-bold text-center text-dathouzz-orange">Chỉnh sửa Inpainting</h2>
                    
                    <div>
                        <label className="block text-sm font-bold mb-2">Công cụ</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setIsErasing(false)} className={`py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 ${!isErasing ? 'bg-dathouzz-orange text-white' : 'bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333]'}`}><Icons.BrushIcon className="w-4 h-4" /> Vẽ</button>
                            <button onClick={() => setIsErasing(true)} className={`py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 ${isErasing ? 'bg-dathouzz-orange text-white' : 'bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333]'}`}><Icons.EraserIcon className="w-4 h-4" /> Tẩy</button>
                        </div>
                    </div>

                    <div>
                         <label htmlFor="brushSize" className="block text-sm font-bold mb-2">Cỡ cọ: <span className="font-normal text-gray-500 dark:text-gray-400">{brushSize}px</span></label>
                        <input
                            id="brushSize"
                            type="range"
                            min="5"
                            max="100"
                            value={brushSize}
                            onChange={e => setBrushSize(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="inpaint-prompt" className="block text-sm font-bold mb-2">Yêu cầu thay đổi</label>
                        <textarea
                            id="inpaint-prompt"
                            rows={4}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="VD: thêm một chiếc ghế sofa màu be..."
                            className="w-full bg-gray-100 dark:bg-[#282828] border border-gray-300 dark:border-dark-border rounded-lg p-2 text-gray-800 dark:text-white text-sm focus:ring-1 focus:ring-dathouzz-orange"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold mb-2">Ảnh tham khảo (Tùy chọn)</label>
                        {referenceImage ? (
                             <div className="relative group">
                                <img src={referenceImage.base64} alt="Ảnh tham khảo" className="w-full rounded-lg object-contain aspect-video bg-gray-100 dark:bg-dark-bg"/>
                                <button type="button" onClick={() => setReferenceImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500">&times;</button>
                            </div>
                        ) : (
                             <button type="button" onClick={() => triggerFileInput('ref-image-input')} className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg">
                                <Icons.PaletteIcon className="w-8 h-8"/>
                                <span className="text-sm mt-1">Tải ảnh tham khảo</span>
                            </button>
                        )}
                         <input type="file" id="ref-image-input" className="hidden" accept="image/*" onChange={handleReferenceImageUpload} />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI sẽ lấy cảm hứng về kiểu dáng, vật liệu, kết cấu từ ảnh này.</p>
                    </div>

                    <div className="mt-auto pt-4">
                         <button onClick={handleApply} disabled={!prompt || isProcessing} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
                            {isProcessing ? 'Đang áp dụng...' : 'Áp dụng'}
                        </button>
                    </div>

                </div>
            </div>
             <button onClick={onClose} className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors z-[71] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">&times;</button>
        </div>
    );
};
