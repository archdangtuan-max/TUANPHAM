

import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { ImageFile, RenderSettings, EditingOptions, ActiveMode } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY is not set in environment variables.');
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getBase64Data = (base64String: string): string => {
    if (base64String.startsWith('data:')) {
        return base64String.split(',')[1];
    }
    return base64String;
};

const callGemini = async (model: string, parts: any[], config: any = {}): Promise<ImageFile[]> => {
    const response = await ai.models.generateContent({ model, contents: { parts }, config });

    const imageParts = response.candidates?.[0]?.content?.parts?.filter(p => p.inlineData) || [];
    if (imageParts.length === 0) {
        const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
        const errorMessage = textPart?.text || "Không tìm thấy ảnh trong phản hồi từ AI.";
        throw new Error(`Tạo ảnh thất bại: ${errorMessage}`);
    }

    return imageParts.map((part, index) => ({
        base64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        mimeType: part.inlineData.mimeType,
        name: `generated-${Date.now()}-${index}.png`,
    }));
};


const generatePrompt = (basePrompt: string, settings: EditingOptions): string => {
    let prompt = basePrompt + ` The final image must have an aspect ratio of ${settings.aspectRatio}, please adhere to this as closely as possible. Your primary goal is to function as a professional architectural photographer. The final output must be a photograph, not a render. It must be indistinguishable from a high-end shot taken with a professional DSLR camera and prime lens. To achieve this, meticulously apply the following principles:
- **Lighting:** Master the complex interplay of natural light and shadow. Emulate how light from the sun or sky diffuses, reflects off surfaces, and creates soft-edged, realistic shadows. For interiors, capture light streaming through windows, creating subtle color temperature shifts. Avoid flat, uniform, or artificial-looking lighting.
- **Materials & Textures:** Every surface must possess a tangible, hyper-realistic texture with subtle imperfections. Wood grain must be non-repeating with natural knots. Fabrics must show individual threads, subtle creases, and realistic folds. Metal should have microscopic scratches and faint smudges. Glass must display clear, slightly distorted reflections. Critically, nothing should be perfectly clean or flawless; these imperfections are key to realism. The textures of tropical Vietnamese trees and plants must be rendered with extreme detail, down to the individual leaves and bark patterns.
- **Camera & Optics:** Simulate the properties of a high-end camera (e.g., Sony A7R IV with a 50mm f/1.4 lens). Create a natural and shallow depth of field (bokeh) to draw focus to the subject. Introduce subtle, physically accurate optical phenomena like faint lens flare when near light sources and minor chromatic aberration on high-contrast edges. The main subject must be tack sharp.
- **Atmosphere & Depth:** Infuse the scene with a palpable atmosphere. This could be a light morning mist in outdoor shots, steam rising from a coffee cup indoors, or the subtle haze of a humid day. These details create depth and separate a photograph from a sterile render.
- **Color Grading:** Apply a professional, non-destructive color grade similar to high-end architectural photography. The color palette must be harmonious and natural. Ensure perfect white balance, retain detail in shadows (no crushed blacks), and preserve information in highlights (no blown-out whites). Avoid any unrealistic oversaturation.`;
    
    if (settings.quality === 'high') {
        prompt += ', ultra realistic, 8k, photorealistic, professional photography, sharp focus';
    }
    if (settings.enhance4k) {
        prompt += ', 4K resolution, hyper-detailed, intricate details';
    }
    if (settings.aiMaterials) {
        prompt += ', using high-end, architecturally appropriate materials chosen by an expert';
    }
    if(settings.effects.lightsOn){
        prompt += ', with warm interior lights turned on, creating a cozy glow from the windows and exterior accent lighting.'
    }
    return prompt;
}

const generateExteriorPrompt = (settings: RenderSettings): string[] => {
    const facadeDescriptions = {
        street_front: `a modern Vietnamese townhouse ("nhà phố") with a vertical design, located on a straight road, built closely between two other houses in a continuous row. CRITICAL: The scene must not show any street corners, intersections, or side alleys. The view is directly from the front`,
        corner_lot: `a modern house on a bustling Vietnamese street corner ("nhà ngã 3") with two prominent, visible facades`,
        villa: `a luxurious and spacious modern villa ("biệt thự") with elegant, meticulously maintained landscaping and a grand entrance`,
        bungalow: `a charming, single-story modern bungalow ("nhà cấp 4") nestled within a lush, natural garden setting`,
        koi_pond: `a modern house featuring a serene, professionally designed Koi fish pond as a central element of its garden`,
        random: `A hyper-realistic photograph of the building provided in the input image, strictly preserving its original architectural design, form, and details. The primary goal is to enhance its realism to the level of a professional photograph and place it within a suitable, authentic Vietnamese context. Do not add, remove, or alter any architectural elements. Focus solely on applying realistic lighting, materials, and atmosphere.`,
        restaurant: `A modern, upscale restaurant located on a straight Vietnamese city street, similar to a "nhà phố". The facade should be inviting with large glass windows showing a warm interior, elegant signage, and possibly some outdoor seating on the sidewalk. It is situated closely between two other buildings. CRITICAL: The scene must not show any street corners, intersections, or side alleys. The view is directly from the front.`,
        resort: `A luxurious and modern resort building located in a tranquil and beautiful Vietnamese natural setting, such as a coastal area with palm trees or a serene mountain landscape. The architecture should feature open spaces, large balconies with scenic views, natural materials, and be surrounded by lush, tropical landscaping, possibly including a glimpse of a swimming pool or water feature.`,
    };

    const detailedInstructions = `CRITICAL GOAL: "Biến ảnh thành ảnh chụp thực tế" (Transform the input into a hyper-realistic photograph), referencing the style of high-end architectural photography. The final image MUST NOT look like a 3D render.
- **Lighting & Atmosphere:** Recreate the lighting of a bright but soft daytime, with a clear blue sky and gentle shadows, resembling a high-end architectural photo. For all scenes, "bật đèn cho công trình trong và ngoài nhà" (turn on all interior and exterior lights) to create a warm, inviting glow that complements the ambient light.
- **Greenery (EXTREMELY IMPORTANT):** "Cây cối trước công trình giống tự nhiên nhất" (All plants and trees must be hyper-realistic and perfectly integrated). Render specific Vietnamese tropical species like Delonix regia (Phượng vĩ) or Terminalia catappa (Bàng) with complex, non-repeating bark textures and naturally translucent leaves. "Ở khu vực ban công và hàng rào thêm cây xanh" (Add lush, tropical greenery like Plumeria or Bougainvillea that looks completely natural to the balconies and fences).
- **Architecture Details:** "Nếu nhà không có cổng tự tạo cổng mới" (If the original building does not have a gate, design and add a modern one that fits the architecture perfectly). If a gate already exists, enhance it but do not replace it.
- **Context:** Create a believable Vietnamese streetscape with authentic details. The specific people and vehicles are controlled by the 'Hoạt động' setting.`;

    const facadeDescription = facadeDescriptions[settings.facadeType];
    
    let finalFacadeDescription = facadeDescription;
    if (settings.facadeType === 'street_front' || settings.facadeType === 'corner_lot' || settings.facadeType === 'villa') {
        finalFacadeDescription += ". " + detailedInstructions;
    }

    let topViewPrompt = `A photorealistic, top-down bird's-eye view of the same building, showing roof details.`;
    if(settings.facadeType === 'street_front') {
        topViewPrompt += ' The area directly behind the house must be a dense residential area with other rooftops, small alleys, and backyards, typical of a Vietnamese city block.';
    }

    const basePrompts = {
        front: `A photorealistic, full front view of ${finalFacadeDescription}.`,
        angle: `A photorealistic, 45-degree angle view of the same building.`,
        top: topViewPrompt,
        cafe: `A wider, more distant photorealistic view of the same building, seen from across a bustling street. In the foreground, a beautiful young Vietnamese woman is sitting inside a modern cafe on this side of the road, looking out the window towards the distant building on the other side of the road. CRITICAL: For variety, the woman's appearance, hairstyle, and stylish modern outfit must be randomized with each generation. The shot must be zoomed out to capture more of the streetscape. IMPORTANT: Use depth of field to keep the main building in sharp focus while the woman and cafe interior in the foreground are slightly and naturally blurred, drawing the viewer's eye to the architecture.`,
        garden: `A detailed, artistic close-up shot of the beautiful garden and landscaping next to the same building.`
    };

    let prompts: string[] = [basePrompts.front, basePrompts.angle, basePrompts.top];
    if (settings.facadeType === 'bungalow' || settings.facadeType === 'koi_pond') {
        prompts.push(basePrompts.garden);
    } else {
        prompts.push(basePrompts.cafe);
    }

    const skyDescriptions = {
        sunny: 'with bright yet soft daylight, a clear blue sky, and gentle shadows. This should resemble a clean, high-end architectural photograph taken on a beautiful day, avoiding harsh, overexposed sunlight.',
        cloudy: 'with soft, scattered white clouds in a blue sky, creating gentle, diffused light',
        overcast: 'on an overcast day with a flat, gray, diffused sky and very soft, minimal shadows',
        sunset: 'during a beautiful, warm sunset with a dramatic sky filled with orange, pink, and purple hues',
        dusk: 'at dusk, during the "blue hour" just after sunset, with deep blue and orange colors in the sky and a tranquil mood',
    };

    const environmentDescriptions = {
        urban: 'in a bustling, modern Vietnamese city street setting, with characteristic elements like diverse building facades, and vibrant street life',
        forest: 'in a serene, dense pine forest with tall trees and dappled sunlight, similar to the highlands of Da Lat, Vietnam',
        empty_lot: 'in an underdeveloped residential plot with new road and sidewalk infrastructure, but low building density. The area should feel like a new development project that is just beginning, with only a few houses scattered around.',
        garden: 'set within a large, private, beautifully landscaped garden ("sân vườn"). The scene must include a spacious lawn, a driveway, and ample space for parking cars, creating a peaceful and secluded atmosphere. The garden should look ultra-realistic, not like a CGI render.',
    };

    const streetActivityDescriptions = {
        none: 'The scene must be completely serene and empty of any people, cars, motorbikes, or any form of traffic. The street should be quiet and deserted.',
        few_cars: 'The scene should include exactly one or two modern cars parked realistically on the side of the street or driving slowly. They should not be the main focus.',
        few_pedestrians: 'The scene should include one or two people walking casually and naturally on the sidewalk. They should be dressed in modern, everyday clothing and not be the main focus.',
        pedestrians: 'The scene must feature a single, stylishly dressed young Vietnamese woman wearing a beautiful short dress, riding a classic Vespa scooter. She should be integrated naturally into the street scene, perhaps driving past the building. She is the only person visible.'
    };
    
    const skyDescription = skyDescriptions[settings.sky];
    const environmentDescription = environmentDescriptions[settings.environment];
    const streetActivityDescription = streetActivityDescriptions[settings.streetActivity];

    return prompts.map(p => generatePrompt(p, settings) + ` The architectural style, materials, and lighting must be identical across all images. The scene is set ${skyDescription}. The surrounding environment is ${environmentDescription}. ${streetActivityDescription}. Effects: ${Object.entries(settings.effects).filter(([_, v]) => v).map(([k]) => k).join(', ')}.`);
};

export const generateExterior = async (originalImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    // Step 1: Generate the primary front-view image.
    const initialPrompts = generateExteriorPrompt(settings);
    const primaryPrompt = initialPrompts[0];
    
    const parts: any[] = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { text: primaryPrompt },
    ];
    
    if(settings.styleImage){
        let styleImagePrompt = "The user has provided a reference image for style. ";
        const stylePrompts: string[] = [];

        if(settings.styleExtractLighting){
            stylePrompts.push("Apply the lighting, color palette, and overall atmosphere from this reference image to the original building.");
        }
        if(settings.styleExtractContext){
            stylePrompts.push("Also, place the building in a similar surrounding environment and context (e.g. trees, street, background buildings) from the reference image.");
        }

        if (stylePrompts.length > 0) {
            styleImagePrompt += stylePrompts.join(' ');
            styleImagePrompt += " CRITICAL INSTRUCTION: You MUST NOT alter the architectural shape, structure, or lines of the original building. The goal is to re-render the original architecture with the visual style of the reference image.";
            parts.push({ text: styleImagePrompt });
            parts.push({ inlineData: { data: getBase64Data(settings.styleImage.base64), mimeType: settings.styleImage.mimeType } });
        }
    }
    
    if(settings.blendArchitecture && settings.architectureImage){
        parts.push({ inlineData: { data: getBase64Data(settings.architectureImage.base64), mimeType: settings.architectureImage.mimeType } });
        parts.push({ text: `Blend the architecture of the original building with the architecture from the reference image. The blend ratio should be ${settings.blendRatio}%.` });
    }

    const [frontView] = await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });

    // Step 2: Generate other angles using the first result as a strict reference.
    const otherViewsPromises = initialPrompts.slice(1).map(prompt => {
        const subsequentParts = [
            { inlineData: { data: getBase64Data(frontView.base64), mimeType: frontView.mimeType } }, // Use generated image as reference
            { text: prompt + " CRITICAL: Use the provided image as a strict visual reference for the building's architecture, materials, and appearance. Only change the camera angle." }
        ];
        return callGemini('gemini-2.5-flash-image', subsequentParts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });
    });

    const otherViewsResults = await Promise.all(otherViewsPromises);
    const otherViews = otherViewsResults.flat();

    return [frontView, ...otherViews];
};

export const generateInterior = async (originalImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    
    let taskDescription;

    // Default to 'redesign' if the option is not present, for backward compatibility
    if (settings.interiorRenderType === 'enhance') {
        taskDescription = `
        **--- YOUR TASK (ENHANCE & RENDER) ---**
        **Based on the user's input image (which is a raw 3D model, e.g., from SketchUp), execute the following task:**
        You are an AI architectural visualization expert. Your task is to take this untextured 3D scene and turn it into a photorealistic final render.
        **CRITICAL COMMANDS:**
        1.  **PRESERVE GEOMETRY:** You MUST strictly preserve all existing geometry. This includes the architectural shell (walls, windows, doors) AND all furniture and objects shown in the scene. **DO NOT** add, remove, change the shape of, or move any object. Your only job is to apply materials and lighting.
        2.  **APPLY HYPER-REALISTIC MATERIALS:** Analyze each object in the scene (sofa, table, floor, walls, etc.) and apply high-end, physically accurate materials to it. The materials should be logical and create a cohesive, modern, and beautiful interior design. Pay extreme attention to texture details: wood grain, fabric weaves, metal reflections, glass transparency, etc.
        3.  **MASTERFUL LIGHTING:** Create a realistic and atmospheric lighting setup for the scene. This is the most important part to make it look like a real photo.
        **SUMMARY:** The input is a 3D model. The output must be that exact same model, but rendered as a photorealistic photograph with expert-level materials and lighting.
        `;
    } else { // 'redesign'
        const transformationGoal = (settings.styleImage && settings.styleExtractDesign)
            ? `Your goal is a TOTAL TRANSFORMATION. The provided reference image is the absolute source of truth for the new style. You must meticulously extract and replicate its **lighting, atmosphere, materials, color palette, furniture types, and decor style.** The final result should look as if the room from the original image was completely renovated in the style of the reference image.`
            : `Your goal is a TOTAL TRANSFORMATION into a new, beautiful, and coherent interior design. Do not retain any visual elements from the original photo except for the architecture. The new design should be in a clean, appealing, modern style.`;
        
        taskDescription = `
        **--- YOUR TASK (REDESIGN) ---**
        You are an AI renovation expert executing a complete redesign. The input is an image of an interior space (it could be a 3D render, a sketch, or a real photo). 
        **CRITICAL COMMAND:** You must preserve the core architectural shell (walls, windows, doors, and overall room structure). However, you must completely **STRIP OUT and REPLACE ALL** existing furniture, decor, materials (flooring, wall finishes, etc.), and fixtures. 
        ${transformationGoal}
        **COLOR PALETTE INSPIRATION:** Analyze the user's original input image to understand its general color palette. The new design you create should be inspired by this color palette. For example, if the original image has a lot of warm wood tones and beige, your new design should also lean towards a similar warm, neutral palette, even with different furniture. This creates a sense of continuity while still providing a fresh design.
        Failure to completely replace the old elements is a failure of the task.
        `;
    }

    const lightingScenarios = {
        sunny: `
- **Lighting Scenario (Sunny Day):** The primary light source is bright, clear, natural light from a sunny day outside. The atmosphere must be crisp and clear, completely free of any fog, haze, or mist. The scene must be well-exposed, bright, and airy. Shadows should be soft-edged and add depth.
- **CRITICAL REALISM RULE (CURTAINS):** If the window has curtains (especially sheer/voile curtains like in the YIMDESIGN examples), you MUST NOT render harsh, direct sunbeams entering the room. Instead, the curtains must act as a natural diffuser, filling the space with beautiful, soft, bright, ambient light. The entire room should feel illuminated, not just have patches of sun on the floor.
- **GLOBAL ILLUMINATION:** The room must be filled with abundant bounced light, ensuring that shadow areas are not black voids but are softly illuminated and full of detail. The mood must be bright and positive. The view outside the windows must be a clear, sunny day.
`,
        foggy: `
- **Lighting Scenario (Foggy/Misty Morning):** The scene is enveloped in a soft, bright, diffused light from an overcast or foggy day. Light coming through the windows must be very gentle with extremely soft, subtle shadows. CRITICAL: Soft light does not mean a dark image. The scene must be well-lit and feel calm, moody, and serene. The view outside the windows must show a thick fog or mist, creating a sense of privacy and coziness.
`,
        night: `
- **Lighting Scenario (Night):** The scene is lit by artificial interior lights. Create a well-lit, sophisticated, and cozy atmosphere. You MUST use a multi-layered lighting strategy: ambient light (ceiling fixtures), task light (lamps), and accent lights. Ensure the lighting is warm, inviting, and properly exposes the scene, avoiding a dark or gloomy feeling. The view outside the windows must be a dark night scene, perhaps with city lights twinkling in the distance. Reflections on the windows must be prominent and realistic.
`
    };

    const selectedLightingScenario = lightingScenarios[settings.interiorLighting] || lightingScenarios.sunny;
    
    let referenceImageInstructions = '';
    if (settings.styleImage) {
        const whatToCopy = [];
        const criticalDonts = [
            "- **ABSOLUTE RULE: DO NOT COPY THE ASPECT RATIO OR CROP.** The final image's dimensions (width and height) and composition MUST strictly match the user's original input image, not the reference image.",
            "- **DO NOT COPY THE ROOM'S ARCHITECTURE/LAYOUT.** The reference is for style, not structure."
        ];

        if (settings.styleExtractLighting) {
            whatToCopy.push("- **Lighting, Atmosphere & Color Palette:** Meticulously replicate the lighting conditions (color temperature, quality of light, shadow direction) and the overall color scheme.");
        }
        
        if (settings.interiorRenderType === 'redesign' && settings.styleExtractDesign) {
            whatToCopy.push("- **Furniture & Decor Style:** Extract and replicate the types of furniture, materials, and decor style.");
        } else {
            // This is the crucial new part. Add a very specific instruction to prevent style bleed.
            criticalDonts.push("- **CRITICAL: DO NOT COPY FURNITURE, DECOR, OR MATERIAL TYPES (e.g., wood, marble) from the reference image.** The reference is exclusively for analyzing and replicating the **lighting and atmosphere**. Your primary task is still to apply new, appropriate, high-quality materials to the original geometry, inspired by the new mood, but these materials MUST NOT be copied from the reference.");
        }

        if (whatToCopy.length > 0) {
            referenceImageInstructions = `
**REFERENCE IMAGE INSTRUCTIONS (STYLE TRANSFER):**
A style reference image has been provided. You must act as a style analyst.
**WHAT TO COPY FROM THE REFERENCE:**
${whatToCopy.join('\n')}
- **Environment:** If a view is visible through the windows, replicate that type of environment (e.g., urban city, forest, beach).

**WHAT NOT TO COPY (ABSOLUTE RULES):**
${criticalDonts.join('\n')}
`;
        }
    }

    let prompt = `
    **INTERIOR PHOTOREALISM MANIFESTO v2.5 (YIMDESIGN & ADHOME UPGRADE):**
    Your goal is to embody a world-class architectural visualization artist from a top-tier studio like YIMDESIGN. The output must be an **ultra-photorealistic photograph**, not a render. It must be indistinguishable from a professionally shot and edited image found in luxury design magazines. The provided reference images are your quality benchmark.

- **1. LIGHTING IS THE SOUL (ABSOLUTE PRIORITY):**
    ${selectedLightingScenario}
    - **LAYERED LIGHTING PHILOSOPHY (MANDATORY):** You must implement a sophisticated, multi-layered lighting strategy.
        - **Natural Light:** For daytime scenes, light from windows must be soft and diffused, as if filtered through high-quality sheer curtains. This creates a bright, airy base with gentle, realistic shadows.
        - **Intelligent Accent Lighting (CRITICAL):** Actively search for opportunities to add integrated lighting. It is **MANDATORY** to place concealed LED strips:
            - Behind headboards.
            - Under floating shelves, TV consoles, and kitchen cabinets.
            - Inside glass display cabinets and bookcases.
            - Along vertical architectural grooves or wall panels.
        - **CRITICAL WARM TONE:** All artificial light sources (LED strips, lamps, spotlights) **MUST** emit a warm, inviting glow (color temperature between 2700K - 3000K). This is non-negotiable for creating a luxurious and cozy atmosphere. AVOID cold, blue, or sterile white light.
    - **PERFECT EXPOSURE & DYNAMIC RANGE:** The final image must be perfectly exposed. Shadows must be soft and filled with detail from bounced light (perfect global illumination), never just black voids ('crushed blacks'). Bright areas, like windows or light fixtures, must retain detail, never appearing as pure white blobs ('blown-out highlights').

- **2. MATERIALS MUST BE TANGIBLE & LUXURIOUS:** Every surface must have a hyper-realistic, high-end texture with believable imperfections. NO plastic-looking surfaces. NO visibly repeating patterns.
    - **Specific Material Palette (Inspired by YIMDESIGN):**
        - **Wood:** Use rich textures like natural light oak or dark walnut, often with fluted or slatted paneling. Finishes should be matte or satin.
        - **Stone:** Employ large, seamless slabs of marble (e.g., Calacatta, Travertine) with complex, non-repetitive veining for feature walls and countertops.
        - **Metals:** Integrate subtle accents of brushed bronze, brass, or matte black metal. Avoid cheap-looking chrome.
        - **Walls:** Move beyond simple paint. Use textured plaster, lime wash finishes, or elegant fabric/upholstered wall panels.
    - **FABRIC MASTERCLASS (CRITICAL DETAIL):** Render textiles with extreme fidelity.
        - **For Upholstery (Sofas, Chairs):** Prioritize rich, textured fabrics like **Bouclé**, high-quality linen, or soft, low-pile velvet. The weave and texture must be visible on close inspection.
        - **For Curtains:** Must be heavy and drape realistically, often in two layers (sheer and blackout).
        - **For Rugs:** Must have a visible pile and texture that feels soft and luxurious underfoot.

- **3. PROFESSIONAL COMPOSITION & POST-PROCESSING:**
    - **Camera Simulation:** Emulate a high-end full-frame camera (e.g., Sony A7R IV) with a prime lens (e.g., 35mm or 50mm f/1.8). Create a subtle, natural depth of field that draws the eye. The main focal point must be tack sharp.
    - **Color Grading:** Apply a professional, harmonious color grade. The palette should be sophisticated and cohesive, often based on neutral tones with warm accents. Ensure perfect white balance.

    ${referenceImageInstructions}
    
    ${taskDescription}
    `;
    
    // This is only for redesign mode
    if(settings.interiorRenderType !== 'enhance') {
        prompt += `\nUse variation seed ${settings.interiorVariationSeed} to ensure a unique result.`;
    }

    if (settings.quality === 'high') {
        prompt += '\n- **Quality:** ultra realistic, 8k, photorealistic, professional photography, sharp focus';
    }
    if (settings.enhance4k) {
        prompt += ', 4K resolution, hyper-detailed, intricate details';
    }
    if (settings.aiMaterials) {
        prompt += ', using high-end, architecturally appropriate materials chosen by an expert';
    }

    const mainParts: any[] = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { text: generatePrompt(prompt, settings) },
    ];

    if (settings.styleImage) {
        mainParts.push({ inlineData: { data: getBase64Data(settings.styleImage.base64), mimeType: settings.styleImage.mimeType } });
    }
    
    // Step 1: Generate the primary view.
    const [primaryView] = await callGemini('gemini-2.5-flash-image', mainParts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });

    // Per user request, interior mode now only generates one image to optimize cost.
    return [primaryView];
};


export const generatePlanning = async (originalImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    let basePrompt = `Based on the provided building, create an ultra-realistic, high-altitude aerial photograph of a large, master-planned urban development. The final image must look like a professional shot from a drone or helicopter, NOT a simple 3D render. Emulate the style of high-end architectural visualization found in professional portfolios.
    Key requirements for realism:
    1.  **Organic Layout:** Design a complex and believable urban fabric with a main arterial road, smaller connecting streets, and varied block sizes. Avoid unnatural repetition.
    2.  **Architectural Diversity:** Expand upon the style of the single building to create a cohesive neighborhood, but introduce subtle variations in building height, form, and facade to create a natural, non-uniform appearance. Include a mix of residential areas, a small commercial hub, and public buildings.
    3.  **Lush Greenery:** Integrate extensive, realistic green spaces, such as a central park, smaller pocket parks, tree-lined boulevards, and waterfront areas with lakes or rivers.
    4.  **Human Scale:** Add subtle details that bring the scene to life, such as cars moving on the roads, people in public spaces (if visible from the altitude), and realistic landscaping.`;
    
    if (settings.effects.nighttime) {
        basePrompt += ', The scene is set during a beautiful, clear night. It must be vividly illuminated by a network of glowing streetlights casting realistic pools of light, warm light emanating from the windows of buildings, and dynamic light trails from moving vehicles on the main roads. The atmosphere should be vibrant and alive.';
    } else if (settings.effects.daytime) {
        basePrompt += ', set during a bright, clear daytime with strong, realistic sunlight casting soft shadows, creating a sense of depth and form.';
    }

    if (settings.effects.fog) {
        basePrompt += ', with light atmospheric fog in the distance.';
    }
    if (settings.effects.lightsOn && !settings.effects.nighttime) { // Only add if not already night
        basePrompt += ', with lights on in all the buildings.';
    }

    const finalBasePrompt = generatePrompt(basePrompt, settings);

    const parts = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { text: finalBasePrompt },
    ];
    
    return await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });
};

export const generateSketchColorize = async (originalImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    const sketchStylePrompts = {
        black_white_sketch: `You are an AI architectural illustrator. Transform the provided architectural image into a single, professional, and artistic hand-drawn architectural sketch in black and white.
        CRITICAL INSTRUCTIONS:
        1.  **Preserve Architecture:** The fundamental architectural form and proportions of the building in the input image must be accurately maintained.
        2.  **Artistic Style:** Interpret the 3D model and convert it into a convincing hand-drawn style with the character of a sketch made with fine-liners and markers.
        3.  **Line Quality:** Use clean, confident lines with varying weights to create depth and emphasis. Avoid a "computer-generated" look.
        4.  **Shading & Texture:** Apply subtle shading and hatching to suggest form, material, and shadow.
        5.  **Output:** The final image must be a beautiful black and white architectural sketch, suitable for a design presentation. It must not look like a simple "sketch" filter.`,
        watercolor: `You are an AI architectural illustrator. Transform the provided architectural image into a beautiful and artistic architectural watercolor painting.
        CRITICAL INSTRUCTIONS:
        1.  **Preserve Architecture:** The underlying architectural form must remain accurate to the input image.
        2.  **Watercolor Aesthetics:** The style should be vibrant but soft, with characteristic watercolor techniques like wet-on-wet bleeds for the sky, soft gradients, and subtle color variations.
        3.  **Line Work:** Underlying sketch lines should be visible but soft and integrated into the painting, not harsh black outlines.
        4.  **Paper Texture:** The final result should subtly evoke the texture of real watercolor paper.
        5.  **Output:** Create a professional, artistic piece that feels hand-painted, not like a digital filter.`,
        lineless: `You are an AI architectural illustrator. Transform the provided architectural image into a lineless, painterly architectural illustration.
        CRITICAL INSTRUCTIONS:
        1.  **Preserve Architecture:** The building's form, shape, and proportions must be accurately represented from the input image.
        2.  **NO LINE ART:** You must completely remove all black outlines and line art. This is the most important rule.
        3.  **Form Through Color:** The shape and volume of the building must be defined entirely by blocks of color, light, and shadow.
        4.  **Style:** The result should be a clean, modern, almost minimalist illustration with a soft, artistic, and slightly dreamy quality.
        5.  **Output:** The final image is a professional digital illustration, not a photorealistic render or a sketch.`
    };
    
    let prompt = sketchStylePrompts[settings.sketchStyle as keyof typeof sketchStylePrompts] || sketchStylePrompts.black_white_sketch;

    if (settings.quality === 'high') {
        prompt += ', high detail, professional art, sharp focus';
    }
    if (settings.enhance4k) {
        prompt += ', 4K resolution, hyper-detailed, intricate details';
    }

    const parts: any[] = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { text: generatePrompt(prompt, settings) },
    ];
    
    return await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });
};

export const generatePlanTo3D = async (originalImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    const viewDescriptions = {
        perspective: 'a photorealistic eye-level perspective shot from an attractive angle that showcases the space.',
        top_down: 'a photorealistic top-down axonometric (3D) view.',
        high_angle: 'a photorealistic high-angle perspective shot, looking down into the room from a corner to give a sense of the overall layout and space.',
        wide_angle: 'a photorealistic wide-angle perspective shot that captures as much of the room as possible, emphasizing the sense of space and openness.',
        detail: 'a photorealistic close-up or detail shot focusing on a specific, beautifully arranged area of the room, such as a decorated coffee table, a stylish bookshelf, or a cozy reading nook. Highlight the textures and materials.',
        angle_45: 'a photorealistic 45-degree axonometric view, also known as an "exploded floor plan" ("phối cảnh nội thất bóc mái"). This view should show the entire layout from an elevated 45-degree angle without a ceiling, providing a clear and comprehensive look at the furniture arrangement and spatial flow. The walls should be shown at full height.'
    };
    
    // Fallback to perspective if the view is not found
    const viewDescription = viewDescriptions[settings.planView as keyof typeof viewDescriptions] || viewDescriptions.perspective;

    let prompt = `You are an AI architectural visualization expert. The input is a 2D floor plan (which could be a hand-drawn sketch or a CAD file). Your task is to transform it into a single, ultra-realistic, fully furnished 3D interior photograph.
    1.  **Analyze the Plan:** Automatically interpret the layout of walls, doors, and windows from the 2D plan to determine the room type(s) (e.g., living room, kitchen, bedroom).
    2.  **Furnish the Space:** Populate the 3D space with hyper-realistic furniture and decor in a universally appealing, clean, and modern interior design style. The placement of furniture must strictly follow the 2D plan if specified, otherwise arrange it logically and beautifully according to the detected room type.
    3.  **Set Camera View:** The final image must be ${viewDescription}
    4.  **Realism:** The final image must be indistinguishable from a real photograph. Apply master-level lighting and texturing.`;
    
    prompt = generatePrompt(prompt, settings);

    const parts: any[] = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { text: prompt },
    ];
    
    return await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });
};

export const generatePlanToPerspective = async (planImage: ImageFile, settings: RenderSettings): Promise<ImageFile[]> => {
    if (!settings.moodboardImage) {
        throw new Error('Vui lòng tải lên ảnh phong cách (moodboard) để tiếp tục.');
    }

    const basePrompt = `**PRIMARY DIRECTIVE: 2D PLAN TO 3D CONVERSION**

**INPUTS:**
1.  **IMAGE 1 (THE BLUEPRINT):** A 2D architectural floor plan.
2.  **IMAGE 2 (THE MOODBOARD):** A style reference image.

**NON-NEGOTIABLE RULES:**
1.  **THE BLUEPRINT IS LAW:** You MUST construct the 3D model as an EXACT replica of the 2D floor plan (IMAGE 1). Every wall, window, door, and structural element must be identical in position and proportion. Analyze the plan for furniture symbols (e.g., bed, toilet, wardrobe) and place the 3D furniture in those precise locations. ANY deviation from the blueprint's layout is a critical failure.
2.  **THE MOODBOARD IS STYLE:** You MUST use the moodboard (IMAGE 2) ONLY for aesthetic guidance. Extract the interior design style, color palette, material choices (e.g., wood type, fabric texture), lighting atmosphere, and furniture types from it. DO NOT copy the room shape or layout from the moodboard.

**YOUR TASK:**
- Create a 3D model that is structurally identical to the 2D blueprint.
- Furnish and style this model using the aesthetics from the moodboard.
- Render the final result as a photorealistic image.`;

    const anglePrompt = "Render a single, eye-level, photorealistic perspective shot of the final space from the most visually appealing main angle.";

    const fullPrompt = generatePrompt(`${basePrompt}\n- ${anglePrompt}`, settings);
    const parts: any[] = [
        { inlineData: { data: getBase64Data(planImage.base64), mimeType: planImage.mimeType } },
        { inlineData: { data: getBase64Data(settings.moodboardImage!.base64), mimeType: settings.moodboardImage!.mimeType } },
        { text: fullPrompt },
    ];
    return await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT], numberOfImages: 1 });
};

export const refineImage = async (imageToRefine: ImageFile, prompt: string): Promise<ImageFile> => {
    const parts = [
        { inlineData: { data: getBase64Data(imageToRefine.base64), mimeType: imageToRefine.mimeType } },
        { text: `Refine this image with the following instruction: "${prompt}". CRITICAL: The final result must be "chân thực như ảnh chụp" (photorealistic). It must look like a real photograph, not a render. Ensure the refined area has realistic lighting, textures with subtle imperfections, and blends seamlessly with the rest of the image. Only apply this change, keeping everything else identical.` }
    ];
    const [result] = await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT] });
    return result;
};


export const inpaintImage = async (originalImage: ImageFile, maskImage: ImageFile, prompt: string, referenceImage: ImageFile | null): Promise<ImageFile> => {
     const parts: (object)[] = [
        { inlineData: { data: getBase64Data(originalImage.base64), mimeType: originalImage.mimeType } },
        { inlineData: { data: getBase64Data(maskImage.base64), mimeType: maskImage.mimeType } },
    ];

    let textPrompt = `Apply the following change ONLY to the white masked area: "${prompt}".`;

    if (referenceImage) {
        parts.push({ inlineData: { data: getBase64Data(referenceImage.base64), mimeType: referenceImage.mimeType } });
        textPrompt += ` Use the provided reference image as inspiration for the style, materials, and textures in the masked area. Do NOT copy the objects from the reference, only the aesthetic qualities.`;
    }

    textPrompt += ` CRITICAL: The result in the masked area must be "chân thực như ảnh chụp" (photorealistic). It must look like a real photograph, not a render. Ensure it has realistic lighting, textures with subtle imperfections, and blends seamlessly with the original photograph.`;
    
    parts.push({ text: textPrompt });

    const [result] = await callGemini('gemini-2.5-flash-image', parts, { responseModalities: [Modality.IMAGE, Modality.TEXT] });
    return result;
};

export const generateImageSuggestions = async (image: ImageFile, mode: ActiveMode): Promise<string[]> => {
    let systemInstruction = "You are an expert in architectural and interior design visualization. Analyze the user's image and provide three creative, actionable suggestions in Vietnamese as a JSON array of strings. The suggestions should be concise (around 15-20 words each).";

    let userPrompt = '';
    switch (mode) {
        case 'exterior':
            userPrompt = "Analyze this exterior architectural image. Suggest three different creative ways to re-imagine it (e.g., different architectural styles, materials, or environments).";
            break;
        case 'interior':
            userPrompt = "Analyze this interior image. Provide three specific and creative suggestions for how our AI tool could transform it. Frame each suggestion as a clear instruction. For example: 'Biến căn phòng thành phong cách Japandi với gỗ sồi sáng và vải lanh màu be.' or 'Thêm hệ thống đèn LED âm trần và dưới kệ tủ để tạo không khí ấm cúng vào ban đêm.' Focus on actionable changes related to style, materials, and lighting that our AI can execute.";
            break;
        case 'planning':
            userPrompt = "Analyze this building. Suggest three concepts for developing the surrounding area into a larger, cohesive urban plan.";
            break;
        case 'sketch_colorize':
            userPrompt = "This is a sketch or 3D model. Suggest three distinct artistic styles to transform it into a professional architectural illustration (e.g., watercolor, black and white sketch, lineless art).";
            break;
        case 'plan_to_3d':
            userPrompt = "This is a 2D floor plan. Suggest three different interior design themes or concepts that could be applied when converting it to 3D.";
            break;
        case 'plan_to_perspective':
            userPrompt = "This is a 2D floor plan. Suggest three different moodboard concepts or interior styles (e.g., 'Japandi style with light oak and neutral fabrics', 'Industrial loft with exposed brick and black metal') that could be applied to it.";
            break;
        default:
            return []; // No suggestions for gallery or other modes
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: getBase64Data(image.base64), mimeType: image.mimeType } },
                    { text: userPrompt },
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
        }
        return [];

    } catch (error) {
        console.error("Error generating AI suggestions:", error);
        // Don't throw, just return empty array to not break the UI
        return [];
    }
};
