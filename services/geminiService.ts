
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  // Directly use the provided environment key
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey) {
    console.warn("API_KEY is missing, using fallback message.");
    return {
      quote: `To ${request.recipientName}: You make every day feel like a beautiful dream. I'm so lucky to have you in my life.`,
      author: "Forever yours"
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Write a short, sincere Valentine's Day message for my ${request.relationship} named ${request.recipientName}. 
  ${request.additionalContext ? `Tone/Vibe: ${request.additionalContext}` : ""}
  
  Requirements:
  - Max 2 sentences.
  - Sincere and heartfelt.
  - Return JSON format with 'quote' and 'author' keys.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a professional romantic writer. Create personalized Valentine's messages. Always output valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "A short, unique Valentine's message.",
            },
            author: {
              type: Type.STRING,
              description: "A short sign-off.",
            },
          },
          required: ["quote", "author"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    return JSON.parse(text.trim()) as GeneratedMessage;
  } catch (error) {
    console.error("Gemini service failed:", error);
    // Reliable fallback for production stability
    return {
      quote: `To ${request.recipientName}: My heart is full of gratitude for you every single day. Wishing you a day as beautiful as your soul.`,
      author: "With all my love"
    };
  }
};
