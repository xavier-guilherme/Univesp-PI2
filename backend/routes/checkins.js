const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.userId = payload.userId;

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

// GET /api/checkins - Listar todos os check-ins (apenas admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }

    const { aula_id } = req.query;
    
    let query = `
      SELECT 
        ch.*,
        u.nome as aluno_nome,
        u.email as aluno_email,
        au.nome as aula_nome
      FROM checkins ch
      INNER JOIN usuarios u ON ch.usuario_id = u.id
      INNER JOIN aulas au ON ch.aula_id = au.id
    `;
    
    const params = [];
    
    if (aula_id) {
      query += ' WHERE ch.aula_id = $1';
      params.push(aula_id);
    }
    
    query += ' ORDER BY ch.data_checkin DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar check-ins:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
