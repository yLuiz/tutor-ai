import mongoose from 'mongoose';
import { CONFIG } from './config';
import { seedDefaultUsers } from '../db/seed/seedDefaultUsers';

export const connectToDatabase = async () => {

    const tries = 0;
    const maxTries = 5;

    try {
        const uri = CONFIG.MONGO_URI;

        console.log(`🔗 Conectando ao MongoDB em: ${uri} 🔗`);
        await mongoose.connect(uri, {
            dbName: CONFIG.MONGO_DB_NAME,
        });
        console.log('✅ Conectado ao MongoDB ✅');

        await seedDefaultUsers();

    } catch (error) {

        if (tries < maxTries) {
            console.log(`🔄 Tentando reconectar ao MongoDB (${tries + 1}/${maxTries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos antes de tentar novamente
            return connectToDatabase(); // Tenta conectar novamente
        }

        console.error('❌ Erro ao conectar ao MongoDB ❌ => ', error);
        process.exit(1);
    }
};
