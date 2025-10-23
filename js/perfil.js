// js/perfil.js
// Script executado QUANDO paginas/perfil.html é carregado

// Função auto-executável para encapsular o escopo e usar async/await
(async function() {
    try {
        // 1. PROTEGER A PÁGINA: Verifica se está logado
        // (Função global do auth.js)
        // Se não estiver, esta função vai lançar um erro e o ajax-navigation vai redirecionar
        protectPage(); 
        
        console.log("Página de perfil. Usuário está logado.");

        // 2. OBTER ELEMENTOS DO DOM (da página perfil.html)
        const profileInfoDiv = document.getElementById('profileInfo');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessageDiv = document.getElementById('errorMessage');

        // Spans para os dados
        const userNameSpan = document.getElementById('userName');
        const userEmailSpan = document.getElementById('userEmail');
        const userTelefoneSpan = document.getElementById('userTelefone');
        const userNascimentoSpan = document.getElementById('userNascimento');
        const userTipoSanguineoSpan = document.getElementById('userTipoSanguineo');
        const userContatoEmergenciaSpan = document.getElementById('userContatoEmergencia');
        const userTelefoneEmergenciaSpan = document.getElementById('userTelefoneEmergencia');

        // 3. BUSCAR DADOS DA API
        console.log("Buscando dados do usuário na API...");
        // A função getJson (do api.js) já inclui o token no cabeçalho
        const userData = await getJson('/api/user/profile'); // Rota correta do backend

        console.log("Dados recebidos:", userData);

        // 4. PREENCHER A PÁGINA
        if (userData) {
            userNameSpan.textContent = userData.nome || 'Não informado';
            userEmailSpan.textContent = userData.email || 'Não informado';
            userTelefoneSpan.textContent = userData.telefone || 'Não informado';
            
            let dataFormatada = 'Não informada';
            if (userData.data_nascimento) {
                try {
                    dataFormatada = new Date(userData.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                } catch (e) {
                    dataFormatada = userData.data_nascimento;
                }
            }
            userNascimentoSpan.textContent = dataFormatada;
            
            userTipoSanguineoSpan.textContent = userData.tipo_sanguineo || 'Não informado';
            userContatoEmergenciaSpan.textContent = userData.contato_emergencia || 'Não informado';
            userTelefoneEmergenciaSpan.textContent = userData.telefone_emergencia || 'Não informado';

            // Exibe as informações e esconde o carregamento
            loadingMessage.style.display = 'none';
            profileInfoDiv.style.display = 'block';
        } else {
            throw new Error("Dados do usuário não recebidos da API.");
        }

    } catch (error) {
        // Se o erro for "Usuário não autenticado", a execução já foi parada e redirecionada
        if (error.message.includes("autenticado")) {
            console.log("Execução do perfil.js interrompida.");
            return; 
        }

        // Outros erros (ex: falha na API, dados não encontrados)
        console.error("Erro ao carregar dados do perfil:", error);
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessageDiv = document.getElementById('errorMessage');
        
        if(loadingMessage) loadingMessage.style.display = 'none';
        if(errorMessageDiv) {
            errorMessageDiv.textContent = `Erro ao carregar perfil: ${error.message}`;
            errorMessageDiv.style.display = 'block';
        }
    }
})();

