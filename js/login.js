// js/login.js
// Chamado pelo onsubmit="submitLoginForm(event)" em paginas/login.html

async function submitLoginForm(event) {
  event.preventDefault();
  console.log('Formulário de login enviado.');

  const email = document.getElementById('email').value;
  const senha = document.getElementById('password').value;
  const errorMessageDiv = document.getElementById('loginErrorMessage');
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Reset UI
  if (errorMessageDiv) {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
  }
  if (submitButton) submitButton.disabled = true;

  try {
    console.log('Enviando para postJson...');
    // backend deve responder com { token, user }
    const data = await postJson('/auth/login', { email, senha });
    console.log('Resposta do login:', data);

    const jwt = data.token || data.jwt || data.accessToken;
    if (!jwt) throw new Error('Token não recebido na resposta do servidor.');

    saveToken(jwt);             // de auth.js (agora salva em 'token')
    if (data.user?.name) {
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userPerfil', data.user.perfil); // ← LINHA ADICIONADA
    }
    if (typeof updateNavUI === 'function') updateNavUI();

    if (typeof window.carregarPagina === 'function') {
      window.carregarPagina('paginas/perfil.html');
    } else {
      window.location.reload();
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
    if (errorMessageDiv) {
      errorMessageDiv.textContent = error.message || 'Credenciais inválidas ou erro no servidor.';
      errorMessageDiv.style.display = 'block';
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}
