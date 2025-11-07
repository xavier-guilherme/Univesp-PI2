// js/auth.js
// Funções globais de autenticação

// Padronização: use sempre a mesma chave
const TOKEN_KEY = 'token';

// Página de destino após login
const HOME_PAGE_PATH = 'paginas/perfil.html';

const LOGIN_PAGE_PATH = 'paginas/login.html';
const LOGOUT_PAGE_PATH = 'paginas/home.html';

/**
 * Salva o token de autenticação no localStorage.
 */
function saveToken(token) {
  try {
    if (!token) throw new Error('Token inválido para salvar');
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Falha ao salvar token:', e);
  }
}

/**
 * Obtém o token de autenticação do localStorage.
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove o token de autenticação do localStorage.
 */
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('userName');
  localStorage.removeItem('userPerfil');
}

/**
 * Verifica se o usuário está logado (se existe um token).
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Realiza o logout do usuário.
 */
function logout() {
  removeToken();
  if (typeof updateNavUI === 'function') updateNavUI();
  if (typeof window.carregarPagina === 'function') {
    window.carregarPagina(LOGOUT_PAGE_PATH);
  } else {
    window.location.reload();
  }
}

/**
 * Protege páginas que exigem autenticação.
 */
function protectPage() {
  if (!isLoggedIn()) {
    if (typeof window.carregarPagina === 'function') {
      window.carregarPagina(LOGIN_PAGE_PATH);
    } else {
      window.location.reload();
    }
    throw new Error('Usuário não autenticado.');
  }
}

/**
 * Atualiza os links de navegação (Login, Logout, Perfil).
 */
function updateNavUI() {
  const profileLink = document.getElementById('profile-nav-link');
  const loginLink = document.getElementById('login-nav-link');
  const logoutLink = document.getElementById('logout-nav-link');
  const adminLink = document.getElementById('admin-nav-link');

  if (!profileLink || !loginLink || !logoutLink) return;

  if (isLoggedIn()) {
    profileLink.style.display = 'list-item';
    loginLink.style.display = 'none';
    logoutLink.style.display = 'list-item';
    
    // Mostrar link admin apenas se for admin
    if (adminLink && isAdmin()) {
      adminLink.style.display = 'list-item';
    } else if (adminLink) {
      adminLink.style.display = 'none';
    }
  } else {
    profileLink.style.display = 'none';
    loginLink.style.display = 'list-item';
    logoutLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

/**
 * Obtém o perfil do usuário do localStorage.
 */
function getUserPerfil() {
  return localStorage.getItem('userPerfil');
}

/**
 * Verifica se o usuário é admin.
 */
function isAdmin() {
  return getUserPerfil() === 'admin';
}
