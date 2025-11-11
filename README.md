# Sistema de Agendamento de Aulas - Canoa Caiçara

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-v5.1-blue.svg" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-v14+-blue.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Azure-Deploy-blue.svg" alt="Azure">
  <img src="https://img.shields.io/badge/License-ISC-yellow.svg" alt="License">
</p>

## 📋 Sobre o Projeto

Sistema web desenvolvido para automatizar o agendamento de aulas de canoa havaiana da empresa **Canoa Caiçara** (Santos/SP), substituindo o processo manual realizado via WhatsApp por uma solução profissional, escalável e acessível.

O sistema oferece controle completo de agendamentos, gerenciamento de usuários com diferentes perfis (administrador e aluno), sistema de check-in para presença, modo escuro/claro e deploy em nuvem (Azure).

**🌐 Acesso em Produção:** [https://canoacaicara.azurewebsites.net](https://canoacaicara.azurewebsites.net)

---

## ✨ Funcionalidades

### Para Alunos
- ✅ Cadastro e autenticação com JWT
- ✅ Visualização de aulas disponíveis
- ✅ Agendamento de aulas considerando disponibilidade
- ✅ Cancelamento e reagendamento de aulas
- ✅ Check-in antes do início da aula
- ✅ Visualização do histórico de agendamentos
- ✅ Edição de perfil pessoal
- ✅ Modo escuro/claro

### Para Administradores
- ✅ Criação, edição e exclusão de aulas
- ✅ Gerenciamento de todos os agendamentos
- ✅ Visualização de check-ins realizados
- ✅ Controle completo de usuários
- ✅ Dashboard administrativo

---

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** (v5.1) - Framework web minimalista
- **PostgreSQL** (v14+) - Banco de dados relacional
- **bcrypt** (v6.0) - Criptografia de senhas
- **jsonwebtoken** (v9.0) - Autenticação JWT
- **dotenv** (v17.2) - Gerenciamento de variáveis de ambiente
- **pg** (v8.16) - Driver PostgreSQL para Node.js

### Front-end
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva e modo escuro
- **JavaScript ES6+** - Interatividade e requisições AJAX
- **AOS (Animate On Scroll)** - Animações

### Infraestrutura
- **Git/GitHub** - Controle de versão
- **Azure App Service** - Hospedagem da aplicação
- **Azure Database for PostgreSQL** - Banco de dados gerenciado
- **GitHub Actions** - CI/CD automatizado

---

## 📁 Estrutura do Projeto

```
Univesp-PI2/
├── backend/
│   ├── routes/
│   │   ├── auth.js              # Autenticação (login/cadastro)
│   │   ├── user.js              # Gerenciamento de usuários
│   │   ├── aulas.js             # CRUD de aulas
│   │   ├── agendamentos.js      # Agendamentos de aulas
│   │   └── checkins.js          # Sistema de check-in
│   ├── db.js                    # Configuração do PostgreSQL
│   ├── server.js                # Servidor Express principal
│   └── package.json             # Dependências do back-end
├── css/
│   └── style.css                # Estilos globais com modo escuro
├── js/
│   ├── script.js                # Navegação SPA e utilitários
│   ├── login.js                 # Lógica de autenticação
│   ├── cadastro.js              # Cadastro de usuários
│   ├── perfil.js                # Edição de perfil
│   ├── aulas.js                 # Listagem e gerenciamento de aulas
│   ├── agendar-aulas.js         # Agendamento de aulas
│   ├── meus-agendamentos.js     # Histórico de agendamentos
│   ├── admin-aulas.js           # Admin: CRUD de aulas
│   ├── admin-agendamentos.js    # Admin: Gerenciamento de agendamentos
│   └── admin-checkins.js        # Admin: Visualização de check-ins
├── paginas/
│   ├── home.html                # Página inicial pública
│   ├── login.html               # Página de login
│   ├── cadastro.html            # Página de cadastro
│   ├── perfil.html              # Perfil do usuário
│   ├── aulas.html               # Listagem de aulas (aluno)
│   ├── agendar-aulas.html       # Interface de agendamento
│   ├── meus-agendamentos.html   # Histórico (aluno)
│   └── admin/
│       ├── aulas.html           # Admin: Gerenciar aulas
│       ├── agendamentos.html    # Admin: Gerenciar agendamentos
│       └── checkins.html        # Admin: Visualizar check-ins
├── imagens/                     # Assets visuais
├── docs/                        # Documentação adicional
├── index.html                   # Ponto de entrada (SPA)
├── package.json                 # Dependências do front-end
└── .gitignore                   # Arquivos ignorados pelo Git
```

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (versão 14 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **pgAdmin 4** (opcional, para gerenciamento visual do banco) - [Download](https://www.pgadmin.org/)

---

## 🚀 Instalação e Configuração Local

### 1. Clone o Repositório

```bash
git clone https://github.com/xavier-guilherme/Univesp-PI2.git
cd Univesp-PI2
```

### 2. Configure o Banco de Dados PostgreSQL

#### Opção A: Usando pgAdmin 4
1. Abra o **pgAdmin 4**
2. Conecte-se ao seu servidor PostgreSQL local
3. Crie um novo banco de dados chamado `canoa_caicara`:
   - Clique com botão direito em "Databases" > "Create" > "Database..."
   - Nome: `canoa_caicara`
   - Clique em "Save"

#### Opção B: Usando linha de comando
```bash
psql -U postgres
CREATE DATABASE canoa_caicara;
\q
```

### 3. Importe o Schema do Banco de Dados

Execute o arquivo `database/schema.sql` (será criado na etapa de documentação):

```bash
# Usando psql
psql -U postgres -d canoa_caicara -f database/schema.sql

# OU usando pgAdmin 4
# Tools > Query Tool > Open File > Selecionar schema.sql > Execute
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```bash
cd backend
touch .env
```

Adicione as seguintes variáveis (ajuste conforme seu ambiente):

```env
# Configuração do Banco de Dados Local
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/canoa_caicara

# Configuração JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_minimo_32_caracteres

# Porta do Servidor
PORT=3000
```

**⚠️ IMPORTANTE:** 
- Substitua `SUA_SENHA` pela senha do seu usuário PostgreSQL
- Gere uma chave JWT forte e única para `JWT_SECRET`
- Nunca compartilhe o arquivo `.env` (ele está no `.gitignore`)

### 5. Instale as Dependências

```bash
# Instalar dependências do back-end
cd backend
npm install

# Voltar para raiz (se quiser instalar deps do front)
cd ..
npm install
```

### 6. Inicie o Servidor

```bash
cd backend
npm start
```

Você verá a mensagem:
```
Servidor rodando na porta 3000
```

### 7. Acesse a Aplicação

Abra seu navegador e acesse:
```
http://localhost:3000
```

---

## 🌐 Deploy na Azure

### Pré-requisitos Azure
- Conta Azure ativa ([criar conta gratuita](https://azure.microsoft.com/free/))
- Azure CLI instalado ([instalar](https://learn.microsoft.com/cli/azure/install-azure-cli))

### Passo a Passo

#### 1. Criar Azure Database for PostgreSQL

```bash
# Login na Azure
az login

# Criar grupo de recursos
az group create --name canoa-caicara-rg --location brazilsouth

# Criar servidor PostgreSQL
az postgres flexible-server create \
  --resource-group canoa-caicara-rg \
  --name canoacaicara-db \
  --location brazilsouth \
  --admin-user admincanoa \
  --admin-password SUA_SENHA_FORTE \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

# Criar banco de dados
az postgres flexible-server db create \
  --resource-group canoa-caicara-rg \
  --server-name canoacaicara-db \
  --database-name canoa_caicara

# Configurar firewall para permitir acesso Azure
az postgres flexible-server firewall-rule create \
  --resource-group canoa-caicara-rg \
  --name canoacaicara-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### 2. Obter String de Conexão

```bash
az postgres flexible-server show-connection-string \
  --server-name canoacaicara-db \
  --database-name canoa_caicara \
  --admin-user admincanoa
```

Copie a string `node.js` fornecida.

#### 3. Criar App Service

```bash
# Criar App Service Plan
az appservice plan create \
  --name canoa-caicara-plan \
  --resource-group canoa-caicara-rg \
  --sku B1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group canoa-caicara-rg \
  --plan canoa-caicara-plan \
  --name canoacaicara \
  --runtime "NODE:18-lts"
```

#### 4. Configurar Variáveis de Ambiente no Azure

```bash
# Configurar DATABASE_URL
az webapp config appsettings set \
  --resource-group canoa-caicara-rg \
  --name canoacaicara \
  --settings DATABASE_URL="COLE_SUA_STRING_DE_CONEXAO_AQUI"

# Configurar JWT_SECRET
az webapp config appsettings set \
  --resource-group canoa-caicara-rg \
  --name canoacaicara \
  --settings JWT_SECRET="sua_chave_jwt_super_segura"

# Configurar PORT
az webapp config appsettings set \
  --resource-group canoa-caicara-rg \
  --name canoacaicara \
  --settings PORT="8080"
```

#### 5. Deploy via Git

```bash
# Configurar Git no Azure
az webapp deployment source config-local-git \
  --name canoacaicara \
  --resource-group canoa-caicara-rg

# Adicionar remote do Azure ao repositório local
git remote add azure <URL_DO_GIT_FORNECIDA_PELO_COMANDO_ANTERIOR>

# Fazer push para Azure
git push azure main
```

#### 6. Importar Schema no Banco Azure

```bash
# Conectar ao banco Azure e importar schema
psql "postgres://admincanoa@canoacaicara-db:SUA_SENHA@canoacaicara-db.postgres.database.azure.com:5432/canoa_caicara?sslmode=require" -f database/schema.sql
```

---

## 📖 Uso do Sistema

### Login Inicial (Administrador)

Após a instalação, será necessário criar o primeiro usuário administrador diretamente no banco de dados:

```sql
-- Conectar ao banco
psql -U postgres -d canoa_caicara

-- Inserir admin (senha: admin123)
INSERT INTO users (nome, email, senha, perfil) 
VALUES (
  'Administrador', 
  'admin@canoacaicara.com', 
  '$2b$10$example_hash_here', 
  'admin'
);
```

**Obter hash bcrypt da senha:**
```javascript
// Execute no Node.js REPL (digite 'node' no terminal)
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(console.log);
```

### Fluxo de Uso - Aluno

1. **Cadastro:** Acesse `/paginas/cadastro.html` e crie sua conta
2. **Login:** Entre com email e senha
3. **Visualizar Aulas:** Navegue para "Aulas" no menu
4. **Agendar Aula:** Clique em "Agendar Aula" e selecione horário disponível
5. **Check-in:** No dia da aula, acesse "Meus Agendamentos" e faça check-in
6. **Histórico:** Visualize todas as suas aulas em "Meus Agendamentos"

### Fluxo de Uso - Administrador

1. **Login:** Entre com credenciais de administrador
2. **Criar Aulas:** Acesse "Admin > Aulas" e cadastre novas aulas
3. **Gerenciar Agendamentos:** Visualize e gerencie todos os agendamentos
4. **Monitorar Check-ins:** Acompanhe a presença dos alunos

---

## 🔐 Autenticação e Segurança

- **JWT (JSON Web Tokens):** Autenticação stateless com tokens de 24h de validade
- **Bcrypt:** Hash de senhas com salt de 10 rounds
- **CORS:** Configurado para aceitar requisições do front-end
- **Variáveis de Ambiente:** Credenciais sensíveis protegidas via `.env`
- **SQL Injection Prevention:** Queries parametrizadas via `pg`

---

## 🧪 Testes

### Testes Manuais Implementados

O projeto atualmente utiliza testes manuais conforme especificado no Relatório Parcial:

1. **Testes Funcionais:** Validação de cada funcionalidade (agendamento, cancelamento, check-in)
2. **Testes de Usabilidade:** Navegação e experiência do usuário
3. **Testes de Integração:** Comunicação front-end e back-end
4. **Testes de Acessibilidade:** Conformidade básica com WCAG

### Testes Automatizados (Em Implementação)

Planejamento para implementação de testes automatizados com Jest:

```bash
# Instalar dependências de teste
cd backend
npm install --save-dev jest supertest

# Executar testes (quando implementados)
npm test
```

---

## ♿ Acessibilidade

O sistema implementa práticas básicas de acessibilidade:

- ✅ Tags HTML semânticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- ✅ Textos alternativos em imagens
- ✅ Contraste adequado de cores (modo claro e escuro)
- ✅ Navegação por teclado funcional
- ⚠️ **Em auditoria:** Conformidade completa WCAG 2.1 nível AA

---

## 🤝 Contribuindo

Este projeto é parte do **Projeto Integrador II - Univesp (PJI240)**. Contribuições da equipe:

### Equipe de Desenvolvimento

- **Guilherme Xavier Fontes** - Polo Itanhaém
- **José de França Bueno** - Polo Santos
- **Luiz Guilherme Soares da Silva** - Polo Santos
- **Luiz Gustavo Almeida Romeiro** - Polo São Vicente
- **Marcus Luan Alonso Conde Soares** - Polo Guarujá
- **Renee Vanja Siqueira de Souza** - Polo Praia Grande
- **Simone de Sales Ribeiro Chalega** - Polo Praia Grande

### Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de comportamento
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

---

## 📝 Licença

Este projeto está sob a licença **ISC**.

---

## 📞 Contato e Suporte

**Empresa Cliente:** Canoa Caiçara - Santos/SP  
**Orientador:** Prof. Matheus Sanches de Sá Bergamo  
**Instituição:** UNIVESP - Universidade Virtual do Estado de São Paulo  
**Disciplina:** PJI240 - Projeto Integrador em Computação II  
**Repositório:** [https://github.com/xavier-guilherme/Univesp-PI2](https://github.com/xavier-guilherme/Univesp-PI2)

---

## 🙏 Agradecimentos

- **Canoa Caiçara** por ceder o ambiente real para desenvolvimento e testes
- **Prof. Matheus Sanches** pela orientação durante o projeto
- **Comunidade Node.js e PostgreSQL** pelas excelentes ferramentas open-source
- **Microsoft Azure** pela infraestrutura de hospedagem

---

## 📚 Referências

- [Documentação Node.js](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Azure App Service Docs](https://learn.microsoft.com/azure/app-service/)
- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

<p align="center">
  Desenvolvido com ❤️ pela equipe Univesp PI2 - 2025
</p>
