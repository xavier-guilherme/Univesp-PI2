const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware'); // Nosso "segurança"

// Rota GET para listar todas as aulas disponíveis
// URL: /api/aulas
// Esta é uma rota pública, todos podem ver as aulas.
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM aulas ORDER BY data_hora ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar aulas:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota POST para criar uma nova aula
// URL: /api/aulas
// Rota protegida: Apenas usuários logados podem criar aulas (no futuro, podemos restringir a admins).
router.post('/', verifyToken, async (req, res) => {
  const { nome, instrutor, data_hora, vagas_totais } = req.body;

  if (!nome || !data_hora || !vagas_totais) {
    return res.status(400).json({ error: 'Nome, data_hora e vagas_totais são obrigatórios.' });
  }

  try {
    const newAula = await db.query(
      'INSERT INTO aulas (nome, instrutor, data_hora, vagas_totais) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, instrutor, data_hora, vagas_totais]
    );
    res.status(201).json(newAula.rows[0]);
  } catch (err) {
    console.error('Erro ao criar aula:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;