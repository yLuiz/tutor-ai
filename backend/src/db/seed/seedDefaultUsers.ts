import moment from 'moment';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { CONFIG } from '../../config/config';

const UserRoles: { ADMIN: "admin"; COMMON: "common" } = {
    ADMIN: "admin",
    COMMON: "common",
};

const defaultUsers = [
    {
        id: 1,
        name: 'João Lucas',
        email: 'joao@exemplo.com',
        password: 'senha123',
        role: UserRoles.ADMIN,
        bio: 'Administrador do sistema, responsável por gerenciar usuários e configurações.',
        isActive: true,
        lastAccess: '2025-06-20',
        correctedTexts: 45,
    },
    {
        id: 2,
        name: 'Luiz Victor',
        email: 'luizvictor1231@gmail.com',
        password: 'senha123',
        role: UserRoles.ADMIN,
        bio: 'Administrador do sistema, responsável por gerenciar usuários e configurações.',
        isActive: true,
        lastAccess: '2025-06-20',
        correctedTexts: 25,
    },
    {
        id: 3,
        name: 'Usuário Normal',
        email: 'normal@exemplo.com',
        password: 'senha123',
        role: UserRoles.COMMON,
        bio: 'Estudante de português interessado em melhorar minha escrita.',
        isActive: true,
        lastAccess: '2025-06-20',
        correctedTexts: 30,
    },
];

export async function seedDefaultUsers() {

    if (CONFIG.IS_PROD) return;

    const userRepository = new UserRepository();

    for (const user of defaultUsers) {
        const exists = await userRepository.existsByEmail(user.email);
        if (!exists) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            const userToCreate = {
                ...user,
                password: hashedPassword,
                lastAccess: moment(user.lastAccess).toDate(),
            };

            await userRepository.create(userToCreate);
            console.log(`Usuário criado: ${user.email}`);
        } else {
            console.log(`Usuário já existe: ${user.email}`);
        }
    }
}
