// js/auth.js
// Funções globais de autenticação

const TOKEN_KEY = 'authToken';

// ====================== PONTO DE VERIFICAÇÃO ======================
// A página de destino após o login é definida AQUI.
const HOME_PAGE_PATH = 'paginas/perfil.html'; 
// ================================================================

const LOGIN_PAGE_PATH = 'paginas/login.html'; 
const LOGOUT_PAGE_PATH = 'paginas/home.html'; 

/**
 * Salva o token de autenticação no localStorage.
 */
function saveToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        console.error("Tentativa de salvar um token nulo ou indefinido.");
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
}

/**
 * Verifica se o usuário está logado (se existe um token).
 */
function isLoggedIn() {
    const token = getToken();
    return !!token;
}

/**
 * Realiza o logout do usuário.
 */
function logout() {
    removeToken();
    console.log("Usuário deslogado. Redirecionando...");
    
    // Chama a função global de carregamento de conteúdo (exposta em ajax-navigation.js)
    if (typeof window.carregarPagina === 'function') {
        window.carregarPagina(LOGOUT_PAGE_PATH);
    } else {
        // Fallback caso algo dê errado
        window.location.reload();
    }
    // Atualiza a UI da navegação imediatamente
    updateNavUI();
}

/**
 * Protege uma página. Redireciona para o login se não estiver autenticado.
 * Deve ser chamada no início dos scripts de páginas protegidas (ex: perfil.js).
 */
function protectPage() {
    if (!isLoggedIn()) {
        console.warn("Acesso negado. Redirecionando para login.");
        if (typeof window.carregarPagina === 'function') {
            window.carregarPagina(LOGIN_PAGE_PATH);
        } else {
             window.location.reload();
        }
        // Lança um erro para parar a execução do script da página (ex: perfil.js)
        throw new Error("Usuário não autenticado.");
    }
}

/**
 * Atualiza os links de navegação (Login, Logout, Perfil) no header.
 * Esta função é chamada pelo index.html (no load) e pelo ajax-navigation.js (a cada página)
 */
function updateNavUI() {
    // IDs que definimos no index.html
    const profileLink = document.getElementById('profile-nav-link');
    const loginLink = document.getElementById('login-nav-link');
    const logoutLink = document.getElementById('logout-nav-link');

    if (!profileLink || !loginLink || !logoutLink) {
        // Se os elementos ainda não existem (raro, mas possível), não faz nada.
        return;
    }

    if (isLoggedIn()) {
        profileLink.style.display = 'list-item'; // 'list-item' para <li>
        loginLink.style.display = 'none';   
        logoutLink.style.display = 'list-item'; 
    } else {
        profileLink.style.display = 'none'; 
        loginLink.style.display = 'list-item';  
        logoutLink.style.display = 'none'; 
    }
}

