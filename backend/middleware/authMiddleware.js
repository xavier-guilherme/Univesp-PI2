const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // O token virá no cabeçalho da requisição (header)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Não autorizado (sem token)
  }

  // Verifica se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Proibido (token inválido)
    }

    // Se o token for válido, adicionamos o payload (os dados do usuário) à requisição
    req.user = user;

    // Passa para o próximo passo (a rota que o usuário quer acessar)
    next();
  });
}

module.exports = verifyToken;