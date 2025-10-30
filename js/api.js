// js/api.js
// Funções globais para chamadas de API

// Ajuste se necessário no deploy
const API_BASE_URL = '';

/**
 * Cabeçalhos padrão com Authorization quando houver token.
 */
function getHeaders() {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const token = getToken(); // de auth.js
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Wrapper de fetch com baseURL e tratamento 401/403.
 */
async function fetchApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const mergedOptions = {
    headers: getHeaders(),
    ...options,
  };

  if (mergedOptions.body && typeof mergedOptions.body !== 'string') {
    mergedOptions.body = JSON.stringify(mergedOptions.body);
  }

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401 || response.status === 403) {
      console.warn(`Erro ${response.status}: não autorizado/expirado.`);
      logout();
      throw new Error('Não autorizado. Faça login novamente.');
    }

    return response;
  } catch (error) {
    console.error(`Erro de rede ao chamar ${url}:`, error);
    throw new Error('Erro ao conectar com o servidor.');
  }
}

/**
 * Helpers JSON.
 */
async function getJson(endpoint) {
  const res = await fetchApi(endpoint, { method: 'GET' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Erro ${res.status}`);
  }
  return data;
}

async function postJson(endpoint, body) {
  const res = await fetchApi(endpoint, { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Erro ${res.status}`);
  }
  return data;
}
