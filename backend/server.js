// Importa o framework Express
const express = require('express');

// Cria a aplicação
const app = express();
const port = 3000; // A porta que o servidor vai "ouvir"

// Cria uma rota de teste
app.get('/', (req, res) => {
  res.send('Olá, mundo! Meu back-end está funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});