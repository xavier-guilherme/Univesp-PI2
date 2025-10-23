// js/login.js
// Esta função é chamada pelo `onsubmit="submitLoginForm(event)"` no seu `paginas/login.html`

async function submitLoginForm(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    console.log("Formulário de login enviado.");

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const errorMessageDiv = document.getElementById('loginErrorMessage');
    const submitButton = event.target.querySelector('button[type="submit"]');

    // Limpa mensagens de erro e desabilita o botão
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }
    if (submitButton) submitButton.disabled = true;

    try {
        // Usa as funções globais de api.js e auth.js
        console.log("Enviando para postJson...");
        
        // postJson (de api.js) faz o fetch para http://localhost:3000/auth/login
        const response = await postJson('/auth/login', { email, senha });

        if (response && response.token) {
            console.log("Login bem-sucedido, token recebido.");
            
            // saveToken (de auth.js) salva o token no localStorage
            saveToken(response.token); 
            
            // updateNavUI (de auth.js) atualiza os links do header
            updateNavUI(); 

            // ====================== PONTO DE VERIFICAÇÃO ======================
            // A chamada de redirecionamento usa a constante de auth.js
            // ================================================================
            if (typeof window.carregarPagina === 'function') {
                window.carregarPagina(HOME_PAGE_PATH); 
            } else {
                console.error("Erro: window.carregarPagina não está definida. Recarregando.");
                window.location.reload();
            }
        
        } else {
            // Resposta OK mas sem token
            throw new Error("Token não recebido na resposta.");
        }

    } catch (error) {
        // Erros de API (401, 500) ou de rede
        console.error("Erro durante o login:", error);
        if (errorMessageDiv) {
            // A mensagem de erro vem da API (capturada pelo postJson)
            errorMessageDiv.textContent = error.message || 'Credenciais inválidas ou erro no servidor.';
            errorMessageDiv.style.display = 'block';
        }
        // Reabilita o botão em caso de erro
        if (submitButton) submitButton.disabled = false;
    }
}

