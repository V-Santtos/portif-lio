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
    const header = document.querySelector(".capsule__header");
    const eyebrow = document.querySelector(".capsule__eyebrow");
    const titleLines = document.querySelectorAll("h1 > span");
    const description = document.querySelector(".capsule__description");
    const bookAction = document.querySelector(".capsule__book");
    const statCard = document.querySelector(".capsule__stat");

    // O carrossel precisa nascer estável: a entrada em cascata competia com o
    // scroll pinado. A cápsula já abre na pose final; hovers continuam vivos.
    gsap.set(
      [background, header, eyebrow, ...titleLines, description, bookAction, statCard],
      { autoAlpha: 1, y: 0, scale: 1 }
    );

    document.querySelectorAll(".nav-roll").forEach((item) => {
      const track = item.querySelector(".nav-roll__track");
      const activate = () =>
        animateTo(track, { y: -40, duration: 0.48, ease: "power3.inOut" });
      const deactivate = () =>
        animateTo(track, { y: 0, duration: 0.48, ease: "power3.inOut" });

      item.addEventListener("pointerenter", activate);
      item.addEventListener("pointerleave", deactivate);
      item.addEventListener("focus", activate);
      item.addEventListener("blur", deactivate);
    });

    document.querySelectorAll(".capsule-action").forEach((action) => {
      const labelTrack = action.querySelector(".capsule-action__label-track");
      const outgoingArrow = action.querySelector(".capsule-action__arrow--out");
      const incomingArrow = action.querySelector(".capsule-action__arrow--in");

      const activate = () => {
        animateTo(labelTrack, { y: -50, duration: 0.5, ease: "power3.inOut" });
        animateTo(outgoingArrow, {
          x: 50,
          y: -50,
          duration: 0.5,
          ease: "power3.inOut",
        });
        animateTo(incomingArrow, { x: 0, y: 0, duration: 0.5, ease: "power3.inOut" });
      };

      const deactivate = () => {
        animateTo(labelTrack, { y: 0, duration: 0.5, ease: "power3.inOut" });
        animateTo(outgoingArrow, { x: 0, y: 0, duration: 0.5, ease: "power3.inOut" });
        animateTo(incomingArrow, {
          x: -50,
          y: 50,
          duration: 0.5,
          ease: "power3.inOut",
        });
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
