document.addEventListener("DOMContentLoaded", () => {
  const darkToggle = document.getElementById("toggleDarkMode");
  const darkStatus = document.getElementById("darkStatus");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const darkEnabled = saved ? saved === "true" : prefersDark;

  // Aplica o tema inicial com transição
  aplicarTransicaoTema(() => {
    document.body.classList.toggle("dark-mode", darkEnabled);
  });
  localStorage.setItem("darkMode", darkEnabled);
  if (darkStatus) darkStatus.textContent = darkEnabled ? "ON" : "OFF";

  darkToggle?.addEventListener("click", e => {
    e.preventDefault();
    aplicarTransicaoTema(() => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDark);
      if (darkStatus) darkStatus.textContent = isDark ? "ON" : "OFF";
    });
  });

  // 💡 Função que adiciona a classe de transição temporariamente
  function aplicarTransicaoTema(callback) {
    document.body.classList.add("theme-transition");
    setTimeout(() => {
      callback();
      document.body.classList.remove("theme-transition");
    }, 300); // tempo levemente maior que o transition no CSS
  }
});
