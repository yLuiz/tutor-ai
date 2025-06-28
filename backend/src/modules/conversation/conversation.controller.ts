import { Router } from 'express';
import { ConversationRepository } from '../../db/repositories/ConversationRepository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const conversationRepository = new ConversationRepository();

// Criar nova conversa
router.post('/conversations', async (req: any, res: any) => {
    const { userId, messages, title } = req.body;

    try {

        console.log('Criando nova conversa:', { userId, messages, title });

        const conversation = await conversationRepository.create({
            userId,
            messages,
            title
        });

        const output = {
            ...conversation,
            id: conversation._id,
        }

        res.status(201).json(output);
    } catch (error) {
        console.error('Erro ao criar conversa:', error);
        res.status(500).json({ error: 'Erro ao criar conversa' });
    }
});

// Listar conversas por usuário
router.get('/conversations/user/:userId', async (req: any, res: any) => {
    const { userId } = req.params;

    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const conversations = await conversationRepository.findByUserId({
            userId,
            take: limit,
            skip: page * limit
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Erro ao buscar conversas do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar conversas do usuário' });
    }
});

// Buscar conversa por ID
router.get('/conversations/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const conversation = await conversationRepository.findById(id);
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
        const updated = await conversationRepository.appendMessages(id, messages);
        if (!updated) return res.status(404).json({ error: 'Conversa não encontrada' });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Erro ao adicionar mensagens na conversa:', error);
        res.status(500).json({ error: 'Erro ao adicionar mensagens' });
    }
});

// Compartilhar conversa (gera sharedId)
router.post('/conversations/share/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const sharedId = uuidv4();
        const updatedConversation = await conversationRepository.shareConversation(id, sharedId);

        if (!updatedConversation) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        res.json({ sharedId });
    } catch (error) {
        console.error('Erro ao compartilhar conversa:', error);
        res.status(500).json({ error: 'Erro ao compartilhar conversa' });
    }
});

// Acessar conversa compartilhada
router.get('/conversations/shared/:sharedId', async (req: any, res: any) => {
    const { sharedId } = req.params;

    try {
        const conversation = await conversationRepository.findBySharedId(sharedId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversa compartilhada não encontrada' });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Erro ao acessar conversa compartilhada:', error);
        res.status(500).json({ error: 'Erro ao acessar conversa compartilhada' });
    }
});

// Deletar conversa
router.delete('/conversations/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const deleted = await conversationRepository.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir conversa:', error);
        res.status(500).json({ error: 'Erro ao excluir conversa' });
    }
});

export const ConversationRouter = router;
