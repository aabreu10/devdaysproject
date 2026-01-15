import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateText = async (prompt) => {
    try {
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
