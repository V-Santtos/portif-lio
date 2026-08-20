(() => {
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const orange = "#f43c00";
  const white = "#ffffff";

  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";

  const stopNavigation = (event) => {
    const actionable = event.target.closest("a, button, form, [role='link']");
    if (!actionable) return;
    event.preventDefault();
  };

  document.addEventListener("click", stopNavigation, true);
  document.addEventListener("submit", stopNavigation, true);
  document.addEventListener("auxclick", stopNavigation, true);

  document.querySelectorAll(".title-copy").forEach((element) => {
    const text = element.textContent;
    element.textContent = "";

    [...text].forEach((character) => {
      const span = document.createElement("span");
      span.className = "title-char";
      span.textContent = character === " " ? "\u00a0" : character;
      span.setAttribute("aria-hidden", "true");
      element.appendChild(span);
    });
  });

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

    const background = document.querySelector(".capsule__background");
    const titleCharacters = document.querySelectorAll(".title-char");
    const titleImages = document.querySelectorAll(".capsule__line img");
    const copy = document.querySelector(".capsule__copy");
    const cta = document.querySelector(".capsule__cta");

    // Sem entrada automática dentro do carrossel: texto, imagens e fundo já
    // são montados no estado final. As respostas aos hovers permanecem.
    gsap.set([background, titleCharacters, titleImages, copy, cta], {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    });

    document.querySelectorAll(".nav-link:not(.nav-pages__trigger)").forEach((link) => {
      const activate = () =>
        animateTo(link, { color: orange, duration: 0.28, ease: "power2.out" });
      const deactivate = () =>
        animateTo(link, { color: white, duration: 0.28, ease: "power2.out" });

      link.addEventListener("pointerenter", activate);
      link.addEventListener("pointerleave", deactivate);
      link.addEventListener("focus", activate);
      link.addEventListener("blur", deactivate);
    });

    document.querySelectorAll(".capsule-action").forEach((action) => {
      const labelTrack = action.querySelector(".capsule-action__label-track");
      const iconTrack = action.querySelector(".capsule-action__icon-track");

      const activate = () => {
        animateTo(labelTrack, { y: -38, duration: 0.46, ease: "power3.inOut" });
        animateTo(iconTrack, { x: -47, duration: 0.46, ease: "power3.inOut" });
      };

      const deactivate = () => {
        animateTo(labelTrack, { y: 0, duration: 0.46, ease: "power3.inOut" });
        animateTo(iconTrack, { x: 0, duration: 0.46, ease: "power3.inOut" });
      };

      action.addEventListener("pointerenter", activate);
      action.addEventListener("pointerleave", deactivate);
      action.addEventListener("focus", activate);
      action.addEventListener("blur", deactivate);
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
