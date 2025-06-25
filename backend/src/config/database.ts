import mongoose from 'mongoose';
import { CONFIG } from './config';
import { seedDefaultUsers } from '../db/seed/seedDefaultUsers';

export const connectToDatabase = async () => {
    try {
        const uri = CONFIG.MONGO_URI;

        console.log(`🔗 Conectando ao MongoDB em: ${uri} 🔗`);
        await mongoose.connect(uri);
        console.log('✅ Conectado ao MongoDB ✅');

        await seedDefaultUsers();

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB ❌ => ', error);
        process.exit(1);
    }
};
