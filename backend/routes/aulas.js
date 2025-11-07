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

// GET /api/aulas - Listar todas as aulas com contagem de vagas
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        au.*,
        (au.vagas_totais - COUNT(ag.id)) as vagas_disponiveis
      FROM aulas au
      LEFT JOIN agendamentos ag ON au.id = ag.aula_id
      GROUP BY au.id
      ORDER BY au.data_hora`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar aulas:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/aulas/:id - Buscar aula específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM aulas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar aula:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/aulas - Criar nova aula (apenas admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }

    const { nome, instrutor, data_hora, vagas_totais, tipo_aula } = req.body;

    if (!nome || !data_hora || !vagas_totais) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, data_hora, vagas_totais' });
    }

    // Converte horário simples (HH:MM) para timestamp completo
    const dataHoraCompleta = new Date();
    const [hora, minuto] = data_hora.split(':');
    dataHoraCompleta.setHours(parseInt(hora), parseInt(minuto), 0, 0);

    const result = await db.query(
      `INSERT INTO aulas (nome, instrutor, data_hora, vagas_totais, tipo_aula, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [nome, instrutor || null, dataHoraCompleta, vagas_totais, tipo_aula || 'Regular']
    );

    res.status(201).json({
      message: 'Aula criada com sucesso!',
      aula: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao criar aula:', err);
    res.status(500).json({ error: 'Erro interno do servidor: ' + err.message });
  }
});

// PUT /api/aulas/:id - Atualizar aula (apenas admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }

    const { id } = req.params;
    const { nome, instrutor, data_hora, vagas_totais, tipo_aula } = req.body;

    // Converter horário para timestamp se fornecido
    let dataHoraCompleta = null;
    if (data_hora) {
      dataHoraCompleta = new Date();
      const [hora, minuto] = data_hora.split(':');
      dataHoraCompleta.setHours(parseInt(hora), parseInt(minuto), 0, 0);
    }

    const result = await db.query(
      `UPDATE aulas 
       SET nome = COALESCE($1, nome),
           instrutor = COALESCE($2, instrutor),
           data_hora = COALESCE($3, data_hora),
           vagas_totais = COALESCE($4, vagas_totais),
           tipo_aula = COALESCE($5, tipo_aula)
       WHERE id = $6
       RETURNING *`,
      [nome, instrutor, dataHoraCompleta, vagas_totais, tipo_aula, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    res.json({
      message: 'Aula atualizada com sucesso!',
      aula: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar aula:', err);
    res.status(500).json({ error: 'Erro interno do servidor: ' + err.message });
  }
});

// DELETE /api/aulas/:id - Deletar aula (apenas admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }

    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM aulas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    res.json({
      message: 'Aula deletada com sucesso!',
      aula: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao deletar aula:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
