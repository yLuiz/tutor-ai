import { Router } from "express";
import { UserRepository } from "../../db/repositories/UserRepository";
import { UserRoles } from "../../db/entities/UserEntity";

const router = Router();
const userRepository = new UserRepository();

router.post('/users', async (req: any, res: any) => {
    const { name, email, password, role, isActive, bio } = req.body;

    try {

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const newUser = await userRepository.create({
            name,
            email,
            password,
            role: role || UserRoles.COMMON,
            bio: bio || '',
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(newUser);

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
});

router.get('/users', async (req: any, res: any) => {
    try {
        const { email } = req.query;
        if (email?.length) {
            const user = await userRepository.findByEmail(email as string);
            return res.status(200).json(user);
        }

        const userList = await userRepository.findAll();

        res.status(200).json(userList);

    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});

router.get('/users/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Retorna os dados completos do usuário
        const { password, ...userData } = user; // Remove a senha do retorno
        res.json(userData);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
});


router.patch('/users/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, password, role, isActive, bio } = req.body;

    try {
        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        let updatePayload = {
            id: user.id,
            name: name ? name : user.name,
            email: email ? email : user.email,
            password: password ? password : user.password,
            role: role ? role : user.role,
            bio: bio ? bio : user.bio,
            isActive: isActive !== undefined ? isActive : user.isActive,
            lastAccess: user.lastAccess,
            correctedTexts: user.correctedTexts,
        }

        const updatedUser = await userRepository.update(id, updatePayload);
        res.json(updatedUser);

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
});


router.patch('/users/profile/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, bio } = req.body;

    try {
        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const updatedUser = await userRepository.updateProfile(id, {
            name: name ? name : user.name,
            email: email ? email : user.email,
            bio: bio ? bio : user.bio,
        });

        res.json(updatedUser);

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
});

router.patch('/users/change-password/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {

        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (user.password !== oldPassword) {
            return res.status(400).json({ error: 'Senha antiga incorreta' });
        }

        await userRepository.update(id, { password: newPassword });
        res.json({ message: 'Senha atualizada com sucesso' });

    } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        res.status(500).json({ error: "Erro ao atualizar senha" });
    }
});

router.delete('/users/:id', async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const user = await userRepository.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        await userRepository.delete(id);

        res.status(204).send();

    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        res.status(500).json({ error: "Erro ao excluir usuário" });
    }
});

export const UserRouter = router;