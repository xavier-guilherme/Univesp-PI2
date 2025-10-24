// js/meus-agendamentos.js
console.log('=== SCRIPT meus-agendamentos.js CARREGADO ===');

async function carregarPaginaCompleta() {
  console.log('=== EXECUTANDO carregarPaginaCompleta ===');

  const token = getToken(); // de auth.js
  if (!token) {
    const msgDiv = document.getElementById('mensagem-ag');
    if (msgDiv) {
      msgDiv.className = 'alert alert-warning';
      msgDiv.textContent = 'Faça login para acessar esta área.';
    }
    return;
  }

  // Carrega as duas seções
  await carregarAulasDisponiveis();
  await carregarMeusAgendamentos();
}

async function carregarAulasDisponiveis() {
  const aulasDiv = document.getElementById('lista-aulas-disponiveis');
  const msgDiv = document.getElementById('mensagem-ag');

  if (!aulasDiv) return;

  try {
    msgDiv.className = '';
    msgDiv.textContent = 'Carregando aulas disponíveis...';

    const aulas = await getJson('/api/aulas');

    if (!Array.isArray(aulas) || aulas.length === 0) {
      aulasDiv.innerHTML = '<p>Nenhuma aula disponível no momento.</p>';
      msgDiv.textContent = '';
      return;
    }

    const cards = aulas.map(aula => {
      const dataHora = new Date(aula.data_hora).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
      return `
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-title">${aula.nome}</h6>
              <p class="card-text small">
                <strong>Instrutor:</strong> ${aula.instrutor || 'Não definido'}<br>
                <strong>Data:</strong> ${dataHora}<br>
                <strong>Vagas:</strong> ${aula.vagas_totais ?? '-'}
              </p>
              <button class="btn btn-success btn-sm btn-agendar-nova" data-aula-id="${aula.id}">
                <i class="bi bi-plus-circle"></i> Agendar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    aulasDiv.innerHTML = cards;
    msgDiv.textContent = '';

    // Listeners de agendar
    document.querySelectorAll('.btn-agendar-nova').forEach(btn => {
      btn.addEventListener('click', () => agendarNovaAula(btn.getAttribute('data-aula-id')));
    });

  } catch (error) {
    console.error('Erro ao carregar aulas:', error);
    aulasDiv.innerHTML = `<p class="text-danger">Erro ao carregar aulas: ${error.message}</p>`;
    msgDiv.textContent = '';
  }
}

async function carregarMeusAgendamentos() {
  const listaDiv = document.getElementById('lista-agendamentos');
  const msgDiv = document.getElementById('mensagem-ag');

  if (!listaDiv) return;

  try {
    const ags = await getJson('/api/agendamentos/meus-agendamentos');

    if (!Array.isArray(ags) || ags.length === 0) {
      listaDiv.innerHTML = '<p>Você não possui agendamentos.</p>';
      return;
    }

    const cards = ags.map(a => {
      const dataHora = new Date(a.data_hora).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
      return `
        <div class="col-md-6 col-lg-4 mb-3" data-agendamento-id="${a.id}">
          <div class="card h-100 border-info">
            <div class="card-body">
              <h6 class="card-title">${a.nome_aula || a.nome || 'Aula'}</h6>
              <p class="card-text small">
                <strong>Instrutor:</strong> ${a.instrutor || 'Não informado'}<br>
                <strong>Data:</strong> ${dataHora}
              </p>
              <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${a.id}">
                <i class="bi bi-x-circle"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listaDiv.innerHTML = cards;

    // Listeners de cancelar
    document.querySelectorAll('.btn-cancelar').forEach(btn => {
      btn.addEventListener('click', () => cancelarAgendamento(btn.getAttribute('data-id')));
    });

  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    listaDiv.innerHTML = `<p class="text-danger">Erro ao carregar seus agendamentos: ${error.message}</p>`;
  }
}

async function agendarNovaAula(aulaId) {
  const msgDiv = document.getElementById('mensagem-ag');
  try {
    const data = await postJson('/api/agendamentos', { aula_id: parseInt(aulaId, 10) });
    msgDiv.className = 'alert alert-success';
    msgDiv.textContent = data.message || 'Agendamento realizado com sucesso!';
    
    // Recarrega as duas listas
    setTimeout(() => {
      carregarAulasDisponiveis();
      carregarMeusAgendamentos();
    }, 1500);
    
  } catch (error) {
    msgDiv.className = 'alert alert-danger';
    msgDiv.textContent = error.message || 'Erro ao agendar aula.';
  }
}

async function cancelarAgendamento(agendamentoId) {
  const msgDiv = document.getElementById('mensagem-ag');
  if (!agendamentoId) return;

  if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
    return;
  }

  try {
    const res = await fetchApi(`/api/agendamentos/${agendamentoId}`, {
      method: 'DELETE'
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}`);
    }

    msgDiv.className = 'alert alert-success';
    msgDiv.textContent = data.message || 'Agendamento cancelado com sucesso.';
    
    // Recarrega as duas listas
    setTimeout(() => {
      carregarAulasDisponiveis();
      carregarMeusAgendamentos();
    }, 1500);
    
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    msgDiv.className = 'alert alert-danger';
    msgDiv.textContent = error.message || 'Erro ao cancelar agendamento.';
  }
}

// Executa ao carregar a página via AJAX
try {
  protectPage(); // garante login
  carregarPaginaCompleta();
} catch (e) {
  // protectPage redireciona e lança erro para interromper execução
}
