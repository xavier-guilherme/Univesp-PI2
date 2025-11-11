-- ============================================
-- SCHEMA DO BANCO DE DADOS - CANOA CAIÇARA
-- Sistema de Agendamento de Aulas
-- Univesp PI2 - 2025
-- ============================================

-- Database: canoa_caicara
-- PostgreSQL version: 14+

-- ============================================
-- TABELA: users
-- Armazena os dados dos usuários do sistema
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    perfil VARCHAR(20) DEFAULT 'aluno' CHECK (perfil IN ('aluno', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_perfil ON users(perfil);

-- ============================================
-- TABELA: aulas
-- Armazena as aulas disponíveis para agendamento
-- ============================================

CREATE TABLE IF NOT EXISTS aulas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    instrutor VARCHAR(100) NOT NULL,
    vagas_total INTEGER NOT NULL CHECK (vagas_total > 0),
    local VARCHAR(200),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX idx_aulas_data ON aulas(data);
CREATE INDEX idx_aulas_instrutor ON aulas(instrutor);
CREATE INDEX idx_aulas_data_hora ON aulas(data, hora_inicio);

-- ============================================
-- TABELA: agendamentos
-- Armazena os agendamentos dos alunos
-- ============================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, aula_id) -- Impede agendamento duplicado
);

-- Índices para otimização de consultas
CREATE INDEX idx_agendamentos_usuario ON agendamentos(usuario_id);
CREATE INDEX idx_agendamentos_aula ON agendamentos(aula_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_usuario_status ON agendamentos(usuario_id, status);

-- ============================================
-- TABELA: checkins
-- Armazena os check-ins realizados pelos alunos
-- ============================================

CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    hora_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agendamento_id) -- Impede check-in duplicado
);

-- Índices para otimização de consultas
CREATE INDEX idx_checkins_agendamento ON checkins(agendamento_id);
CREATE INDEX idx_checkins_hora ON checkins(hora_checkin);

-- ============================================
-- VIEWS (Visualizações)
-- Facilitam consultas complexas
-- ============================================

-- View: Vagas disponíveis por aula
CREATE OR REPLACE VIEW vw_vagas_disponiveis AS
SELECT 
    a.id AS aula_id,
    a.titulo,
    a.data,
    a.hora_inicio,
    a.hora_fim,
    a.vagas_total,
    COUNT(ag.id) FILTER (WHERE ag.status = 'confirmado') AS vagas_ocupadas,
    a.vagas_total - COUNT(ag.id) FILTER (WHERE ag.status = 'confirmado') AS vagas_disponiveis
FROM aulas a
LEFT JOIN agendamentos ag ON a.id = ag.aula_id
GROUP BY a.id, a.titulo, a.data, a.hora_inicio, a.hora_fim, a.vagas_total;

-- View: Agendamentos com detalhes completos
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT 
    ag.id AS agendamento_id,
    ag.usuario_id,
    u.nome AS usuario_nome,
    u.email AS usuario_email,
    ag.aula_id,
    a.titulo AS aula_titulo,
    a.data AS aula_data,
    a.hora_inicio,
    a.hora_fim,
    a.instrutor,
    ag.status,
    CASE WHEN c.id IS NOT NULL THEN true ELSE false END AS checkin_realizado,
    c.hora_checkin,
    ag.created_at AS data_agendamento
FROM agendamentos ag
INNER JOIN users u ON ag.usuario_id = u.id
INNER JOIN aulas a ON ag.aula_id = a.id
LEFT JOIN checkins c ON ag.id = c.agendamento_id;

-- ============================================
-- FUNCTIONS (Funções)
-- Automatizam lógica de negócio
-- ============================================

-- Função: Atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- Automatizam ações no banco
-- ============================================

-- Trigger: Atualizar updated_at na tabela users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Atualizar updated_at na tabela aulas
DROP TRIGGER IF EXISTS update_aulas_updated_at ON aulas;
CREATE TRIGGER update_aulas_updated_at
    BEFORE UPDATE ON aulas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Atualizar updated_at na tabela agendamentos
DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- Descomente para inserir dados de exemplo
-- ============================================

-- Inserir usuário administrador padrão
-- IMPORTANTE: Altere a senha em produção!
-- Senha padrão: admin123 (hash bcrypt com salt de 10 rounds)
/*
INSERT INTO users (nome, email, senha, perfil) VALUES 
('Administrador', 'admin@canoacaicara.com', '$2b$10$example_hash_here', 'admin');
*/

-- Inserir alguns usuários de teste
/*
INSERT INTO users (nome, email, senha, telefone, perfil) VALUES 
('João Silva', 'joao@exemplo.com', '$2b$10$example_hash', '(13) 99999-1111', 'aluno'),
('Maria Santos', 'maria@exemplo.com', '$2b$10$example_hash', '(13) 99999-2222', 'aluno'),
('Pedro Oliveira', 'pedro@exemplo.com', '$2b$10$example_hash', '(13) 99999-3333', 'aluno');
*/

-- Inserir aulas de exemplo
/*
INSERT INTO aulas (titulo, descricao, data, hora_inicio, hora_fim, instrutor, vagas_total, local) VALUES
('Aula de Canoa - Manhã Iniciantes', 'Aula para iniciantes focada em técnicas básicas', '2025-11-20', '08:00', '10:00', 'Prof. Carlos', 10, 'Praia do José Menino'),
('Aula de Canoa - Tarde Avançado', 'Aula avançada com remada longa', '2025-11-20', '14:00', '16:00', 'Prof. Ana', 8, 'Praia do Gonzaga'),
('Aula de Canoa - Fim de Tarde', 'Aula especial ao pôr do sol', '2025-11-21', '17:00', '19:00', 'Prof. Roberto', 12, 'Praia de Itararé');
*/

-- ============================================
-- CONSULTAS ÚTEIS
-- ============================================

-- Listar todas as aulas com vagas disponíveis
-- SELECT * FROM vw_vagas_disponiveis WHERE vagas_disponiveis > 0 ORDER BY data, hora_inicio;

-- Listar agendamentos futuros de um aluno
-- SELECT * FROM vw_agendamentos_completos WHERE usuario_id = 1 AND aula_data >= CURRENT_DATE ORDER BY aula_data;

-- Contar total de agendamentos por aula
-- SELECT aula_id, COUNT(*) as total FROM agendamentos WHERE status = 'confirmado' GROUP BY aula_id;

-- Listar alunos que fizeram check-in em uma aula específica
-- SELECT u.nome, u.email, c.hora_checkin FROM checkins c
-- JOIN agendamentos ag ON c.agendamento_id = ag.id
-- JOIN users u ON ag.usuario_id = u.id
-- WHERE ag.aula_id = 1;

-- ============================================
-- MANUTENÇÃO
-- ============================================

-- Limpar agendamentos cancelados antigos (opcional, executar periodicamente)
-- DELETE FROM agendamentos WHERE status = 'cancelado' AND updated_at < CURRENT_DATE - INTERVAL '90 days';

-- Verificar integridade do banco
-- VACUUM ANALYZE;

-- ============================================
-- PERMISSÕES (OPCIONAL)
-- Configure conforme necessário para produção
-- ============================================

-- Criar usuário da aplicação (apenas leitura/escrita nas tabelas necessárias)
/*
CREATE USER canoa_app WITH PASSWORD 'senha_forte_aqui';
GRANT CONNECT ON DATABASE canoa_caicara TO canoa_app;
GRANT USAGE ON SCHEMA public TO canoa_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO canoa_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO canoa_app;
*/

-- ============================================
-- BACKUP E RESTORE
-- ============================================

-- Para fazer backup do schema:
-- pg_dump -U postgres -s -d canoa_caicara > schema.sql

-- Para fazer backup completo (schema + dados):
-- pg_dump -U postgres -d canoa_caicara > backup_completo.sql

-- Para restaurar:
-- psql -U postgres -d canoa_caicara < schema.sql

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. SEGURANÇA:
--    - Altere a senha do usuário admin padrão imediatamente
--    - Use senhas fortes com bcrypt (mínimo 10 rounds de salt)
--    - Configure SSL/TLS para conexões em produção

-- 2. PERFORMANCE:
--    - Os índices foram criados nas colunas mais consultadas
--    - Execute VACUUM ANALYZE periodicamente
--    - Monitore queries lentas e adicione índices conforme necessário

-- 3. BACKUP:
--    - Configure backups automáticos diários
--    - Teste a restauração dos backups periodicamente
--    - Mantenha backups em local seguro (ex: Azure Backup)

-- 4. MONITORAMENTO:
--    - Monitore o uso de conexões
--    - Verifique o tamanho das tabelas regularmente
--    - Configure alertas para erros críticos

-- ============================================
-- FIM DO SCHEMA
-- ============================================
