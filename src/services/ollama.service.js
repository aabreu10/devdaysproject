import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
});

export const generateText = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'llama3.2:1b', // Default model for Ollama
            messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Ollama Error:', error);
        throw error;
    }
};
