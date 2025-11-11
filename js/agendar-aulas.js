// js/agendar-aulas.js

(async function() {
  try {
    protectPage();
    
    // DOM
    const calendarView = document.getElementById('calendarView');
    const listView = document.getElementById('listView');
    const btnViewCalendar = document.getElementById('btnViewCalendar');
    const btnViewList = document.getElementById('btnViewList');
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthLabel = document.getElementById('currentMonth');
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');
    const aulasDoDay = document.getElementById('aulasDoDay');
    const aulasDoDay_content = document.getElementById('aulasDoDay-content');
    const diaSelecionadoTitulo = document.getElementById('diaSelecionadoTitulo');
    const loadingAulas = document.getElementById('loadingAulas');
    const aulasDisponiveis = document.getElementById('aulasDisponiveis');
    const errorAulas = document.getElementById('errorAulas');
    
    let todasAulas = [];
    let currentDate = new Date();
    
    // Toggle de visualização
    btnViewCalendar.addEventListener('click', () => {
      calendarView.style.display = 'block';
      listView.style.display = 'none';
      btnViewCalendar.classList.add('active');
      btnViewList.classList.remove('active');
    });
    
    btnViewList.addEventListener('click', () => {
      calendarView.style.display = 'none';
      listView.style.display = 'block';
      btnViewCalendar.classList.remove('active');
      btnViewList.classList.add('active');
      carregarListaAulas();
    });
    
    // Navegação calendário
    btnPrevMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderizarCalendario();
    });
    
    btnNextMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderizarCalendario();
    });
    
    // Funções auxiliares
    function formatarHorario(dataHora) {
      if (!dataHora) return '';
      const data = new Date(dataHora);
      return String(data.getHours()).padStart(2, '0') + ':' + 
             String(data.getMinutes()).padStart(2, '0');
    }
    
    function formatarDataCompleta(dataHora) {
      const data = new Date(dataHora);
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const diaSemana = diasSemana[data.getDay()];
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${diaSemana}, ${dia}/${mes}/${ano}`;
    }
    
    // Carregar aulas
    async function carregarAulas() {
      try {
        todasAulas = await getJsonAuth('/api/aulas');
        renderizarCalendario();
      } catch (error) {
        showErrorToast('Erro ao carregar aulas');
      }
    }
    
    // Renderizar calendário (mesmo código anterior)
    function renderizarCalendario() {
      const ano = currentDate.getFullYear();
      const mes = currentDate.getMonth();
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      currentMonthLabel.textContent = `${meses[mes]} ${ano}`;
      
      const dias = calendarGrid.querySelectorAll('.calendar-day');
      dias.forEach(dia => dia.remove());
      
      const primeiroDia = new Date(ano, mes, 1).getDay();
      const totalDias = new Date(ano, mes + 1, 0).getDate();
      
      for (let i = 0; i < primeiroDia; i++) {
        const celula = document.createElement('div');
        celula.className = 'calendar-day calendar-day-empty';
        calendarGrid.appendChild(celula);
      }
      
      for (let dia = 1; dia <= totalDias; dia++) {
        const celula = document.createElement('div');
        celula.className = 'calendar-day';
        celula.innerHTML = `<span class="day-number">${dia}</span>`;
        
        const aulasNoDia = todasAulas.filter(aula => {
          const dataAula = new Date(aula.data_hora);
          return dataAula.getDate() === dia &&
                 dataAula.getMonth() === mes &&
                 dataAula.getFullYear() === ano;
        });
        
        if (aulasNoDia.length > 0) {
          celula.classList.add('calendar-day-with-classes');
          const marcador = document.createElement('div');
          marcador.className = 'day-marker';
          marcador.textContent = `${aulasNoDia.length}`;
          celula.appendChild(marcador);
        }
        
        const hoje = new Date();
        if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
          celula.classList.add('calendar-day-today');
        }
        
        celula.addEventListener('click', () => {
          if (aulasNoDia.length > 0) {
            mostrarAulasDoDia(dia, mes, ano, aulasNoDia);
          }
        });
        
        calendarGrid.appendChild(celula);
      }
    }
    
    // Mostrar aulas do dia
    function mostrarAulasDoDia(dia, mes, ano, aulas) {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      
      diaSelecionadoTitulo.textContent = `Aulas de ${dia} de ${meses[mes]} de ${ano}`;
      
      const html = aulas.map(aula => {
        const vagasEsgotadas = aula.vagas_disponiveis <= 0;
        
        return `
          <div class="aula-card-calendario">
            <div class="aula-card-header">
              <h4>${aula.nome}</h4>
              <span class="badge badge-${(aula.tipo_aula || 'regular').toLowerCase()}">
                ${aula.tipo_aula || 'Regular'}
              </span>
            </div>
            <div class="aula-card-info">
              <div class="info-item">
                <i class="bi bi-clock"></i>
                <span>${formatarHorario(aula.data_hora)}</span>
              </div>
              <div class="info-item">
                <i class="bi bi-person"></i>
                <span>${aula.instrutor || 'Não informado'}</span>
              </div>
              <div class="info-item">
                <i class="bi bi-people"></i>
                <span>${aula.vagas_disponiveis} / ${aula.vagas_totais} vagas</span>
              </div>
            </div>
            <div class="aula-card-actions">
              ${vagasEsgotadas
                ? '<button class="btn-secondary" disabled>Vagas Esgotadas</button>'
                : `<button class="btn-primary btn-agendar-cal" data-id="${aula.id}">
                    <i class="bi bi-calendar-plus"></i> Agendar
                  </button>`
              }
            </div>
          </div>
        `;
      }).join('');
      
      aulasDoDay_content.innerHTML = html;
      aulasDoDay.style.display = 'block';
      aulasDoDay.scrollIntoView({ behavior: 'smooth' });
      
      document.querySelectorAll('.btn-agendar-cal').forEach(btn => {
        btn.addEventListener('click', () => agendarAula(btn.dataset.id));
      });
    }
    
    window.fecharAulasDia = function() {
      aulasDoDay.style.display = 'none';
    }
    
    // Carregar lista de aulas
    async function carregarListaAulas() {
      try {
        loadingAulas.style.display = 'flex';
        errorAulas.style.display = 'none';
        aulasDisponiveis.innerHTML = '';
        
        const aulas = await getJsonAuth('/api/aulas');
        loadingAulas.style.display = 'none';
        
        if (aulas.length === 0) {
          aulasDisponiveis.innerHTML = '<p class="sem-resultados">Nenhuma aula disponível</p>';
          return;
        }
        
        const html = aulas.map(aula => {
          const vagasEsgotadas = aula.vagas_disponiveis <= 0;
          
          return `
            <div class="aula-card-compacto">
              <div class="aula-badge-tipo">
                <span class="badge badge-${(aula.tipo_aula || 'regular').toLowerCase()}">
                  ${aula.tipo_aula || 'Regular'}
                </span>
              </div>
              <h4 class="aula-titulo">${aula.nome}</h4>
              <div class="aula-info-grid">
                <div class="info-compacto">
                  <i class="bi bi-calendar3"></i>
                  <span>${formatarDataCompleta(aula.data_hora)}</span>
                </div>
                <div class="info-compacto">
                  <i class="bi bi-clock"></i>
                  <span>${formatarHorario(aula.data_hora)}</span>
                </div>
                <div class="info-compacto">
                  <i class="bi bi-person"></i>
                  <span>${aula.instrutor || 'Não informado'}</span>
                </div>
                <div class="info-compacto">
                  <i class="bi bi-people"></i>
                  <span>${aula.vagas_disponiveis}/${aula.vagas_totais} vagas</span>
                </div>
              </div>
              ${vagasEsgotadas
                ? '<button class="btn-disabled" disabled>Vagas Esgotadas</button>'
                : `<button class="btn-agendar-lista" data-id="${aula.id}">
                    <i class="bi bi-calendar-plus"></i> Agendar
                  </button>`
              }
            </div>
          `;
        }).join('');
        
        aulasDisponiveis.innerHTML = html;
        
        document.querySelectorAll('.btn-agendar-lista').forEach(btn => {
          btn.addEventListener('click', () => agendarAula(btn.dataset.id));
        });
        
      } catch (error) {
        loadingAulas.style.display = 'none';
        errorAulas.textContent = 'Erro ao carregar aulas';
        errorAulas.style.display = 'block';
      }
    }
    
    // Agendar aula
    async function agendarAula(aulaId) {
      try {
        await postJsonAuth('/api/agendamentos', { aula_id: aulaId });
        showSuccessToast('Aula agendada com sucesso!');
        await carregarAulas();
        if (listView.style.display !== 'none') {
          await carregarListaAulas();
        }
      } catch (error) {
        showErrorToast('Erro ao agendar: ' + error.message);
      }
    }
    
    // Inicializar
    await carregarAulas();
    
  } catch (error) {
    if (error.message.includes("autenticado")) return;
    console.error("Erro:", error);
  }
})();
