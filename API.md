# Documentação da API REST - Canoa Caiçara

## 📋 Informações Gerais

**Base URL (Produção):** `https://canoacaicara.azurewebsites.net`  
**Base URL (Local):** `http://localhost:3000`  
**Formato de Dados:** JSON  
**Autenticação:** JWT Bearer Token  

---

## 🔐 Autenticação

### POST `/auth/login`

Realiza o login do usuário e retorna um token JWT.

**Requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@exemplo.com",
    "perfil": "aluno"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "error": "Email ou senha inválidos"
}
```

---

### POST `/auth/cadastro`

Registra um novo usuário no sistema.

**Requisição:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "senha": "senhaSegura123",
  "telefone": "(13) 98765-4321"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "userId": 5
}
```

**Resposta de Erro (409):**
```json
{
  "error": "Email já cadastrado"
}
```

---

## 👤 Usuários

### GET `/api/user/profile`

Retorna os dados do perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "(13) 99999-9999",
  "perfil": "aluno",
  "created_at": "2025-08-15T10:30:00.000Z"
}
```

**Resposta de Erro (401):**
```json
{
  "error": "Token inválido ou expirado"
}
```

---

### PUT `/api/user/profile`

Atualiza os dados do perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Requisição:**
```json
{
  "nome": "João da Silva Santos",
  "telefone": "(13) 91111-2222",
  "senha": "novaSenha123"
}
```

**Nota:** Todos os campos são opcionais. Envie apenas os que deseja atualizar.

**Resposta de Sucesso (200):**
```json
{
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": 1,
    "nome": "João da Silva Santos",
    "email": "joao@exemplo.com",
    "telefone": "(13) 91111-2222"
  }
}
```

---

## 📚 Aulas

### GET `/api/aulas`

Lista todas as aulas cadastradas (públicas).

**Query Parameters (opcionais):**
- `data` - Filtrar por data específica (formato: YYYY-MM-DD)
- `instrutor` - Filtrar por nome do instrutor

**Exemplo:** `/api/aulas?data=2025-11-15`

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "titulo": "Aula de Canoa - Manhã",
    "descricao": "Aula para iniciantes",
    "data": "2025-11-15",
    "hora_inicio": "08:00:00",
    "hora_fim": "10:00:00",
    "instrutor": "Prof. Carlos",
    "vagas_total": 10,
    "vagas_disponiveis": 3,
    "local": "Praia do José Menino"
  },
  {
    "id": 2,
    "titulo": "Aula de Canoa - Tarde",
    "descricao": "Aula avançada",
    "data": "2025-11-15",
    "hora_inicio": "14:00:00",
    "hora_fim": "16:00:00",
    "instrutor": "Prof. Ana",
    "vagas_total": 8,
    "vagas_disponiveis": 8,
    "local": "Praia do Gonzaga"
  }
]
```

---

### GET `/api/aulas/:id`

Retorna os detalhes de uma aula específica.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "titulo": "Aula de Canoa - Manhã",
  "descricao": "Aula para iniciantes focada em técnicas básicas de remada",
  "data": "2025-11-15",
  "hora_inicio": "08:00:00",
  "hora_fim": "10:00:00",
  "instrutor": "Prof. Carlos",
  "vagas_total": 10,
  "vagas_disponiveis": 3,
  "local": "Praia do José Menino",
  "observacoes": "Trazer protetor solar e água"
}
```

**Resposta de Erro (404):**
```json
{
  "error": "Aula não encontrada"
}
```

---

### POST `/api/aulas` 🔒 Admin

Cria uma nova aula (apenas administradores).

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Requisição:**
```json
{
  "titulo": "Aula de Canoa - Noite",
  "descricao": "Aula especial ao pôr do sol",
  "data": "2025-11-20",
  "hora_inicio": "17:00",
  "hora_fim": "19:00",
  "instrutor": "Prof. Roberto",
  "vagas_total": 12,
  "local": "Praia de Itararé",
  "observacoes": "Aula sujeita a condições climáticas"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Aula criada com sucesso",
  "aulaId": 15
}
```

---

### PUT `/api/aulas/:id` 🔒 Admin

Atualiza uma aula existente (apenas administradores).

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Requisição (todos os campos opcionais):**
```json
{
  "titulo": "Aula de Canoa - Noite (Atualizada)",
  "vagas_total": 15,
  "observacoes": "Aula confirmada - boas condições climáticas"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Aula atualizada com sucesso"
}
```

---

### DELETE `/api/aulas/:id` 🔒 Admin

Exclui uma aula (apenas administradores).

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Aula excluída com sucesso"
}
```

**Resposta de Erro (409):**
```json
{
  "error": "Não é possível excluir aula com agendamentos ativos"
}
```

---

## 📅 Agendamentos

### GET `/api/agendamentos` 🔒

Lista os agendamentos do usuário autenticado (alunos) ou todos os agendamentos (admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (apenas para admin):**
- `aula_id` - Filtrar por ID da aula
- `usuario_id` - Filtrar por ID do usuário
- `status` - Filtrar por status (confirmado, cancelado)

**Resposta de Sucesso (200) - Aluno:**
```json
[
  {
    "id": 10,
    "aula_id": 1,
    "aula_titulo": "Aula de Canoa - Manhã",
    "data": "2025-11-15",
    "hora_inicio": "08:00:00",
    "hora_fim": "10:00:00",
    "instrutor": "Prof. Carlos",
    "status": "confirmado",
    "checkin_realizado": false,
    "created_at": "2025-11-10T14:30:00.000Z"
  }
]
```

**Resposta de Sucesso (200) - Admin:**
```json
[
  {
    "id": 10,
    "aula_id": 1,
    "usuario_id": 5,
    "usuario_nome": "Maria Santos",
    "usuario_email": "maria@exemplo.com",
    "aula_titulo": "Aula de Canoa - Manhã",
    "data": "2025-11-15",
    "status": "confirmado",
    "checkin_realizado": true,
    "created_at": "2025-11-10T14:30:00.000Z"
  }
]
```

---

### POST `/api/agendamentos` 🔒

Cria um novo agendamento para a aula.

**Headers:**
```
Authorization: Bearer <token>
```

**Requisição:**
```json
{
  "aula_id": 1
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Agendamento realizado com sucesso",
  "agendamentoId": 25
}
```

**Resposta de Erro (409):**
```json
{
  "error": "Você já possui um agendamento para esta aula"
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Não há vagas disponíveis para esta aula"
}
```

---

### DELETE `/api/agendamentos/:id` 🔒

Cancela um agendamento existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Agendamento cancelado com sucesso"
}
```

**Resposta de Erro (403):**
```json
{
  "error": "Você não tem permissão para cancelar este agendamento"
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Não é possível cancelar agendamento com check-in realizado"
}
```

---

## ✅ Check-ins

### GET `/api/checkins` 🔒

Lista todos os check-ins (admin) ou apenas do usuário autenticado (aluno).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (apenas para admin):**
- `aula_id` - Filtrar por ID da aula
- `data` - Filtrar por data (YYYY-MM-DD)

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 5,
    "agendamento_id": 10,
    "usuario_nome": "Maria Santos",
    "aula_titulo": "Aula de Canoa - Manhã",
    "data": "2025-11-15",
    "hora_checkin": "2025-11-15T07:45:00.000Z"
  }
]
```

---

### POST `/api/checkins` 🔒

Realiza o check-in para um agendamento.

**Headers:**
```
Authorization: Bearer <token>
```

**Requisição:**
```json
{
  "agendamento_id": 10
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Check-in realizado com sucesso",
  "checkinId": 5
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Check-in pode ser feito apenas 30 minutos antes da aula"
}
```

**Resposta de Erro (409):**
```json
{
  "error": "Check-in já foi realizado para este agendamento"
}
```

---

## 📊 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos ou faltando |
| 401 | Unauthorized - Não autenticado ou token inválido |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já cadastrado) |
| 500 | Internal Server Error - Erro no servidor |

---

## 🔑 Autenticação JWT

### Como Usar

Após o login bem-sucedido, inclua o token JWT no header de todas as requisições autenticadas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Validade do Token

- **Duração:** 24 horas
- **Renovação:** Faça login novamente para obter um novo token

### Exemplo de Requisição com Token (JavaScript)

```javascript
fetch('https://canoacaicara.azurewebsites.net/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 🧪 Exemplos de Uso com cURL

### Login
```bash
curl -X POST https://canoacaicara.azurewebsites.net/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","senha":"senha123"}'
```

### Listar Aulas
```bash
curl https://canoacaicara.azurewebsites.net/api/aulas
```

### Criar Agendamento
```bash
curl -X POST https://canoacaicara.azurewebsites.net/api/agendamentos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"aula_id":1}'
```

### Obter Perfil
```bash
curl https://canoacaicara.azurewebsites.net/api/user/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📝 Notas Importantes

1. **CORS:** A API aceita requisições de qualquer origem em desenvolvimento. Em produção, configure adequadamente.
2. **Rate Limiting:** Não há limite de requisições implementado atualmente.
3. **Paginação:** As listagens retornam todos os resultados. Considere implementar paginação para grandes volumes.
4. **Timezone:** Todos os timestamps estão em UTC. Converta para o timezone local conforme necessário.

---

## 🐛 Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "error": "Descrição clara do erro",
  "details": "Informações adicionais (opcional)"
}
```

---

## 📞 Suporte

Em caso de dúvidas ou problemas com a API:

- **Repositório:** [https://github.com/xavier-guilherme/Univesp-PI2](https://github.com/xavier-guilherme/Univesp-PI2)
- **Issues:** [Reportar problema](https://github.com/xavier-guilherme/Univesp-PI2/issues)

---

<p align="center">
  Documentação da API - Sistema Canoa Caiçara | Univesp PI2 - 2025
</p>
