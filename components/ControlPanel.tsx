

import React, { useState } from 'react';
import type { ActiveMode, EditingOptions, ImageFile } from '../types';
import { Accordion } from './Accordion';
import { ActionButton } from './ActionButton';
import { IconToggleButton, IconToggleButtonGroup } from './IconToggleButton';
import * as Icons from './Icons';
import { DEFAULT_OPTIONS } from '../config';

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

interface ControlPanelProps {
    onGenerate: (settings: EditingOptions) => void;
    isLoading: boolean;
    activeMode: ActiveMode;
    prompt: string;
    onPromptChange: (newPrompt: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onGenerate, isLoading, activeMode, prompt, onPromptChange }) => {
    const [options, setOptions] = useState<EditingOptions>(DEFAULT_OPTIONS);

    const handleOptionChange = (key: keyof EditingOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };
    
    const handleEffectChange = (key: keyof EditingOptions['effects']) => {
        setOptions(prev => ({
            ...prev,
            effects: { ...prev.effects, [key]: !prev.effects[key] }
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'style' | 'architecture' | 'moodboard') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            const imageFile: ImageFile = { base64, mimeType: file.type, name: file.name };
            if (type === 'style') {
                handleOptionChange('styleImage', imageFile);
            } else if (type === 'architecture') {
                handleOptionChange('architectureImage', imageFile);
            } else if (type === 'moodboard') {
                handleOptionChange('moodboardImage', imageFile);
            }
        }
    };
    
    const triggerFileInput = (id: string) => document.getElementById(id)?.click();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(options);
    };

    const renderExteriorControls = () => (
        <>
            <Accordion title="Bối cảnh" isOpen={true}>
                 <IconToggleButtonGroup label="Loại mặt tiền" value={options.facadeType} onChange={(v) => handleOptionChange('facadeType', v)}>
                    <IconToggleButton value="street_front" icon={<Icons.StreetFrontIcon />} label="Nhà phố" />
                    <IconToggleButton value="corner_lot" icon={<Icons.CornerHouseIcon />} label="Nhà ngã 3" />
                    <IconToggleButton value="villa" icon={<Icons.VillaIcon />} label="Biệt thự" />
                    <IconToggleButton value="bungalow" icon={<Icons.BungalowIcon />} label="Nhà cấp 4" />
                    <IconToggleButton value="koi_pond" icon={<Icons.KoiPondIcon />} label="Hồ cá Koi" />
                    <IconToggleButton value="random" icon={<Icons.RandomIcon />} label="Ngẫu nhiên" />
                    <IconToggleButton value="restaurant" icon={<Icons.RestaurantIcon />} label="Nhà hàng" />
                    <IconToggleButton value="resort" icon={<Icons.ResortIcon />} label="Nghỉ dưỡng" />
                </IconToggleButtonGroup>
                 <IconToggleButtonGroup label="Bầu trời & Thời gian" value={options.sky} onChange={(v) => handleOptionChange('sky', v)}>
                    <IconToggleButton value="sunny" icon={<Icons.SunIcon />} label="Trời nắng" />
                    <IconToggleButton value="cloudy" icon={<Icons.CloudIcon />} label="Nhiều mây" />
                    <IconToggleButton value="overcast" icon={<Icons.OvercastIcon />} label="U ám" />
                    <IconToggleButton value="sunset" icon={<Icons.SunsetIcon />} label="Hoàng hôn" />
                    <IconToggleButton value="dusk" icon={<Icons.DuskIcon />} label="Chiều tối" />
                </IconToggleButtonGroup>
                 <IconToggleButtonGroup label="Môi trường" value={options.environment} onChange={(v) => handleOptionChange('environment', v)}>
                    <IconToggleButton value="urban" icon={<Icons.UrbanIcon />} label="Đô thị" />
                    <IconToggleButton value="forest" icon={<Icons.ForestIcon />} label="Rừng thông" />
                    <IconToggleButton value="empty_lot" icon={<Icons.EmptyLotIcon />} label="Đất trống" />
                    <IconToggleButton value="garden" icon={<Icons.GardenIcon />} label="Sân vườn" />
                </IconToggleButtonGroup>
                 <IconToggleButtonGroup label="Hoạt động" value={options.streetActivity} onChange={(v) => handleOptionChange('streetActivity', v)}>
                    <IconToggleButton value="none" icon={<Icons.NoActivityIcon />} label="Không có" />
                    <IconToggleButton value="few_cars" icon={<Icons.CarIcon />} label="Ít xe cộ" />
                    <IconToggleButton value="few_pedestrians" icon={<Icons.WalkingPeopleIcon />} label="Vài người đi dạo" />
                    <IconToggleButton value="pedestrians" icon={<Icons.VespaIcon />} label="Cô gái & Vespa" />
                </IconToggleButtonGroup>
                 <IconToggleButtonGroup label="Hiệu ứng" isMultiSelect>
                    <IconToggleButton value="fog" icon={<Icons.FogIcon />} label="Sương mù" isActive={options.effects.fog} onClick={() => handleEffectChange('fog')}/>
                    <IconToggleButton value="rain" icon={<Icons.RainIcon />} label="Mưa" isActive={options.effects.rain} onClick={() => handleEffectChange('rain')} />
                    <IconToggleButton value="afterRain" icon={<Icons.AfterRainIcon />} label="Tạnh mưa" isActive={options.effects.afterRain} onClick={() => handleEffectChange('afterRain')} />
                    <IconToggleButton value="lightsOn" icon={<Icons.LightsOnIcon />} label="Bật đèn" isActive={options.effects.lightsOn} onClick={() => handleEffectChange('lightsOn')} />
                </IconToggleButtonGroup>
            </Accordion>
        </>
    );

     const renderInteriorControls = () => (
        <>
            <Accordion title="Thiết lập Nội thất" isOpen={true}>
                <IconToggleButtonGroup 
                    label="Chế độ Nội thất" 
                    value={options.interiorRenderType} 
                    onChange={(v) => handleOptionChange('interiorRenderType', v as 'redesign' | 'enhance')}
                >
                    <IconToggleButton value="redesign" icon={<Icons.MagicWandIcon />} label="Thiết kế lại" />
                    <IconToggleButton value="enhance" icon={<Icons.BrushIcon />} label="Hoàn thiện vật liệu" />
                </IconToggleButtonGroup>
                
                <IconToggleButtonGroup 
                    label="Ánh sáng & Môi trường" 
                    value={options.interiorLighting} 
                    onChange={(v) => handleOptionChange('interiorLighting', v as 'sunny' | 'foggy' | 'night')}
                >
                    <IconToggleButton value="sunny" icon={<Icons.SunIcon />} label="Trời nắng" />
                    <IconToggleButton value="foggy" icon={<Icons.FogIcon />} label="Trời mù" />
                    <IconToggleButton value="night" icon={<Icons.NightIcon />} label="Đêm" />
                </IconToggleButtonGroup>

                {options.interiorRenderType === 'redesign' ? (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2 mt-3 mb-1">
                            AI sẽ giữ lại cấu trúc kiến trúc nhưng thay đổi toàn bộ vật liệu, ánh sáng và nội thất để tạo ra một thiết kế mới hoàn toàn.
                        </p>
                        <button
                            type="button"
                            onClick={() => handleOptionChange('interiorVariationSeed', options.interiorVariationSeed + 1)}
                            className="w-full flex items-center justify-center gap-2 p-2 rounded-md transition-colors font-semibold border bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-transparent"
                        >
                            <Icons.RefreshIcon className="w-5 h-5" />
                            <span>Thay đổi phương án (Lấy kết quả khác)</span>
                        </button>
                    </>
                ) : (
                     <p className="text-sm text-gray-500 dark:text-gray-400 p-2 mt-3">
                        AI sẽ giữ nguyên các khối đồ nội thất từ ảnh gốc (Sketchup, 3D thô) và áp dụng vật liệu, ánh sáng siêu thực để hoàn thiện thành ảnh chụp.
                    </p>
                )}
            </Accordion>
        </>
    );

    const renderPlanningControls = () => (
        <>
            <Accordion title="Hiệu ứng Quy hoạch" isOpen={true}>
                 <IconToggleButtonGroup label="Hiệu ứng" isMultiSelect>
                    <IconToggleButton value="daytime" icon={<Icons.DayIcon />} label="Ban ngày" isActive={options.effects.daytime} onClick={() => handleEffectChange('daytime')}/>
                    <IconToggleButton value="nighttime" icon={<Icons.NightIcon />} label="Ban đêm" isActive={options.effects.nighttime} onClick={() => handleEffectChange('nighttime')}/>
                    <IconToggleButton value="fog" icon={<Icons.FogIcon />} label="Sương mù xa" isActive={options.effects.fog} onClick={() => handleEffectChange('fog')}/>
                    <IconToggleButton value="lightsOn" icon={<Icons.LightsOnIcon />} label="Bật đèn KĐT" isActive={options.effects.lightsOn} onClick={() => handleEffectChange('lightsOn')} />
                </IconToggleButtonGroup>
            </Accordion>
        </>
    );

    const renderSketchColorizeControls = () => (
        <Accordion title="Tùy chọn Nét vẽ" isOpen={true}>
            <IconToggleButtonGroup label="Phong cách" value={options.sketchStyle} onChange={(v) => handleOptionChange('sketchStyle', v as any)}>
                <IconToggleButton value="black_white_sketch" icon={<Icons.SketchIcon />} label="Nét đen trắng" />
                <IconToggleButton value="watercolor" icon={<Icons.WatercolorIcon />} label="Màu nước" />
                <IconToggleButton value="lineless" icon={<Icons.LinelessIcon />} label="Xóa nét line" />
            </IconToggleButtonGroup>
        </Accordion>
    );

    const renderPlanTo3DControls = () => (
        <>
            <Accordion title="Thiết lập 3D" isOpen={true}>
                 <p className="text-sm text-gray-500 dark:text-gray-400 p-2 mb-3">
                    AI sẽ tự động phân tích mặt bằng 2D, xác định loại phòng, và bố trí nội thất theo phong cách hiện đại để tạo ra một không gian 3D siêu thực.
                </p>
                 <IconToggleButtonGroup label="Góc nhìn" value={options.planView} onChange={(v) => handleOptionChange('planView', v)}>
                    <IconToggleButton value="perspective" icon={<Icons.PerspectiveViewIcon />} label="Phối cảnh" />
                    <IconToggleButton value="top_down" icon={<Icons.TopDownViewIcon />} label="Trên xuống" />
                    <IconToggleButton value="angle_45" icon={<Icons.Angle45ViewIcon />} label="3D góc 45" />
                    <IconToggleButton value="high_angle" icon={<Icons.HighAngleIcon />} label="Góc cao" />
                    <IconToggleButton value="wide_angle" icon={<Icons.WideAngleIcon />} label="Góc rộng" />
                    <IconToggleButton value="detail" icon={<Icons.DetailIcon />} label="Chi tiết" />
                </IconToggleButtonGroup>
            </Accordion>
        </>
    );

    const renderPlanToPerspectiveControls = () => (
         <Accordion title="Thiết lập Phối cảnh" isOpen={true}>
             <p className="text-sm text-gray-500 dark:text-gray-400 p-2 mb-3">
                Tải lên mặt bằng 2D ở ô "Ảnh Gốc" và một ảnh phong cách (moodboard hoặc ảnh hoàn thiện) ở dưới. AI sẽ tạo phối cảnh dựa trên bố cục mặt bằng và phong cách của ảnh tham khảo.
            </p>
            <div className="mt-2 space-y-2">
                <label className="font-semibold text-base">Ảnh Phong cách (Moodboard)</label>
                {options.moodboardImage ? (
                     <div className="relative group">
                        <img src={options.moodboardImage.base64} alt="Ảnh moodboard" className="w-full rounded-lg object-contain aspect-video bg-gray-100 dark:bg-dark-bg"/>
                        <button type="button" onClick={() => handleOptionChange('moodboardImage', null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500">&times;</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => triggerFileInput('moodboard-image-input')} className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg">
                        <Icons.PaletteIcon className="w-8 h-8"/>
                        <span className="text-sm mt-1">Tải ảnh moodboard</span>
                    </button>
                )}
                <input type="file" id="moodboard-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'moodboard')} />
                <p className="text-xs text-gray-500 dark:text-gray-400">AI sẽ lấy đồ nội thất, vật liệu và màu sắc từ ảnh này để đưa vào phòng.</p>
            </div>
        </Accordion>
    );
    
    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-4 rounded-xl shadow-lg flex flex-col gap-4 text-gray-800 dark:text-dark-text">
             <div>
                <label htmlFor="main-prompt" className="block text-sm font-bold mb-2">
                    Yêu cầu chính (Prompt)
                </label>
                <textarea
                    id="main-prompt"
                    rows={4}
                    className="w-full bg-gray-100 dark:bg-[#282828] border border-gray-300 dark:border-dark-border rounded-lg p-2 text-gray-800 dark:text-white text-sm focus:ring-1 focus:ring-dathouzz-orange"
                    placeholder="Mô tả chi tiết về hình ảnh bạn muốn tạo..."
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                />
            </div>

             <div>
                <label className="block text-sm font-bold mb-2">Chất lượng</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => handleOptionChange('quality', 'draft')} className={`py-2 px-3 rounded-md text-base font-semibold transition-colors ${options.quality === 'draft' ? 'bg-dathouzz-orange text-white' : 'bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333]'}`}>Bản nháp (Nhanh)</button>
                    <button type="button" onClick={() => handleOptionChange('quality', 'high')} className={`py-2 px-3 rounded-md text-base font-semibold transition-colors ${options.quality === 'high' ? 'bg-dathouzz-orange text-white' : 'bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333]'}`}>Chất lượng cao (Chậm)</button>
                </div>
            </div>

             <Accordion title="Phong cách & Hiệu ứng" isOpen={true}>
                 {/* FIX: Removed invalid 'isMultiSelect' prop. It is not a valid prop for IconToggleButton. */}
                 <IconToggleButton isStandalone value="enhance4k" icon={<Icons.EnhanceIcon />} label="Tăng cường ảnh (4K+)" isActive={options.enhance4k} onClick={() => handleOptionChange('enhance4k', !options.enhance4k)} />
                {/* FIX: Removed invalid 'isMultiSelect' prop. It is not a valid prop for IconToggleButton. */}
                <IconToggleButton isStandalone value="aiMaterials" icon={<Icons.MagicWandIcon />} label="AI tự chọn vật liệu" isActive={options.aiMaterials} onClick={() => handleOptionChange('aiMaterials', !options.aiMaterials)} />
                
                {!['plan_to_perspective', 'sketch_colorize', 'planning'].includes(activeMode) && (
                    <>
                        <div className="mt-4 space-y-2">
                            <label className="font-semibold text-base">Ảnh mẫu (Phong cách)</label>
                            {options.styleImage ? (
                                <div className="relative group">
                                    <img src={options.styleImage.base64} alt="Ảnh mẫu" className="w-full rounded-lg object-contain aspect-video bg-gray-100 dark:bg-dark-bg"/>
                                    <button type="button" onClick={() => handleOptionChange('styleImage', null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500">&times;</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => triggerFileInput('style-image-input')} className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg">
                                    <Icons.PaletteIcon className="w-8 h-8"/>
                                    <span className="text-sm mt-1">Tải ảnh phong cách</span>
                                </button>
                            )}
                            <input type="file" id="style-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'style')} />
                            <p className="text-xs text-gray-500 dark:text-gray-400">AI sẽ áp dụng các yếu tố được chọn từ ảnh này.</p>
                            
                            {options.styleImage && (
                                <IconToggleButtonGroup label="Tùy chọn ảnh mẫu" isMultiSelect>
                                    <IconToggleButton value="lighting" icon={<Icons.SunIcon />} label="Ánh sáng & Màu sắc" isActive={options.styleExtractLighting} onClick={() => handleOptionChange('styleExtractLighting', !options.styleExtractLighting)} />
                                    {activeMode === 'exterior' && <IconToggleButton value="context" icon={<Icons.UrbanIcon />} label="Bao cảnh" isActive={options.styleExtractContext} onClick={() => handleOptionChange('styleExtractContext', !options.styleExtractContext)} />}
                                    {activeMode === 'interior' && options.interiorRenderType === 'redesign' && <IconToggleButton value="design" icon={<Icons.LivingRoomIcon />} label="Nội thất & Thiết kế" isActive={options.styleExtractDesign} onClick={() => handleOptionChange('styleExtractDesign', !options.styleExtractDesign)} />}
                                </IconToggleButtonGroup>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                            <label className="font-semibold text-base">Pha trộn kiến trúc</label>
                            {options.architectureImage ? (
                                <div className="relative group">
                                    <img src={options.architectureImage.base64} alt="Ảnh kiến trúc" className="w-full rounded-lg object-contain aspect-video bg-gray-100 dark:bg-dark-bg"/>
                                    <button type="button" onClick={() => { handleOptionChange('architectureImage', null); handleOptionChange('blendArchitecture', false); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500">&times;</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => triggerFileInput('arch-image-input')} className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg">
                                    <Icons.BlueprintIcon className="w-8 h-8"/>
                                    <span className="text-sm mt-1">Tải ảnh kiến trúc</span>
                                </button>
                            )}
                            <input type="file" id="arch-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'architecture')} />
                            
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="blend-arch-check" checked={options.blendArchitecture} onChange={(e) => handleOptionChange('blendArchitecture', e.target.checked)} disabled={!options.architectureImage} className="w-4 h-4 accent-dathouzz-orange" />
                                <label htmlFor="blend-arch-check" className={`text-base ${!options.architectureImage ? 'text-gray-400 dark:text-gray-500' : ''}`}>Pha trộn kiến trúc</label>
                            </div>
                            {options.blendArchitecture && options.architectureImage && (
                                <input type="range" min="0" max="100" value={options.blendRatio} onChange={(e) => handleOptionChange('blendRatio', Number(e.target.value))} className="w-full mt-2" />
                            )}
                        </div>
                    </>
                )}
            </Accordion>
            
            {activeMode === 'exterior' && renderExteriorControls()}
            {activeMode === 'interior' && renderInteriorControls()}
            {activeMode === 'planning' && renderPlanningControls()}
            {activeMode === 'sketch_colorize' && renderSketchColorizeControls()}
            {activeMode === 'plan_to_3d' && renderPlanTo3DControls()}
            {activeMode === 'plan_to_perspective' && renderPlanToPerspectiveControls()}
            
            {['exterior', 'interior'].includes(activeMode) && (
                <Accordion title="Tỷ lệ khung hình" isOpen={true}>
                    <IconToggleButtonGroup label="Chọn tỷ lệ" value={options.aspectRatio} onChange={(v) => handleOptionChange('aspectRatio', v)}>
                        <IconToggleButton value="1:1" icon={<Icons.AspectRatioIcon type="1:1" />} label="1:1" />
                        <IconToggleButton value="16:9" icon={<Icons.AspectRatioIcon type="16:9" />} label="16:9" />
                        <IconToggleButton value="9:16" icon={<Icons.AspectRatioIcon type="9:16" />} label="9:16" />
                        <IconToggleButton value="4:3" icon={<Icons.AspectRatioIcon type="4:3" />} label="4:3" />
                        <IconToggleButton value="3:4" icon={<Icons.AspectRatioIcon type="3:4" />} label="3:4" />
                    </IconToggleButtonGroup>
                </Accordion>
            )}


             <div className="mt-auto pt-4">
                 <ActionButton type="submit" disabled={isLoading}>
                    {isLoading 
                        ? 'Đang xử lý...' 
                        : `Tạo ${
                            ['interior', 'planning', 'sketch_colorize', 'plan_to_3d', 'plan_to_perspective'].includes(activeMode) 
                            ? '1 phương án' 
                            : '4 phương án'
                        }`
                    }
                </ActionButton>
            </div>
        </form>
    );
};
