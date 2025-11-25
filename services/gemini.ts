import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedEvent } from "../types";

const parseSchedule = async (text: string): Promise<ParsedEvent[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const eventSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The name of the class (e.g., Emily 伸展瑜伽). Remove raw dates from title if redundant.",
      },
      start: {
        type: Type.STRING,
        description: "Start time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss). Assume timezone is Asia/Taipei (GMT+8) unless specified.",
      },
      end: {
        type: Type.STRING,
        description: "End time in ISO 8601 format. If duration is not explicit, assume 1 hour.",
      },
      location: {
        type: Type.STRING,
        description: "The Zoom link URL.",
      },
      description: {
        type: Type.STRING,
        description: "Other details like Meeting ID and Password.",
      },
    },
    required: ["title", "start", "end"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Parse the following class schedule text into structured events. 
    The text contains multiple class entries. 
    The input usually includes a line with a date (e.g. 11/5) and a line with a full date (e.g. 2025年11月5日).
    Use the full date year/month/day context. 
    Timezone is Asia/Taipei.
    
    Input Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: eventSchema,
      },
    },
  });

  const jsonStr = response.text || "[]";
  try {
    const rawEvents = JSON.parse(jsonStr);
    // Add unique IDs
    return rawEvents.map((e: any) => ({
      ...e,
      id: crypto.randomUUID(),
    }));
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("AI response was not valid JSON");
  }
};

export { parseSchedule };