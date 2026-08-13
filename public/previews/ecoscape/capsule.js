(() => {
  const gsap = window.gsap;
  document.documentElement.dataset.capsuleReady = "true";
  document.documentElement.dataset.animationEngine = gsap ? "gsap" : "unavailable";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rootStyles = getComputedStyle(document.documentElement);
  const interactionLime =
    rootStyles.getPropertyValue("--source-interaction-lime").trim() || "#d1fc71";

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

    if (reducedMotion) {
      gsap.set(
        [background, header, eyebrow, ...titleLines, description, bookAction, statCard],
        { autoAlpha: 1, y: 0, scale: 1 }
      );
    } else {
      gsap.set(background, {
        autoAlpha: 0.72,
        scale: 1.035,
        transformOrigin: "50% 50%",
      });
      gsap.set([header, eyebrow, ...titleLines, description, bookAction], {
        autoAlpha: 0,
        y: 22,
      });
      gsap.set(statCard, { autoAlpha: 0, y: 26, scale: 0.975 });

      gsap
        .timeline()
        .to(background, { autoAlpha: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(header, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" }, 0.08)
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" }, 0.18)
        .to(
          titleLines,
          { autoAlpha: 1, y: 0, duration: 0.82, stagger: 0.07, ease: "power3.out" },
          0.23
        )
        .to(description, { autoAlpha: 1, y: 0, duration: 0.78, ease: "power3.out" }, 0.38)
        .to(
          statCard,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          0.4
        )
        .to(bookAction, { autoAlpha: 1, y: 0, duration: 0.78, ease: "power3.out" }, 0.46);
    }

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

    const pages = document.querySelector(".nav-pages");
    const pagesTrigger = pages?.querySelector(".nav-pages__trigger");
    const pagesArrow = pagesTrigger?.querySelector("svg");
    const pagesMenu = pages?.querySelector(".nav-pages__menu");

    if (pages && pagesTrigger && pagesArrow && pagesMenu) {
      gsap.set(pagesMenu, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(pagesArrow, { rotation: 0, transformOrigin: "50% 50%" });

      const openPages = () => {
        gsap.set(pagesMenu, { autoAlpha: 1, pointerEvents: "auto" });
        animateTo(pagesTrigger, {
          color: interactionLime,
          duration: 0.3,
          ease: "power2.out",
        });
        animateTo(pagesArrow, { rotation: 180, duration: 0.4, ease: "power2.inOut" });
      };

      const closePages = () => {
        gsap.set(pagesMenu, { autoAlpha: 0, pointerEvents: "none" });
        animateTo(pagesTrigger, { color: "#ffffff", duration: 0.3, ease: "power2.out" });
        animateTo(pagesArrow, { rotation: 0, duration: 0.4, ease: "power2.inOut" });
      };

      pages.addEventListener("pointerenter", openPages);
      pages.addEventListener("pointerleave", closePages);
      pagesTrigger.addEventListener("focus", openPages);
      pages.addEventListener("focusout", (event) => {
        if (!pages.contains(event.relatedTarget)) closePages();
      });
    }
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
