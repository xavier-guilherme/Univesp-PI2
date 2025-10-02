const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware'); // Nosso "segurança"

// Rota GET para buscar o perfil do usuário logado
// URL: /api/user/profile
// Esta rota está protegida pelo middleware verifyToken
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // O ID do usuário foi adicionado à requisição (req.user) pelo nosso middleware
    const userId = req.user.userId;

    const userData = await db.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [userId]);

    if (userData.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json(userData.rows[0]);

  } catch (err) {
    console.error('Erro ao buscar perfil:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;