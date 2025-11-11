// js/meus-agendamentos.js - VERSÃO COM CALENDÁRIO

(async function() {
  try {
    protectPage();
    
    // DOM Elements
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
    
    // Lista View Elements
    const loadingAulas = document.getElementById('loadingAulas');
    const aulasDisponiveis = document.getElementById('aulasDisponiveis');
    const errorAulas = document.getElementById('errorAulas');
    const loadingAgendamentos = document.getElementById('loadingAgendamentos');
    const meusAgendamentos = document.getElementById('meusAgendamentos');
    const errorAgendamentos = document.getElementById('errorAgendamentos');
    
    let todasAulas = [];
    let meusAgendamentosData = [];
    let currentDate = new Date();
    
    // Toggle entre visualizações
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
      carregarListView();
    });
    
    // Navegação do calendário
    btnPrevMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderizarCalendario();
    });
    
    btnNextMonth.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderizarCalendario();
    });
    
    // Função: Formatar horário
    function formatarHorario(dataHora) {
      if (!dataHora) return '';
      const data = new Date(dataHora);
      return String(data.getHours()).padStart(2, '0') + ':' + 
             String(data.getMinutes()).padStart(2, '0');
    }
    
    // Função: Verificar se pode fazer check-in
    function podeCheckin(dataHoraAula) {
      const horarioAula = new Date(dataHoraAula);
      const agora = new Date();
      const diffMinutos = (horarioAula - agora) / 1000 / 60;
      return diffMinutos <= 30 && diffMinutos >= -30;
    }
    
    // Carregar dados
    async function carregarDados() {
      try {
        todasAulas = await getJsonAuth('/api/aulas');
        meusAgendamentosData = await getJsonAuth('/api/agendamentos/meus');
        renderizarCalendario();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showErrorToast('Erro ao carregar aulas e agendamentos');
      }
    }
    
    // Renderizar Calendário
    function renderizarCalendario() {
      const ano = currentDate.getFullYear();
      const mes = currentDate.getMonth();
      
      // Atualizar label do mês
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      currentMonthLabel.textContent = `${meses[mes]} ${ano}`;
      
      // Limpar calendário (manter cabeçalho dos dias)
      const dias = calendarGrid.querySelectorAll('.calendar-day');
      dias.forEach(dia => dia.remove());
      
      // Primeiro dia do mês e total de dias
      const primeiroDia = new Date(ano, mes, 1).getDay();
      const totalDias = new Date(ano, mes + 1, 0).getDate();
      
      // Criar células vazias antes do primeiro dia
      for (let i = 0; i < primeiroDia; i++) {
        const celula = document.createElement('div');
        celula.className = 'calendar-day calendar-day-empty';
        calendarGrid.appendChild(celula);
      }
      
      // Criar células dos dias do mês
      for (let dia = 1; dia <= totalDias; dia++) {
        const celula = document.createElement('div');
        celula.className = 'calendar-day';
        celula.innerHTML = `<span class="day-number">${dia}</span>`;
        
        // Verificar se tem aulas neste dia
        const dataCompleta = new Date(ano, mes, dia);
        const aulasNoDia = todasAulas.filter(aula => {
          const dataAula = new Date(aula.data_hora);
          return dataAula.getDate() === dia &&
                 dataAula.getMonth() === mes &&
                 dataAula.getFullYear() === ano;
        });
        
        // Verificar se tenho agendamentos neste dia
        const agendamentosNoDia = meusAgendamentosData.filter(ag => {
          const dataAg = new Date(ag.data_hora);
          return dataAg.getDate() === dia &&
                 dataAg.getMonth() === mes &&
                 dataAg.getFullYear() === ano;
        });
        
        if (aulasNoDia.length > 0) {
          celula.classList.add('calendar-day-with-classes');
          const marcador = document.createElement('div');
          marcador.className = 'day-marker';
          marcador.textContent = `${aulasNoDia.length}`;
          celula.appendChild(marcador);
        }
        
        if (agendamentosNoDia.length > 0) {
          celula.classList.add('calendar-day-scheduled');
        }
        
        // Destacar dia atual
        const hoje = new Date();
        if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
          celula.classList.add('calendar-day-today');
        }
        
        // Click no dia
        celula.addEventListener('click', () => {
          if (aulasNoDia.length > 0) {
            mostrarAulasDoDia(dia, mes, ano, aulasNoDia);
          }
        });
        
        calendarGrid.appendChild(celula);
      }
    }
    
    // Mostrar aulas de um dia específico
    function mostrarAulasDoDia(dia, mes, ano, aulas) {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      
      diaSelecionadoTitulo.textContent = `Aulas de ${dia} de ${meses[mes]} de ${ano}`;
      
      const html = aulas.map(aula => {
        const agendado = meusAgendamentosData.some(ag => ag.aula_id === aula.id);
        const vagasEsgotadas = aula.vagas_disponiveis <= 0;
        const podeCheckinAgora = podeCheckin(aula.data_hora);
        
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
              ${agendado 
                ? podeCheckinAgora
                  ? `<button class="btn-primary btn-checkin-cal" data-id="${aula.id}">
                      <i class="bi bi-geo-alt"></i> Fazer Check-in
                    </button>`
                  : '<span class="badge-agendado"><i class="bi bi-check-circle"></i> Agendado</span>'
                : vagasEsgotadas
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
      
      // Eventos dos botões
      document.querySelectorAll('.btn-agendar-cal').forEach(btn => {
        btn.addEventListener('click', () => agendarAula(btn.dataset.id));
      });
      
      document.querySelectorAll('.btn-checkin-cal').forEach(btn => {
        btn.addEventListener('click', () => fazerCheckin(btn.dataset.id));
      });
    }
    
    // Fechar aulas do dia
    window.fecharAulasDia = function() {
      aulasDoDay.style.display = 'none';
    }
    
    // AGENDAR AULA
    async function agendarAula(aulaId) {
      try {
        await postJsonAuth('/api/agendamentos', { aula_id: aulaId });
        showSuccessToast('Agendamento realizado com sucesso!');
        await carregarDados();
        fecharAulasDia();
      } catch (error) {
        showErrorToast('Erro ao agendar: ' + error.message);
      }
    }
    
    // FAZER CHECK-IN
    async function fazerCheckin(agendamentoId) {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {
                  localizacao_lat: position.coords.latitude,
                  localizacao_lng: position.coords.longitude
                });
                showSuccessToast('Check-in realizado com sucesso!');
                await carregarDados();
              } catch (error) {
                showErrorToast('Erro ao fazer check-in: ' + error.message);
              }
            },
            async (error) => {
              try {
                await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
                showSuccessToast('Check-in realizado com sucesso (sem localização)!');
                await carregarDados();
              } catch (error) {
                showErrorToast('Erro ao fazer check-in: ' + error.message);
              }
            }
          );
        } else {
          await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
          showSuccessToast('Check-in realizado com sucesso!');
          await carregarDados();
        }
      } catch (error) {
        showErrorToast('Erro ao fazer check-in: ' + error.message);
      }
    }
    
    // CANCELAR AGENDAMENTO
    async function cancelarAgendamento(agendamentoId) {
      if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
      
      try {
        await fetch(`/api/agendamentos/${agendamentoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        showSuccessToast('Agendamento cancelado com sucesso!');
        await carregarDados();
        
      } catch (error) {
        showErrorToast('Erro ao cancelar agendamento: ' + error.message);
      }
    }
    
    // CARREGAR VIEW DE LISTA
    async function carregarListView() {
      // Carregar Aulas Disponíveis
      async function carregarAulasDisponiveis() {
        try {
          loadingAulas.style.display = 'block';
          errorAulas.style.display = 'none';
          aulasDisponiveis.innerHTML = '';
          
          const aulas = await getJsonAuth('/api/aulas');
          
          loadingAulas.style.display = 'none';
          
          if (aulas.length === 0) {
            aulasDisponiveis.innerHTML = '<p>Nenhuma aula disponível no momento.</p>';
            return;
          }
          
          const html = aulas.map(aula => {
            const vagasEsgotadas = aula.vagas_disponiveis <= 0;
            
            return `
              <div class="card" style="margin-bottom: 15px; padding: 15px;">
                <h4>${aula.nome}</h4>
                <p><strong>Instrutor:</strong> ${aula.instrutor || 'Não informado'}</p>
                <p><strong>Horário:</strong> ${formatarHorario(aula.data_hora)}</p>
                <p><strong>Tipo:</strong> ${aula.tipo_aula || 'Regular'}</p>
                <p><strong>Vagas disponíveis:</strong> 
                  <span style="color: ${vagasEsgotadas ? '#dc3545' : '#28a745'}">
                    ${aula.vagas_disponiveis} de ${aula.vagas_totais}
                  </span>
                </p>
                ${vagasEsgotadas 
                  ? '<button class="btn-secondary" disabled>Vagas Esgotadas</button>'
                  : `<button class="btn-primary btn-agendar" data-id="${aula.id}">Agendar</button>`
                }
              </div>
            `;
          }).join('');
          
          aulasDisponiveis.innerHTML = html;
          
          document.querySelectorAll('.btn-agendar').forEach(btn => {
            btn.addEventListener('click', () => agendarAula(btn.dataset.id));
          });
          
        } catch (error) {
          loadingAulas.style.display = 'none';
          errorAulas.textContent = 'Erro ao carregar aulas: ' + error.message;
          errorAulas.style.display = 'block';
        }
      }
      
      // Carregar Meus Agendamentos (use a função melhorada da Fase 4)
      async function carregarMeusAgendamentos() {
        // [Usar o código da Fase 4 que já foi implementado]
      }
      
      await carregarAulasDisponiveis();
      await carregarMeusAgendamentos();
    }

    
    // INICIALIZAR
    await carregarDados();
    
  } catch (error) {
    if (error.message.includes("autenticado")) return;
    console.error("Erro na página de agendamentos:", error);
  }
})();
