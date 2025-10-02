const express = require('express');
const db = require('./db');

// Nossas rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // <-- Importa as rotas de usuário

const app = express();
const port = 3000;

// Middlewares
app.use(express.json());

// Configuração das Rotas
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes); // <-- Usa as rotas de usuário com o prefixo /api/user

// Rota principal
app.get('/', (req, res) => {
  res.send('Back-end da Canoa Caiçara funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});