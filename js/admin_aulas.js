// js/admin_aulas.js

(async function() {
  try {
    // Função auxiliar para formatar horário
    function formatarHorario(dataHora) {
        if (!dataHora) return 'Não definido';
        const data = new Date(dataHora);
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
    }

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
    const formTitle = document.getElementById('formTitle');
    const aulaIdInput = document.getElementById('aulaId');
    const loadingAulas = document.getElementById('loadingAulas');
    const aulasContainer = document.getElementById('aulasContainer');
    const errorAulas = document.getElementById('errorAulas');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    
    // 5. CARREGAR LISTA DE AULAS
    async function carregarAulas() {
      try {
        loadingAulas.style.display = 'block';
        errorAulas.style.display = 'none';
        aulasContainer.innerHTML = '';
        
        const aulas = await getJsonAuth('/api/aulas');
        
        loadingAulas.style.display = 'none';
        
        if (aulas.length === 0) {
          aulasContainer.innerHTML = '<p>Nenhuma aula cadastrada.</p>';
          return;
        }
        
        // Renderizar aulas
        const html = aulas.map(aula => `
        <div class="card" style="margin-bottom: 15px; padding: 15px;">
            <h4>${aula.nome}</h4>
            <p><strong>Instrutor:</strong> ${aula.instrutor || 'Não informado'}</p>
            <p><strong>Horário:</strong> ${formatarHorario(aula.data_hora)}</p>
            <p><strong>Vagas:</strong> ${aula.vagas_totais}</p>
            <p><strong>Tipo:</strong> ${aula.tipo_aula || 'Regular'}</p>
            <button class="btn-secondary btn-editar" data-id="${aula.id}">Editar</button>
            <button class="btn-danger btn-deletar" data-id="${aula.id}">Deletar</button>
        </div>
        `).join('');

        aulasContainer.innerHTML = html;
        
        // Adicionar eventos aos botões
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarAula(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-deletar').forEach(btn => {
            btn.addEventListener('click', () => deletarAula(btn.dataset.id));
        });

        
      } catch (error) {
        loadingAulas.style.display = 'none';
        errorAulas.textContent = 'Erro ao carregar aulas: ' + error.message;
        errorAulas.style.display = 'block';
      }
    }
    
    // 6. ABRIR FORMULÁRIO DE NOVA AULA
    btnNovaAula.addEventListener('click', () => {
      formTitle.textContent = 'Cadastrar Nova Aula';
      formAula.reset();
      aulaIdInput.value = '';
      formContainer.style.display = 'block';
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
    });
    
    // 7. CANCELAR FORMULÁRIO
    btnCancelar.addEventListener('click', () => {
      formContainer.style.display = 'none';
      formAula.reset();
    });
    
    // 8. SUBMETER FORMULÁRIO
    formAula.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      formSuccess.style.display = 'none';
      formError.style.display = 'none';
      
      const formData = new FormData(formAula);
        const aulaData = {
        nome: formData.get('nome'),
        instrutor: formData.get('instrutor'),
        data_hora: formData.get('data_hora'),
        vagas_totais: parseInt(formData.get('vagas_totais')),
        tipo_aula: formData.get('tipo_aula')
        };
      
      const aulaId = aulaIdInput.value;
      
      try {
        let result;
        if (aulaId) {
          // Atualizar aula existente
          result = await fetch(`/api/aulas/${aulaId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(aulaData)
          });
        } else {
          // Criar nova aula
          result = await postJsonAuth('/api/aulas', aulaData);
        }
        
        formSuccess.textContent = aulaId ? 'Aula atualizada com sucesso!' : 'Aula criada com sucesso!';
        formSuccess.style.display = 'block';
        
        formAula.reset();
        formContainer.style.display = 'none';
        carregarAulas();
        
      } catch (error) {
        formError.textContent = error.message || 'Erro ao salvar aula';
        formError.style.display = 'block';
      }
    });
    
    // 9. EDITAR AULA
    async function editarAula(id) {
    try {
        const aula = await getJsonAuth(`/api/aulas/${id}`);
        
        formTitle.textContent = 'Editar Aula';
        aulaIdInput.value = aula.id;
        document.getElementById('aulaNome').value = aula.nome;
        document.getElementById('aulaInstrutor').value = aula.instrutor || '';
        document.getElementById('aulaHorario').value = formatarHorario(aula.data_hora);
        document.getElementById('aulaVagas').value = aula.vagas_totais;
        document.getElementById('aulaTipo').value = aula.tipo_aula || 'Regular';
        
        formContainer.style.display = 'block';
        formSuccess.style.display = 'none';
        formError.style.display = 'none';
        
    } catch (error) {
        alert('Erro ao carregar aula: ' + error.message);
    }
    }
    
    // 10. DELETAR AULA
    async function deletarAula(id) {
    if (!confirm('Tem certeza que deseja deletar esta aula?')) return;
    
    try {
        await fetch(`/api/aulas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
        });
        
        alert('Aula deletada com sucesso!');
        carregarAulas();
        
    } catch (error) {
        alert('Erro ao deletar aula: ' + error.message);
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
    
    // CARREGAR AULAS AO INICIAR
    carregarAulas();
    
  } catch (error) {
    if (error.message.includes("autenticado")) {
      return;
    }
    console.error("Erro na página admin aulas:", error);
  }
})();
