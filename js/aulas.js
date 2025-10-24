// js/aulas.js
console.log('=== SCRIPT aulas.js CARREGADO ===');

async function carregarAulas() {
  console.log('=== EXECUTANDO carregarAulas ===');

  const token = getToken(); // de auth.js (padronizado)
  const listaAulasDiv = document.getElementById('lista-aulas');
  const mensagemDiv = document.getElementById('mensagem');

  if (!listaAulasDiv || !mensagemDiv) {
    console.warn('Elementos #lista-aulas ou #mensagem não encontrados em aulas.html');
    return;
  }

  if (!token) {
    mensagemDiv.className = 'alert alert-warning';
    mensagemDiv.textContent = 'Faça login para ver as aulas.';
    listaAulasDiv.innerHTML = '';
    return;
  }

  try {
    mensagemDiv.className = '';
    mensagemDiv.textContent = 'Carregando aulas...';

    // Se a rota exigir token, o api.js já adiciona Authorization
    const aulas = await getJson('/api/aulas');

    if (!Array.isArray(aulas) || aulas.length === 0) {
      listaAulasDiv.innerHTML = '<p>Nenhuma aula disponível no momento.</p>';
      mensagemDiv.textContent = '';
      return;
    }

    const cards = aulas.map(aula => {
      const dataHora = new Date(aula.data_hora).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
      return `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${aula.nome}</h5>
              <p class="card-text">Instrutor: ${aula.instrutor || 'Não definido'}</p>
              <p class="card-text">Data: ${dataHora}</p>
              <p class="card-text">Vagas: <span id="vagas-${aula.id}">${aula.vagas_totais ?? '-'}</span></p>
              <button class="btn btn-primary btn-agendar" data-aula-id="${aula.id}">Agendar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listaAulasDiv.innerHTML = cards;
    mensagemDiv.textContent = '';

    // Listeners de agendar
    document.querySelectorAll('.btn-agendar').forEach(btn => {
      btn.addEventListener('click', () => agendarAula(btn.getAttribute('data-aula-id')));
    });

  } catch (error) {
    console.error('Erro ao carregar aulas:', error);
    mensagemDiv.className = 'alert alert-danger';
    mensagemDiv.textContent = error.message || 'Erro ao carregar aulas.';
  }
}

async function agendarAula(aulaId) {
  const mensagemDiv = document.getElementById('mensagem');
  try {
    const data = await postJson('/api/agendamentos', { aula_id: parseInt(aulaId, 10) });
    mensagemDiv.className = 'alert alert-success';
    mensagemDiv.textContent = data.message || 'Agendamento realizado com sucesso!';
    // opcional: recarregar lista
    carregarAulas();
  } catch (error) {
    mensagemDiv.className = 'alert alert-danger';
    mensagemDiv.textContent = error.message || 'Erro ao agendar.';
  }
}

// Executa imediatamente quando a página aulas.html carrega via AJAX
carregarAulas();
