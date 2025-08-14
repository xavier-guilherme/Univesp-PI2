// ==============================
// ⬆️ BOTÃO VOLTAR AO TOPO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const btnTopo = document.getElementById("btnTopo");

  window.addEventListener("scroll", () => {
    btnTopo.style.display = window.scrollY > 300 ? "block" : "none";
  });

  btnTopo?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});