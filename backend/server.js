const express = require('express');
const db = require('./db');

// Nossas rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aulasRoutes = require('./routes/aulas');
const agendamentosRoutes = require('./routes/agendamentos'); // <-- Importa as rotas de agendamentos

const app = express();
const port = 3000;

// Middlewares
app.use(express.json());

// Configuração das Rotas
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/agendamentos', agendamentosRoutes); // <-- Usa as rotas de agendamentos

// Rota principal
app.get('/', (req, res) => {
  res.send('Back-end da Canoa Caiçara funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});