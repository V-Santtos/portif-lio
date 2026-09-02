(() => {
  document.documentElement.dataset.capsuleReady = "true";

  // Obrigatorio agora que a capsula tem <a> de verdade: hover e foco
  // respondem, mas nada muda a URL, envia formulario ou abre janela
  // (Regras/09 item 4).
  const stopNavigation = (event) => {
    const actionable = event.target.closest("a, button, form, [role='link']");
    if (!actionable) return;
    event.preventDefault();
  };

  document.addEventListener("click", stopNavigation, true);
  document.addEventListener("submit", stopNavigation, true);
  document.addEventListener("auxclick", stopNavigation, true);

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY === 0) return;
      event.preventDefault();

      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 810 : 1;
      const deltaY = Math.max(-240, Math.min(240, event.deltaY * multiplier));
      window.parent.postMessage({ type: "case-preview:wheel", deltaY }, window.location.origin);
    },
    { passive: false }
  );
})();
