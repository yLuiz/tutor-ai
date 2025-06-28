import { Router } from 'express';
import { AuthService } from './auth.service';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    const status = error.message === 'Credenciais inválidas' ? 401 : 500;
    console.error("Erro ao processar o login:", error);
    res.status(status).json({ error: error.message });
  }
});

export const AuthRouter = router;
