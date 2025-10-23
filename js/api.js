// js/api.js
// Funções globais para chamadas de API

// ATENÇÃO: Ajuste esta URL para a URL do seu backend
const API_BASE_URL = 'http://localhost:3000'; 

/**
 * Cria os cabeçalhos padrão para as requisições API.
 */
function getHeaders() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const token = getToken(); // Função do auth.js
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
}

/**
 * Função genérica para realizar chamadas fetch para a API.
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: getHeaders(),
    };

    const mergedOptions = { ...defaultOptions, ...options };

    if (mergedOptions.body && typeof mergedOptions.body !== 'string') {
        mergedOptions.body = JSON.stringify(mergedOptions.body);
    }

    try {
        const response = await fetch(url, mergedOptions);

        // Se o token for inválido ou expirado (401/403), desloga o usuário
        if (response.status === 401 || response.status === 403) {
            console.warn(`Erro ${response.status}: Token inválido ou expirado.`);
            logout(); // Função do auth.js (limpa token e redireciona)
            return Promise.reject(new Error(`Não autorizado. Faça login novamente.`));
        }

        return response; // Retorna a resposta completa
    } catch (error) {
        console.error(`Erro de rede ou fetch para ${url}:`, error);
        throw new Error("Erro ao conectar com o servidor."); // Lança um erro genérico
    }
}

/**
 * Helper para GET requests que já retorna o JSON.
 */
async function getJson(endpoint) {
    const response = await fetchApi(endpoint, { method: 'GET' });
    const responseBody = await response.json().catch(() => response.text()); // Tenta JSON, fallback para texto

    if (!response.ok) {
        const errorMessage = (responseBody && responseBody.message) ? responseBody.message : responseBody;
        console.error(`Erro GET ${endpoint}: ${response.status}`, responseBody);
        throw new Error(errorMessage || `Erro ${response.status}`);
    }
    return responseBody;
}

/**
 * Helper para POST requests que já retorna o JSON.
 */
async function postJson(endpoint, data) {
    const response = await fetchApi(endpoint, {
        method: 'POST',
        body: data // O fetchApi vai converter para JSON string
    });

    const contentType = response.headers.get("content-type");
    let responseBody;

    try {
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }
    } catch (e) {
         responseBody = "Resposta inválida do servidor.";
    }

    if (!response.ok) {
        console.error(`Erro POST ${endpoint}: ${response.status}`, responseBody);
        const errorMessage = (responseBody && responseBody.message) ? responseBody.message : responseBody;
        throw new Error(errorMessage || `Erro ${response.status}`);
    }

    return responseBody;
}

