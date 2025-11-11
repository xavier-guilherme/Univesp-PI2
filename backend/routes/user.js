const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Middleware para autenticar token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.userId = payload.userId;

    try {
      // ✅ Buscar TODOS os campos
      const result = await db.query(
        'SELECT id, nome, email, telefone, data_nascimento, perfil FROM usuarios WHERE id = $1',
        [req.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      req.user = result.rows[0];
      next();
    } catch (e) {
      console.error('Erro ao buscar usuário no middleware:', e);
      return res.status(500).json({ error: 'Erro interno' });
    }
  });
}

// GET /api/user/profile - VERSÃO COMPLETA COM TODOS OS CAMPOS
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // 🔍 Buscar TODOS os campos do usuário no banco
    const result = await db.query(
      'SELECT id, nome, email, telefone, data_nascimento, perfil FROM usuarios WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const user = result.rows[0];

    return res.status(200).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      data_nascimento: user.data_nascimento,
      perfil: user.perfil
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

// PUT /api/user/profile - Atualizar perfil do usuário autenticado
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome, telefone, data_nascimento } = req.body;

    // Apenas atualizar campos que existem no banco.
    const q = `
      UPDATE usuarios
         SET nome = $1,
             telefone = $2,
             data_nascimento = $3
       WHERE id = $4
       RETURNING id, nome, email, telefone, data_nascimento, perfil
    `;
    const result = await db.query(q, [nome, telefone || null, data_nascimento || null, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;
