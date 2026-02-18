
import { GoogleGenAI, Type } from "@google/genai";

export const getMessageTemplates = async (businessType: string): Promise<{ templates: { title: string; content: string }[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 4 professional WhatsApp message templates for a business of type: ${businessType}. 
    Each template should have a short descriptive title and the message content.
    Keep the messages friendly, professional, and designed to initiate a sale or inquiry.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          templates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["title", "content"]
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"templates": []}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { templates: [] };
  }
};
