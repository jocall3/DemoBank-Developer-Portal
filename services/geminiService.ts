
import { GoogleGenAI } from "@google/genai";
import { AiConfig } from '../types';

export const generateAiResponse = async (
    prompt: string, 
    config: AiConfig, 
    apiKey: string,
    systemInstruction?: string
) => {
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: config.temperature,
                maxOutputTokens: config.maxTokens,
            },
        });

        return response.text || 'No response generated.';
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
