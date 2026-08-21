/* ============================================================
   Cascata de entrada — port GSAP fiel dos presets da origem
   (MV-OFICIAL/site-mv/src/lib/animation/motion.ts).

   navCascade  : from {autoAlpha:0, y:-14} → dur 0.55, stagger 0.08, power2.out
   heroCascade : from {autoAlpha:0, y: 30} → dur 1.00, stagger 0.20, power2.out

   ⚠️ DELAYS. Na origem os dois presets esperam a CORTINA da intro subir
   (`intro.lift.duration` = 0.6s): nav em 0.6, hero em 0.95. A intro não faz
   parte do escopo (só o hero foi importado), então a espera do painel não
   existe aqui. Preservo o INTERVALO entre as duas — nav em 0, hero em 0.35 —
   que é a coreografia canônica sem os 0.6s de tela parada.
   ============================================================ */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return; // conteúdo já visível pelo CSS, sem cascata

  var nav = document.querySelector(".nav");
  var hero = document.querySelector(".hero__inner");
  var navItems = nav ? gsap.utils.toArray("[data-reveal]", nav) : [];
  var heroItems = hero ? gsap.utils.toArray("[data-reveal]", hero) : [];

  gsap.set(navItems, { autoAlpha: 0, y: -14 });
  gsap.set(heroItems, { autoAlpha: 0, y: 30 });

  function tocar() {
    // Navbar lidera (logo → links → CTA/burger).
    gsap.to(navItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      stagger: 0.08,
    });
    // Hero em seguida (título → subtítulo → CTA).
    gsap.to(heroItems, {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      stagger: 0.2,
      delay: 0.35,
    });
  }

  // Espera as fontes: a cascata sobe o texto, e um swap de fonte no meio do
  // movimento reflowa o bloco inteiro. `document.fonts.ready` não trava se
  // a fonte falhar — resolve de qualquer jeito.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(tocar);
  } else {
    tocar();
  }
})();
