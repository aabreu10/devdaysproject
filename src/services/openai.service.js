import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateText = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-5-mini', 
            messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw error;
    }
};
