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

// GET /api/agendamentos/meus - Listar agendamentos do usuário logado
router.get('/meus', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        ag.id as agendamento_id,
        ag.created_at as data_agendamento,
        au.id as aula_id,
        au.nome as aula_nome,
        au.instrutor,
        au.data_hora,
        au.vagas_totais,
        au.tipo_aula,
        (SELECT COUNT(*) FROM checkins WHERE agendamento_id = ag.id) as checkin_feito
      FROM agendamentos ag
      INNER JOIN aulas au ON ag.aula_id = au.id
      WHERE ag.usuario_id = $1
      ORDER BY au.data_hora DESC`,
      [req.userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/agendamentos - Criar novo agendamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { aula_id } = req.body;

    if (!aula_id) {
      return res.status(400).json({ error: 'aula_id é obrigatório' });
    }

    // Verificar se aula existe e buscar vagas
    const aulaResult = await db.query(
      `SELECT 
        au.*,
        (au.vagas_totais - COUNT(ag.id)) as vagas_disponiveis
      FROM aulas au
      LEFT JOIN agendamentos ag ON au.id = ag.aula_id
      WHERE au.id = $1
      GROUP BY au.id`,
      [aula_id]
    );

    if (aulaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    const aula = aulaResult.rows[0];

    // Verificar se há vagas disponíveis
    if (aula.vagas_disponiveis <= 0) {
      return res.status(400).json({ error: 'Não há vagas disponíveis para esta aula' });
    }

    // Verificar se já tem agendamento
    const agendamentoExistente = await db.query(
      'SELECT * FROM agendamentos WHERE usuario_id = $1 AND aula_id = $2',
      [req.userId, aula_id]
    );

    if (agendamentoExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Você já tem um agendamento para esta aula' });
    }

    // Criar agendamento
    const result = await db.query(
      'INSERT INTO agendamentos (usuario_id, aula_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
      [req.userId, aula_id]
    );

    res.status(201).json({
      message: 'Agendamento realizado com sucesso!',
      agendamento: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/agendamentos/:id/checkin - Fazer check-in
router.post('/:id/checkin', authenticateToken, async (req, res) => {
  try {
    const agendamentoId = req.params.id;
    const { localizacao_lat, localizacao_lng } = req.body;

    // Verificar se agendamento existe e pertence ao usuário
    const agendamento = await db.query(
      `SELECT ag.*, au.data_hora, au.nome as aula_nome
       FROM agendamentos ag
       INNER JOIN aulas au ON ag.aula_id = au.id
       WHERE ag.id = $1 AND ag.usuario_id = $2`,
      [agendamentoId, req.userId]
    );

    if (agendamento.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado ou não pertence a você' });
    }

    const aula = agendamento.rows[0];

    // Verificar se já fez check-in
    const checkinExistente = await db.query(
      'SELECT * FROM checkins WHERE agendamento_id = $1',
      [agendamentoId]
    );

    if (checkinExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Check-in já realizado para este agendamento' });
    }

    // Verificar horário (30 min antes e depois da aula)
    const horarioAula = new Date(aula.data_hora);
    const agora = new Date();
    const diffMinutos = (horarioAula - agora) / 1000 / 60;

    if (diffMinutos > 30 || diffMinutos < -30) {
      return res.status(400).json({ 
        error: 'Check-in só pode ser feito 30 minutos antes ou depois do horário da aula',
        horario_aula: horarioAula,
        agora: agora
      });
    }

    // Criar check-in
    const result = await db.query(
      `INSERT INTO checkins (agendamento_id, usuario_id, aula_id, data_checkin, localizacao_lat, localizacao_lng)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5)
       RETURNING *`,
      [agendamentoId, req.userId, aula.aula_id, localizacao_lat || null, localizacao_lng || null]
    );

    res.status(201).json({
      message: 'Check-in realizado com sucesso!',
      checkin: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao fazer check-in:', err);
    res.status(500).json({ error: 'Erro interno do servidor: ' + err.message });
  }
});

// DELETE /api/agendamentos/:id - Cancelar agendamento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const agendamentoId = req.params.id;

    const result = await db.query(
      'DELETE FROM agendamentos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [agendamentoId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado ou não pertence a você' });
    }

    res.json({
      message: 'Agendamento cancelado com sucesso!',
      agendamento: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
