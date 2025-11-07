// js/admin_checkins.js

(async function() {
  try {
    protectPage();
    
    if (!isAdmin()) {
      document.getElementById('accessDenied').style.display = 'block';
      return;
    }
    
    document.getElementById('adminContent').style.display = 'block';
    
    const loadingCheckins = document.getElementById('loadingCheckins');
    const checkinsContainer = document.getElementById('checkinsContainer');
    const errorCheckins = document.getElementById('errorCheckins');
    const filtroAula = document.getElementById('filtroAula');
    
    // Carregar lista de check-ins
    async function carregarCheckins(aulaId = '') {
      try {
        loadingCheckins.style.display = 'block';
        errorCheckins.style.display = 'none';
        checkinsContainer.innerHTML = '';
        
        let url = '/api/checkins';
        if (aulaId) url += `?aula_id=${aulaId}`;
        
        const checkins = await getJsonAuth(url);
        
        loadingCheckins.style.display = 'none';
        
        if (checkins.length === 0) {
          checkinsContainer.innerHTML = '<p>Nenhum check-in realizado ainda.</p>';
          return;
        }
        
        const html = checkins.map(ch => `
          <div class="card" style="margin-bottom: 15px; padding: 15px;">
            <h4>${ch.aluno_nome}</h4>
            <p><strong>Aula:</strong> ${ch.aula_nome}</p>
            <p><strong>Data/Hora do Check-in:</strong> ${new Date(ch.data_checkin).toLocaleString('pt-BR')}</p>
            ${ch.localizacao_lat && ch.localizacao_lng 
              ? `<p><strong>Localização:</strong> 
                  <a href="https://www.google.com/maps?q=${ch.localizacao_lat},${ch.localizacao_lng}" target="_blank">
                    Ver no mapa
                  </a>
                </p>`
              : '<p><strong>Localização:</strong> Não registrada</p>'
            }
          </div>
        `).join('');
        
        checkinsContainer.innerHTML = html;
        
      } catch (error) {
        loadingCheckins.style.display = 'none';
        errorCheckins.textContent = 'Erro ao carregar check-ins: ' + error.message;
        errorCheckins.style.display = 'block';
      }
    }
    
    // Carregar aulas para o filtro
    async function carregarAulasFiltro() {
      try {
        const aulas = await getJsonAuth('/api/aulas');
        
        aulas.forEach(aula => {
          const option = document.createElement('option');
          option.value = aula.id;
          option.textContent = aula.nome;
          filtroAula.appendChild(option);
        });
        
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
      }
    }
    
    // Evento de filtro
    filtroAula.addEventListener('change', () => {
      carregarCheckins(filtroAula.value);
    });
    
    // Inicializar
    await carregarAulasFiltro();
    carregarCheckins();
    
  } catch (error) {
    if (error.message.includes("autenticado")) return;
    console.error("Erro na página de check-ins:", error);
  }
})();
