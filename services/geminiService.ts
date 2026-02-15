
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  // Ensure we have a key, even if it's an empty string (the API will handle the error)
  const apiKey = process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Write a short, sincere Valentine's Day message for my ${request.relationship} named ${request.recipientName}. 
  ${request.additionalContext ? `Tone/Vibe: ${request.additionalContext}` : ""}
  
  Requirements:
  - 1 to 2 sentences.
  - Heartfelt and unique.
  - Return JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a world-class romantic poet. Create personalized, elegant, and non-cliché Valentine's messages. Always output valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "The heartfelt Valentine's message.",
            },
            author: {
              type: Type.STRING,
              description: "A short romantic signature (e.g., 'Forever yours', 'With all my love').",
            },
          },
          required: ["quote", "author"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const cleanedText = text.trim();
    return JSON.parse(cleanedText) as GeneratedMessage;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Return a beautiful fallback if the API fails
    return {
      quote: `To ${request.recipientName}: My world is brighter and my heart is fuller simply because you are in it. Happy Valentine's Day.`,
      author: "With all my love"
    };
  }
};
