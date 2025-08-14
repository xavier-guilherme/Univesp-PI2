function initGallery() {
  const galleryContainer = document.querySelector('#galeriaCaicaraVaa');
  if (!galleryContainer) return;

  gerarItensCarrossel();
}

function gerarItensCarrossel() {
    const container = document.querySelector('#galeriaCaicaraVaa .carousel-inner');
    if (!container) return;
    
    let html = '';

    for (let i = 1; i <= 326; i++) {
        const numeroFormatado = i.toString().padStart(3, '0');
        const imagemSrc = `imagens/3caicara/${numeroFormatado}.webp`;

        html += `
        <div class="carousel-item ${i === 1 ? 'active' : ''}">
            <a href="${imagemSrc}" class="uk-inline" data-caption="Imagem ${numeroFormatado}">
                <img src="${imagemSrc}" loading="lazy" 
                    class="d-block w-100 img-fluid" alt="Imagem ${numeroFormatado}"
                    onerror="this.style.display='none'">
            </a>
        </div>
        `;
    }

    container.innerHTML = html;
    initCarouselAndLightbox();
}

function initCarouselAndLightbox() {
  // Inicializa Bootstrap Carousel
  if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
    const carousel = new bootstrap.Carousel('#galeriaCaicaraVaa', {
      interval: 5000,
      wrap: true
    });
  }

  // Configuração do UIkit Lightbox
  if (typeof UIkit !== 'undefined') {
    // Força reinicialização para garantir que funcione com AJAX
    setTimeout(() => {
      UIkit.lightbox('.carousel-inner', {
        animation: 'slide',
        slidenav: false,
        nav: 'thumbnav',
        thumbnav: true,
        counter: true,
        items: Array.from(document.querySelectorAll('.carousel-inner a')).map(el => ({
          source: el.href,
          type: 'image',
          caption: el.dataset.caption || ''
        }))
      });
    }, 100);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', initGallery);
document.addEventListener('pageLoaded', function(e) {
  if (e.detail.page.includes('caicara-vaa.html')) {
    initGallery();
  }
});