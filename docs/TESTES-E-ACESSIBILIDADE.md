# Testes Manuais e Acessibilidade - Projeto Integrador Canoa Caiçara

## Contexto
Este documento sintetiza as abordagens de **testes manuais** e **acessibilidade web** aplicadas ao sistema de agendamento de aulas da Canoa Caiçara, atendendo aos requisitos formais da disciplina PJI240 da UNIVESP e às diretrizes do Plano de Ação do grupo.

---

## 1. Testes Funcionais e de Usabilidade (Realizados Manualmente)

Todos os módulos críticos do sistema foram testados manualmente, cobrindo cenários reais de uso. Foram utilizados diferentes perfis de usuário (administrador e aluno).

### 1.1. Fluxos Testados
- Cadastro de usuário, login e autenticação
- Recuperação de senha esquecida
- Visualização e agendamento de aulas disponíveis
- Cancelamento e reagendamento de agendamentos
- Realização e validação do check-in antes da aula
- Ações administrativas: criação, edição, exclusão de aulas
- Perfil do usuário: edição de nome, telefone e senha
- Controle de acesso: diferentes menus e funções por perfil
- Respostas e mensagens de erro proposital (inputs inválidos)

### 1.2. Estratégia dos Testes Manuais
- Navegação completa via interface Web
- Testes realizados em navegadores distintos (Chrome, Edge, Firefox)
- Validação do comportamento responsivo (desktop e mobile)
- Execução de testes em ambiente produtivo (Azure) e local (localhost)

### 1.3. Resultados e Correções
- Pequenos bugs de validação foram identificados e corrigidos
- Recursos e mensagens inconsistentes sofreram ajustes após feedback real de usuários-teste
- Interface confirmou estabilidade após iterações

### 1.4. Justificativa Técnica
A disciplina PJI240 **não exige testes automatizados** como critério eliminatório. Priorizou-se o teste manual completo sobre fluxos reais por viabilizar a entrega de um software estável, funcional e contextualizado ao cliente. Não houve prejuízo à integridade da arquitetura do sistema.

---

## 2. Acessibilidade Web Aplicada

### 2.1. Práticas de Acessibilidade Implementadas
- Utilização de **tags HTML semânticas** (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<form>`, etc)
- Garantia de contraste suficiente entre textos e fundos em todos os modos (claro/escuro)
- Inclusão de textos alternativos (`alt`) em todas as imagens e elementos gráficos
- Navegação por teclado: toda interface pode ser percorrida somente com Tab/Enter
- Foco visível em todos os elementos navegáveis
- Hierarquia correta de títulos (`<h1>`, `<h2>`, `<h3>`) por página
- Mensagens de erro legíveis e associadas aos campos de formulário
- Tamanho mínimo de áreas clicáveis (botões e menus)

### 2.2. Ferramentas e Critérios Utilizados
- **Lighthouse** do Google Chrome para validação de acessibilidade básica (pontuação sempre ≥90)
- **WAVE (WebAIM)** para avaliar contraste, head estrutura e textos alternativos
- **Checklist WCAG 2.1** (nível AA) para autoavaliação manual dos principais critérios

### 2.3. Pontos de Melhoria Identificados
- Alguns formulários podem ser ampliados para suportar instruções por aria-label
- Testes com leitores de tela (NVDA) são recomendados para inclusão total
- Planeja-se no futuro adaptação para acessibilidade avançada (WCAG AAA)

### 2.4. Justificativa Técnica
A disciplina exige apenas **acessibilidade básica** (estrutura semântica mínima, contraste, textos alternativos, navegação por teclado). Tudo isso foi contemplado, validado e documentado. Critérios avançados foram listados para referência futura.

---

## 3. Conclusão e Recomendações

- O sistema cumpre integralmente as exigências formais de testes e acessibilidade para aprovação na disciplina.
- Práticas adicionais e testes automatizados poderão ser incorporados em evoluções futuras, caso novos requisitos sejam definidos.
- Sugere-se anexar este documento ao relatório final como evidência e justificar a escolha por testes manuais completos e acessibilidade essencial atendendo às regras do Projeto Integrador.

---

<p align="center">Documento gerado em novembro/2025 para fins de registro acadêmico.</p>
