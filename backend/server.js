require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { correctText, correctWithDeepSeek } = require('./services/ai.service');
const { parseBotResponse } = require('./utils/helpers/parseBotResponse');
const { createJwtToken } = require('./utils/auth/create-jwt-token');
const app = express();

const UserRoles = {
  ADMIN: 'admin',
  COMMON: 'common',
};

const users = [
  {
    id: 1,
    name: 'João Lucas',
    email: 'joao@exemplo.com',
    password: 'senha123',
    role: UserRoles.ADMIN,
    bio: 'Administrador do sistema, responsável por gerenciar usuários e configurações.',
    isActive: 1,
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
    isActive: 1,
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
    isActive: 1,
    lastAccess: '2025-06-20',
    correctedTexts: 30,
  },
];

const getUserByEmail = (req, res, email) => {
  try {
    console.log(req.headers.authorization);
    console.log(`Buscando usuário com email: ${email}`);


    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userData } = user; // Remove a senha do retorno
    res.json(userData);

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}

app.use(cors());
app.use(express.json());

// Rota para corrigir texto
app.post('/api/correct', async (req, res) => {
  const { text } = req.body;
  console.log(req.headers.authorization);
  try {
    const correctedText = await correctText(text);
    // const correctedText = await correctWithDeepSeek(text);

    const responseParsed = parseBotResponse(correctedText);

    res.json({ original: text, ...responseParsed });
  } catch (error) {

    console.error("Erro ao processar o texto:", error);

    res.status(500).json({ error: "Erro ao processar o texto" });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, role, isActive, bio } = req.body;

  try {
    // Verifica se o usuário já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Cria um novo usuário
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: role || UserRoles.COMMON,
      bio: bio || '',
      isActive: isActive !== undefined ? isActive : 1,
      lastAccess: new Date().toISOString().split('T')[0],
      correctedTexts: 0,
    };

    users.push(newUser);

    res.status(201).json(newUser);

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.get('/api/users', (req, res) => {
  try {

    console.log(req.headers.authorization);


    const { email } = req.query;

    if (email?.length) {
      return getUserByEmail(req, res, email);
    }

    // Retorna a lista de usuários com informações básicas
    const userList = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastAccess: user.lastAccess,
      correctedTexts: user.correctedTexts,
    }));

    res.status(200).json(userList);

  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  try {
    const user = users.find(u => u.id === parseInt(id));
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = createJwtToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });

  } catch (error) {
    console.error("Erro ao processar o login:", error);
    res.status(500).json({ error: "Erro ao processar o login" });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, isActive, bio } = req.body;

  try {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[userIndex];


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

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula uma operação assíncrona

    const updatedUser = Object.assign({}, users[userIndex], updatePayload);
    users[userIndex] = {
      ...updatedUser,
    };

    console.log(updatedUser);


    res.json(updatedUser);

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});


app.patch('/api/users/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  try {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualiza os dados do usuário
    const updatedUser = {
      ...users[userIndex],
      name,
      email,
      bio
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula uma operação assíncrona

    users[userIndex] = updatedUser;
    res.json(updatedUser);

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

app.patch('/api/users/change-password/:id', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[userIndex];
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: 'Senha antiga incorreta' });
    }

    // Atualiza a senha do usuário
    user.password = newPassword;

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula uma operação assíncrona

    res.json({ message: 'Senha atualizada com sucesso' });

  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    res.status(500).json({ error: "Erro ao atualizar senha" });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula uma operação assíncrona

    users.splice(userIndex, 1);
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));