
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const processRendering = async (
  imageBase64: string,
  userPrompt: string,
  onStatusChange?: (status: string) => void
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API 密钥缺失，请检查环境变量配置。");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  onStatusChange?.("初始化材质识别模型...");

  const modelName = 'gemini-2.5-flash-image';

  const contents = {
    parts: [
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
      {
        text: `You are a world-class Architectural Visualization Specialist and Material Scientist. 
               Your task is to analyze the provided 3D rendering and execute the following material and lighting modifications: ${userPrompt}.

               STRICT WORKFLOW RULES:
               1. MATERIAL SEGMENTATION: Automatically identify all materials in the scene, specifically: floorings, wall cladding, metallic trims, glass panels, and upholstery.
               2. REPLACEMENT LOGIC: When a material replacement is requested (e.g., 'replace floor with walnut'), you must precisely map the new high-resolution texture onto the existing geometry, maintaining all perspective, tiling scale, and edge boundaries.
               3. PHYSICAL ACCURACY: Ensure the new materials interact realistically with the scene's light sources. Reflective surfaces (marble, metal, glass) must show accurate reflections of the surrounding environment.
               4. STRUCTURE PRESERVATION: Never alter the structural geometry of the building. Windows, doors, and furniture silhouettes must remain sharp and unchanged.
               5. PHOTOREALISM: Enhance the final output with subtle ambient occlusion, realistic texture maps (normal/specular), and studio-quality post-processing.

               Please deliver a professional, high-fidelity final rendering that looks like it was rendered with an offline engine like V-Ray or Corona.`,
      },
    ],
  };

  try {
    onStatusChange?.("正在提取几何体纹理映射...");
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
    });

    onStatusChange?.("渲染物理材质层...");
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("AI 无法解析材质映射，请尝试重新选择材质。");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
