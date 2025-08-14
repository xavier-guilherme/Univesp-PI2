// ==============================
// 🔠 TAMANHO DA FONTE (Acessibilidade)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const savedFontSize = localStorage.getItem("fontSize") || "normal";
  document.body.classList.add(`font-${savedFontSize}`);

  const activeFontBtn = document.querySelector(`.font-option[data-size="${savedFontSize}"]`);
  if (activeFontBtn) activeFontBtn.classList.add("active");

  document.querySelectorAll(".font-option").forEach(option => {
    option.addEventListener("click", () => {
      document.body.classList.remove("font-normal", "font-large", "font-extra");
      document.querySelectorAll(".font-option").forEach(o => o.classList.remove("active"));

      const size = option.dataset.size;
      option.classList.add("active");
      document.body.classList.add(`font-${size}`);
      localStorage.setItem("fontSize", size);
    });
  });
});