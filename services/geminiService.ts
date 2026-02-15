
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `Write a beautiful, deeply poetic, and unique Valentine's Day message for someone named ${request.recipientName}. 
  The relationship is: ${request.relationship}. 
  ${request.additionalContext ? `Context: ${request.additionalContext}` : ""}
  
  Style: Elegant, heartfelt, and memorable. It can be a short poem or a couple of powerful sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class romantic poet and speechwriter. You specialize in crafting deeply personal and emotionally resonant Valentine's Day messages that avoid clichés while remaining accessible and warm.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "The main romantic message or poem.",
            },
            author: {
              type: Type.STRING,
              description: "The name of the recipient or a signature like 'Always yours'.",
            }
          },
          required: ["quote"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      quote: result.quote || "May your heart be full of love today and always.",
      author: result.author || `For ${request.recipientName}`
    };
  } catch (error) {
    console.error("Error generating message:", error);
    return {
      quote: "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.",
      author: "Unknown"
    };
  }
};
