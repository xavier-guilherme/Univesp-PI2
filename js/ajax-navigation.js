// js/ajax-navigation.js
// VERSÃO UNIFICADA E CORRIGIDA
// (Combina os dois scripts que estavam no seu arquivo)

document.addEventListener("DOMContentLoaded", () => {
  // Cache de páginas
  const pageCache = new Map();

  // Elementos globais
  const conteudo = document.getElementById("conteudo");

  // Verifica se o navegador suporta a API History
  const supportsHistory = window.history && 'pushState' in window.history;

  // Função para mostrar loader
  function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-busy', 'true');
    conteudo.innerHTML = '';
    conteudo.appendChild(loader);
  }

  // Função para atualizar links ativos
  function updateActiveLink(pagina) {
    document.querySelectorAll(".linkMenu").forEach(link => {
      const isActive = link.getAttribute("data-page") === pagina;
      link.classList.toggle("ativo", isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  // ===================================================================
  // FUNÇÃO 'executarScripts' (Trazida do seu segundo script)
  // ===================================================================
  function executarScripts(elemento) {
    const scripts = elemento.querySelectorAll('script');
    scripts.forEach(scriptAntigo => {
      const scriptNovo = document.createElement('script');
      
      // Copia atributos
      Array.from(scriptAntigo.attributes).forEach(attr => {
        scriptNovo.setAttribute(attr.name, attr.value);
      });
      
      // Copia o código
      scriptNovo.textContent = scriptAntigo.textContent;
      
      // Remove o script antigo e adiciona o novo (para forçar execução)
      scriptAntigo.parentNode.replaceChild(scriptNovo, scriptAntigo);
    });
  }
  // ===================================================================


  // Função para atualizar o conteúdo
  function updateContent(html, pagina) {
    conteudo.classList.add("fade-out");

    setTimeout(() => {
      conteudo.innerHTML = html;
      conteudo.classList.remove("fade-out");
      conteudo.classList.add("animar-secao");

      // ===================================================================
      // SUBSTITUIÇÃO: 
      // Chamando 'executarScripts' (do seu Bloco 2)
      // Esta é a função correta para carregar 'login.js', 'perfil.js', etc.
      // ===================================================================
      executarScripts(conteudo);
      
      // Reinicializa o AOS (animações)
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }

      // ===================================================================
      // MODIFICAÇÃO 2 (NECESSÁRIA): Chamar 'updateNavUI'
      // Isso atualiza os botões "Login/Logout" a cada navegação.
      // ===================================================================
      if (typeof updateNavUI === 'function') {
        updateNavUI();
      }
      // ===================================================================
      
      // Atualiza link ativo (do seu Bloco 1)
      updateActiveLink(pagina);
      
    }, 300); // 300ms da sua animação fade-out
  }

  // Função para mostrar erro
  function showErrorPage(failedPage) {
    conteudo.innerHTML = `
      <div class="error-page">
        <h2>Erro ao carregar conteúdo</h2>
        <p>Desculpe, ocorreu um problema ao carregar a página solicitada.</p>
        <button id="retryButton" class="btn-retry">Tentar novamente</button>
        <a href="#" class="linkMenu btn-home" data-page="paginas/home.html">Voltar para a página inicial</a>
      </div>
    `;
    
    // Adiciona listeners aos botões de erro
    document.getElementById('retryButton')?.addEventListener('click', () => {
      const currentPage = failedPage || 'paginas/home.html';
      window.carregarPagina(currentPage); // Usa a função global
    });
    
    document.querySelector('.btn-home')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.carregarPagina('paginas/home.html'); // Usa a função global
      if (supportsHistory) {
        history.pushState(null, "", "#!paginas/home.html");
      }
    });
  }


  // ===================================================================
  // MODIFICAÇÃO 1 (NECESSÁRIA): Expor 'carregarPagina' globalmente
  // Trocamos 'async function carregarPagina(pagina)' por 'window.carregarPagina = async function(pagina)'
  // ===================================================================
  window.carregarPagina = async function(pagina) {
    // Verifica se já está no cache
    if (pageCache.has(pagina)) {
      updateContent(pageCache.get(pagina), pagina);
      return;
    }
    
    showLoader();
    
    try {
      const response = await fetch(pagina);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Armazena no cache
      pageCache.set(pagina, html);
      
      updateContent(html, pagina);
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      showErrorPage(pagina); // Passa a página que falhou
    }
  }

  // Event listeners para links
  document.querySelectorAll(".linkMenu").forEach(link => {
    // Pré-carrega páginas quando o mouse passa sobre o link
    link.addEventListener('mouseenter', function() {
      const pagina = this.getAttribute('data-page');
      if (pagina && !pageCache.has(pagina)) {
        fetch(pagina).then(res => {
          if (res.ok) return res.text();
          throw new Error('Pré-carregamento falhou');
        }).then(html => {
          pageCache.set(pagina, html);
        }).catch(console.error);
      }
    });
    
    // Clique normal
    link.addEventListener("click", e => {
      const pagina = link.getAttribute("data-page");
      if (pagina) {
        e.preventDefault();
        window.carregarPagina(pagina); // Chama a função global
        
        // Atualiza histórico se suportado
        if (supportsHistory) {
          history.pushState(null, "", "#!" + pagina);
        } else {
          // Fallback para navegadores antigos
          window.location.hash = "#!" + pagina;
        }
      }
    });
  });

  // Lida com o botão voltar/avançar
  window.addEventListener('popstate', function() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#!")) {
      const pagina = hash.slice(2);
      window.carregarPagina(pagina); // Chama a função global
    } else {
      window.carregarPagina("paginas/home.html"); // Chama a função global
    }
  });

  // Carrega a página inicial
  const hash = window.location.hash;
  if (hash && hash.startsWith("#!")) {
    const pagina = hash.slice(2);
    window.carregarPagina(pagina); // Chama a função global
  } else {
    window.carregarPagina("paginas/home.html"); // Chama a função global
    if (supportsHistory) {
      history.replaceState(null, "", "#!paginas/home.html");
    }
  }
});
// O SEGUNDO SCRIPT QUE COMEÇAVA AQUI FOI REMOVIDO E UNIFICADO COM O PRIMEIRO.

