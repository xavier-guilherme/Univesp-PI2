const express = require('express');
const db = require('./db');
const authRoutes = require('./routes/auth'); // Importa nossas rotas de autenticação

const app = express();
const port = 3000;

// Middleware para o Express entender JSON
app.use(express.json());

// Diz ao Express para usar o roteador de autenticação
// Todas as rotas em auth.js terão o prefixo /auth
app.use('/auth', authRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.send('Back-end da Canoa Caiçara funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});