(() => {
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const capsule = document.querySelector(".capsule");
  const hero = document.querySelector(".hero");
  const video = document.querySelector(".hero__video");
  const cursor = document.querySelector(".cursor");
  const cursorLabel = cursor?.querySelector("span");
  const capsuleScale = 0.75;

  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";
  document.documentElement.dataset.videoState = "idle";

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
      if (event.deltaY === 0 || window.parent === window) return;
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

  if (!gsap || !capsule || !hero || !video) {
    document.documentElement.classList.remove("js");
    return;
  }

  const select = gsap.utils.selector(capsule);
  const topbar = select("[data-reveal='topbar']")[0];
  const eyebrow = select("[data-reveal='eyebrow']")[0];
  const headlineLines = select(".headline__line");
  const intro = select("[data-reveal='intro']")[0];
  const actions = select("[data-reveal='actions']")[0];
  const footer = select("[data-reveal='footer']")[0];
  const scrollNote = select("[data-reveal='scroll']")[0];
  const architecturePaths = select(".architecture-line path");
  const metrics = select("[data-value]");

  // No carrossel a cápsula abre pronta. O poster cobre a mídia e o vídeo não é
  // carregado nem reproduzido automaticamente; hovers e botões continuam vivos.
  gsap.set(video, { scale: 1.035, filter: "brightness(1)", transformOrigin: "50% 50%" });
  gsap.set(topbar, { autoAlpha: 1, y: 0 });
  gsap.set([eyebrow, intro, actions, footer, scrollNote], { autoAlpha: 1, y: 0 });
  gsap.set(headlineLines, { autoAlpha: 1, yPercent: 0 });
  gsap.set(architecturePaths, { strokeDashoffset: 0, opacity: 0.38 });
  gsap.set(select(".nav__indicator"), { scaleX: 0, transformOrigin: "left center" });
  gsap.set(select(".button__fill"), { xPercent: -102 });
  metrics.forEach((metric) => {
    const suffix = metric.dataset.plus === "true" ? "+" : "";
    metric.textContent = `${metric.dataset.value}${suffix}`;
  });
  document.documentElement.dataset.entranceState = "complete";
  document.documentElement.dataset.videoState = "poster";

  const animate = (target, vars) => {
    if (!target) return;
    if (reducedMotion.matches) {
      const { duration, ease, overwrite, ...finalState } = vars;
      gsap.set(target, finalState);
      return;
    }
    gsap.to(target, { overwrite: "auto", ...vars });
  };

  select(".nav__link").forEach((item) => {
    const indicator = item.querySelector(".nav__indicator");
    item.addEventListener("pointerenter", () => {
      animate(item, { opacity: 1, y: -1, duration: 0.24, ease: "power2.out" });
      animate(indicator, { scaleX: 1, duration: 0.45, ease: "power3.out" });
    });
    item.addEventListener("pointerleave", () => {
      animate(item, { opacity: 0.82, y: 0, duration: 0.24, ease: "power2.out" });
      animate(indicator, { scaleX: 0, duration: 0.35, ease: "power2.out" });
    });
  });

  select(".button").forEach((button) => {
    const fill = button.querySelector(".button__fill");
    const isPrimary = button.classList.contains("button--primary");
    button.addEventListener("pointerenter", () => {
      animate(button, {
        y: -2,
        color: "#101411",
        borderColor: "#f4f1e9",
        duration: 0.35,
        ease: "power3.out",
      });
      animate(fill, { xPercent: 0, duration: 0.55, ease: "power3.out" });
    });
    button.addEventListener("pointerleave", () => {
      animate(button, {
        y: 0,
        color: isPrimary ? "#101411" : "#f4f1e9",
        borderColor: isPrimary ? "#f4f1e9" : "rgba(255, 255, 255, 0.42)",
        duration: 0.35,
        ease: "power3.out",
      });
      animate(fill, { xPercent: -102, duration: 0.45, ease: "power3.out" });
    });
  });

  const canAnimatePointer = () => finePointer.matches && !reducedMotion.matches;
  if (cursor && cursorLabel) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.16, ease: "power2.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.16, ease: "power2.out" });

    const setCursorMode = (mode) => {
      if (!canAnimatePointer()) return;
      const isMedia = mode === "media";
      animate(cursor, {
        width: isMedia ? 76 : 42,
        height: isMedia ? 76 : 42,
        backgroundColor: isMedia ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.8)",
        duration: 0.35,
        ease: "power3.out",
      });
      animate(cursorLabel, { autoAlpha: isMedia ? 1 : 0, duration: 0.2, ease: "power1.out" });
    };

    window.addEventListener("pointermove", (event) => {
      if (!canAnimatePointer()) return;
      cursorX(event.clientX / capsuleScale);
      cursorY(event.clientY / capsuleScale);
      gsap.set(cursor, { autoAlpha: 1 });
    });

    hero.addEventListener("pointerenter", () => setCursorMode("media"));
    hero.addEventListener("pointerleave", () => animate(cursor, { autoAlpha: 0, duration: 0.2 }));
    select("[data-cursor-link]").forEach((item) => {
      item.addEventListener("pointerenter", () => setCursorMode("link"));
      item.addEventListener("pointerleave", () => setCursorMode("media"));
    });
  }

})();
