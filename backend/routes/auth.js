const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const db = require('../db'); // Voltamos um nível para achar o db.js
const bcrypt = require('bcrypt');

// Rota POST para registrar um novo usuário
// URL: /auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação simples
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // 1. Gerar o hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 2. Inserir o novo usuário no banco de dados
    const newUser = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, email',
      [nome, email, senhaHash]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error('Erro no registro:', err.message);
    // Verifica se o erro é de email duplicado
    if (err.code === '23505') {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota POST para login de usuário
// URL: /auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação simples
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail and senha são obrigatórios.' });
  }

  try {
    // 1. Verificar se o usuário existe
    const user = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' }); // Usamos uma mensagem genérica por segurança
    }

    const usuarioEncontrado = user.rows[0];

    // 2. Comparar a senha enviada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 3. Gerar o Token JWT
    // O token conterá o ID do usuário (payload) para sabermos quem ele é nas futuras requisições
    const token = jwt.sign(
        { userId: usuarioEncontrado.id },
        process.env.JWT_SECRET, // Uma chave secreta para assinar o token
        { expiresIn: '1h' } // O token expira em 1 hora
    );

    // Adicionar o nome e perfil do usuário na resposta
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        name: usuarioEncontrado.nome,
        perfil: usuarioEncontrado.perfil
      }
    });

  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
