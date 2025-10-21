document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const listaAulasDiv = document.getElementById('lista-aulas'); // Precisaremos criar este elemento no HTML
    const mensagemDiv = document.getElementById('mensagem'); // Para mostrar erros ou sucesso

    // Se não houver token, redireciona para o login (ou mostra mensagem)
    if (!token) {
        // Poderia redirecionar: window.location.href = '../login.html'; 
        if (listaAulasDiv) listaAulasDiv.innerHTML = '<p class="text-danger">Você precisa estar logado para ver as aulas.</p>';
        return; 
    }

    try {
        // Busca as aulas da API
        const response = await fetch('http://localhost:3000/api/aulas');
        if (!response.ok) {
            throw new Error('Erro ao buscar aulas.');
        }
        const aulas = await response.json();

        // Limpa a área de aulas antes de adicionar as novas
        if (listaAulasDiv) listaAulasDiv.innerHTML = ''; 

        if (aulas.length === 0) {
             if (listaAulasDiv) listaAulasDiv.innerHTML = '<p>Nenhuma aula disponível no momento.</p>';
             return;
        }

        // Cria o HTML para cada aula
        aulas.forEach(aula => {
            const aulaCard = document.createElement('div');
            aulaCard.className = 'col-md-4 mb-4'; // Usa classes do Bootstrap para layout de card

            // Formata a data e hora para exibição
            const dataHoraFormatada = new Date(aula.data_hora).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });

            aulaCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${aula.nome}</h5>
                        <p class="card-text">Instrutor: ${aula.instrutor || 'Não definido'}</p>
                        <p class="card-text">Data: ${dataHoraFormatada}</p>
                        <p class="card-text">Vagas: <span id="vagas-${aula.id}">${/* Precisaremos buscar isso dinamicamente ou calcular */ aula.vagas_totais}</span></p> 
                        <button class="btn btn-primary btn-agendar" data-aula-id="${aula.id}">Agendar</button>
                    </div>
                </div>
            `;
            if (listaAulasDiv) listaAulasDiv.appendChild(aulaCard);
        });

        // Adiciona o listener para os botões de agendar DEPOIS que eles foram criados
        adicionarListenersAgendar();

    } catch (error) {
        console.error('Erro:', error);
        if (listaAulasDiv) listaAulasDiv.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
});

// Função para adicionar listeners aos botões "Agendar"
function adicionarListenersAgendar() {
    const token = localStorage.getItem('authToken');
    const mensagemDiv = document.getElementById('mensagem');
    document.querySelectorAll('.btn-agendar').forEach(button => {
        button.addEventListener('click', async (event) => {
            const aulaId = event.target.getAttribute('data-aula-id');

            if (!token) {
                if (mensagemDiv) mensagemDiv.textContent = 'Erro: Token não encontrado. Faça login novamente.';
                if (mensagemDiv) mensagemDiv.className = 'alert alert-danger';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/agendamentos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Envia o token
                    },
                    body: JSON.stringify({ aula_id: parseInt(aulaId) }) 
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Erro ${response.status}`);
                }

                if (mensagemDiv) mensagemDiv.textContent = data.message || 'Agendamento realizado com sucesso!';
                if (mensagemDiv) mensagemDiv.className = 'alert alert-success'; 
                // Opcional: Atualizar a contagem de vagas visualmente ou recarregar a lista

            } catch (error) {
                console.error('Erro ao agendar:', error);
                if (mensagemDiv) mensagemDiv.textContent = `Erro ao agendar: ${error.message}`;
                if (mensagemDiv) mensagemDiv.className = 'alert alert-danger';
            }
        });
    });
}