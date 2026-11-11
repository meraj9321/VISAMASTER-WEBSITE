const getGeminiClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const { GoogleGenAI } = await import("@google/genai");

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

module.exports = { getGeminiClient };
