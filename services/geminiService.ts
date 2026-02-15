
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `Write a short, deeply personal Valentine's Day message for ${request.recipientName}. 
  Relationship: ${request.relationship}. 
  ${request.additionalContext ? `Vibe: ${request.additionalContext}` : ""}
  
  Guidelines:
  - Concise (1-2 sentences).
  - Genuine, warm, human.
  - No clichés.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a thoughtful person writing a quick, sincere handwritten note. Output JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["quote"]
        }
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
      quote: result.quote || "You make my world a little brighter just by being in it.",
      author: result.author || `For ${request.recipientName}`
    };
  } catch (error) {
    console.error("Error generating message:", error);
    return {
      quote: "Every moment with you feels like a gift I didn't know I was waiting for.",
      author: "With love"
    };
  }
};
