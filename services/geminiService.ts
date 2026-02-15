
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `Write a deeply personal Valentine's Day message for ${request.recipientName}. 
  The relationship is: ${request.relationship}. 
  ${request.additionalContext ? `Special detail/vibe: ${request.additionalContext}` : ""}
  
  Guidelines:
  - Make it sound like it was written by a real person, with genuine warmth and sincerity.
  - Avoid overly generic "greeting card" clichés.
  - Focus on small, meaningful feelings and authentic connection.
  - The tone should be intimate and thoughtful.
  - Keep it concise but impactful (1-3 powerful sentences or a very short, raw poem).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a thoughtful individual expressing genuine, raw, and beautiful human emotions. Your goal is to write a message that feels like a handwritten note from a loved one. Use simple but profound language. Focus on the 'human' element—vulnerability, specific affection, and deep sincerity. Do not use corporate or overly polished AI phrasing.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "The authentic, human-written romantic message.",
            },
            author: {
              type: Type.STRING,
              description: "A short, warm sign-off (e.g., 'Always yours', 'With all my love').",
            }
          },
          required: ["quote"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      quote: result.quote || "You make my world a little brighter just by being in it. Happy Valentine's Day.",
      author: result.author || `For ${request.recipientName}`
    };
  } catch (error) {
    console.error("Error generating message:", error);
    return {
      quote: "Sometimes I find myself smiling just thinking about you. You're the best part of my day.",
      author: "With love"
    };
  }
};
