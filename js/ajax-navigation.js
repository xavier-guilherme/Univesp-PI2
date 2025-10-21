// ==============================
// 🚀 AJAX Navigation System - Enhanced
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  // Cache de páginas
  const pageCache = new Map();
  
  // Elementos globais
  const conteudo = document.getElementById("conteudo");
  const mainContent = document.querySelector('main');
  
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
  
  // Função para carregar página
  async function carregarPagina(pagina) {
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
      showErrorPage();
    }
  }
  
  // Função para atualizar o conteúdo
  function updateContent(html, pagina) {
  conteudo.classList.add("fade-out");
  
  setTimeout(() => {
    conteudo.innerHTML = html;
    conteudo.classList.remove("fade-out");
    conteudo.classList.add("animar-secao");
    
    // Dispara evento customizado para scripts específicos da página
    const event = new CustomEvent('pageLoaded', { 
      detail: { 
        page: pagina,
        content: conteudo.innerHTML
      }
    });
    document.dispatchEvent(event);
    
    // Restante do seu código...
  }, 300);
}
  
  // Função para mostrar erro
  function showErrorPage() {
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
      const currentPage = window.location.hash.slice(2) || 'paginas/home.html';
      carregarPagina(currentPage);
    });
    
    document.querySelector('.btn-home')?.addEventListener('click', (e) => {
      e.preventDefault();
      carregarPagina('paginas/home.html');
      if (supportsHistory) {
        history.pushState(null, "", "#!paginas/home.html");
      }
    });
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
        carregarPagina(pagina);
        
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
      carregarPagina(pagina);
    } else {
      carregarPagina("paginas/home.html");
    }
  });
  
  // Carrega a página inicial
  const hash = window.location.hash;
  if (hash && hash.startsWith("#!")) {
    const pagina = hash.slice(2);
    carregarPagina(pagina);
  } else {
    carregarPagina("paginas/home.html");
    if (supportsHistory) {
      history.replaceState(null, "", "#!paginas/home.html");
    }
  }
});
// Navegação AJAX com suporte a scripts inline
document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('.linkMenu');
  const conteudo = document.getElementById('conteudo');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pagina = this.getAttribute('data-page');
      
      if (pagina) {
        carregarPagina(pagina);
      }
    });
  });
  
  function carregarPagina(url) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        // Injeta o HTML no conteúdo
        conteudo.innerHTML = html;
        
        // IMPORTANTE: Executa os scripts que vieram no HTML
        executarScripts(conteudo);
        
        // Reinicializa o AOS (animações)
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      })
      .catch(erro => {
        console.error('Erro ao carregar a página:', erro);
        conteudo.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
      });
  }
  
  // Função para executar scripts inline
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
});
