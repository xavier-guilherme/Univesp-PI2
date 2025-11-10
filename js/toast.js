// ===================================
// 🍞 SISTEMA DE NOTIFICAÇÕES TOAST
// ===================================

// Função para criar e exibir notificação
function showToast(message, type = 'success') {
  // Remove toast anterior se existir
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Cria o elemento toast
  const toast = document.createElement('div');
  toast.className = `custom-toast custom-toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x"></i>
    </button>
  `;

  // Adiciona ao body
  document.body.appendChild(toast);

  // Animação de entrada
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Remove automaticamente após 4 segundos
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 4000);
}

// Atalhos para facilitar o uso
window.showSuccessToast = (message) => showToast(message, 'success');
window.showErrorToast = (message) => showToast(message, 'error');
