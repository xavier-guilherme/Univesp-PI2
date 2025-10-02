// Importa e configura o dotenv. DEVE SER A PRIMEIRA LINHA!
require('dotenv').config();

// Importa o framework Express
const express = require('express');

// Importa o Pool do 'pg' (gerenciador de conexões)
const { Pool } = require('pg');

// Cria a aplicação
const app = express();
const port = 3000;

// Cria uma instância do Pool de conexões usando as variáveis de ambiente
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Rota principal
app.get('/', (req, res) => {
  res.send('Olá, mundo! Meu back-end está funcionando!');
});

// Cria uma rota de teste para o banco de dados
app.get('/test-db', async (req, res) => {
  try {
    // Faz uma query simples para pegar a hora atual do banco
    const result = await pool.query('SELECT NOW()'); 
    res.send(`Conexão com o banco bem-sucedida! Hora do servidor do banco: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Erro ao executar a query no banco de dados', err.stack);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

// Inicia o servidor e testa a conexão com o banco
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  
  // Testa a conexão com o banco de dados ao iniciar o servidor
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('*** FALHA AO CONECTAR COM O POSTGRESQL ***', err.stack);
    } else {
        console.log('Conexão com o PostgreSQL estabelecida com sucesso!');
    }
  });
});