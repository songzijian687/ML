
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const processRendering = async (
  imageBase64: string,
  userPrompt: string,
  onStatusChange?: (status: string) => void,
  textureBase64?: string | null
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key not found in environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  onStatusChange?.("Connecting to Gemini 2.5 Flash Image...");

  // Switching back to 2.5 Flash Image as it supports image editing/reference and doesn't require paid key enforcement for basic usage in this context.
  const modelName = 'gemini-2.5-flash-image';

  const parts: any[] = [
    {
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64,
      },
    }
  ];

  let systemPrompt = `You are a world-class AI Image Editor and Architectural Visualization specialist. 
               Your task is to modify the provided image based on these instructions: "${userPrompt}".

               CAPABILITIES & PRIORITIES:
               1. MAGIC EDITING: You can add/remove objects, apply filters, and adjust lighting.
               2. MATERIAL REPLACEMENT: Identify and replace materials while maintaining perspective and lighting.
               3. ARCHITECTURAL INTEGRITY: Preserve the core structure and geometry unless explicitly asked to change it.
               4. SEAMLESS BLENDING: Ensure all new elements or material changes are photorealistically blended.`;

  if (textureBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: textureBase64,
      },
    });
    systemPrompt += `
               
               REFERENCE TEXTURE PROVIDED:
               The second image provided is a REFERENCE TEXTURE. 
               You must apply this texture to the specific area/material mentioned in the prompt (e.g. floor, wall, sofa).
               Map the texture realistically, accounting for perspective, scale, and lighting shadows of the scene.`;
  }

  parts.push({ text: systemPrompt });

  try {
    onStatusChange?.("Processing with Vision Model...");
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
    });

    onStatusChange?.("Finalizing Render...");
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("AI did not return a generated image. Please try a different prompt.");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
