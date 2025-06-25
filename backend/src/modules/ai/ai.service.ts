import OpenAI from "openai";
import { CONFIG } from "../../config/config";
import { sleep } from "../../utils/helpers/sleep";
import { naturalPrompt } from "./prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
});

export async function correctText(text: string): Promise<string | null> {

    if (!CONFIG.CORRECT_BY_AI) {

        return `[Correção pela IA desativada] Esta é a correção fictícia do texto: *${text}*`;
        
        return `        
        \`\`\`json
        {
            "correcao": "[Correção pela IA desativada] Esta é a correção fictícia do texto: *${text}*", 
            "explicacao": "[Correção pela IA desativada] Esta é uma explicação fictícia sobre a correção."
        }`;
    }

    const prompt = naturalPrompt();

    for (let i = 0; i < 3; i++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: prompt },
                    { role: "user", content: text }
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            return response.choices[0].message.content;

        } catch (error: any) {
            if (error.status === 429) {
                console.warn("Rate limit! Tentando novamente...");
                await sleep(1000 + i * 1000); // backoff
            } else {
                throw new Error(`Erro OpenAI: ${error.message}`);
            }
        }
    }

    throw new Error("Limite de requisições excedido mesmo após retries.");
};