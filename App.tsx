import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultView, GalleryView } from './components/ResultView';
import { MaskingEditor } from './components/MaskingEditor';
import { generateExterior, generateInterior, generatePlanning, refineImage, inpaintImage, generateSketchColorize, generatePlanTo3D, generatePlanToPerspective, generateImageSuggestions } from './services/geminiService';
import type { ActiveMode, ImageFile, RenderSettings, EditingOptions } from './types';
import { AISuggestions } from './components/AISuggestions';

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


// FIX: Changed component definition to let TypeScript infer the return type, avoiding issues with React.FC.
const App = () => {
    const [activeMode, setActiveMode] = useState<ActiveMode>('exterior');
    const [isLoading, setIsLoading] = useState(false);
    const [refiningIndex, setRefiningIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [activeImage, setActiveImage] = useState<ImageFile | null>(null);
    const [imageToInpaint, setImageToInpaint] = useState<ImageFile | null>(null);
    const [isInpaintingOriginal, setIsInpaintingOriginal] = useState(false);

    const [results, setResults] = useState<ImageFile[]>([]);
    const [allGeneratedImages, setAllGeneratedImages] = useState<ImageFile[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [prompt, setPrompt] = useState('Một công trình kiến trúc hiện đại, sang trọng.');

    useEffect(() => {
        if (activeImage && activeMode !== 'gallery') {
            setSuggestions([]);
            setIsFetchingSuggestions(true);
            generateImageSuggestions(activeImage, activeMode).then(newSuggestions => {
                setSuggestions(newSuggestions);
            }).finally(() => {
                setIsFetchingSuggestions(false);
            });
        }
    }, [activeMode, activeImage]);
    
    const handleImageUpload = useCallback(async (file: File) => {
        try {
            const base64 = await fileToBase64(file);
            const newImage = { base64, mimeType: file.type, name: file.name };
            setActiveImage(newImage);
            setResults([]); // Clear previous results when a new image is uploaded
            setError(null);
            setActiveMode('exterior'); // Reset to default mode on new image
        } catch (err) {
            setError('Không thể tải ảnh lên. Vui lòng thử lại.');
            console.error(err);
        }
    }, []);

    const handleGenerate = async (options: EditingOptions) => {
        if (!activeImage) {
            setError("Vui lòng tải ảnh gốc trước khi tạo.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);

        const settings: RenderSettings = { ...options, prompt };

        try {
            let generated: ImageFile[] = [];
            switch(activeMode) {
                case 'exterior':
                    generated = await generateExterior(activeImage, settings);
                    break;
                case 'interior':
                    generated = await generateInterior(activeImage, settings);
                    break;
                case 'planning':
                    generated = await generatePlanning(activeImage, settings);
                    break;
                case 'sketch_colorize':
                    generated = await generateSketchColorize(activeImage, settings);
                    break;
                case 'plan_to_3d':
                    generated = await generatePlanTo3D(activeImage, settings);
                    break;
                case 'plan_to_perspective':
                    generated = await generatePlanToPerspective(activeImage, settings);
                    break;
                default:
                    throw new Error("Chế độ không hợp lệ.");
            }
            setResults(generated);
            setAllGeneratedImages(prev => [...prev, ...generated]);
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartInpainting = (image: ImageFile, isOriginal: boolean) => {
        setImageToInpaint(image);
        setIsInpaintingOriginal(isOriginal);
    };

    const handleApplyInpaint = async (maskImage: ImageFile, prompt: string, referenceImage: ImageFile | null) => {
        if (!imageToInpaint) return;
        setIsLoading(true);
        setError(null);
        try {
            const edited = await inpaintImage(imageToInpaint, maskImage, prompt, referenceImage);

            if (isInpaintingOriginal) {
                const newResults = [edited, ...results];
                setResults(newResults);
                setAllGeneratedImages(prev => [edited, ...prev]);
            } else {
                const resultIndex = results.findIndex(r => r.base64 === imageToInpaint.base64);
                if (resultIndex > -1) {
                    const newResults = [...results];
                    newResults[resultIndex] = edited;
                    setResults(newResults);
                }

                const galleryIndex = allGeneratedImages.findIndex(g => g.base64 === imageToInpaint.base64);
                if(galleryIndex > -1) {
                    const newGallery = [...allGeneratedImages];
                    newGallery[galleryIndex] = edited;
                    setAllGeneratedImages(newGallery);
                } else {
                     setAllGeneratedImages(prev => [edited, ...prev]);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi chỉnh sửa ảnh.');
        } finally {
            setIsLoading(false);
            setImageToInpaint(null);
        }
    };

    const handleRefine = async (index: number, prompt: string) => {
        const imageToRefine = results[index];
        if (!imageToRefine) return;
        setRefiningIndex(index);
        setError(null);
        try {
            const refined = await refineImage(imageToRefine, prompt);
            const newResults = [...results];
            newResults[index] = refined;
            setResults(newResults);
            
            const galleryIndex = allGeneratedImages.findIndex(g => g.base64 === imageToRefine.base64);
            if(galleryIndex > -1) {
                const newGallery = [...allGeneratedImages];
                newGallery[galleryIndex] = refined;
                setAllGeneratedImages(newGallery);
            } else {
                 setAllGeneratedImages(prev => [refined, ...prev]);
            }
// FIX: Corrected the try-catch block syntax. The previous arrow function syntax was invalid for a catch block.
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi chỉnh sửa.');
        } finally {
            setRefiningIndex(null);
        }
    };

    const handleSetAsActiveImage = useCallback((image: ImageFile) => {
        setActiveImage(image);
        setResults([]);
        setError(null);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-white font-sans">
            <Header activeMode={activeMode} setActiveMode={setActiveMode} />
            <div className="flex-grow flex flex-col">
                 <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeMode !== 'gallery' ? (
                        <>
                            <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4">
                               <ResultView 
                                    results={results} 
                                    isLoading={isLoading} 
                                    error={error}
                                    activeMode={activeMode}
                                    onRefine={handleRefine}
                                    refiningIndex={refiningIndex}
                                    activeImage={activeImage}
                                    onSetAsActive={handleSetAsActiveImage}
                                    onInpaint={(image) => handleStartInpainting(image, false)}
                               />
                            </div>
                             <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4">
                                <ImageUploader 
                                    onImageUpload={handleImageUpload} 
                                    activeImage={activeImage ? activeImage.base64 : null}
                                    onStartMasking={() => activeImage && handleStartInpainting(activeImage, true)}
                                />
                                <AISuggestions 
                                    isLoading={isFetchingSuggestions}
                                    suggestions={suggestions}
                                    onSuggestionClick={handleSuggestionClick}
                                />
                                <ControlPanel 
                                    onGenerate={handleGenerate} 
                                    isLoading={isLoading} 
                                    activeMode={activeMode}
                                    prompt={prompt}
                                    onPromptChange={setPrompt}
                                    key={activeMode} // Re-mounts component on mode change
                                />
                            </div>
                        </>
                    ) : (
                        <div className="lg:col-span-3 xl:col-span-4 h-full">
                            <GalleryView images={allGeneratedImages} />
                        </div>
                    )}
                </main>
            </div>

            {imageToInpaint && (
                <MaskingEditor
                    image={imageToInpaint}
                    onApply={handleApplyInpaint}
                    onClose={() => setImageToInpaint(null)}
                    isProcessing={isLoading}
                />
            )}
        </div>
    );
};

export default App;