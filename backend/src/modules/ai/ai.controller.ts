import { Router } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { AiService } from "./ai.service";

const router = Router();
const aiService = new AiService();


router.post('/ai/correct', async (req, res) => {
  const { text, conversationId } = req.body;

  try {
    const result = await aiService.correctAndAppend(conversationId, text);
    res.json(result);
  } catch (error) {
    console.error("Erro ao processar o texto:", error);
    res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

router.post('/ai/v2/correct', async (req, res) => {
  const { text, conversationId } = req.body;
  const userId = (req as AuthenticatedRequest).user!.id;

  try {
    const result = await aiService.correctWithOptionalConversation(userId, text, conversationId);
    res.json(result);
  } catch (error) {
    console.error("Erro ao processar o texto:", error);
    res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

export const AiRouter = router;