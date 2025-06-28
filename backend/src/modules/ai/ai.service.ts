import OpenAI from "openai";
import { ConversationRepository } from "../../db/repositories/ConversationRepository";
import moment from "moment";
import { IConversation } from "../../db/entities/ConversationEntity";
import { parseBotResponse } from "../../utils/helpers/parseBotResponse";
import { naturalPrompt } from "./prompts";
import { CONFIG } from "../../config/config";
import { sleep } from "../../utils/helpers/sleep";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
});

export class AiService {

    private conversationRepository = new ConversationRepository();

    async correctAndAppend(conversationId: string, text: string) {
        const correctedText = await this._correctText(text);
        const responseParsed = parseBotResponse(correctedText);

        await this.conversationRepository.appendMessages(conversationId, [
            { role: 'user', content: text }
        ]);

        await this.conversationRepository.appendMessages(conversationId, [
            { role: 'bot', content: responseParsed.correcao }
        ]);

        return { original: text, ...responseParsed };
    }

    async correctWithOptionalConversation(userId: string, text: string, conversationId?: string) {
        let conversation: IConversation | null;

        if (!conversationId) {
            conversation = await this.conversationRepository.create({
                title: `Conversa com o usuário ${userId}`,
                userId,
                messages: []
            });
        } else {
            conversation = await this.conversationRepository.findById(conversationId);
        }

        const correctedText = await this._correctText(text);

        await this.conversationRepository.appendMessages(conversation?.id, [
            { role: 'user', content: text, timestamp: moment().toDate() }
        ]);

        await this.conversationRepository.appendMessages(conversation?.id, [
            { role: 'bot', content: correctedText as string, timestamp: moment().toDate() }
        ]);

        return { correctedText, conversationId: conversation?.id };
    }



    private async _correctText(text: string): Promise<string | null> {

        if (!CONFIG.CORRECT_BY_AI) {
            return `[Correção pela IA desativada] Esta é a correção fictícia do texto: *${text}*`;
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
                    await sleep(1000 + i * 1000);
                } else {
                    throw new Error(`Erro OpenAI: ${error.message}`);
                }
            }
        }

        throw new Error("Limite de requisições excedido mesmo após retries.");
    };

}
