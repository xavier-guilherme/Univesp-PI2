// js/perfil.js

(async function() {
    try {
        protectPage();

        // DOM
        const profileInfoDiv = document.getElementById('profileInfo');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessageDiv = document.getElementById('errorMessage');

        // Spans
        const userNameSpan = document.getElementById('userNamePerfil');
        const userEmailSpan = document.getElementById('userEmail');
        const userTelefoneSpan = document.getElementById('userTelefone');
        const userNascimentoSpan = document.getElementById('userNascimento');

        let userData = null;

        window.tornarPerfilEditavel = function() {
            document.getElementById('formEditarPerfil').style.display = 'block';
            profileInfoDiv.style.display = 'none';
        }

        window.cancelarEdicaoPerfil = function() {
            document.getElementById('formEditarPerfil').style.display = 'none';
            profileInfoDiv.style.display = 'block';
        }

        await carregarPerfil();

        async function carregarPerfil() {
            loadingMessage.style.display = 'block';
            profileInfoDiv.style.display = 'none';
            document.getElementById('formEditarPerfil')?.style.setProperty('display', 'none');
            if (errorMessageDiv) errorMessageDiv.style.display = 'none';

            // Chame o endpoint correto
            const resp = await fetch('/api/user/profile', {
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });

            userData = await resp.json();

            if (!resp.ok) {
                throw new Error(userData.error || "Erro ao carregar perfil.");
            }

            // Preencher
            userNameSpan.textContent = userData.nome || 'Não informado';
            userEmailSpan.textContent = userData.email || 'Não informado';
            userTelefoneSpan.textContent = userData.telefone || 'Não informado';

            let dataFormatada = '';
            if (userData.data_nascimento) {
                try {
                    dataFormatada = new Date(userData.data_nascimento).toISOString().substr(0,10);
                    userNascimentoSpan.textContent = new Date(dataFormatada).toLocaleDateString('pt-BR');
                } catch {
                    userNascimentoSpan.textContent = 'Não informada';
                }
            } else {
                userNascimentoSpan.textContent = 'Não informada';
            }

            document.getElementById('editNome').value = userData.nome || '';
            document.getElementById('editTelefone').value = userData.telefone || '';
            document.getElementById('editNascimento').value = dataFormatada || '';

            const userNameHeader = document.getElementById('userName');
            if (userNameHeader) {
                userNameHeader.textContent = userData.nome || 'Aluno';
            }

            loadingMessage.style.display = 'none';
            profileInfoDiv.style.display = 'block';
        }

        // Envio do formulário
        document.getElementById('formEditarPerfil').addEventListener('submit', async function(e){
            e.preventDefault();

            const payload = {
                nome: document.getElementById('editNome').value.trim(),
                telefone: document.getElementById('editTelefone').value.trim(),
                data_nascimento: document.getElementById('editNascimento').value
            };

            try {
                if (!payload.nome) {
                    showErrorToast('Informe seu nome completo');
                    return;
                }
                
                const resp = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(payload)
                });

                const result = await resp.json();

                if (!resp.ok) {
                    throw new Error(result.error || 'Falha ao atualizar perfil');
                }

                showSuccessToast('Perfil atualizado com sucesso!');
                await carregarPerfil();
                cancelarEdicaoPerfil();
            } catch (error) {
                showErrorToast('Falha ao atualizar perfil: ' + error.message);
            }
        });

    } catch (error) {
        if (error.message && error.message.includes("autenticado")) return;
        if (errorMessageDiv) {
            errorMessageDiv.textContent = `Erro ao carregar perfil: ${error.message}`;
            errorMessageDiv.style.display = 'block';
        }
    }
})();
