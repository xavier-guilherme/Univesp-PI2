document.addEventListener("DOMContentLoaded", () => {
  const isMobile = () => window.innerWidth <= 768;
  const menu = document.querySelector(".menu");
  const btnFechar = document.getElementById("fecharMenuMobile");

  // ================================
  // 📌 Abre/Fecha o menu mobile (hambúrguer)
  // ================================
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    menu?.classList.toggle("open");
  });

  // ================================
  // 🔻 Seta abre/fecha submenu (somente no mobile)
  // ================================
  document.querySelectorAll(".toggle-submenu").forEach(botao => {
    botao.addEventListener("click", (e) => {
      if (!isMobile()) return;

      e.preventDefault();
      e.stopPropagation();

      const item = botao.closest("li");
      const jaAberto = item.classList.contains("open-submenu");

      // Fecha todos os submenus e reseta ícones
      document.querySelectorAll(".menu li.open-submenu").forEach(outro => {
        outro.classList.remove("open-submenu");
        const icone = outro.querySelector(".toggle-submenu i");
      });

      // Se não estava aberto, abre este
      if (!jaAberto) {
        item.classList.add("open-submenu");
        const icone = item.querySelector(".toggle-submenu i");
      }
    });
  });

  // ================================
  // ❌ Botão "Fechar Menu"
  // ================================
  btnFechar?.addEventListener("click", () => {
    menu.classList.remove("open");
    document.querySelectorAll(".menu li").forEach(li => li.classList.remove("open-submenu"));
  });

  // ================================
  // 🚪 Fecha o menu e submenus ao clicar em um link (mobile)
  // ================================
  document.querySelectorAll(".linkMenu").forEach(link => {
    link.addEventListener("click", () => {
      if (isMobile()) {
        menu.classList.remove("open");
        document.querySelectorAll(".menu li").forEach(li => li.classList.remove("open-submenu"));
      }
    });
  });
});
