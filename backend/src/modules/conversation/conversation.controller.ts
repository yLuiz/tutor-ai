import { Router } from 'express';
import { ConversationService } from './conversation.service';

const router = Router();
const conversationService = new ConversationService();

router.post('/conversations', async (req, res) => {
  const { userId, messages, title } = req.body;

  try {
    const conversation = await conversationService.createConversation({ userId, messages, title });
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

router.get('/conversations/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const conversations = await conversationService.getConversationsByUser(userId, page, limit);
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

router.get('/conversations/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const conversation = await conversationService.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

router.post('/conversations/:id/messages', async (req: any, res: any) => {
  const { id } = req.params;
  const { messages } = req.body;

  try {
    const updated = await conversationService.appendMessages(id, messages);
    if (!updated) return res.status(404).json({ error: 'Conversa não encontrada' });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Erro ao adicionar mensagens:', error);
    res.status(500).json({ error: 'Erro ao adicionar mensagens' });
  }
});

router.post('/conversations/share/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const sharedId = await conversationService.shareConversation(id);
    if (!sharedId) return res.status(404).json({ error: 'Conversa não encontrada' });

    res.json({ sharedId });
  } catch (error) {
    console.error('Erro ao compartilhar conversa:', error);
    res.status(500).json({ error: 'Erro ao compartilhar conversa' });
  }
});

router.get('/conversations/shared/:sharedId', async (req: any, res: any) => {
  const { sharedId } = req.params;

  try {
    const conversation = await conversationService.getSharedConversation(sharedId);
    if (!conversation) return res.status(404).json({ error: 'Conversa compartilhada não encontrada' });

    res.json(conversation);
  } catch (error) {
    console.error('Erro ao acessar conversa compartilhada:', error);
    res.status(500).json({ error: 'Erro ao acessar conversa compartilhada' });
  }
});

router.delete('/conversations/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const deleted = await conversationService.deleteConversation(id);
    if (!deleted) return res.status(404).json({ error: 'Conversa não encontrada' });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    res.status(500).json({ error: 'Erro ao excluir conversa' });
  }
});

export const ConversationRouter = router;
