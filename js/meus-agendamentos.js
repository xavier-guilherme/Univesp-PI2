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
    
    // 6. CARREGAR MEUS AGENDAMENTOS
    async function carregarMeusAgendamentos() {
      try {
        loadingAgendamentos.style.display = 'block';
        errorAgendamentos.style.display = 'none';
        meusAgendamentos.innerHTML = '';
        
        const agendamentos = await getJsonAuth('/api/agendamentos/meus');
        
        loadingAgendamentos.style.display = 'none';
        
        if (agendamentos.length === 0) {
          meusAgendamentos.innerHTML = '<p>Você ainda não tem agendamentos.</p>';
          return;
        }
        
        const html = agendamentos.map(ag => {
          const checkinFeito = ag.checkin_feito > 0;
          const podeCheckinAgora = podeCheckin(ag.data_hora);
          
          return `
            <div class="card" style="margin-bottom: 15px; padding: 15px; ${checkinFeito ? 'border-left: 4px solid #28a745;' : ''}">
              <h4>${ag.aula_nome}</h4>
              <p><strong>Instrutor:</strong> ${ag.instrutor || 'Não informado'}</p>
              <p><strong>Horário:</strong> ${formatarHorario(ag.data_hora)}</p>
              <p><strong>Tipo:</strong> ${ag.tipo_aula || 'Regular'}</p>
              <p><strong>Agendado em:</strong> ${new Date(ag.data_agendamento).toLocaleDateString('pt-BR')}</p>
              
              ${checkinFeito 
                ? '<p style="color: #28a745; font-weight: bold;"><i class="bi bi-check-circle"></i> Check-in realizado</p>'
                : podeCheckinAgora
                  ? `<button class="btn-primary btn-checkin" data-id="${ag.agendamento_id}">
                      <i class="bi bi-geo-alt"></i> Fazer Check-in
                    </button>`
                  : '<p style="color: #6c757d;">Check-in disponível 30 min antes/depois da aula</p>'
              }
              
              ${!checkinFeito 
                ? `<button class="btn-danger btn-cancelar" data-id="${ag.agendamento_id}">Cancelar Agendamento</button>`
                : ''
              }
            </div>
          `;
        }).join('');
        
        meusAgendamentos.innerHTML = html;
        
        // Adicionar eventos aos botões de check-in
        document.querySelectorAll('.btn-checkin').forEach(btn => {
          btn.addEventListener('click', () => fazerCheckin(btn.dataset.id));
        });
        
        // Adicionar eventos aos botões de cancelar
        document.querySelectorAll('.btn-cancelar').forEach(btn => {
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
