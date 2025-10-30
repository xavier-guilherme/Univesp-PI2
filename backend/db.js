// Carrega as variáveis de ambiente do arquivo .env APENAS se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Importa o cliente do PostgreSQL
const { Pool } = require('pg');

// Configura o "Pool" de conexões com o banco de dados
// Ele vai ler as variáveis a partir do seu arquivo .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exporta uma função para que possamos fazer queries de qualquer lugar do código
module.exports = {
  query: (text, params) => pool.query(text, params),
};