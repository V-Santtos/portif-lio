(() => {
  const gsap = window.gsap;

  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";

  // Sem entrada automática dentro do carrossel (mesmo padrão da MV e do
  // Nexous): o conteúdo já nasce no estado final. A cascata de entrada
  // (monograma → nav → título → parágrafo → CTA) pertence à origem, onde
  // ela abre a página; aqui ela reabriria o problema de "passagem rápida
  // troca o conteúdo visível" e obrigaria a tratar `case-preview:restore`
  // — não existe pose inicial pra restaurar.
  //
  // O hero da origem também não tem hover de navbar: o único efeito
  // comprovado é `.cta:hover`, que vive no CSS. Nada a animar aqui.

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
      const normalizedDelta = Math.max(-240, Math.min(240, event.deltaY * multiplier));

      window.parent.postMessage(
        { type: "case-preview:wheel", deltaY: normalizedDelta },
        window.location.origin
      );
    },
    { passive: false }
  );
})();
