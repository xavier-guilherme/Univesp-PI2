const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Middleware para autenticar token (versão simplificada)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Espera 'Bearer <token>'
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.userId = payload.userId;

    // Carrega perfil do usuário autenticado
    try {
      const result = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE id = $1', [req.userId]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
      req.user = result.rows[0];
      next();
    } catch (e) {
      console.error('Erro ao buscar usuário no middleware:', e);
      return res.status(500).json({ error: 'Erro interno' });
    }
  });
}

// GET /api/user/profile - MANTÉM COMPATIBILIDADE (rota original)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    return res.status(200).json({
      id: req.user.id,
      nome: req.user.nome,
      email: req.user.email,
      perfil: req.user.perfil
    });
  } catch (err) {
    console.error('Erro em /profile:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// GET /api/user/me - dados do usuário logado (nova rota)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    return res.status(200).json({
      id: req.user.id,
      nome: req.user.nome,
      email: req.user.email,
      perfil: req.user.perfil
    });
  } catch (err) {
    console.error('Erro em /me:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/user/create - criar aluno (apenas admin)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // Permissão apenas admin
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    // Hash de senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Por padrão, novos cadastros feitos pelo admin serão perfil 'aluno'
    const q = `
      INSERT INTO usuarios (nome, email, senha, perfil)
      VALUES ($1, $2, $3, 'aluno')
      RETURNING id, nome, email, perfil
    `;
    const result = await db.query(q, [nome, email, senhaHash]);

    return res.status(201).json({
      message: 'Aluno criado com sucesso!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Erro em /create:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
