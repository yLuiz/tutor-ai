import { Router } from "express";
import { UserService } from "./user.service";


const router = Router();
const userService = new UserService();

router.post('/users', async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        const { password, ...userData } = newUser;
        res.status(201).json(userData);
    } catch (error: any) {
        console.error("Erro ao criar usuário:", error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await userService.getUsers(req.query.email as string);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});

router.get('/users/:id', async (req: any, res: any) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
});

router.patch('/users/:id', async (req, res) => {
    try {
        const updated = await userService.updateUser(req.params.id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.patch('/users/profile/:id', async (req, res) => {
    try {
        const updated = await userService.updateProfile(req.params.id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.patch('/users/change-password/:id', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const result = await userService.changePassword(req.params.id, oldPassword, newPassword);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export const UserRouter = router;
