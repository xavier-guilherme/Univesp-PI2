const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// Rota POST para um usuário agendar uma aula
// URL: /api/agendamentos
router.post('/', verifyToken, async (req, res) => {
  const { aula_id } = req.body;
  const usuario_id = req.user.userId; // Pegamos o ID do usuário logado através do token

  if (!aula_id) {
    return res.status(400).json({ error: 'O ID da aula é obrigatório.' });
  }

  try {
    // --- Lógica de Validação ---

    // 1. Verificar se a aula existe
    const aulaResult = await db.query('SELECT * FROM aulas WHERE id = $1', [aula_id]);
    if (aulaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }
    const aula = aulaResult.rows[0];

    // 2. Verificar se o usuário já está agendado nesta aula
    const agendamentoExistente = await db.query(
      'SELECT * FROM agendamentos WHERE usuario_id = $1 AND aula_id = $2',
      [usuario_id, aula_id]
    );
    if (agendamentoExistente.rows.length > 0) {
      return res.status(409).json({ error: 'Você já está agendado nesta aula.' }); // 409 Conflict
    }

    // 3. Verificar se ainda há vagas
    const agendamentosCountResult = await db.query('SELECT COUNT(*) FROM agendamentos WHERE aula_id = $1', [aula_id]);
    const vagasOcupadas = parseInt(agendamentosCountResult.rows[0].count);

    if (vagasOcupadas >= aula.vagas_totais) {
      return res.status(400).json({ error: 'Não há mais vagas para esta aula.' });
    }

    // --- Fim da Validação ---

    // Se passou por todas as validações, cria o agendamento
    const newAgendamento = await db.query(
      'INSERT INTO agendamentos (usuario_id, aula_id) VALUES ($1, $2) RETURNING *',
      [usuario_id, aula_id]
    );

    res.status(201).json({
      message: 'Agendamento realizado com sucesso!',
      agendamento: newAgendamento.rows[0],
    });

  } catch (err) {
    console.error('Erro ao criar agendamento:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;