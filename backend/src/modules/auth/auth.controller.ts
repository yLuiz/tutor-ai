import { Router } from "express";
import { createJwtToken } from "../../utils/auth/create-jwt-token";
import { UserRepository } from "../../db/repositories/UserRepository";

const router = Router();
const userRepository = new UserRepository();

router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  try {

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = user.password === password;
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = createJwtToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });

  } catch (error) {
    console.error("Erro ao processar o login:", error);
    res.status(500).json({ error: "Erro ao processar o login" });
  }
});

export const AuthRouter = router;