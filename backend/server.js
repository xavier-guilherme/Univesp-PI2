const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

// Nossas rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aulasRoutes = require('./routes/aulas');
const agendamentosRoutes = require('./routes/agendamentos');
const checkinsRoutes = require('./routes/checkins');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos do front-end (index.html, css/, js/, etc.)
app.use(express.static(path.join(__dirname, '..')));

// Configuração das Rotas
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/checkins', checkinsRoutes);

// Rota principal (NÃO PRECISA MAIS, O express.static vai servir o index.html)
/*
app.get('/', (req, res) => {
  res.send('Back-end da Canoa Caiçara funcionando!');
});
*/

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`); 
});