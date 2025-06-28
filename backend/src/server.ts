require('dotenv').config();
import cors from 'cors';
import express from 'express';
import { AiRouter } from './modules/ai/ai.controller';
import { AuthRouter } from './modules/auth/auth.controller';
import { UserRouter } from './modules/user/user.controller';
import { connectToDatabase } from './config/database';
import { authenticateToken } from './middlewares/auth';
import { ConversationRouter } from './modules/conversation/conversation.controller';
const app = express();


async function main() {

    try {
        connectToDatabase();

        app.use(cors());
        app.use(express.json());

        app.use('/api', AuthRouter);
        app.use('/api', ConversationRouter);
        app.use('/api', authenticateToken as any, AiRouter);
        app.use('/api', authenticateToken as any, UserRouter);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
    }
    catch (error) {
        console.error('Erro ao iniciar o servidor: ');
        console.error(error);
        process.exit(1);
    }


}

main();