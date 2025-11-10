// js/perfil.js

(async function() {
    try {
        // Proteger a página
        protectPage();
        console.log("Página de perfil. Usuário está logado.");

        // DOM
        const profileInfoDiv = document.getElementById('profileInfo');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessageDiv = document.getElementById('errorMessage');

        // Spans para leitura
        const userNameSpan = document.getElementById('userName');
        const userEmailSpan = document.getElementById('userEmail');
        const userTelefoneSpan = document.getElementById('userTelefone');
        const userNascimentoSpan = document.getElementById('userNascimento');
        const userTipoSanguineoSpan = document.getElementById('userTipoSanguineo');
        const userContatoEmergenciaSpan = document.getElementById('userContatoEmergencia');
        const userTelefoneEmergenciaSpan = document.getElementById('userTelefoneEmergencia');

        // Para edição
        let userData = null;

        // Função para ativar edição
        window.tornarPerfilEditavel = function() {
            preencherPerfilEditavel();
            document.getElementById('formEditarPerfil').style.display = 'block';
            profileInfoDiv.style.display = 'none';
        }

        // Função para voltar ao modo leitura
        window.cancelarEdicaoPerfil = function() {
            document.getElementById('formEditarPerfil').style.display = 'none';
            profileInfoDiv.style.display = 'block';
        }

        // Preenche dados ao carregar
        await carregarPerfil();

        async function carregarPerfil() {
            loadingMessage.style.display = 'block';
            profileInfoDiv.style.display = 'none';
            document.getElementById('formEditarPerfil')?.style.setProperty('display', 'none');
            if (errorMessageDiv) errorMessageDiv.style.display = 'none';

            userData = await getJsonAuth('/api/user/profile');

            // Sobrescrevendo spans e inputs
            userNameSpan.textContent = userData.nome || 'Não informado';
            userEmailSpan.textContent = userData.email || 'Não informado';
            userTelefoneSpan.textContent = userData.telefone || 'Não informado';

            let dataFormatada = '';
            if (userData.data_nascimento) {
                try {
                    dataFormatada = new Date(userData.data_nascimento).toISOString().substr(0,10);
                } catch {
                    dataFormatada = userData.data_nascimento;
                }
            }
            userNascimentoSpan.textContent = dataFormatada ? new Date(dataFormatada).toLocaleDateString('pt-BR') : 'Não informada';

            userTipoSanguineoSpan.textContent = userData.tipo_sanguineo || 'Não informado';
            userContatoEmergenciaSpan.textContent = userData.contato_emergencia || 'Não informado';
            userTelefoneEmergenciaSpan.textContent = userData.telefone_emergencia || 'Não informado';

            // inputs edição
            document.getElementById('editNome').value = userData.nome || '';
            document.getElementById('editTelefone').value = userData.telefone || '';
            document.getElementById('editNascimento').value = dataFormatada || '';
            document.getElementById('editTipoSanguineo').value = userData.tipo_sanguineo || '';
            document.getElementById('editContatoEmergencia').value = userData.contato_emergencia || '';
            document.getElementById('editTelefoneEmergencia').value = userData.telefone_emergencia || '';

            // Exibe info
            loadingMessage.style.display = 'none';
            profileInfoDiv.style.display = 'block';
        }

        // SUBMETER EDIÇÃO DO PERFIL
        document.getElementById('formEditarPerfil').addEventListener('submit', async function(e){
            e.preventDefault();
            // Coleta campos
            const payload = {
                nome: document.getElementById('editNome').value.trim(),
                telefone: document.getElementById('editTelefone').value.trim(),
                data_nascimento: document.getElementById('editNascimento').value,
                tipo_sanguineo: document.getElementById('editTipoSanguineo').value,
                contato_emergencia: document.getElementById('editContatoEmergencia').value.trim(),
                telefone_emergencia: document.getElementById('editTelefoneEmergencia').value.trim()
            };

            try {
                // Validação rápida
                if (!payload.nome) {
                    showErrorToast('Informe seu nome completo');
                    return;
                }
                if (payload.telefone && !/^\d{8,15}$/.test(payload.telefone.replace(/\D/g,''))) {
                    showErrorToast('Telefone inválido');
                    return;
                }
                // Chamada API
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(payload)
                });
                showSuccessToast('Perfil atualizado com sucesso!');
                await carregarPerfil();
                cancelarEdicaoPerfil();
            } catch (error) {
                showErrorToast('Falha ao atualizar perfil');
            }
        });

        function preencherPerfilEditavel() {
            // Já preenchido por carregarPerfil
        }

    } catch (error) {
        if (error.message.includes("autenticado")) return;
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessageDiv = document.getElementById('errorMessage');
        if(loadingMessage) loadingMessage.style.display = 'none';
        if(errorMessageDiv) {
            errorMessageDiv.textContent = `Erro ao carregar perfil: ${error.message}`;
            errorMessageDiv.style.display = 'block';
        }
    }
})();
