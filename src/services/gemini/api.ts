import axios from "axios";

const geminiApi = axios.create({
  baseURL: process.env.VUE_APP_GEMINI_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.VUE_APP_GEMINI_API_KEY}`,
  },
});

export interface GeminiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiResponse {
  message: GeminiMessage;
  conversationId: string;
}

export async function sendMessage(message: string): Promise<GeminiResponse> {
  try {
    const response = await geminiApi.post("/chat", { message });
    return response.data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process your request");
  }
}