import { Router } from "express";
import { correctText } from "./ai.service";
import { parseBotResponse } from "../../utils/helpers/parseBotResponse";
import { ConversationRepository } from "../../db/repositories/ConversationRepository";
import moment from "moment";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { IConversation } from "../../db/entities/ConversationEntity";

const router = Router();
const conversationRepository = new ConversationRepository();

router.post('/ai/correct', async (req, res) => {
  const { text, conversationId } = req.body;
  
  try {
    const correctedText = await correctText(text);
    const responseParsed = parseBotResponse(correctedText);

    await conversationRepository.appendMessages(conversationId, [
      { role: 'user', content: text }
    ]);
    
    await conversationRepository.appendMessages(conversationId, [
      { role: 'bot', content: responseParsed.correcao }
    ]);

    res.json({ original: text, ...responseParsed });
  } catch (error) {

    console.error("Erro ao processar o texto:", error);

    res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

router.post('/ai/v2/correct', async (req, res) => {
  const { text } = req.body;
  let { conversationId } = req.body;

  try {

    const userId = (req as AuthenticatedRequest).user!.id;

    let conversation: IConversation | null = null;
    if (!conversationId) {
      conversation = await conversationRepository.create({
        title: `Conversa com o usuário ${userId}`,
        userId,
        messages: []
      });
    } else {
      conversation = await conversationRepository.findById(conversationId);
    }

    const correctedText = await correctText(text);
    await conversationRepository.appendMessages(conversation?.id, [
      { role: 'user', content: text, timestamp: moment().toDate() }
    ]);    

    await conversationRepository.appendMessages(conversation?.id, [
      { role: 'bot', content: correctedText as string, timestamp: moment().toDate() }
    ]);

    res.json({ correctedText, conversationId: conversation?.id });
  } catch (error) {

    console.error("Erro ao processar o texto:", error);

    res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

export const AiRouter = router;