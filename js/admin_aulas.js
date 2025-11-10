// js/admin_aulas.js

(async function() {
  try {
    // 1. PROTEGER A PÁGINA
    protectPage();
    
    // 2. VERIFICAR SE É ADMIN
    if (!isAdmin()) {
      document.getElementById('accessDenied').style.display = 'block';
      return;
    }
    
    // 3. EXIBIR CONTEÚDO ADMIN
    document.getElementById('adminContent').style.display = 'block';
    
    // 4. ELEMENTOS DO DOM
    const btnNovaAula = document.getElementById('btnNovaAula');
    const formContainer = document.getElementById('formAulaContainer');
    const formAula = document.getElementById('formAula');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnCancelarForm = document.getElementById('btnCancelarForm');
    const formTitle = document.getElementById('formTitle');
    const aulaIdInput = document.getElementById('aulaId');
    const loadingAulas = document.getElementById('loadingAulas');
    const aulasContainer = document.getElementById('aulasContainer');
    const errorAulas = document.getElementById('errorAulas');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const totalAulas = document.getElementById('totalAulas');
    
    // Filtros
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroInstrutor = document.getElementById('filtroInstrutor');
    const filtroData = document.getElementById('filtroData');
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    
    let aulasCache = []; // Cache para filtros
    
    // 5. FUNÇÃO: Formatar data e hora
    function formatarDataHora(dataHora) {
      if (!dataHora) return 'Não definido';
      const data = new Date(dataHora);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    function formatarHorario(dataHora) {
      if (!dataHora) return '';
      const data = new Date(dataHora);
      return String(data.getHours()).padStart(2, '0') + ':' + 
             String(data.getMinutes()).padStart(2, '0');
    }
    
    function formatarData(dataHora) {
      if (!dataHora) return '';
      const data = new Date(dataHora);
      return data.toISOString().split('T')[0];
    }
    
    // 6. CARREGAR E RENDERIZAR AULAS
    async function carregarAulas() {
      try {
        loadingAulas.style.display = 'flex';
        errorAulas.style.display = 'none';
        aulasContainer.innerHTML = '';
        
        const aulas = await getJsonAuth('/api/aulas');
        aulasCache = aulas; // Salvar no cache
        
        renderizarAulas(aulas);
        
      } catch (error) {
        loadingAulas.style.display = 'none';
        errorAulas.textContent = 'Erro ao carregar aulas: ' + error.message;
        errorAulas.style.display = 'block';
      }
    }
    
    // 7. RENDERIZAR AULAS EM TABELA
    function renderizarAulas(aulas) {
      loadingAulas.style.display = 'none';
      
      totalAulas.textContent = `${aulas.length} ${aulas.length === 1 ? 'aula' : 'aulas'}`;
      
      if (aulas.length === 0) {
        aulasContainer.innerHTML = '<p class="sem-resultados"><i class="bi bi-inbox"></i> Nenhuma aula encontrada</p>';
        return;
      }
      
      const html = `
        <table class="table-aulas">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Instrutor</th>
              <th>Data/Hora</th>
              <th>Vagas</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${aulas.map(aula => `
              <tr>
                <td data-label="Nome">${aula.nome}</td>
                <td data-label="Instrutor">${aula.instrutor || '-'}</td>
                <td data-label="Data/Hora">${formatarDataHora(aula.data_hora)}</td>
                <td data-label="Vagas">${aula.vagas_totais}</td>
                <td data-label="Tipo">
                  <span class="badge badge-${aula.tipo_aula.toLowerCase()}">${aula.tipo_aula}</span>
                </td>
                <td data-label="Ações" class="actions-cell">
                  <button class="btn-icon btn-editar" data-id="${aula.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn-icon btn-deletar" data-id="${aula.id}" title="Deletar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      aulasContainer.innerHTML = html;
      
      // Adicionar eventos aos botões
      document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => editarAula(btn.dataset.id));
      });
      
      document.querySelectorAll('.btn-deletar').forEach(btn => {
        btn.addEventListener('click', () => deletarAula(btn.dataset.id));
      });
    }
    
    // 8. FILTRAR AULAS
    function filtrarAulas() {
      const tipo = filtroTipo.value.toLowerCase();
      const instrutor = filtroInstrutor.value.toLowerCase();
      const data = filtroData.value;
      
      const aulasFiltradas = aulasCache.filter(aula => {
        const matchTipo = !tipo || aula.tipo_aula.toLowerCase() === tipo;
        const matchInstrutor = !instrutor || 
          (aula.instrutor && aula.instrutor.toLowerCase().includes(instrutor));
        const matchData = !data || formatarData(aula.data_hora) === data;
        
        return matchTipo && matchInstrutor && matchData;
      });
      
      renderizarAulas(aulasFiltradas);
    }
    
    // 9. LIMPAR FILTROS
    function limparFiltros() {
      filtroTipo.value = '';
      filtroInstrutor.value = '';
      filtroData.value = '';
      renderizarAulas(aulasCache);
    }
    
    // 10. ABRIR FORMULÁRIO DE NOVA AULA
    btnNovaAula.addEventListener('click', () => {
      formTitle.innerHTML = '<i class="bi bi-plus-circle"></i> Cadastrar Nova Aula';
      formAula.reset();
      aulaIdInput.value = '';
      formContainer.style.display = 'block';
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
      formContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 11. CANCELAR FORMULÁRIO
    function fecharFormulario() {
      formContainer.style.display = 'none';
      formAula.reset();
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
    }
    
    btnCancelar.addEventListener('click', fecharFormulario);
    btnCancelarForm.addEventListener('click', fecharFormulario);
    
    // 12. SUBMETER FORMULÁRIO
    formAula.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
      
      const formData = new FormData(formAula);
      
      // Combinar data e hora
      const data = formData.get('data');
      const horario = formData.get('horario');
      const dataHora = `${data}T${horario}:00`;
      
      const aulaData = {
        nome: formData.get('nome'),
        instrutor: formData.get('instrutor') || null,
        data_hora: dataHora,
        vagas_totais: parseInt(formData.get('vagas_totais')),
        tipo_aula: formData.get('tipo_aula')
      };
      
      const aulaId = aulaIdInput.value;
      
      try {
        if (aulaId) {
          // Atualizar aula existente
          await fetch(`/api/aulas/${aulaId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(aulaData)
          });
          
          // ✅ TOAST DE SUCESSO
          showSuccessToast('Aula atualizada com sucesso!');
        } else {
          // Criar nova aula
          await postJsonAuth('/api/aulas', aulaData);
          
          // ✅ TOAST DE SUCESSO
          showSuccessToast('Aula criada com sucesso!');
        }
        
        fecharFormulario();
        carregarAulas();
        
      } catch (error) {
        // ✅ TOAST DE ERRO
        showErrorToast(error.message || 'Erro ao salvar aula');
        
        formError.textContent = error.message || 'Erro ao salvar aula';
        formError.style.display = 'block';
      }
    });
    
    // 13. EDITAR AULA
    async function editarAula(id) {
      try {
        const aula = await getJsonAuth(`/api/aulas/${id}`);
        
        formTitle.innerHTML = '<i class="bi bi-pencil-square"></i> Editar Aula';
        aulaIdInput.value = aula.id;
        document.getElementById('aulaNome').value = aula.nome;
        document.getElementById('aulaInstrutor').value = aula.instrutor || '';
        document.getElementById('aulaData').value = formatarData(aula.data_hora);
        document.getElementById('aulaHorario').value = formatarHorario(aula.data_hora);
        document.getElementById('aulaVagas').value = aula.vagas_totais;
        document.getElementById('aulaTipo').value = aula.tipo_aula || 'Regular';
        
        formContainer.style.display = 'block';
        formSuccess.style.display = 'none';
        formError.style.display = 'none';
        formContainer.scrollIntoView({ behavior: 'smooth' });
        
      } catch (error) {
        showErrorToast('Erro ao carregar aula: ' + error.message);
      }
    }
    
    // 14. DELETAR AULA
    async function deletarAula(id) {
      if (!confirm('Tem certeza que deseja deletar esta aula? Esta ação não pode ser desfeita.')) {
        return;
      }
      
      try {
        await fetch(`/api/aulas/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        // ✅ TOAST DE SUCESSO
        showSuccessToast('Aula deletada com sucesso!');
        
        carregarAulas();
        
      } catch (error) {
        // ✅ TOAST DE ERRO
        showErrorToast('Erro ao deletar aula: ' + error.message);
      }
    }
    
    // Função auxiliar para headers
    function getAuthHeaders() {
      const token = getToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }
    
    // 15. EVENT LISTENERS FILTROS
    btnAplicarFiltros.addEventListener('click', filtrarAulas);
    btnLimparFiltros.addEventListener('click', limparFiltros);
    
    // Filtrar ao pressionar Enter nos campos
    filtroInstrutor.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') filtrarAulas();
    });
    
    // CARREGAR AULAS AO INICIAR
    carregarAulas();
    
  } catch (error) {
    if (error.message.includes("autenticado")) {
      return;
    }
    console.error("Erro na página admin aulas:", error);
  }
})();
