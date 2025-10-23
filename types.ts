

// FIX: Removed circular import of 'ActiveMode'. The type is defined in this file and should not be imported from itself.

export type ActiveMode = 'exterior' | 'interior' | 'planning' | 'sketch_colorize' | 'plan_to_3d' | 'plan_to_perspective' | 'gallery';

export interface ImageFile {
    base64: string;
    mimeType: string;
    name: string;
}

export interface EditingOptions {
    // General
    quality: 'draft' | 'high';
    enhance4k: boolean;
    aiMaterials: boolean;
    styleImage?: ImageFile | null;
    styleExtractLighting: boolean;
    styleExtractContext: boolean;
    styleExtractDesign: boolean;
    architectureImage?: ImageFile | null;
    moodboardImage?: ImageFile | null;
    blendArchitecture: boolean;
    blendRatio: number;
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

    // Exterior
    facadeType: 'street_front' | 'corner_lot' | 'villa' | 'bungalow' | 'koi_pond' | 'random' | 'restaurant' | 'resort';
    sky: 'sunny' | 'cloudy' | 'overcast' | 'sunset' | 'dusk';
    environment: 'urban' | 'forest' | 'empty_lot' | 'garden';
    streetActivity: 'none' | 'few_cars' | 'pedestrians' | 'few_pedestrians';
    effects: {
        fog: boolean;
        rain: boolean;
        afterRain: boolean;
        lightsOn: boolean;
        daytime: boolean; // Added for planning mode
        nighttime: boolean; // Added for planning mode
    };

    // Interior
    interiorVariationSeed: number;
    interiorRenderType: 'redesign' | 'enhance';
    interiorLighting: 'sunny' | 'foggy' | 'night';
    
    // Sketch Colorize
    sketchStyle: 'black_white_sketch' | 'watercolor' | 'lineless';

    // Plan to 3D
    planView: 'top_down' | 'perspective' | 'high_angle' | 'wide_angle' | 'detail' | 'angle_45';
}

// This combines the base prompt with all the detailed options
export interface RenderSettings extends EditingOptions {
    prompt: string;
}
