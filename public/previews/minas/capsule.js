(() => {
  const gsap = window.gsap;
  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopNavigation = (event) => {
    const actionable = event.target.closest("a, button, form, [role='link']");
    if (!actionable) return;
    event.preventDefault();
  };
  document.addEventListener("click", stopNavigation, true);
  document.addEventListener("submit", stopNavigation, true);
  document.addEventListener("auxclick", stopNavigation, true);

  // Fonte de verdade da diagonal: as variáveis do CSS. Mudar o corte lá
  // reposiciona listras, foto e animação de uma vez só.
  const raiz = getComputedStyle(document.documentElement);
  const CORTE_TOPO = raiz.getPropertyValue("--corte-topo").trim() || "62%";
  const CORTE_BASE = raiz.getPropertyValue("--corte-base").trim() || "56%";
  const CORTE_FINAL = `polygon(${CORTE_TOPO} 0, 100% 0, 100% 100%, ${CORTE_BASE} 100%)`;

  if (gsap) {
    const animateTo = (target, vars) => {
      if (!target) return;
      if (reducedMotion) {
        const { duration, ease, overwrite, ...finalState } = vars;
        gsap.set(target, finalState);
        return;
      }
      gsap.to(target, { overwrite: "auto", ...vars });
    };

    // ── Entrada: painel esquerdo em cascata (Framer stagger 0.15, delay 0.2) ──
    const nav = document.querySelector(".capsule__nav");
    const logo = document.querySelector(".capsule__logo");
    const title = document.querySelector(".capsule__title");
    const rule = document.querySelector(".capsule__rule");
    const subtitle = document.querySelector(".capsule__subtitle");
    const footer = document.querySelector(".capsule__footer");
    const wipeBlack = document.querySelector(".wipe--black");
    const wipeRed = document.querySelector(".wipe--red");
    const wipeCream = document.querySelector(".wipe--cream");
    const wipePhoto = document.querySelector(".wipe--photo");
    const media = document.querySelector(".capsule__media");

    const cascadeItems = [logo, title, rule, subtitle, footer];

    const aplicarEstadoFinal = () => {
      gsap.set([nav, ...cascadeItems], { autoAlpha: 1, y: 0 });
      gsap.set(wipePhoto, { autoAlpha: 1, clipPath: CORTE_FINAL });
      gsap.set(wipeBlack, { autoAlpha: 1, x: -45 });
      gsap.set(wipeRed, { autoAlpha: 1, x: -30 });
      gsap.set(wipeCream, { autoAlpha: 1, x: -15 });
      gsap.set([nav, ...cascadeItems, wipeBlack, wipeRed, wipeCream, wipePhoto], {
        willChange: "auto",
      });
    };

    // A abertura com clip-path e cascata era a maior disputa com o scroll do
    // carrossel. Mantemos a cápsula e seus hovers, já na composição final.
    aplicarEstadoFinal();

    // ── Indicador da navbar: desliza sob o item em hover, cor vermelho→preto ──
    const items = Array.from(document.querySelectorAll(".nav-item"));
    const indicator = document.querySelector(".nav-indicator");
    const list = document.querySelector(".nav-list");
    const defaultItem = items.find((it) => it.dataset.id === "inicio") || items[0];

    // Medidas cacheadas: getBoundingClientRect a cada hover forçaria reflow
    // síncrono. Mede uma vez (e no resize) e depois só anima transform.
    const LARGURA_BASE = 100;
    let medidas = new Map();
    // offsetLeft/offsetWidth (e não getBoundingClientRect): o indicador vive
    // dentro do .capsule escalado, então precisa das medidas do canvas de
    // desenho (1920). O rect devolveria valores já multiplicados por 0.75.
    const medir = () => {
      if (!list) return;
      medidas = new Map(
        items.map((item) => [
          item,
          {
            x: item.offsetLeft - list.offsetLeft,
            escala: item.offsetWidth / LARGURA_BASE,
          },
        ])
      );
    };

    // scaleX em vez de width: width dispara layout, scaleX roda no compositor.
    const placeIndicator = (item, color) => {
      if (!item || !indicator) return;
      const m = medidas.get(item);
      if (!m) return;
      animateTo(indicator, {
        scaleX: m.escala,
        x: m.x,
        background: color,
        duration: 0.35,
        ease: "power3.inOut",
      });
    };

    medir();
    gsap.set(indicator, { width: LARGURA_BASE, transformOrigin: "left center" });
    placeIndicator(defaultItem, "var(--minas-gradient)");

    let resizeId;
    window.addEventListener("resize", () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => {
        medir();
        const ativo = items.find((it) => it.classList.contains("is-hovered")) || defaultItem;
        const m = medidas.get(ativo);
        if (m) gsap.set(indicator, { scaleX: m.escala, x: m.x });
      }, 120);
    });

    items.forEach((item) => {
      item.addEventListener("pointerenter", () => {
        items.forEach((it) => it.classList.toggle("is-hovered", it === item));
        placeIndicator(item, "var(--minas-dark)");
      });
      item.addEventListener("focus", () => {
        items.forEach((it) => it.classList.toggle("is-hovered", it === item));
        placeIndicator(item, "var(--minas-dark)");
      });
    });

    list?.addEventListener("mouseleave", () => {
      items.forEach((it) => it.classList.remove("is-hovered"));
      placeIndicator(defaultItem, "var(--minas-gradient)");
    });

    // ── Contatos: opacidade no hover (igual ao onMouseEnter/Leave original) ──
    document.querySelectorAll(".contact").forEach((contact) => {
      contact.addEventListener("pointerenter", () => animateTo(contact, { opacity: 0.7, duration: 0.2 }));
      contact.addEventListener("pointerleave", () => animateTo(contact, { opacity: 1, duration: 0.2 }));
    });
  }

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
