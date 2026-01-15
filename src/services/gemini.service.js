import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateText = async (prompt) => {
    try {
        // Switch to 'gemini-flash-latest' which maps to the stable 1.5 Flash model (usually free tier compatible)
        // 'gemini-2.0-flash' returned a 0-limit quota error.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text;
    } catch (error) {
        console.error('Gemini Error:', error);
        throw error;
    }
};
