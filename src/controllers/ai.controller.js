import { generateText as generateTextOpenAI } from '../services/openai.service.js';
import { generateText as generateTextOllama } from '../services/ollama.service.js';
import { generateText as generateTextGemini } from '../services/gemini.service.js';

export const generateAIResponse = async (req, res) => {
    const { prompt, provider = 'openai' } = req.body;
    try {
        let aiResponse;
        switch (provider) {
            case 'ollama':
                aiResponse = await generateTextOllama(prompt);
                break;
            case 'gemini':
                 aiResponse = await generateTextGemini(prompt);
                 break;
            case 'openai':
            default:
                aiResponse = await generateTextOpenAI(prompt);
                break;
        }
        
        res.status(200).json({ response: aiResponse });
    } catch (error) {
        aiRequestsCounter.add(1, { provider, status: 'error' });
        
        console.error('Error:', error);
        res.status(error.status || 500).json({ 
            message: error.error?.message || error.message || 'Internal server error',
            error: error.message 
        });
    }
};
