
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  // Always initialize inside the function to ensure the latest API Key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Write a short, deeply personal Valentine's Day message for ${request.recipientName}. 
  Relationship: ${request.relationship}. 
  ${request.additionalContext ? `Vibe: ${request.additionalContext}` : ""}
  
  Guidelines:
  - Concise (1-2 sentences max).
  - Sincere and heartfelt.
  - Avoid all cliches and generic phrases.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a poet and a romantic writer. Create unique, personalized Valentine's Day quotes. Return the output as JSON with 'quote' and 'author' fields.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "The Valentine's Day message or quote.",
            },
            author: {
              type: Type.STRING,
              description: "A signature or short romantic attribution (e.g. 'Your Love', 'Forever Yours').",
            },
          },
          required: ["quote", "author"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from model");
    }

    return JSON.parse(text) as GeneratedMessage;
  } catch (error) {
    console.error("Failed to generate Valentine message:", error);
    // Fallback content in case of API issues
    return {
      quote: `To ${request.recipientName}: My heart finds its way home whenever I'm with you. You are my favorite thought.`,
      author: "Always Yours"
    };
  }
};
