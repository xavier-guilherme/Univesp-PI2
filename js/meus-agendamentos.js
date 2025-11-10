// js/meus-agendamentos.js

(async function() {
  try {
    // 1. PROTEGER A PÁGINA
    protectPage();
    
    // 2. ELEMENTOS DO DOM
    const loadingAulas = document.getElementById('loadingAulas');
    const aulasDisponiveis = document.getElementById('aulasDisponiveis');
    const errorAulas = document.getElementById('errorAulas');
    
    const loadingAgendamentos = document.getElementById('loadingAgendamentos');
    const meusAgendamentos = document.getElementById('meusAgendamentos');
    const errorAgendamentos = document.getElementById('errorAgendamentos');
    
    // 3. FUNÇÃO AUXILIAR: Formatar horário
    function formatarHorario(dataHora) {
      if (!dataHora) return 'Não definido';
      const data = new Date(dataHora);
      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    
    // 4. FUNÇÃO: Verificar se check-in está disponível
    function podeCheckin(dataHoraAula) {
      const horarioAula = new Date(dataHoraAula);
      const agora = new Date();
      const diffMinutos = (horarioAula - agora) / 1000 / 60;
      return diffMinutos <= 30 && diffMinutos >= -30;
    }
    
    // 5. CARREGAR AULAS DISPONÍVEIS
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
        
        // Adicionar eventos aos botões de agendar
        document.querySelectorAll('.btn-agendar').forEach(btn => {
          btn.addEventListener('click', () => agendarAula(btn.dataset.id));
        });
        
      } catch (error) {
        loadingAulas.style.display = 'none';
        errorAulas.textContent = 'Erro ao carregar aulas: ' + error.message;
        errorAulas.style.display = 'block';
      }
    }
    
    // 6. CARREGAR MEUS AGENDAMENTOS (VERSÃO MELHORADA COM STATUS CHECK-IN)
    async function carregarMeusAgendamentos() {
      try {
        loadingAgendamentos.style.display = 'block';
        errorAgendamentos.style.display = 'none';
        meusAgendamentos.innerHTML = '';
        
        const agendamentos = await getJsonAuth('/api/agendamentos/meus');
        
        loadingAgendamentos.style.display = 'none';
        
        if (agendamentos.length === 0) {
          meusAgendamentos.innerHTML = `
            <div class="sem-agendamentos">
              <i class="bi bi-calendar-x"></i>
              <p>Você ainda não tem agendamentos.</p>
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
          
          // Status visual do check-in
          let statusCheckin = '';
          if (checkinFeito) {
            statusCheckin = `
              <div class="checkin-status checkin-realizado">
                <i class="bi bi-check-circle-fill"></i>
                <span>Check-in realizado</span>
              </div>
            `;
          } else if (aulaPassada) {
            statusCheckin = `
              <div class="checkin-status checkin-perdido">
                <i class="bi bi-x-circle-fill"></i>
                <span>Check-in não realizado</span>
              </div>
            `;
          } else if (podeCheckinAgora) {
            statusCheckin = `
              <div class="checkin-status checkin-disponivel">
                <i class="bi bi-geo-alt-fill"></i>
                <span>Check-in disponível agora!</span>
                <button class="btn-checkin-ativo btn-checkin" data-id="${ag.agendamento_id}">
                  <i class="bi bi-check-circle"></i> Fazer Check-in
                </button>
              </div>
            `;
          } else {
            const minutosRestantes = diffMinutos > 0 ? diffMinutos : 0;
            const horasRestantes = Math.floor(minutosRestantes / 60);
            const minsRestantes = minutosRestantes % 60;
            
            let tempoTexto = '';
            if (horasRestantes > 0) {
              tempoTexto = `${horasRestantes}h ${minsRestantes}min`;
            } else {
              tempoTexto = `${minsRestantes} minutos`;
            }
            
            statusCheckin = `
              <div class="checkin-status checkin-aguardando">
                <i class="bi bi-clock-fill"></i>
                <span>Check-in disponível em <strong>${tempoTexto}</strong></span>
                <small>Disponível 30 min antes da aula</small>
              </div>
            `;
          }
          
          return `
            <div class="agendamento-card ${checkinFeito ? 'agendamento-confirmado' : ''}">
              <div class="agendamento-header">
                <h4><i class="bi bi-water"></i> ${ag.aula_nome}</h4>
                ${checkinFeito ? '<span class="badge-confirmado">Confirmado</span>' : ''}
              </div>
              
              <div class="agendamento-info">
                <div class="info-row">
                  <i class="bi bi-person"></i>
                  <span><strong>Instrutor:</strong> ${ag.instrutor || 'Não informado'}</span>
                </div>
                <div class="info-row">
                  <i class="bi bi-calendar"></i>
                  <span><strong>Data:</strong> ${dataHoraAula.toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="info-row">
                  <i class="bi bi-clock"></i>
                  <span><strong>Horário:</strong> ${formatarHorario(ag.data_hora)}</span>
                </div>
                <div class="info-row">
                  <i class="bi bi-tag"></i>
                  <span><strong>Tipo:</strong> ${ag.tipo_aula || 'Regular'}</span>
                </div>
              </div>
              
              ${statusCheckin}
              
              ${!checkinFeito && !aulaPassada ? `
                <button class="btn-cancelar-agendamento" data-id="${ag.agendamento_id}">
                  <i class="bi bi-x-circle"></i> Cancelar Agendamento
                </button>
              ` : ''}
            </div>
          `;
        }).join('');
        
        meusAgendamentos.innerHTML = html;
        
        // Adicionar eventos aos botões de check-in
        document.querySelectorAll('.btn-checkin').forEach(btn => {
          btn.addEventListener('click', () => fazerCheckin(btn.dataset.id));
        });
        
        // Adicionar eventos aos botões de cancelar
        document.querySelectorAll('.btn-cancelar-agendamento').forEach(btn => {
          btn.addEventListener('click', () => cancelarAgendamento(btn.dataset.id));
        });
        
      } catch (error) {
        loadingAgendamentos.style.display = 'none';
        errorAgendamentos.textContent = 'Erro ao carregar agendamentos: ' + error.message;
        errorAgendamentos.style.display = 'block';
      }
    }

    // 7. AGENDAR AULA
    async function agendarAula(aulaId) {
      try {
        await postJsonAuth('/api/agendamentos', { aula_id: aulaId });
        
        // ✅ TOAST DE SUCESSO
        showSuccessToast('Agendamento realizado com sucesso!');
        
        carregarMeusAgendamentos();
        carregarAulasDisponiveis();
      } catch (error) {
        // ✅ TOAST DE ERRO
        showErrorToast('Erro ao agendar: ' + error.message);
      }
    }
    
    // 8. FAZER CHECK-IN
    async function fazerCheckin(agendamentoId) {
      try {
        // Tentar obter localização do navegador
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {
                  localizacao_lat: position.coords.latitude,
                  localizacao_lng: position.coords.longitude
                });
                
                // ✅ TOAST DE SUCESSO
                showSuccessToast('Check-in realizado com sucesso!');
                
                carregarMeusAgendamentos();
              } catch (error) {
                // ✅ TOAST DE ERRO
                showErrorToast('Erro ao fazer check-in: ' + error.message);
              }
            },
            async (error) => {
              // Se negar localização, faz check-in sem localização
              console.warn('Localização negada:', error);
              try {
                await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
                
                // ✅ TOAST DE SUCESSO
                showSuccessToast('Check-in realizado com sucesso (sem localização)!');
                
                carregarMeusAgendamentos();
              } catch (error) {
                // ✅ TOAST DE ERRO
                showErrorToast('Erro ao fazer check-in: ' + error.message);
              }
            }
          );
        } else {
          // Navegador não suporta geolocalização
          await postJsonAuth(`/api/agendamentos/${agendamentoId}/checkin`, {});
          
          // ✅ TOAST DE SUCESSO
          showSuccessToast('Check-in realizado com sucesso!');
          
          carregarMeusAgendamentos();
        }
      } catch (error) {
        // ✅ TOAST DE ERRO
        showErrorToast('Erro ao fazer check-in: ' + error.message);
      }
    }
    
    // 9. CANCELAR AGENDAMENTO
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
        
        // ✅ TOAST DE SUCESSO
        showSuccessToast('Agendamento cancelado com sucesso!');
        
        carregarMeusAgendamentos();
        carregarAulasDisponiveis();
        
      } catch (error) {
        // ✅ TOAST DE ERRO
        showErrorToast('Erro ao cancelar agendamento: ' + error.message);
      }
    }
    
    // INICIALIZAR
    carregarAulasDisponiveis();
    carregarMeusAgendamentos();
    
  } catch (error) {
    if (error.message.includes("autenticado")) {
      return;
    }
    console.error("Erro na página de agendamentos:", error);
  }
})();
