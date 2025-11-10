// js/admin_checkins.js

(async function() {
  try {
    // Proteger e verificar admin
    protectPage();
    
    if (!isAdmin()) {
      document.getElementById('accessDenied').style.display = 'block';
      return;
    }
    
    document.getElementById('adminContent').style.display = 'block';
    
    // DOM
    const loadingCheckins = document.getElementById('loadingCheckins');
    const checkinsContainer = document.getElementById('checkinsContainer');
    const errorCheckins = document.getElementById('errorCheckins');
    const totalCheckins = document.getElementById('totalCheckins');
    
    const filtroData = document.getElementById('filtroDataCheckin');
    const filtroAula = document.getElementById('filtroAulaCheckin');
    const filtroAluno = document.getElementById('filtroAlunoCheckin');
    const btnAplicar = document.getElementById('btnAplicarFiltrosCheckin');
    const btnLimpar = document.getElementById('btnLimparFiltrosCheckin');
    
    let checkinsCache = [];
    let aulasCache = [];
    
    // Formatar data/hora
    function formatarDataHora(dataHora) {
      if (!dataHora) return '-';
      const data = new Date(dataHora);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Carregar aulas para o filtro
    async function carregarAulasParaFiltro() {
      try {
        aulasCache = await getJsonAuth('/api/aulas');
        
        filtroAula.innerHTML = '<option value="">Todas as aulas</option>';
        aulasCache.forEach(aula => {
          const option = document.createElement('option');
          option.value = aula.id;
          option.textContent = aula.nome;
          filtroAula.appendChild(option);
        });
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
      }
    }
    
    // Carregar check-ins
    async function carregarCheckins() {
      try {
        loadingCheckins.style.display = 'flex';
        errorCheckins.style.display = 'none';
        checkinsContainer.innerHTML = '';
        
        const checkins = await getJsonAuth('/api/checkins');
        checkinsCache = checkins;
        
        renderizarCheckins(checkins);
        
      } catch (error) {
        loadingCheckins.style.display = 'none';
        errorCheckins.textContent = 'Erro ao carregar check-ins: ' + error.message;
        errorCheckins.style.display = 'block';
      }
    }
    
    // Renderizar tabela
    function renderizarCheckins(checkins) {
      loadingCheckins.style.display = 'none';
      
      totalCheckins.textContent = `${checkins.length} ${checkins.length === 1 ? 'check-in' : 'check-ins'}`;
      
      if (checkins.length === 0) {
        checkinsContainer.innerHTML = '<p class="sem-resultados"><i class="bi bi-inbox"></i> Nenhum check-in encontrado</p>';
        return;
      }
      
      const html = `
        <table class="table-aulas">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Aula</th>
              <th>Data/Hora Check-in</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            ${checkins.map(ch => `
              <tr>
                <td data-label="Aluno">${ch.aluno_nome || '-'}</td>
                <td data-label="Aula">${ch.aula_nome || '-'}</td>
                <td data-label="Data/Hora">${formatarDataHora(ch.data_checkin)}</td>
                <td data-label="Localização">
                  ${ch.localizacao_lat && ch.localizacao_lng 
                    ? `<a href="https://www.google.com/maps?q=${ch.localizacao_lat},${ch.localizacao_lng}" 
                         target="_blank" class="btn-map">
                         <i class="bi bi-geo-alt"></i> Ver Mapa
                       </a>`
                    : '<span style="color: #6c757d;">-</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      checkinsContainer.innerHTML = html;
    }
    
    // Filtrar check-ins
    function filtrarCheckins() {
      const data = filtroData.value;
      const aulaId = filtroAula.value;
      const aluno = filtroAluno.value.toLowerCase();
      
      const checkinsFiltrados = checkinsCache.filter(ch => {
        const matchData = !data || new Date(ch.data_checkin).toISOString().substr(0, 10) === data;
        const matchAula = !aulaId || ch.aula_id == aulaId;
        const matchAluno = !aluno || (ch.aluno_nome && ch.aluno_nome.toLowerCase().includes(aluno));
        
        return matchData && matchAula && matchAluno;
      });
      
      renderizarCheckins(checkinsFiltrados);
    }
    
    // Limpar filtros
    function limparFiltros() {
      filtroData.value = '';
      filtroAula.value = '';
      filtroAluno.value = '';
      renderizarCheckins(checkinsCache);
    }
    
    // Eventos
    btnAplicar.addEventListener('click', filtrarCheckins);
    btnLimpar.addEventListener('click', limparFiltros);
    
    filtroAluno.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') filtrarCheckins();
    });
    
    // Inicializar
    await carregarAulasParaFiltro();
    await carregarCheckins();
    
  } catch (error) {
    if (error.message.includes("autenticado")) return;
    console.error("Erro na página de check-ins:", error);
  }
})();
