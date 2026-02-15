
import { GoogleGenAI, Type } from "@google/genai";
import { ValentineMessageRequest, GeneratedMessage } from "../types";

export const generateValentineMessage = async (
  request: ValentineMessageRequest
): Promise<GeneratedMessage> => {
  // Use the environment variable directly as per guidelines
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey) {
    // Robust local fallbacks if API is missing
    const fallbacks = [
      { quote: `To ${request.recipientName}: You are the light that guides me through every storm.`, author: "With all my love" },
      { quote: `To ${request.recipientName}: My world is a better place just because you exist in it.`, author: "Forever grateful" },
      { quote: `To ${request.recipientName}: Of all the paths I've taken, the one that led to you is my favorite.`, author: "Yours always" }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // High entropy key to force the model to rethink every single request
  const uniqueId = Math.random().toString(36).substring(7) + Date.now().toString();
  
  const prompt = `Task: Craft a unique, bespoke Valentine's Day message.
Recipient: ${request.recipientName}
Relationship Category: ${request.relationship}
Personal Context/Vibe: ${request.additionalContext || "purely heartfelt"}
Entropy Key: ${uniqueId}

Relationship-Specific Nuance Guidelines:
- If PARENT: Focus on roots, unwavering support, and deep gratitude. Not romantic.
- If SIBLING: Focus on shared history, an unbreakable bond, and loyalty. Not romantic.
- If FRIEND: Focus on kindred spirits, laughter, and the beauty of chosen family.
- If PARTNER/SPOUSE: Focus on intimacy, shared dreams, and soul-level connection.
- If CRUSH: Focus on sweet anticipation, admiration, and a gentle spark.

Constraints:
- Maximum 2 sentences.
- DO NOT use clichés like 'roses are red' or 'be my valentine'.
- Use sophisticated, evocative, and elegant language.
- Ensure the tone matches the specific relationship category perfectly.
- Return ONLY a JSON object with 'quote' and 'author'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a master of human connection and a world-class poet. You understand the subtle differences between the love for a parent, a sibling, a friend, and a partner. Your mission is to provide distinct, deeply moving, and non-repetitive messages for each unique user request.",
        temperature: 1.0, 
        topP: 0.98,
        topK: 64,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "A unique, relationship-appropriate Valentine's quote.",
            },
            author: {
              type: Type.STRING,
              description: "A short, matching sign-off (e.g., 'With love', 'Forever', 'Your sibling').",
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
    // Dynamic fallback
    return {
      quote: `To ${request.recipientName}: You make life's journey so much more meaningful. Happy Valentine's Day.`,
      author: "With deep affection"
    };
  }
};
