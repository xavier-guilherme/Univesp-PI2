// js/meus-agendamentos.js - SOMENTE AGENDAMENTOS DO ALUNO

(async function() {
  try {
    protectPage();
    
    const loadingAgendamentos = document.getElementById('loadingAgendamentos');
    const meusAgendamentos = document.getElementById('meusAgendamentos');
    const errorAgendamentos = document.getElementById('errorAgendamentos');
    
    function formatarHorario(dataHora) {
      if (!dataHora) return '';
      const data = new Date(dataHora);
      return String(data.getHours()).padStart(2, '0') + ':' + 
             String(data.getMinutes()).padStart(2, '0');
    }
    
    function formatarDataCompleta(dataHora) {
      const data = new Date(dataHora);
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      return {
        diaSemana: diasSemana[data.getDay()],
        dia: String(data.getDate()).padStart(2, '0'),
        mes: meses[data.getMonth()],
        ano: data.getFullYear()
      };
    }
    
    function podeCheckin(dataHoraAula) {
      const horarioAula = new Date(dataHoraAula);
      const agora = new Date();
      const diffMinutos = (horarioAula - agora) / 1000 / 60;
      return diffMinutos <= 30 && diffMinutos >= -30;
    }
    
    async function carregarAgendamentos() {
      try {
        loadingAgendamentos.style.display = 'flex';
        errorAgendamentos.style.display = 'none';
        meusAgendamentos.innerHTML = '';
        
        const agendamentos = await getJsonAuth('/api/agendamentos/meus');
        
        loadingAgendamentos.style.display = 'none';
        
        if (agendamentos.length === 0) {
          meusAgendamentos.innerHTML = `
            <div class="sem-agendamentos-box">
              <i class="bi bi-calendar-x"></i>
              <h3>Você não possui agendamentos</h3>
              <p>Comece agendando uma aula!</p>
              <a href="#" class="linkMenu btn-primary" data-page="paginas/agendar-aulas.html">
                <i class="bi bi-calendar-plus"></i> Agendar Aula
              </a>
            </div>
          `;
          return;
        }
        
        const html = agendamentos.map(ag => {
          const checkinFeito = ag.checkin_feito > 0;
          const dataHoraAula = new Date(ag.data_hora);
          const agora = new Date();
          const diffMinutos = Math.round((dataHoraAula - agora) / 1000 / 60);
          const podeCheckinAgora = diffMinutos <= 30 && diffMinutos >= -30;
          const aulaPassada = diffMinutos < -30;
          const dataFormatada = formatarDataCompleta(ag.data_hora);
          
          return `
            <div class="agendamento-card-moderno ${checkinFeito ? 'agendamento-confirmado' : ''}">
              
              <!-- Data em Destaque -->
              <div class="agendamento-data-box">
                <div class="data-dia">${dataFormatada.dia}</div>
                <div class="data-mes">${dataFormatada.mes}</div>
                <div class="data-ano">${dataFormatada.ano}</div>
              </div>
              
              <!-- Informações da Aula -->
              <div class="agendamento-conteudo">
                <div class="agendamento-titulo-linha">
                  <h4>${ag.aula_nome}</h4>
                  ${checkinFeito ? '<span class="badge-status badge-confirmado"><i class="bi bi-check-circle-fill"></i> Confirmado</span>' : ''}
                </div>
                
                <div class="agendamento-detalhes">
                  <span class="detalhe-item">
                    <i class="bi bi-calendar3"></i>
                    ${dataFormatada.diaSemana}
                  </span>
                  <span class="detalhe-item">
                    <i class="bi bi-clock"></i>
                    ${formatarHorario(ag.data_hora)}
                  </span>
                  <span class="detalhe-item">
                    <i class="bi bi-person"></i>
                    ${ag.instrutor || 'Não informado'}
                  </span>
                  <span class="detalhe-item badge-tipo">
                    <i class="bi bi-tag"></i>
                    ${ag.tipo_aula || 'Regular'}
                  </span>
                </div>
                
                <!-- Check-in Status -->
                ${checkinFeito ? `
                  <div class="checkin-realizado-box">
                    <i class="bi bi-check-circle-fill"></i>
                    Check-in realizado
                  </div>
                ` : podeCheckinAgora ? `
                  <button class="btn-checkin-principal" data-id="${ag.agendamento_id}">
                    <i class="bi bi-geo-alt-fill"></i> Fazer Check-in Agora
                  </button>
                ` : aulaPassada ? `
                  <div class="checkin-perdido-box">
                    <i class="bi bi-x-circle"></i>
                    Check-in não realizado
                  </div>
                ` : `
                  <div class="checkin-aguardando-box">
                    <i class="bi bi-clock"></i>
                    Check-in disponível 30 min antes
                  </div>
                `}
                
                <!-- Botão Cancelar -->
                ${!checkinFeito && !aulaPassada ? `
                  <button class="btn-cancelar-moderno" data-id="${ag.agendamento_id}">
                    <i class="bi bi-trash"></i> Cancelar Agendamento
                  </button>
                ` : ''}
              </div>
              
            </div>
          `;
        }).join('');
        
        meusAgendamentos.innerHTML = html;
        
        // Eventos
        document.querySelectorAll('.btn-checkin-principal').forEach(btn => {
          btn.addEventListener('click', () => fazerCheckin(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-cancelar-moderno').forEach(btn => {
          btn.addEventListener('click', () => cancelarAgendamento(btn.dataset.id));
        });
        
      } catch (error) {
        loadingAgendamentos.style.display = 'none';
        errorAgendamentos.textContent = 'Erro ao carregar agendamentos';
        errorAgendamentos.style.display = 'block';
      }
    }
    
    // Fazer check-in
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
                await carregarAgendamentos();
              } catch (error) {
                showErrorToast('Erro ao fazer check-in');
              }
            },
            async (error) => {
              try {
                await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
                showSuccessToast('Check-in realizado (sem localização)');
                await carregarAgendamentos();
              } catch (error) {
                showErrorToast('Erro ao fazer check-in');
              }
            }
          );
        } else {
          await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
          showSuccessToast('Check-in realizado com sucesso!');
          await carregarAgendamentos();
        }
      } catch (error) {
        showErrorToast('Erro ao fazer check-in');
      }
    }
    
    // Cancelar agendamento
    async function cancelarAgendamento(agendamentoId) {
      if (!confirm('Deseja realmente cancelar este agendamento?')) return;
      
      try {
        await fetch(`/api/agendamentos/${agendamentoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        showSuccessToast('Agendamento cancelado');
        await carregarAgendamentos();
        
      } catch (error) {
        showErrorToast('Erro ao cancelar');
      }
    }
    
    // Inicializar
    await carregarAgendamentos();
    
  } catch (error) {
    if (error.message.includes("autenticado")) return;
    console.error("Erro:", error);
  }
})();
