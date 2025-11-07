// js/cadastro.js

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Reset mensagens
  document.getElementById('cadastroSuccess').style.display = 'none';
  document.getElementById('cadastroError').style.display = 'none';

  const nome = document.getElementById('cadastroNome').value.trim();
  const email = document.getElementById('cadastroEmail').value.trim();
  const senha = document.getElementById('cadastroSenha').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById('cadastroSuccess').textContent = 'Conta criada com sucesso! Você pode fazer login agora.';
      document.getElementById('cadastroSuccess').style.display = 'block';
      document.getElementById('cadastroForm').reset();
    } else {
      throw new Error(data.error || 'Erro ao criar conta');
    }
  } catch (error) {
    document.getElementById('cadastroError').textContent = error.message;
    document.getElementById('cadastroError').style.display = 'block';
  }
});
