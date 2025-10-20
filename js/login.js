// Espera o conteúdo da página ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessageDiv = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (event) => {
    // Impede o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // Pega os valores dos campos
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      // Faz a requisição para a nossa API de login
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }), // Converte os dados para JSON
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta não for de sucesso (ex: 401 Credenciais inválidas)
        throw new Error(data.error || 'Erro ao fazer login.');
      }

      // Se o login for bem-sucedido:
      // 1. Salva o token no localStorage do navegador
      localStorage.setItem('authToken', data.token);

      // 2. Redireciona o usuário para a página de aulas (ou um dashboard)
      alert('Login bem-sucedido!');
      window.location.href = 'aulas.html'; // Redireciona para a página de aulas

    } catch (error) {
      // Mostra a mensagem de erro na tela
      errorMessageDiv.textContent = error.message;
    }
  });
});